import logging
from django.utils import timezone
from api.models import DeliveryLog, DeliveryEvent, EngagementMetric

logger = logging.getLogger(__name__)

STATUS_MAP = {
    DeliveryEvent.EventType.MESSAGE_QUEUED: DeliveryLog.DeliveryStatus.QUEUED,
    DeliveryEvent.EventType.MESSAGE_PROCESSING: DeliveryLog.DeliveryStatus.PROCESSING,
    DeliveryEvent.EventType.MESSAGE_SENT: DeliveryLog.DeliveryStatus.SENT,
    DeliveryEvent.EventType.MESSAGE_DELIVERED: DeliveryLog.DeliveryStatus.DELIVERED,
    DeliveryEvent.EventType.MESSAGE_READ: DeliveryLog.DeliveryStatus.READ,
    DeliveryEvent.EventType.MESSAGE_CLICKED: DeliveryLog.DeliveryStatus.CLICKED,
    DeliveryEvent.EventType.MESSAGE_FAILED: DeliveryLog.DeliveryStatus.FAILED,
    DeliveryEvent.EventType.MESSAGE_RETRIED: DeliveryLog.DeliveryStatus.RETRYING,
    DeliveryEvent.EventType.MESSAGE_CANCELLED: DeliveryLog.DeliveryStatus.CANCELLED,
}

def record_delivery_event(delivery: DeliveryLog, event_type: str, provider_event_id: str = "", metadata: dict = None, timestamp=None) -> DeliveryEvent:
    if metadata is None:
        metadata = {}
    if timestamp is None:
        timestamp = timezone.now()

    # 1. Idempotency Check: prevent duplicate provider events
    if provider_event_id:
        existing = DeliveryEvent.objects.filter(delivery=delivery, provider_event_id=provider_event_id).first()
        if existing:
            logger.info(f"Duplicate event ignored (idempotent): {provider_event_id}")
            return existing

    # 2. Create Immutable Event Record
    event = DeliveryEvent.objects.create(
        delivery=delivery,
        event_type=event_type,
        provider_event_id=provider_event_id,
        timestamp=timestamp,
        metadata=metadata
    )

    # 3. Update Delivery Record State & Timestamps
    new_status = STATUS_MAP.get(event_type, delivery.status)
    delivery.status = new_status

    if event_type == DeliveryEvent.EventType.MESSAGE_QUEUED and not delivery.queued_at:
        delivery.queued_at = timestamp
    elif event_type == DeliveryEvent.EventType.MESSAGE_PROCESSING and not delivery.processing_at:
        delivery.processing_at = timestamp
    elif event_type == DeliveryEvent.EventType.MESSAGE_SENT and not delivery.sent_at:
        delivery.sent_at = timestamp
    elif event_type == DeliveryEvent.EventType.MESSAGE_DELIVERED and not delivery.delivered_at:
        delivery.delivered_at = timestamp
    elif event_type == DeliveryEvent.EventType.MESSAGE_READ and not delivery.read_at:
        delivery.read_at = timestamp
    elif event_type == DeliveryEvent.EventType.MESSAGE_CLICKED and not delivery.clicked_at:
        delivery.clicked_at = timestamp
    elif event_type == DeliveryEvent.EventType.MESSAGE_FAILED:
        delivery.failed_at = timestamp
        if metadata.get("error_code"):
            delivery.error_code = metadata["error_code"]
        if metadata.get("error_message"):
            delivery.error_message = metadata["error_message"]

    delivery.save()

    # 4. Sync Engagement Metric for READ / CLICKED
    if event_type in [DeliveryEvent.EventType.MESSAGE_READ, DeliveryEvent.EventType.MESSAGE_CLICKED]:
        engagement, _ = EngagementMetric.objects.get_or_create(
            campaign=delivery.campaign,
            recipient=delivery.recipient
        )
        if event_type == DeliveryEvent.EventType.MESSAGE_READ:
            engagement.opened = True
        if event_type == DeliveryEvent.EventType.MESSAGE_CLICKED:
            engagement.opened = True
            engagement.clicked = True
        engagement.save()

    return event
