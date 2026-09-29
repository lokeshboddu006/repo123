import logging
from django.utils import timezone
from api.models import DeliveryLog, DeliveryEvent
from api.delivery.providers.registry import get_provider_for_channel
from api.delivery.services.event_service import record_delivery_event

logger = logging.getLogger(__name__)

MAX_RETRIES = 3

def retry_delivery(delivery_id: str) -> dict:
    try:
        delivery = DeliveryLog.objects.select_related('campaign', 'recipient').get(id=delivery_id)
    except DeliveryLog.DoesNotExist:
        raise ValueError(f"Delivery log with ID {delivery_id} does not exist.")

    if delivery.retry_count >= MAX_RETRIES:
        logger.warning(f"Delivery {delivery.id} exceeded MAX_RETRIES ({MAX_RETRIES}). Permanent failure.")
        return {
            "success": False,
            "delivery_id": str(delivery.id),
            "status": delivery.status,
            "retry_count": delivery.retry_count,
            "message": f"Maximum retry limit ({MAX_RETRIES}) reached. Delivery marked permanently failed."
        }

    delivery.retry_count += 1
    delivery.save(update_fields=['retry_count', 'updated_at'])

    record_delivery_event(
        delivery=delivery,
        event_type=DeliveryEvent.EventType.MESSAGE_RETRIED,
        metadata={"retry_attempt": delivery.retry_count}
    )

    # Re-execute channel dispatch
    provider = get_provider_for_channel(delivery.channel)
    content_item = delivery.campaign.contents.filter(channel=delivery.channel).first() or delivery.campaign.contents.first()
    content_data = {
        "subject": content_item.subject if content_item else delivery.campaign.title,
        "body": content_item.body if content_item else delivery.campaign.description
    }
    recipient_data = {
        "email": delivery.recipient.email,
        "phone": delivery.recipient.phone,
        "first_name": delivery.recipient.first_name,
    }

    record_delivery_event(
        delivery=delivery,
        event_type=DeliveryEvent.EventType.MESSAGE_PROCESSING,
        metadata={"retry": True}
    )

    resp = provider.send(recipient_data, content_data)
    delivery.provider_message_id = resp.provider_message_id
    delivery.save(update_fields=['provider_message_id'])

    if resp.success:
        record_delivery_event(
            delivery=delivery,
            event_type=DeliveryEvent.EventType.MESSAGE_SENT,
            metadata=resp.metadata
        )
        record_delivery_event(
            delivery=delivery,
            event_type=DeliveryEvent.EventType.MESSAGE_DELIVERED,
            metadata={"retry_recovered": True}
        )
        return {
            "success": True,
            "delivery_id": str(delivery.id),
            "status": delivery.status,
            "retry_count": delivery.retry_count,
            "message": "Retry successful. Delivery recovered to DELIVERED."
        }
    else:
        record_delivery_event(
            delivery=delivery,
            event_type=DeliveryEvent.EventType.MESSAGE_FAILED,
            metadata={"error_code": resp.error_code, "error_message": resp.error_message}
        )
        return {
            "success": False,
            "delivery_id": str(delivery.id),
            "status": delivery.status,
            "retry_count": delivery.retry_count,
            "message": f"Retry attempt {delivery.retry_count} failed."
        }
