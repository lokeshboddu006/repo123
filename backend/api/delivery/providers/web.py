import logging
from .base import BaseChannelProvider, ProviderResponse

logger = logging.getLogger(__name__)

class DevelopmentWebProvider(BaseChannelProvider):
    channel_name = "WEB"
    provider_name = "web_portal_broadcast"

    def send(self, recipient_data: dict, content_data: dict, metadata: dict = None) -> ProviderResponse:
        provider_msg_id = self.generate_provider_message_id("WEB")
        return ProviderResponse(
            success=True,
            provider_message_id=provider_msg_id,
            status="SENT",
            metadata={"portal": "Public Citizen Services Portal"}
        )
