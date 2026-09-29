import time
import logging
from typing import Dict, Any, List
from config import settings
from .groq_provider import GroqProvider
from .gemini_provider import GeminiProvider
from .fallback_provider import LocalFallbackProvider

logger = logging.getLogger("ai_service.manager")

class AIProviderManager:
    def __init__(self):
        self.groq = GroqProvider()
        self.gemini = GeminiProvider()
        self.fallback = LocalFallbackProvider()

    def get_provider(self, provider_name: str):
        if provider_name == "groq":
            return self.groq
        elif provider_name == "gemini":
            return self.gemini
        elif provider_name == "local_fallback":
            return self.fallback
        return None

    def generate_content(self, prompt: str, language: str, channel: str, tone: str) -> Dict[str, Any]:
        start_time = time.time()
        attempted_providers: List[str] = []

        # Determine chain order
        primary_name = settings.AI_PRIMARY_PROVIDER or "groq"
        secondary_name = settings.AI_SECONDARY_PROVIDER or "gemini"

        chain = [primary_name, secondary_name, "local_fallback"]
        # Deduplicate preserving order
        seen = set()
        provider_chain = []
        for name in chain:
            if name not in seen:
                seen.add(name)
                provider_chain.append(name)

        final_content = None
        selected_provider = None
        is_fallback = False

        for name in provider_chain:
            provider = self.get_provider(name)
            if not provider:
                continue

            attempted_providers.append(name)

            if not provider.is_available():
                logger.info(f"Provider {name} is not available (key or client missing), skipping.")
                continue

            logger.info(f"Attempting content generation using provider: {name}")

            try:
                content = provider.generate(
                    prompt=prompt,
                    language=language,
                    channel=channel,
                    tone=tone
                )
                if content:
                    final_content = content
                    selected_provider = name
                    is_fallback = (name == "local_fallback")
                    logger.info(f"Generation successful via provider: {name}")
                    break
            except Exception as e:
                logger.warning(f"Provider {name} failed: {type(e).__name__}. Falling back to next provider.")

        # Guaranteed fallback if all chain items failed unexpectedly
        if not final_content:
            logger.warning("All primary/secondary providers failed. Executing deterministic fallback.")
            if "local_fallback" not in attempted_providers:
                attempted_providers.append("local_fallback")
            final_content = self.fallback.generate(prompt, language, channel, tone)
            selected_provider = "local_fallback"
            is_fallback = True

        duration = round(time.time() - start_time, 3)
        logger.info(f"Generation finished in {duration}s using {selected_provider} (Attempted: {attempted_providers})")

        return {
            "status": "success",
            "provider": selected_provider,
            "fallback": is_fallback,
            "attempted_providers": attempted_providers,
            "generated_content": final_content,
            "language": language,
            "channel": channel,
            "tone": tone
        }

provider_manager = AIProviderManager()
