import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Load .env file
load_dotenv(BASE_DIR / '.env')

class Settings:
    GROQ_API_KEY: str = os.getenv('GROQ_API_KEY', '').strip()
    GROQ_MODEL: str = os.getenv('GROQ_MODEL', 'openai/gpt-oss-20b').strip()

    GEMINI_API_KEY: str = os.getenv('GEMINI_API_KEY', '').strip()
    GEMINI_MODEL: str = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash').strip()

    AI_PRIMARY_PROVIDER: str = os.getenv('AI_PRIMARY_PROVIDER', 'groq').lower().strip()
    AI_SECONDARY_PROVIDER: str = os.getenv('AI_SECONDARY_PROVIDER', 'gemini').lower().strip()

    AI_REQUEST_TIMEOUT: int = int(os.getenv('AI_REQUEST_TIMEOUT', '30'))
    AI_MAX_RETRIES: int = int(os.getenv('AI_MAX_RETRIES', '2'))

settings = Settings()
