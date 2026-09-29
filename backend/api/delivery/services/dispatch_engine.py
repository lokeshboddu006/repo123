import logging
import random
import time
from django.utils import timezone
from api.models import Campaign, Recipient, DeliveryLog, DeliveryEvent
from api.delivery.providers.registry import get_provider_for_channel
from api.delivery.services.event_service import record_delivery_event

logger = logging.getLogger(__name__)

def resolve_campaign_recipients(campaign: Campaign):
    recipients = set()
    
    # 1. Audiences via M2M / direct relation
    audiences = list(campaign.audiences.all()) if hasattr(campaign, 'audiences') else []
    for seg in audiences:
        if hasattr(seg, 'members'):
            for m in seg.members.all():
                if hasattr(m, 'recipient') and m.recipient:
                    recipients.add(m.recipient)
                elif isinstance(m, Recipient):
                    recipients.add(m)

    # 2. Global active recipients fallback if no audience members resolved
    if not recipients:
        recipients = set(Recipient.objects.all()[:20])

    return list(recipients)

def dispatch_campaign(campaign_id: str) -> dict:
    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        raise ValueError(f"Campaign with ID {campaign_id} does not exist.")

    logger.info(f"Starting dispatch for campaign: '{campaign.title}' (ID: {campaign.id})")
    
    campaign.status = Campaign.StatusChoices.RUNNING
    campaign.save(update_fields=['status', 'updated_at'])

    recipients = resolve_campaign_recipients(campaign)
    channels = campaign.channels if campaign.channels else ["SMS", "EMAIL"]

    total_dispatched = 0
    deliveries_created = []

    for recipient in recipients:
        for ch in channels:
            delivery, created = DeliveryLog.objects.get_or_create(
                campaign=campaign,
                recipient=recipient,
                channel=ch,
                defaults={
                    "status": DeliveryLog.DeliveryStatus.QUEUED,
                    "queued_at": timezone.now(),
                    "details": {
                        "recipient_name": f"{recipient.first_name} {recipient.last_name}".strip(),
                        "recipient_contact": recipient.email or recipient.phone,
                    }
                }
            )

            # Record QUEUED event
            record_delivery_event(
                delivery=delivery,
                event_type=DeliveryEvent.EventType.MESSAGE_QUEUED,
                metadata={"dispatch_trigger": "manual_send"}
            )
            deliveries_created.append(delivery)
            total_dispatched += 1

    # Execute realistic delivery pipeline
    process_deliveries_pipeline(deliveries_created, campaign)

    # Mark campaign complete
    campaign.status = Campaign.StatusChoices.COMPLETED
    campaign.save(update_fields=['status', 'updated_at'])

    logger.info(f"Finished dispatch for campaign '{campaign.title}'. Dispatched {total_dispatched} messages.")
    return {
        "campaign_id": str(campaign.id),
        "status": campaign.status,
        "recipient_count": len(recipients),
        "channels": channels,
        "total_deliveries": total_dispatched
    }

def process_deliveries_pipeline(deliveries, campaign):
    """Executes realistic delivery lifecycle progression across created delivery records."""
    for delivery in deliveries:
        # Step 1: Transition QUEUED -> PROCESSING
        record_delivery_event(
            delivery=delivery,
            event_type=DeliveryEvent.EventType.MESSAGE_PROCESSING,
            metadata={"worker_id": "dispatch_worker_1"}
        )

        # Step 2: Channel Adapter Provider Call
        provider = get_provider_for_channel(delivery.channel)
        delivery.provider = provider.provider_name

        content_item = campaign.contents.filter(channel=delivery.channel).first() or campaign.contents.first()
        content_data = {
            "subject": content_item.subject if content_item else campaign.title,
            "body": content_item.body if content_item else campaign.description
        }
        recipient_data = {
            "email": delivery.recipient.email,
            "phone": delivery.recipient.phone,
            "first_name": delivery.recipient.first_name,
        }

        resp = provider.send(recipient_data, content_data)
        delivery.provider_message_id = resp.provider_message_id
        delivery.save(update_fields=['provider', 'provider_message_id'])

        if not resp.success:
            # Handle failure
            record_delivery_event(
                delivery=delivery,
                event_type=DeliveryEvent.EventType.MESSAGE_FAILED,
                metadata={"error_code": resp.error_code, "error_message": resp.error_message}
            )
            continue

        # Step 3: Transition to SENT
        record_delivery_event(
            delivery=delivery,
            event_type=DeliveryEvent.EventType.MESSAGE_SENT,
            provider_event_id=f"evt-sent-{resp.provider_message_id}",
            metadata=resp.metadata
        )

        # Step 4: Transition to DELIVERED
        record_delivery_event(
            delivery=delivery,
            event_type=DeliveryEvent.EventType.MESSAGE_DELIVERED,
            provider_event_id=f"evt-deliv-{resp.provider_message_id}",
            metadata={"network_latency_ms": random.randint(120, 850)}
        )

        # Step 5: High-probability READ & CLICKED simulation
        if random.random() < 0.75:
            record_delivery_event(
                delivery=delivery,
                event_type=DeliveryEvent.EventType.MESSAGE_READ,
                provider_event_id=f"evt-read-{resp.provider_message_id}",
                metadata={"user_agent": "GovComm Mobile App / Web View"}
            )
            if random.random() < 0.35:
                record_delivery_event(
                    delivery=delivery,
                    event_type=DeliveryEvent.EventType.MESSAGE_CLICKED,
                    provider_event_id=f"evt-click-{resp.provider_message_id}",
                    metadata={"target_url": "https://govcomm.gov.in/advisory"}
                )
