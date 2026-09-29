import logging
from .base import BaseAIProvider
from config import settings

logger = logging.getLogger("ai_service.gemini")

class GeminiProvider(BaseAIProvider):
    name: str = "gemini"

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self._configured = False

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai = genai
                self._configured = True
            except Exception as e:
                logger.error(f"Failed to configure Gemini client: {str(e)}")
                self._configured = False

    def is_available(self) -> bool:
        return bool(self.api_key and self._configured)

    def generate(self, prompt: str, language: str, channel: str, tone: str) -> str:
        if not self.is_available():
            raise ValueError("Gemini API key or client is unavailable.")

        system_instruction = self.build_system_instruction(language, channel, tone)
        full_prompt = f"{system_instruction}\n\nUser Request: {prompt}"

        try:
            model = self._genai.GenerativeModel(self.model_name)
            response = model.generate_content(full_prompt)

            if response and response.text:
                return response.text.strip()

            raise ValueError("Gemini returned empty text response.")

        except Exception as e:
            logger.error(f"Gemini generation failed: {type(e).__name__}")
            raise e
