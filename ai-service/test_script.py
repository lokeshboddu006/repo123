import os
from dotenv import load_dotenv

# Load env
load_dotenv()
print(f"GROQ_API_KEY: {'CONFIGURED' if os.environ.get('GROQ_API_KEY') else 'NOT CONFIGURED'}")
print(f"GEMINI_API_KEY: {'CONFIGURED' if os.environ.get('GEMINI_API_KEY') else 'NOT CONFIGURED'}")

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from providers.groq_provider import GroqProvider
from providers.gemini_provider import GeminiProvider

def test_groq():
    print("\n--- Groq ---")
    if not os.environ.get('GROQ_API_KEY'):
        print("CONFIGURED: False")
        return
    print("CONFIGURED")
    provider = GroqProvider()
    try:
        response = provider.generate(
            prompt="Write one short public awareness sentence about keeping surroundings clean.",
            language="English",
            channel="SMS",
            tone="informative"
        )
        print("REQUEST SENT")
        print("SUCCESS")
        print(f"Model identifier: {provider.model}")
        print("Real provider-generated content was received.")
    except Exception as e:
        print("REQUEST SENT")
        print("FAILURE")
        print(f"Error: {type(e).__name__} - {str(e)[:100]}")

def test_gemini():
    print("\n--- Gemini ---")
    if not os.environ.get('GEMINI_API_KEY'):
        print("CONFIGURED: False")
        return
    print("CONFIGURED")
    provider = GeminiProvider()
    try:
        response = provider.generate(
            prompt="Write one short public awareness sentence about keeping surroundings clean.",
            language="English",
            channel="SMS",
            tone="informative"
        )
        print("REQUEST SENT")
        print("SUCCESS")
        print(f"Model identifier: {provider.model_name}")
        print("Real provider-generated content was received.")
    except Exception as e:
        print("REQUEST SENT")
        print("FAILURE")
        print(f"Error: {type(e).__name__} - {str(e)[:100]}")

def main():
    test_groq()
    test_gemini()

if __name__ == "__main__":
    main()
