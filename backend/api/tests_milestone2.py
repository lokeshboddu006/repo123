from django.test import TestCase
from django.utils import timezone
from datetime import timedelta, date
from rest_framework.test import APIClient
from rest_framework import status
from api.models import (
    User,
    Language,
    State,
    Country,
    District,
    Occupation,
    Recipient,
    AudienceSegment,
    AudienceSegmentRule,
    Campaign,
    CampaignAudience,
    CampaignContent,
    CampaignSchedule
)
from api.campaigns.validator import validate_campaign
from api.audiences.rule_engine import get_audience_recipients


class Milestone2BackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            username='admin_test',
            email='admin@test.com',
            password='TestPassword@123'
        )
        # Login and get JWT token
        login_resp = self.client.post('/api/v1/auth/login/', {
            'login': 'admin_test',
            'password': 'TestPassword@123'
        })
        self.assertEqual(login_resp.status_code, status.HTTP_200_OK)
        self.token = login_resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Setup master data
        self.india = Country.objects.create(name='India', code='IN')
        self.ap = State.objects.create(name='Andhra Pradesh', country=self.india)
        self.vizag = District.objects.create(name='Visakhapatnam', state=self.ap)
        self.te = Language.objects.create(code='te', name='Telugu', native_name='తెలుగు')
        self.en = Language.objects.create(code='en', name='English', native_name='English')
        self.student = Occupation.objects.create(title='Student', category='Education')

    def test_recipient_crud_and_duplicate_detection(self):
        # 1. Create Recipient
        payload = {
            'first_name': 'Test',
            'last_name': 'Student',
            'email': 'student@andhra.edu.in',
            'phone': '+919999988888',
            'external_reference_id': 'TEST-REC-001',
            'state': str(self.ap.id),
            'district': str(self.vizag.id),
            'preferred_language': str(self.te.id),
            'occupation': str(self.student.id),
            'gender': 'MALE'
        }
        res = self.client.post('/api/v1/recipients/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        rec_id = res.data['id']

        # 2. Duplicate detection by email
        res_dup_email = self.client.post('/api/v1/recipients/', {
            'first_name': 'Duplicate',
            'last_name': 'Person',
            'email': 'student@andhra.edu.in',
            'phone': '+919999977777'
        }, format='json')
        self.assertEqual(res_dup_email.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res_dup_email.data)

        # 3. Retrieve
        get_res = self.client.get(f'/api/v1/recipients/{rec_id}/')
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertEqual(get_res.data['first_name'], 'Test')

        # 4. Toggle Status
        toggle_res = self.client.post(f'/api/v1/recipients/{rec_id}/toggle-status/')
        self.assertEqual(toggle_res.status_code, status.HTTP_200_OK)
        self.assertEqual(toggle_res.data['status'], 'INACTIVE')

    def test_dynamic_audience_rule_engine_and_preview(self):
        # Create 2 recipients
        r1 = Recipient.objects.create(
            first_name='AP', last_name='Student',
            email='ap.student@test.com', phone='+919000000001',
            state=self.ap, preferred_language=self.te, occupation=self.student,
            status=Recipient.StatusChoices.ACTIVE
        )
        r2 = Recipient.objects.create(
            first_name='AP', last_name='Doctor',
            email='ap.doctor@test.com', phone='+919000000002',
            state=self.ap, preferred_language=self.te,
            occupation=Occupation.objects.create(title='Doctor', category='Health'),
            status=Recipient.StatusChoices.ACTIVE
        )

        # Preview rules endpoint
        rules = [
            {'field': 'state', 'operator': '=', 'value': 'Andhra Pradesh'},
            {'field': 'language', 'operator': '=', 'value': 'Telugu'},
            {'field': 'occupation', 'operator': '=', 'value': 'Student'}
        ]
        prev_res = self.client.post('/api/v1/audiences/preview/', {'rules': rules}, format='json')
        self.assertEqual(prev_res.status_code, status.HTTP_200_OK)
        self.assertEqual(prev_res.data['matching_count'], 1)
        self.assertEqual(prev_res.data['sample_recipients'][0]['email'], 'ap.student@test.com')

    def test_campaign_validation_and_scheduling(self):
        # Create Audience
        aud = AudienceSegment.objects.create(
            name='Test Audience',
            segment_type=AudienceSegment.SegmentType.DYNAMIC,
            is_active=True
        )
        AudienceSegmentRule.objects.create(audience=aud, field='state', operator='=', value='Andhra Pradesh')

        Recipient.objects.create(
            first_name='Target', last_name='Recipient',
            email='target@andhra.gov.in', phone='+919000000099',
            state=self.ap, preferred_language=self.te, occupation=self.student,
            status=Recipient.StatusChoices.ACTIVE
        )

        # Create Campaign
        c = Campaign.objects.create(
            title='Vaccination Drive 2026',
            campaign_type='AWARENESS',
            priority=Campaign.PriorityChoices.NORMAL,
            status=Campaign.StatusChoices.DRAFT,
            channels=['EMAIL', 'SMS'],
            target_languages=['en', 'te'],
            created_by=self.admin_user
        )
        CampaignAudience.objects.create(campaign=c, audience_segment=aud)

        # Add contents
        CampaignContent.objects.create(
            campaign=c, language=self.en, channel='EMAIL',
            title=c.title, body='Vaccination drive open in AP.'
        )
        CampaignContent.objects.create(
            campaign=c, language=self.te, channel='EMAIL',
            title=c.title, body='ఆంధ్రప్రదేశ్‌లో టీకా పంపిణీ ప్రారంభం.'
        )

        # Validate
        val_res = self.client.post(f'/api/v1/campaigns/{c.id}/validate/')
        self.assertEqual(val_res.status_code, status.HTTP_200_OK)
        self.assertTrue(val_res.data['valid'])

        # Schedule
        sched_res = self.client.post(f'/api/v1/campaigns/{c.id}/schedule/', {
            'schedule_type': 'SCHEDULED',
            'scheduled_time': (timezone.now() + timedelta(days=1)).isoformat()
        }, format='json')
        self.assertEqual(sched_res.status_code, status.HTTP_200_OK)
        self.assertEqual(sched_res.data['status'], 'SCHEDULED')
