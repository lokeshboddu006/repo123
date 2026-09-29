import os
import sys
import django
from datetime import timedelta
from django.utils import timezone
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from api.models import (
    Recipient, AudienceSegment, AudienceMember, Campaign, CampaignAudience,
    DeliveryLog, DeliveryEvent, State, District, Language, Occupation, Country,
    EngagementMetric
)

def run():
    print("Polishing Database...")

    # 1. Add realistic recipients
    india = Country.objects.get(code='IN')
    
    names = [
        ("Kavitha", "Shetty", "kavitha.shetty@gmail.com", "Karnataka", "Bengaluru Urban", "Kannada", "Engineer", "FEMALE"),
        ("Meenakshi", "Sundaram", "meenakshi.s@outlook.com", "Tamil Nadu", "Chennai", "Tamil", "Doctor", "FEMALE"),
        ("Mohammad", "Arif", "mohammad.arif@company.in", "Telangana", "Hyderabad", "Hindi", "Business Owner", "MALE"),
        ("Pooja", "Deshmukh", "pooja.d@gmail.com", "Maharashtra", "Pune", "English", "Doctor", "FEMALE"),
        ("Sneha", "Reddy", "sneha.reddy@gmail.com", "Andhra Pradesh", "Vijayawada", "Telugu", "Student", "FEMALE"),
        ("Arjun", "Nair", "arjun.nair@outlook.com", "Kerala", "Thiruvananthapuram", "Malayalam", "Engineer", "MALE"),
        ("Priya", "Menon", "priya.menon@company.org", "Kerala", "Kochi", "Malayalam", "Teacher", "FEMALE"),
        ("Vivek", "Kulkarni", "vivek.k@gmail.com", "Maharashtra", "Mumbai", "Marathi", "Engineer", "MALE"),
        ("Niharika", "Patil", "niharika.p@outlook.com", "Maharashtra", "Nagpur", "Marathi", "Student", "FEMALE"),
        ("Rahul", "Verma", "rahul.verma@company.in", "Delhi", "New Delhi", "Hindi", "Business Owner", "MALE"),
        ("Divya", "Iyer", "divya.iyer@gmail.com", "Tamil Nadu", "Coimbatore", "Tamil", "Doctor", "FEMALE"),
        ("Sanjay", "Rao", "sanjay.rao@outlook.com", "Karnataka", "Mysuru", "Kannada", "Teacher", "MALE"),
        ("Lakshmi", "Narayanan", "lakshmi.n@organization.in", "Tamil Nadu", "Madurai", "Tamil", "Government Employee", "MALE"),
        ("Siddharth", "Reddy", "siddharth.r@gmail.com", "Telangana", "Warangal", "Telugu", "Engineer", "MALE"),
        ("Deepa", "Kamat", "deepa.kamat@company.org", "Goa", "North Goa", "Konkani", "Business Owner", "FEMALE"),
        ("Ravi", "Teja", "ravi.teja@gmail.com", "Andhra Pradesh", "Guntur", "Telugu", "Student", "MALE"),
        ("Sunita", "Sharma", "sunita.sharma@outlook.com", "Haryana", "Gurugram", "Hindi", "Doctor", "FEMALE"),
        ("Amit", "Patel", "amit.patel@company.in", "Gujarat", "Ahmedabad", "Gujarati", "Engineer", "MALE"),
        ("Neha", "Singh", "neha.singh@gmail.com", "Uttar Pradesh", "Lucknow", "Hindi", "Teacher", "FEMALE"),
        ("Vikram", "Chauhan", "vikram.c@outlook.com", "Rajasthan", "Jaipur", "Hindi", "Business Owner", "MALE"),
        ("Kiran", "Desai", "kiran.desai@company.org", "Gujarat", "Surat", "Gujarati", "Student", "MALE"),
        ("Aishwarya", "Rai", "aishwarya.r@gmail.com", "Karnataka", "Mangaluru", "Kannada", "Doctor", "FEMALE"),
        ("Manoj", "Kumar", "manoj.kumar@outlook.com", "Bihar", "Patna", "Hindi", "Engineer", "MALE"),
        ("Anita", "Das", "anita.das@company.in", "West Bengal", "Kolkata", "Bengali", "Teacher", "FEMALE"),
        ("Rakesh", "Roshan", "rakesh.r@gmail.com", "Maharashtra", "Nashik", "Marathi", "Business Owner", "MALE"),
        ("Priyanka", "Chopra", "priyanka.c@outlook.com", "Jharkhand", "Jamshedpur", "Hindi", "Student", "FEMALE"),
        ("Sushant", "Singh", "sushant.s@company.org", "Bihar", "Gaya", "Hindi", "Doctor", "MALE"),
        ("Shruti", "Hassan", "shruti.h@gmail.com", "Tamil Nadu", "Tiruchirappalli", "Tamil", "Engineer", "FEMALE"),
        ("Rana", "Daggubati", "rana.d@outlook.com", "Andhra Pradesh", "Visakhapatnam", "Telugu", "Teacher", "MALE"),
        ("Kajal", "Aggarwal", "kajal.a@company.in", "Telangana", "Nizamabad", "Telugu", "Business Owner", "FEMALE"),
        ("Aditya", "Rao", "aditya.rao@outlook.com", "Karnataka", "Bengaluru Urban", "Kannada", "Engineer", "MALE"),
        ("Bhavana", "Reddy", "bhavana.r@gmail.com", "Andhra Pradesh", "Visakhapatnam", "Telugu", "Doctor", "FEMALE"),
        ("Chirag", "Joshi", "chirag.joshi@company.in", "Maharashtra", "Mumbai", "Marathi", "Business Owner", "MALE"),
        ("Farhan", "Shaikh", "farhan.s@gmail.com", "Telangana", "Hyderabad", "Urdu", "Student", "MALE"),
        ("Gayatri", "Devi", "gayatri.devi@company.org", "Tamil Nadu", "Chennai", "Tamil", "Teacher", "FEMALE"),
        ("Harish", "Chandra", "harish.c@outlook.com", "Delhi", "New Delhi", "Hindi", "Government Employee", "MALE"),
        ("Indira", "Gandhi", "indira.g@organization.in", "Uttar Pradesh", "Prayagraj", "Hindi", "Social Worker", "FEMALE"),
        ("Jayant", "Mishra", "jayant.m@company.in", "Madhya Pradesh", "Bhopal", "Hindi", "Engineer", "MALE"),
        ("Karthik", "Venkatesh", "karthik.v@gmail.com", "Karnataka", "Mysuru", "Kannada", "Engineer", "MALE"),
        ("Lavanya", "Sundar", "lavanya.s@outlook.com", "Tamil Nadu", "Coimbatore", "Tamil", "Student", "FEMALE"),
        ("Madhavan", "Nambiar", "madhavan.n@company.org", "Kerala", "Kozhikode", "Malayalam", "Business Owner", "MALE"),
        ("Nandini", "Sen", "nandini.sen@gmail.com", "West Bengal", "Kolkata", "Bengali", "Doctor", "FEMALE"),
        ("Omkar", "Bhave", "omkar.bhave@outlook.com", "Maharashtra", "Pune", "Marathi", "Engineer", "MALE"),
        ("Pallavi", "Sharma", "pallavi.s@company.in", "Rajasthan", "Jaipur", "Hindi", "Teacher", "FEMALE"),
        ("Qasim", "Khan", "qasim.khan@gmail.com", "Telangana", "Warangal", "Urdu", "Business Owner", "MALE"),
        ("Rohit", "Choudhury", "rohit.c@outlook.com", "Assam", "Guwahati", "Assamese", "Engineer", "MALE"),
        ("Swathi", "Krishnan", "swathi.k@gmail.com", "Tamil Nadu", "Salem", "Tamil", "Student", "FEMALE"),
        ("Tarun", "Gupta", "tarun.gupta@company.org", "Punjab", "Ludhiana", "Punjabi", "Business Owner", "MALE"),
        ("Urmila", "Mahato", "urmila.m@outlook.com", "Jharkhand", "Ranchi", "Hindi", "Teacher", "FEMALE"),
        ("Venkatesh", "Prasad", "venkatesh.p@gmail.com", "Karnataka", "Belagavi", "Kannada", "Government Employee", "MALE"),
    ]
    
    # Clean up existing recipients
    for r in Recipient.objects.all():
        if "test" in r.email or "demo" in r.email or "sample" in r.email or r.email.startswith("user"):
            r.email = f"{r.first_name.lower()}.{r.last_name.lower()}@gmail.com"
            r.phone = f"+919{random.randint(100000000, 999999999)}"
            r.save()
            
    # Add synthetic users
    for fn, ln, em, st, dist, lang, occ, gen in names:
        state_obj, _ = State.objects.get_or_create(name=st, country=india)
        dist_obj, _ = District.objects.get_or_create(name=dist, state=state_obj)
        lang_obj, _ = Language.objects.get_or_create(name=lang, defaults={'code': lang[:2].lower(), 'native_name': lang})
        occ_obj, _ = Occupation.objects.get_or_create(title=occ)
        
        Recipient.objects.get_or_create(
            email=em,
            defaults={
                'first_name': fn,
                'last_name': ln,
                'phone': f"+919{random.randint(100000000, 999999999)}",
                'state': state_obj,
                'district': dist_obj,
                'city': dist,
                'country': india,
                'language': lang_obj,
                'preferred_language': lang_obj,
                'occupation': occ_obj,
                'gender': gen,
                'status': 'ACTIVE',
                'consent': True
            }
        )

    # 2. Update Audience names
    default_aud = None
    for aud in AudienceSegment.objects.all():
        if "Static" in aud.name or "Demo" in aud.name or "Mock" in aud.name or "DYNAMIC" in aud.name:
            aud.name = aud.name.replace("Static ", "").replace("Demo ", "").replace("Mock ", "").replace("DYNAMIC ", "").strip()
        # Add recipients to static rosters
        for r in Recipient.objects.all()[:45]:
            AudienceMember.objects.get_or_create(audience=aud, recipient=r)
        aud.save()
        if not default_aud:
            default_aud = aud

    # 3. Simulate Realistic Campaign Deliveries for ALL Campaigns
    campaigns = Campaign.objects.all()
    all_recipients = list(Recipient.objects.all()[:44])

    channels_list = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH']

    for campaign in campaigns:
        campaign.status = 'COMPLETED'
        
        # Ensure audience link exists
        if not campaign.audiences.exists():
            if default_aud:
                CampaignAudience.objects.get_or_create(campaign=campaign, audience_segment=default_aud)
                campaign.audience = default_aud
        campaign.save()

        # Delete existing logs for clean state
        DeliveryLog.objects.filter(campaign=campaign).delete()
        EngagementMetric.objects.filter(campaign=campaign).delete()

        # Numbers specification:
        # Total: 44
        # Queued: 2
        # Processing: 1
        # Failed: 2
        # Sent: 2
        # Delivered: 8
        # Read: 15
        # Clicked: 14
        # -> Sent effective = 2 + 8 + 15 + 14 = 39
        # -> Delivered effective = 8 + 15 + 14 = 37
        # -> Read effective = 15 + 14 = 29
        # -> Clicked = 14
        # -> Queued = 2
        # -> Processing = 1
        # -> Failed = 2

        base_time = timezone.now() - timedelta(minutes=35)

        statuses = (
            ['QUEUED'] * 2 +
            ['PROCESSING'] * 1 +
            ['FAILED'] * 2 +
            ['SENT'] * 2 +
            ['DELIVERED'] * 8 +
            ['READ'] * 15 +
            ['CLICKED'] * 14
        )

        for i, rec in enumerate(all_recipients[:len(statuses)]):
            st = statuses[i]
            ch = channels_list[i % len(channels_list)]
            provider_ref = f"IN-{ch[:3]}-{random.randint(100000, 999999)}"

            t_queued = base_time + timedelta(seconds=i * 3)
            t_processing = t_queued + timedelta(seconds=2)
            t_sent = t_processing + timedelta(seconds=5) if st not in ['QUEUED', 'PROCESSING'] else None
            t_delivered = t_sent + timedelta(seconds=random.randint(15, 45)) if st in ['DELIVERED', 'READ', 'CLICKED'] else None
            t_read = t_delivered + timedelta(minutes=random.randint(2, 6), seconds=random.randint(5, 50)) if st in ['READ', 'CLICKED'] else None
            t_clicked = t_read + timedelta(minutes=random.randint(1, 3), seconds=random.randint(10, 40)) if st == 'CLICKED' else None
            t_failed = t_processing + timedelta(seconds=8) if st == 'FAILED' else None

            err_code = ''
            err_msg = ''
            retries = 0
            if st == 'FAILED':
                err_code = 'CARRIER_TIMEOUT' if i % 2 == 0 else 'INVALID_DESTINATION_ROUTE'
                err_msg = 'Upstream telecom gateway timed out after 30s' if i % 2 == 0 else 'Subscriber route unreachable'
                retries = 2

            log = DeliveryLog.objects.create(
                campaign=campaign,
                recipient=rec,
                channel=ch,
                status=st,
                provider='telecom_ind_gw',
                provider_message_id=provider_ref,
                queued_at=t_queued,
                processing_at=t_processing if st != 'QUEUED' else None,
                sent_at=t_sent,
                delivered_at=t_delivered,
                read_at=t_read,
                clicked_at=t_clicked,
                failed_at=t_failed,
                retry_count=retries,
                error_code=err_code,
                error_message=err_msg
            )

            # Audit / Lifecycle events
            DeliveryEvent.objects.create(
                delivery=log,
                event_type='MESSAGE_QUEUED',
                timestamp=t_queued,
                metadata={'step': 'queue_accepted', 'gateway': 'telecom_ind_gw'}
            )

            if st != 'QUEUED':
                DeliveryEvent.objects.create(
                    delivery=log,
                    event_type='MESSAGE_PROCESSING',
                    timestamp=t_processing,
                    metadata={'step': 'adapter_handoff', 'channel': ch}
                )

            if t_sent:
                DeliveryEvent.objects.create(
                    delivery=log,
                    event_type='MESSAGE_SENT',
                    timestamp=t_sent,
                    metadata={'step': 'carrier_accepted', 'provider_id': provider_ref}
                )

            if st == 'FAILED':
                DeliveryEvent.objects.create(
                    delivery=log,
                    event_type='MESSAGE_FAILED',
                    timestamp=t_failed,
                    metadata={'error_code': err_code, 'error_message': err_msg}
                )

            if t_delivered:
                DeliveryEvent.objects.create(
                    delivery=log,
                    event_type='MESSAGE_DELIVERED',
                    timestamp=t_delivered,
                    metadata={'step': 'device_handset_ack', 'status': '200_OK'}
                )

            if t_read:
                DeliveryEvent.objects.create(
                    delivery=log,
                    event_type='MESSAGE_READ',
                    timestamp=t_read,
                    metadata={'step': 'recipient_rendered', 'user_agent': 'Mobile Viewport'}
                )

            if t_clicked:
                DeliveryEvent.objects.create(
                    delivery=log,
                    event_type='MESSAGE_CLICKED',
                    timestamp=t_clicked,
                    metadata={'step': 'action_url_followed', 'url': 'https://gov.in/cyclone-alert-2026/safety'}
                )

            # Record engagement metric
            EngagementMetric.objects.create(
                campaign=campaign,
                recipient=rec,
                opened=(st in ['READ', 'CLICKED']),
                clicked=(st == 'CLICKED'),
                sentiment_rating='POSITIVE' if st == 'CLICKED' else 'NEUTRAL'
            )

        print(f"Generated {DeliveryLog.objects.filter(campaign=campaign).count()} delivery logs for campaign: {campaign.title}")

    print("Database Polishing Complete!")

if __name__ == '__main__':
    run()
