import logging
from .base import BaseChannelProvider, ProviderResponse

logger = logging.getLogger(__name__)

class DevelopmentEmailProvider(BaseChannelProvider):
    channel_name = "EMAIL"
    provider_name = "smtp_relay"

    def send(self, recipient_data: dict, content_data: dict, metadata: dict = None) -> ProviderResponse:
        email = recipient_data.get("email", "")
        subject = content_data.get("subject", "Public Announcement")
        provider_msg_id = self.generate_provider_message_id("EML")

        if email.endswith("@invalid.com"):
            logger.warning(f"[Email Provider] Bounce for {email}")
            return ProviderResponse(
                success=False,
                provider_message_id=provider_msg_id,
                status="FAILED",
                error_code="BOUNCE_HARD",
                error_message="Recipient mailbox address does not exist.",
                metadata={"smtp_code": 550}
            )

        logger.info(f"[Email Provider] Relayed email to {email}. Subject: '{subject}'. ID: {provider_msg_id}")
        return ProviderResponse(
            success=True,
            provider_message_id=provider_msg_id,
            status="SENT",
            metadata={
                "relay_server": "mail.govcomm.gov.in",
                "dkim_signed": True,
                "spf_pass": True
            }
        )
