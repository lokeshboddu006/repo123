import uuid
from typing import Dict, Any

class ProviderResponse:
    def __init__(self, success: bool, provider_message_id: str, status: str, error_code: str = "", error_message: str = "", metadata: Dict[str, Any] = None):
        self.success = success
        self.provider_message_id = provider_message_id
        self.status = status
        self.error_code = error_code
        self.error_message = error_message
        self.metadata = metadata or {}

    def to_dict(self) -> dict:
        return {
            "success": self.success,
            "provider_message_id": self.provider_message_id,
            "status": self.status,
            "error_code": self.error_code,
            "error_message": self.error_message,
            "metadata": self.metadata,
        }

class BaseChannelProvider:
    channel_name = "BASE"
    provider_name = "base"

    def send(self, recipient_data: dict, content_data: dict, metadata: dict = None) -> ProviderResponse:
        raise NotImplementedError("Subclasses must implement send()")

    def generate_provider_message_id(self, prefix: str = "MSG") -> str:
        return f"{prefix}-{uuid.uuid4().hex[:12].upper()}"
