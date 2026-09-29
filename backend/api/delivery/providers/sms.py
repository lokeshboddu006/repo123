import logging
import random
from .base import BaseChannelProvider, ProviderResponse

logger = logging.getLogger(__name__)

class DevelopmentSMSProvider(BaseChannelProvider):
    channel_name = "SMS"
    provider_name = "sms_gateway"

    def send(self, recipient_data: dict, content_data: dict, metadata: dict = None) -> ProviderResponse:
        phone = recipient_data.get("phone", "")
        body = content_data.get("body", "")
        provider_msg_id = self.generate_provider_message_id("SMS")

        # Controlled failure simulation: ~5% chance if phone ends in 999 or invalid
        if phone.endswith("999"):
            logger.warning(f"[SMS Provider] Delivery failed for phone {phone}")
            return ProviderResponse(
                success=False,
                provider_message_id=provider_msg_id,
                status="FAILED",
                error_code="CARRIER_UNREACHABLE",
                error_message="Recipient handset unreachable or DND filter active.",
                metadata={"network_operator": "Telecom Circle India", "attempts": 1}
            )

        logger.info(f"[SMS Provider] Sent SMS to {phone} via gateway. ID: {provider_msg_id}")
        return ProviderResponse(
            success=True,
            provider_message_id=provider_msg_id,
            status="SENT",
            metadata={
                "gateway": "Government Telecom Infrastructure SMS Hub",
                "char_count": len(body),
                "segments": (len(body) // 160) + 1,
            }
        )
