import logging
from .base import BaseChannelProvider, ProviderResponse

logger = logging.getLogger(__name__)

class DevelopmentWhatsAppProvider(BaseChannelProvider):
    channel_name = "WHATSAPP"
    provider_name = "whatsapp_business_api"

    def send(self, recipient_data: dict, content_data: dict, metadata: dict = None) -> ProviderResponse:
        phone = recipient_data.get("phone", "")
        provider_msg_id = self.generate_provider_message_id("WA")

        logger.info(f"[WhatsApp Provider] Dispatched HSM template message to {phone}. ID: {provider_msg_id}")
        return ProviderResponse(
            success=True,
            provider_message_id=provider_msg_id,
            status="SENT",
            metadata={
                "waba_account": "GovComm Official Channel",
                "template_name": "public_advisory_v1",
                "hsm_verified": True
            }
        )
