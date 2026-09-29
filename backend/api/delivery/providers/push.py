import logging
from .base import BaseChannelProvider, ProviderResponse

logger = logging.getLogger(__name__)

class DevelopmentPushProvider(BaseChannelProvider):
    channel_name = "PUSH"
    provider_name = "push_notification_service"

    def send(self, recipient_data: dict, content_data: dict, metadata: dict = None) -> ProviderResponse:
        provider_msg_id = self.generate_provider_message_id("PSH")
        return ProviderResponse(
            success=True,
            provider_message_id=provider_msg_id,
            status="SENT",
            metadata={"gateway": "Citizen App Push Gateway", "priority": "high"}
        )
