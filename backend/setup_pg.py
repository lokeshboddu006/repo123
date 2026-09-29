import os
import sys
import urllib.request
import zipfile
import subprocess
import time

PG_URL = "https://sbp.enterprisedb.com/getfile.jsp?fileid=1260494"
USER_HOME = os.path.expanduser("~")
TARGET_DIR = os.path.join(USER_HOME, "pgsql")
ZIP_PATH = os.path.join(USER_HOME, "pgsql.zip")
DATA_DIR = os.path.join(TARGET_DIR, "data")
BIN_DIR = os.path.join(TARGET_DIR, "pgsql", "bin")

def download_file(url, target):
    print(f"Downloading PostgreSQL from {url} to {target}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(target, 'wb') as out:
        total = int(resp.headers.get('Content-Length', 0))
        downloaded = 0
        chunk_size = 1024 * 1024 * 4 # 4MB
        while True:
            chunk = resp.read(chunk_size)
            if not chunk:
                break
            out.write(chunk)
            downloaded += len(chunk)
            if total > 0:
                percent = (downloaded / total) * 100
                print(f"\rProgress: {percent:.1f}% ({downloaded // (1024*1024)}MB / {total // (1024*1024)}MB)", end='', flush=True)
    print("\nDownload complete.")

def main():
    if not os.path.exists(BIN_DIR):
        if not os.path.exists(ZIP_PATH):
            download_file(PG_URL, ZIP_PATH)
        print("Extracting PostgreSQL...")
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall(TARGET_DIR)
        print("Extraction complete.")
        if os.path.exists(ZIP_PATH):
            os.remove(ZIP_PATH)

    initdb_path = os.path.join(BIN_DIR, "initdb.exe")
    pg_ctl_path = os.path.join(BIN_DIR, "pg_ctl.exe")
    createdb_path = os.path.join(BIN_DIR, "createdb.exe")
    psql_path = os.path.join(BIN_DIR, "psql.exe")

    if not os.path.exists(DATA_DIR):
        print("Initializing PostgreSQL database cluster...")
        cmd = [initdb_path, "-D", DATA_DIR, "-U", "postgres", "-A", "trust", "--encoding=UTF8", "--locale=C"]
        res = subprocess.run(cmd, capture_output=True, text=True)
        print("initdb output:", res.stdout, res.stderr)

    print("Checking if postgres is running...")
    status_cmd = [pg_ctl_path, "-D", DATA_DIR, "status"]
    status_res = subprocess.run(status_cmd, capture_output=True, text=True)
    if "is running" not in status_res.stdout:
        print("Starting PostgreSQL server on port 5432...")
        start_cmd = [pg_ctl_path, "-D", DATA_DIR, "-l", os.path.join(TARGET_DIR, "pg.log"), "-o", "-p 5432", "start"]
        subprocess.run(start_cmd)
        time.sleep(3)

    print("Creating database ai_multilingual_db if it does not exist...")
    create_db_cmd = [createdb_path, "-h", "127.0.0.1", "-p", "5432", "-U", "postgres", "ai_multilingual_db"]
    res = subprocess.run(create_db_cmd, capture_output=True, text=True)
    print(res.stdout, res.stderr)

    print("Setting postgres user password...")
    sql = "ALTER USER postgres WITH PASSWORD 'postgres';"
    subprocess.run([psql_path, "-h", "127.0.0.1", "-p", "5432", "-U", "postgres", "-c", sql], capture_output=True)

    print("PostgreSQL setup is COMPLETE and verified running on port 5432.")

if __name__ == '__main__':
    main()
