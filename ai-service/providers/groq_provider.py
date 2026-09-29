import logging
from .base import BaseAIProvider
from config import settings

logger = logging.getLogger("ai_service.groq")

class GroqProvider(BaseAIProvider):
    name: str = "groq"

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
        self._client = None

        if self.api_key:
            try:
                from groq import Groq
                self._client = Groq(api_key=self.api_key, timeout=settings.AI_REQUEST_TIMEOUT)
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {str(e)}")
                self._client = None

    def is_available(self) -> bool:
        return bool(self.api_key and self._client)

    def generate(self, prompt: str, language: str, channel: str, tone: str) -> str:
        if not self.is_available():
            raise ValueError("Groq API key or client is unavailable.")

        system_instruction = self.build_system_instruction(language, channel, tone)

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": f"Campaign Details / Prompt: {prompt}"}
        ]

        try:
            response = self._client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )

            if response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content
                if content:
                    return content.strip()

            raise ValueError("Groq returned empty response payload.")

        except Exception as e:
            logger.error(f"Groq generation failed: {type(e).__name__}")
            raise e
