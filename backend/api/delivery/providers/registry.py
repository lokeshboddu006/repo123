import os
from .sms import DevelopmentSMSProvider
from .email import DevelopmentEmailProvider
from .whatsapp import DevelopmentWhatsAppProvider
from .push import DevelopmentPushProvider
from .web import DevelopmentWebProvider

PROVIDER_REGISTRY = {
    "SMS": DevelopmentSMSProvider(),
    "EMAIL": DevelopmentEmailProvider(),
    "WHATSAPP": DevelopmentWhatsAppProvider(),
    "PUSH": DevelopmentPushProvider(),
    "WEB": DevelopmentWebProvider(),
    "SOCIAL": DevelopmentWebProvider(),
}

def get_provider_for_channel(channel_name: str):
    key = str(channel_name).upper().strip()
    provider = PROVIDER_REGISTRY.get(key, DevelopmentSMSProvider())
    return provider
