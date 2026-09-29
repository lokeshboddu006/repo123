import os
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class AIServiceUnavailable(Exception):
    pass

class AIClient:
    def __init__(self):
        # Allow override via environment variable, fallback to localhost
        self.base_url = os.environ.get("AI_SERVICE_URL", "http://127.0.0.1:8001").rstrip('/')
        self.timeout = 30  # seconds

    def generate_content(self, prompt: str, language: str, channel: str, tone: str = "formal") -> dict:
        """
        Calls the FastAPI AI service to generate content.
        """
        url = f"{self.base_url}/api/v1/generate"
        payload = {
            "prompt": prompt,
            "language": language,
            "channel": channel,
            "tone": tone
        }

        try:
            response = requests.post(url, json=payload, timeout=self.timeout)
            
            # If FastAPI returned a 400 or 500 level error, raise it
            response.raise_for_status()
            
            data = response.json()
            if data.get("status") == "success":
                return data
            else:
                logger.error(f"AI Service returned non-success status: {data}")
                raise AIServiceUnavailable("AI service failed to generate content.")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"AI Service request failed: {e}")
            raise AIServiceUnavailable("AI service is currently unavailable.")
        except ValueError as e:
            logger.error(f"AI Service returned malformed JSON: {e}")
            raise AIServiceUnavailable("AI service returned invalid data.")

    def translate_content(self, text: str, source_language: str, target_language: str) -> dict:
        """
        Calls the FastAPI IndicTrans2 AI service to translate content.
        """
        url = f"{self.base_url}/api/v1/translate"
        payload = {
            "text": text,
            "source_language": source_language,
            "target_language": target_language
        }

        try:
            response = requests.post(url, json=payload, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"AI Service translation request failed: {e}")
            raise AIServiceUnavailable("AI translation service is currently unavailable.")
        except ValueError as e:
            logger.error(f"AI Service returned malformed JSON: {e}")
            raise AIServiceUnavailable("AI translation service returned invalid data.")

