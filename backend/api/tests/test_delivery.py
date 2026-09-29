from django.test import TestCase
from api.models import Campaign, Recipient, AudienceSegment, AudienceMember, DeliveryLog, DeliveryEvent, Language
from api.delivery.services.dispatch_engine import dispatch_campaign
from api.delivery.services.retry_engine import retry_delivery
from api.delivery.services.event_service import record_delivery_event
import uuid

class DeliverySystemTest(TestCase):
    def setUp(self):
        self.lang_hi = Language.objects.create(code="hi", name="Hindi")
        self.lang_en = Language.objects.create(code="en", name="English")

        self.recipient = Recipient.objects.create(
            first_name="Test",
            last_name="Officer",
            email="officer@gov.in",
            phone="+919876543210",
            preferred_language=self.lang_hi
        )
        self.audience = AudienceSegment.objects.create(
            name="Emergency Response Team"
        )
        AudienceMember.objects.create(
            audience=self.audience,
            recipient=self.recipient
        )
        
        self.campaign = Campaign.objects.create(
            title="Monsoon Flood Alert",
            description="High alert flood broadcast",
            channels=["SMS", "EMAIL"],
            target_languages=["hi", "en"],
            status="DRAFT"
        )
        self.campaign.audiences.add(self.audience)

    def test_campaign_dispatch(self):
        result = dispatch_campaign(self.campaign.id)
        self.assertEqual(result['status'], 'COMPLETED')
        self.assertEqual(result['total_deliveries'], 2) # SMS + EMAIL
        
        deliveries = DeliveryLog.objects.filter(campaign=self.campaign)
        self.assertEqual(deliveries.count(), 2)
        
        for d in deliveries:
            self.assertIn(d.status, ['SENT', 'DELIVERED', 'READ', 'CLICKED', 'FAILED'])
            events = DeliveryEvent.objects.filter(delivery=d)
            self.assertGreater(events.count(), 0)

    def test_idempotency_prevention(self):
        delivery = DeliveryLog.objects.create(
            campaign=self.campaign,
            recipient=self.recipient,
            channel="SMS",
            status="QUEUED"
        )
        
        evt1 = record_delivery_event(
            delivery=delivery,
            event_type="MESSAGE_DELIVERED",
            provider_event_id="evt_unique_12345"
        )
        self.assertIsNotNone(evt1)
        
        evt2 = record_delivery_event(
            delivery=delivery,
            event_type="MESSAGE_DELIVERED",
            provider_event_id="evt_unique_12345" # Duplicate webhook call
        )
        self.assertEqual(evt1.id, evt2.id)
        self.assertEqual(DeliveryEvent.objects.filter(delivery=delivery).count(), 1)

    def test_retry_engine(self):
        delivery = DeliveryLog.objects.create(
            campaign=self.campaign,
            recipient=self.recipient,
            channel="EMAIL",
            status="FAILED",
            retry_count=1
        )
        
        res = retry_delivery(delivery.id)
        self.assertTrue(res['success'])
        delivery.refresh_from_db()
        self.assertEqual(delivery.retry_count, 2)
        self.assertNotEqual(delivery.status, 'FAILED')
