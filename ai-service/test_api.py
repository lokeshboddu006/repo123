import urllib.request
import urllib.error
import json
import time

def test_api():
    print("\n--- API ---")
    url = "http://localhost:8001/api/v1/generate"
    data = json.dumps({
        "prompt": "Create a short public awareness message about dengue prevention.",
        "language": "English",
        "channel": "SMS",
        "tone": "informative"
    }).encode('utf-8')
    headers = {'Content-Type': 'application/json'}
    req = urllib.request.Request(url, data=data, headers=headers, method='POST')
    try:
        with urllib.request.urlopen(req) as response:
            res_data = response.read().decode('utf-8')
            res_json = json.loads(res_data)
            print("API Response:")
            print(json.dumps(res_json, indent=2))
    except Exception as e:
        print(f"API Error: {e}")

def test_health():
    print("\n--- Health ---")
    url = "http://localhost:8001/health"
    try:
        with urllib.request.urlopen(url) as response:
            res_data = response.read().decode('utf-8')
            res_json = json.loads(res_data)
            print("Health Response:")
            print(json.dumps(res_json, indent=2))
    except Exception as e:
        print(f"Health Error: {e}")

if __name__ == "__main__":
    import subprocess
    import sys
    import os
    print("Starting uvicorn with normal env...")
    proc = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8001"])
    time.sleep(5)
    test_api()
    test_health()
    proc.terminate()
    proc.wait()

    print("\nStarting uvicorn with invalid GROQ key to test fallback...")
    env = os.environ.copy()
    env["GROQ_API_KEY"] = "invalid_key"
    proc2 = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", "8001"], env=env)
    time.sleep(5)
    print("\n--- Fallback API ---")
    test_api()
    proc2.terminate()
    proc2.wait()
