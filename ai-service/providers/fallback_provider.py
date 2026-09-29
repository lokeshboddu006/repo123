import logging
from .base import BaseAIProvider

logger = logging.getLogger("ai_service.fallback")

class LocalFallbackProvider(BaseAIProvider):
    name: str = "local_fallback"

    def is_available(self) -> bool:
        return True

    def generate(self, prompt: str, language: str, channel: str, tone: str) -> str:
        logger.info("Executing local fallback content generator.")
        channel_upper = channel.upper()
        clean_prompt = prompt.strip().rstrip('.')

        # Multilingual default titles & templates
        indic_messages = {
            "Hindi": f"जन जागरूकता संदेश: {clean_prompt}। कृपया दिए गए निर्देशों का पालन करें और सुरक्षित रहें।",
            "Telugu": f"ప్రజా చైతన్య సమాచారం: {clean_prompt}. దయచేసి తగిన జాగ్రత్తలు తీసుకోండి మరియు సురక్షితంగా ఉండండి.",
            "Tamil": f"பொது விழிப்புணர்வு செய்தி: {clean_prompt}. தயவுசெய்து தேவையான முன்னெச்சரிக்கை நடவடிக்கைகளை எடுக்கவும்.",
            "Kannada": f"ಸಾರ್ವಜನಿಕ ಜಾಗೃತಿ ಮಾಹಿತಿ: {clean_prompt}. దయవిಟ್ಟು ಅಗತ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳನ್ನು ವಹಿಸಿ.",
        }

        if language in indic_messages:
            base_msg = indic_messages[language]
        else:
            base_msg = f"Public Awareness Notice: {clean_prompt}. Please take necessary precautions and follow safety guidelines."

        if channel_upper == "SMS":
            return f"[{channel_upper}] {base_msg}"[:160]
        elif channel_upper == "EMAIL":
            return f"Subject: Important Public Awareness Notice - {clean_prompt}\n\nDear Citizen,\n\n{base_msg}\n\nFor further details, please stay updated with local official announcements.\n\nRegards,\nPublic Communication Cell"
        elif channel_upper == "PUSH":
            return f"Notice: {clean_prompt}\n{base_msg[:100]}"
        elif channel_upper == "WHATSAPP":
            return f"📢 *PUBLIC AWARENESS ANNOUNCEMENT*\n\n{base_msg}\n\n_Please share this official awareness update with your community._"
        else:
            return f"PUBLIC ANNOUNCEMENT ({channel_upper}): {base_msg}"
