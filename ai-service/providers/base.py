from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseAIProvider(ABC):
    name: str = "base"

    @abstractmethod
    def generate(self, prompt: str, language: str, channel: str, tone: str) -> str:
        """
        Generate campaign communication text.
        """
        pass

    def build_system_instruction(self, language: str, channel: str, tone: str) -> str:
        """
        Build controlled system prompt for campaign content generation.
        """
        channel_guidelines = {
            "SMS": "Extremely concise (under 160 characters if possible), clear, direct, and action-oriented.",
            "EMAIL": "Include a compelling Subject line formatted as 'Subject: <title>' followed by a structured, clear body message.",
            "WHATSAPP": "Conversational, highly readable, clear key points, helpful formatting.",
            "PUSH": "Short eye-catching title (max 50 chars) and concise push body (max 120 chars).",
            "WEB": "Detailed, informative, well-formatted public awareness announcement.",
            "SOCIAL": "Engaging, clear, accessible message with relevant hashtags."
        }

        channel_guide = channel_guidelines.get(channel.upper(), "Clear, direct public communication message.")

        instruction = (
            f"You are an expert AI Mass Communication Assistant for Public Awareness Campaigns.\n"
            f"Your objective is to craft official public campaign messages.\n\n"
            f"TARGET LANGUAGE: Generate the output strictly in {language}.\n"
            f"COMMUNICATION CHANNEL: {channel} ({channel_guide})\n"
            f"TONE: {tone}\n\n"
            f"CRITICAL SAFETY & FACTUALITY RULES:\n"
            f"1. Do NOT invent or hallucinate unverified government policies, emergency phone numbers, medical claims, URLs, dates, or contact details unless specifically provided in the user prompt.\n"
            f"2. Keep the content clear, authoritative, public-friendly, and actionable.\n"
            f"3. Return ONLY the final communication text to be sent to citizens. Do NOT include introductory meta-text like 'Here is your message:' or explanations."
        )
        return instruction
