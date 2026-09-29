from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from api.models import (
    User,
    Language,
    Country,
    State,
    District,
    Location,
    Occupation,
    Organization,
    OrganizationUnit,
    Recipient,
    RecipientChannelPreference,
    AudienceSegment,
    AudienceSegmentRule,
    AudienceMember,
    CampaignType,
    Campaign,
    CampaignAudience,
    CampaignContent,
    CampaignSchedule,
    Template,
    ContentLibrary
)


class Command(BaseCommand):
    help = 'Seeds realistic demo data for Milestone 2 presentation flow'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Milestone 2 demonstration data..."))

        # 1. Admin User (Lokesh)
        lokesh_user, created = User.objects.get_or_create(
            username='Lokesh',
            defaults={
                'email': 'lokesh@multilingual.gov.in',
                'first_name': 'Lokesh',
                'last_name': 'Admin',
                'role': User.RoleChoices.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        lokesh_user.set_password('lokesh@123')
        lokesh_user.is_staff = True
        lokesh_user.is_superuser = True
        lokesh_user.role = User.RoleChoices.ADMIN
        lokesh_user.save()
        admin_user = lokesh_user
        self.stdout.write(self.style.SUCCESS("Ensured Admin user: Lokesh / lokesh@123"))

        # 2. Languages
        languages_data = [
            {'code': 'en', 'name': 'English', 'native_name': 'English', 'is_indic': False},
            {'code': 'hi', 'name': 'Hindi', 'native_name': 'हिन्दी', 'is_indic': True},
            {'code': 'te', 'name': 'Telugu', 'native_name': 'తెలుగు', 'is_indic': True},
            {'code': 'ta', 'name': 'Tamil', 'native_name': 'தமிழ்', 'is_indic': True},
            {'code': 'kn', 'name': 'Kannada', 'native_name': 'ಕನ್ನಡ', 'is_indic': True},
        ]
        lang_objs = {}
        for l_data in languages_data:
            obj, _ = Language.objects.get_or_create(code=l_data['code'], defaults=l_data)
            lang_objs[l_data['name']] = obj
            lang_objs[l_data['code']] = obj

        # 3. Country, States & Districts
        india, _ = Country.objects.get_or_create(code='IN', defaults={'name': 'India'})

        states_data = {
            'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati'],
            'Karnataka': ['Bengaluru Urban', 'Mysuru', 'Hubballi', 'Mangaluru'],
            'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
            'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam'],
            'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik']
        }

        state_objs = {}
        dist_objs = {}
        for s_name, districts in states_data.items():
            s_obj, _ = State.objects.get_or_create(name=s_name, country=india)
            state_objs[s_name] = s_obj
            for d_name in districts:
                d_obj, _ = District.objects.get_or_create(name=d_name, state=s_obj)
                dist_objs[f"{s_name}_{d_name}"] = d_obj
                # backward compatibility location
                Location.objects.get_or_create(state=s_name, district=d_name)

        # 4. Occupations
        occupations_list = [
            ('Student', 'Education'),
            ('Teacher', 'Education'),
            ('Doctor', 'Healthcare'),
            ('Farmer', 'Agriculture'),
            ('Engineer', 'Technology'),
            ('Government Employee', 'Public Administration'),
            ('Business Owner', 'Commerce'),
            ('Healthcare Worker', 'Healthcare'),
        ]
        occ_objs = {}
        for title, cat in occupations_list:
            occ_obj, _ = Occupation.objects.get_or_create(title=title, defaults={'category': cat})
            occ_objs[title] = occ_obj

        # 5. Organizations & Hierarchical Units
        # Organization -> Department -> Unit -> Team
        health_dept, _ = Organization.objects.get_or_create(
            name='Department of Public Health & Family Welfare',
            defaults={'department': 'Public Health'}
        )
        disaster_dept, _ = Organization.objects.get_or_create(
            name='State Disaster Management Authority',
            defaults={'department': 'Emergency Response'}
        )

        # Hierarchical units
        unit_dept, _ = OrganizationUnit.objects.get_or_create(
            organization=health_dept,
            name='Epidemiology & Disease Surveillance',
            defaults={'unit_type': 'Department'}
        )
        unit_sub, _ = OrganizationUnit.objects.get_or_create(
            organization=health_dept,
            name='Vector Control Unit',
            parent_unit=unit_dept,
            defaults={'unit_type': 'Unit'}
        )
        unit_team, _ = OrganizationUnit.objects.get_or_create(
            organization=health_dept,
            name='Field Rapid Action Team A',
            parent_unit=unit_sub,
            defaults={'unit_type': 'Team'}
        )

        # 6. Campaign Types
        campaign_types_data = [
            ('AWARENESS', 'Public Awareness', 'General public awareness and information campaigns'),
            ('EMERGENCY_ALERT', 'Emergency Alert', 'Urgent disaster, weather, and health emergency notices'),
            ('EDUCATIONAL', 'Educational Outreach', 'Scholarship and academic announcements'),
            ('ORGANIZATIONAL_ANNOUNCEMENT', 'Organizational Announcement', 'Official policy notices and updates'),
        ]
        for code, name, desc in campaign_types_data:
            CampaignType.objects.get_or_create(code=code, defaults={'name': name, 'description': desc})

        # 7. Recipients (16 diverse recipients, ensuring multiple Andhra Pradesh + Telugu + Student for presentation demo)
        recipients_data = [
            # Andhra Pradesh + Telugu + Student (MATCHES DEMO QUERY)
            {
                'first_name': 'Ramesh', 'last_name': 'Kalyan', 'email': 'ramesh.kalyan@andhra-uni.edu.in',
                'phone': '+919848011221', 'external_reference_id': 'REC-AP-STU-001',
                'state': 'Andhra Pradesh', 'district': 'Visakhapatnam', 'city': 'Visakhapatnam',
                'language': 'Telugu', 'occupation': 'Student', 'gender': 'MALE', 'dob': date(2003, 5, 14)
            },
            {
                'first_name': 'Priyanka', 'last_name': 'Reddy', 'email': 'priyanka.reddy@vignan.edu.in',
                'phone': '+919848022332', 'external_reference_id': 'REC-AP-STU-002',
                'state': 'Andhra Pradesh', 'district': 'Vijayawada', 'city': 'Vijayawada',
                'language': 'Telugu', 'occupation': 'Student', 'gender': 'FEMALE', 'dob': date(2004, 2, 20)
            },
            {
                'first_name': 'Srinivas', 'last_name': 'Rao', 'email': 'srinivas.rao@gunturtech.ac.in',
                'phone': '+919848033443', 'external_reference_id': 'REC-AP-STU-003',
                'state': 'Andhra Pradesh', 'district': 'Guntur', 'city': 'Guntur',
                'language': 'Telugu', 'occupation': 'Student', 'gender': 'MALE', 'dob': date(2003, 11, 8)
            },
            {
                'first_name': 'Ananya', 'last_name': 'Sharma', 'email': 'ananya.s@svu.edu.in',
                'phone': '+919848044554', 'external_reference_id': 'REC-AP-STU-004',
                'state': 'Andhra Pradesh', 'district': 'Tirupati', 'city': 'Tirupati',
                'language': 'Telugu', 'occupation': 'Student', 'gender': 'FEMALE', 'dob': date(2002, 9, 3)
            },
            # Andhra Pradesh Other Occupations
            {
                'first_name': 'Venkat', 'last_name': 'Subbaiah', 'email': 'venkat.farmer@kisanmail.in',
                'phone': '+919848055665', 'external_reference_id': 'REC-AP-FAR-005',
                'state': 'Andhra Pradesh', 'district': 'Guntur', 'city': 'Tenali',
                'language': 'Telugu', 'occupation': 'Farmer', 'gender': 'MALE', 'dob': date(1982, 3, 12)
            },
            {
                'first_name': 'Dr. Lakshmi', 'last_name': 'Narayana', 'email': 'lakshmi.doc@aphealth.org',
                'phone': '+919848066776', 'external_reference_id': 'REC-AP-DOC-006',
                'state': 'Andhra Pradesh', 'district': 'Vijayawada', 'city': 'Vijayawada',
                'language': 'Telugu', 'occupation': 'Doctor', 'gender': 'FEMALE', 'dob': date(1979, 7, 25)
            },
            # Karnataka Recipients
            {
                'first_name': 'Suresh', 'last_name': 'Gowda', 'email': 'suresh.gowda@bluetech.co.in',
                'phone': '+919844011221', 'external_reference_id': 'REC-KA-ENG-007',
                'state': 'Karnataka', 'district': 'Bengaluru Urban', 'city': 'Bengaluru',
                'language': 'Kannada', 'occupation': 'Engineer', 'gender': 'MALE', 'dob': date(1991, 8, 19)
            },
            {
                'first_name': 'Kavitha', 'last_name': 'Shetty', 'email': 'kavitha.s@mysureschool.edu.in',
                'phone': '+919844022332', 'external_reference_id': 'REC-KA-TCH-008',
                'state': 'Karnataka', 'district': 'Mysuru', 'city': 'Mysuru',
                'language': 'Kannada', 'occupation': 'Teacher', 'gender': 'FEMALE', 'dob': date(1988, 12, 1)
            },
            # Tamil Nadu Recipients
            {
                'first_name': 'Karthik', 'last_name': 'Raman', 'email': 'karthik.raman@chennaicivic.gov.in',
                'phone': '+919841011221', 'external_reference_id': 'REC-TN-GOV-009',
                'state': 'Tamil Nadu', 'district': 'Chennai', 'city': 'Chennai',
                'language': 'Tamil', 'occupation': 'Government Employee', 'gender': 'MALE', 'dob': date(1985, 4, 15)
            },
            {
                'first_name': 'Meenakshi', 'last_name': 'Sundaram', 'email': 'meenakshi.health@tncare.org',
                'phone': '+919841022332', 'external_reference_id': 'REC-TN-HCW-010',
                'state': 'Tamil Nadu', 'district': 'Madurai', 'city': 'Madurai',
                'language': 'Tamil', 'occupation': 'Healthcare Worker', 'gender': 'FEMALE', 'dob': date(1994, 10, 10)
            },
            # Telangana Recipients
            {
                'first_name': 'Mohammad', 'last_name': 'Arif', 'email': 'arif.hyd@biznetwork.in',
                'phone': '+919849011221', 'external_reference_id': 'REC-TG-BIZ-011',
                'state': 'Telangana', 'district': 'Hyderabad', 'city': 'Hyderabad',
                'language': 'Hindi', 'occupation': 'Business Owner', 'gender': 'MALE', 'dob': date(1980, 1, 30)
            },
            {
                'first_name': 'Swathi', 'last_name': 'Kurnool', 'email': 'swathi.k@ou.ac.in',
                'phone': '+919849022332', 'external_reference_id': 'REC-TG-STU-012',
                'state': 'Telangana', 'district': 'Hyderabad', 'city': 'Secunderabad',
                'language': 'Telugu', 'occupation': 'Student', 'gender': 'FEMALE', 'dob': date(2003, 7, 22)
            },
            # Maharashtra & General
            {
                'first_name': 'Rajesh', 'last_name': 'Patil', 'email': 'rajesh.patil@mahapolice.gov.in',
                'phone': '+919820011221', 'external_reference_id': 'REC-MH-GOV-013',
                'state': 'Maharashtra', 'district': 'Mumbai', 'city': 'Mumbai',
                'language': 'Hindi', 'occupation': 'Government Employee', 'gender': 'MALE', 'dob': date(1977, 6, 18)
            },
            {
                'first_name': 'Pooja', 'last_name': 'Deshmukh', 'email': 'pooja.d@punecare.in',
                'phone': '+919820022332', 'external_reference_id': 'REC-MH-DOC-014',
                'state': 'Maharashtra', 'district': 'Pune', 'city': 'Pune',
                'language': 'English', 'occupation': 'Doctor', 'gender': 'FEMALE', 'dob': date(1989, 9, 29)
            },
            {
                'first_name': 'Amit', 'last_name': 'Verma', 'email': 'amit.verma@nationalagro.org',
                'phone': '+919810011221', 'external_reference_id': 'REC-DL-FAR-015',
                'state': 'Maharashtra', 'district': 'Nagpur', 'city': 'Nagpur',
                'language': 'Hindi', 'occupation': 'Farmer', 'gender': 'MALE', 'dob': date(1983, 11, 14)
            },
        ]

        saved_recipients = []
        for r_item in recipients_data:
            s_obj = state_objs.get(r_item['state'])
            d_obj = dist_objs.get(f"{r_item['state']}_{r_item['district']}")
            l_obj = lang_objs.get(r_item['language'])
            o_obj = occ_objs.get(r_item['occupation'])

            rec, _ = Recipient.objects.get_or_create(
                email=r_item['email'],
                defaults={
                    'first_name': r_item['first_name'],
                    'last_name': r_item['last_name'],
                    'phone': r_item['phone'],
                    'external_reference_id': r_item['external_reference_id'],
                    'external_ref_id': r_item['external_reference_id'],
                    'state': s_obj,
                    'district': d_obj,
                    'city': r_item['city'],
                    'country': india,
                    'preferred_language': l_obj,
                    'language': l_obj,
                    'occupation': o_obj,
                    'gender': r_item['gender'],
                    'date_of_birth': r_item['dob'],
                    'status': Recipient.StatusChoices.ACTIVE,
                    'consent': True
                }
            )
            saved_recipients.append(rec)

            # Assign channel preferences: Email, SMS, WhatsApp
            for ch in ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH']:
                RecipientChannelPreference.objects.get_or_create(
                    recipient=rec,
                    channel=ch,
                    defaults={'is_enabled': True}
                )

        # 8. Communication Templates
        t1, _ = Template.objects.get_or_create(
            title='Seasonal Dengue Prevention Advisory',
            defaults={
                'scenario': 'Awareness',
                'subject_template': 'Health Alert: Dengue Prevention Guidelines for {{location}}',
                'body_template': 'Dear Citizen, on {{date}}, Public Health Department issues precautions for {{location}}: {{message}}. Keep water containers clean and avoid stagnation.',
                'default_languages': ['en', 'hi', 'te', 'ta', 'kn'],
                'active': True,
                'created_by': admin_user
            }
        )
        t2, _ = Template.objects.get_or_create(
            title='Monsoon Flood Safety Warning',
            defaults={
                'scenario': 'Emergency Alert',
                'subject_template': 'CRITICAL ALERT: Flood Warning in {{location}}',
                'body_template': 'EMERGENCY: Heavy rainfall alert in {{location}} on {{date}}. {{message}}. Please proceed to designated relief shelters if in low-lying zones.',
                'default_languages': ['en', 'hi', 'te'],
                'active': True,
                'created_by': admin_user
            }
        )
        t3, _ = Template.objects.get_or_create(
            title='Higher Education Scholarship Notification',
            defaults={
                'scenario': 'Educational',
                'subject_template': 'Scholarship Application Open: {{title}}',
                'body_template': 'Dear Students of {{location}}, applications for the {{title}} are open till {{date}}. {{message}}. Visit the state portal to submit documents.',
                'default_languages': ['en', 'te', 'kn'],
                'active': True,
                'created_by': admin_user
            }
        )

        # 9. Content Library
        content_items = [
            {
                'title': 'Dengue Prevention & Stagnant Water Management',
                'category': 'Dengue Prevention',
                'language': lang_objs.get('English'),
                'content': 'Prevent dengue transmission by eliminating standing water in coolers, pots, and discarded tyres once every week.'
            },
            {
                'title': 'డెంగ్యూ నివారణ సూచనలు (Dengue Advisory in Telugu)',
                'category': 'Dengue Prevention',
                'language': lang_objs.get('Telugu'),
                'content': 'ఇళ్ల చుట్టుపక్కల నీరు నిల్వ ఉండకుండా చూసుకోవాలి. దోమల వ్యాప్తిని అరికట్టడం ద్వారా డెంగ్యూ బారిన పడకుండా ఉండవచ్చు.'
            },
            {
                'title': 'Monsoon Flash Flood Safety Protocols',
                'category': 'Flood Safety',
                'language': lang_objs.get('English'),
                'content': 'Do not attempt to drive or walk through flooded roadways. Keep battery torches, essential medications, and emergency numbers accessible.'
            },
            {
                'title': 'Drinking Water Conservation Guidelines',
                'category': 'Water Conservation',
                'language': lang_objs.get('English'),
                'content': 'Adopt rainwater harvesting and drip irrigation techniques to conserve municipal groundwater reserves.'
            },
            {
                'title': 'State Merit Scholarship Scheme 2026',
                'category': 'Education Scholarship',
                'language': lang_objs.get('English'),
                'content': 'Merit-cum-means scholarship covers full tuition for undergraduate students in accredited colleges across Andhra Pradesh.'
            },
        ]
        for c_item in content_items:
            ContentLibrary.objects.get_or_create(
                title=c_item['title'],
                defaults={
                    'category': c_item['category'],
                    'language': c_item['language'],
                    'content': c_item['content'],
                    'active': True
                }
            )

        # 10. Audiences
        # Dynamic Audience: Andhra Pradesh + Telugu + Student (For presentation demo)
        demo_aud, _ = AudienceSegment.objects.get_or_create(
            name='AP Telugu College Students',
            defaults={
                'description': 'Students residing in Andhra Pradesh with Telugu as preferred language',
                'segment_type': AudienceSegment.SegmentType.DYNAMIC,
                'is_active': True,
                'created_by': admin_user
            }
        )
        # Add the 3 rules for demo
        AudienceSegmentRule.objects.filter(audience=demo_aud).delete()
        AudienceSegmentRule.objects.create(audience=demo_aud, field='state', operator='=', value='Andhra Pradesh')
        AudienceSegmentRule.objects.create(audience=demo_aud, field='language', operator='=', value='Telugu')
        AudienceSegmentRule.objects.create(audience=demo_aud, field='occupation', operator='=', value='Student')

        # Dynamic Audience: Healthcare Workers
        hw_aud, _ = AudienceSegment.objects.get_or_create(
            name='Healthcare Personnel Nationwide',
            defaults={
                'description': 'Doctors and healthcare workers across all regions',
                'segment_type': AudienceSegment.SegmentType.DYNAMIC,
                'is_active': True,
                'created_by': admin_user
            }
        )
        AudienceSegmentRule.objects.filter(audience=hw_aud).delete()
        AudienceSegmentRule.objects.create(audience=hw_aud, field='occupation', operator='=', value='Doctor')

        # Static Audience
        static_aud, _ = AudienceSegment.objects.get_or_create(
            name='District Emergency Core Contacts',
            defaults={
                'description': 'Designated emergency officers and responders',
                'segment_type': AudienceSegment.SegmentType.STATIC,
                'is_active': True,
                'created_by': admin_user
            }
        )
        for r in saved_recipients[:3]:
            AudienceMember.objects.get_or_create(audience=static_aud, recipient=r)

        # 11. Sample Campaigns
        c1, _ = Campaign.objects.get_or_create(
            title='Vector-Borne Disease Awareness Drive 2026',
            defaults={
                'description': 'Statewide public health awareness campaign regarding dengue and malaria prevention',
                'campaign_type': 'AWARENESS',
                'priority': Campaign.PriorityChoices.NORMAL,
                'status': Campaign.StatusChoices.DRAFT,
                'channels': ['EMAIL', 'SMS'],
                'target_languages': ['en', 'te'],
                'template': t1,
                'created_by': admin_user
            }
        )
        CampaignAudience.objects.get_or_create(campaign=c1, audience_segment=demo_aud)
        CampaignContent.objects.get_or_create(
            campaign=c1,
            language=lang_objs['English'],
            channel='EMAIL',
            defaults={
                'subject': 'Public Health Notice: Vector Control in Andhra Pradesh',
                'title': c1.title,
                'body': 'Health advisory for Visakhapatnam and surrounding districts: Prevent mosquito breeding by removing stagnant water.',
                'ai_generated': False
            }
        )
        CampaignContent.objects.get_or_create(
            campaign=c1,
            language=lang_objs['Telugu'],
            channel='EMAIL',
            defaults={
                'subject': 'ఆరోగ్య సూచన: దోమల నివారణ మరియు పరిశుభ్రత',
                'title': c1.title,
                'body': 'ఆంధ్రప్రదేశ్ ప్రజలకు ముఖ్య గమనిక: డెంగ్యూ వ్యాప్తి నివారణకు పరిసరాలను పరిశుభ్రంగా ఉంచుకోవలెను.',
                'ai_generated': False
            }
        )

        # Scheduled Campaign
        c2, _ = Campaign.objects.get_or_create(
            title='Monsoon Coastal Flood Preparedness Alert',
            defaults={
                'description': 'Early warning broadcast for coastal districts',
                'campaign_type': 'EMERGENCY_ALERT',
                'priority': Campaign.PriorityChoices.HIGH,
                'status': Campaign.StatusChoices.SCHEDULED,
                'channels': ['EMAIL', 'SMS', 'WHATSAPP'],
                'target_languages': ['en', 'te'],
                'scheduled_at': timezone.now() + timedelta(days=2),
                'template': t2,
                'created_by': admin_user
            }
        )
        CampaignAudience.objects.get_or_create(campaign=c2, audience_segment=demo_aud)
        CampaignSchedule.objects.get_or_create(
            campaign=c2,
            defaults={
                'schedule_type': 'SCHEDULED',
                'scheduled_time': timezone.now() + timedelta(days=2),
                'timezone': 'Asia/Kolkata',
                'status': 'PENDING'
            }
        )
        CampaignContent.objects.get_or_create(
            campaign=c2,
            language=lang_objs['English'],
            channel='EMAIL',
            defaults={
                'subject': 'EMERGENCY: Coastal Weather Alert',
                'title': c2.title,
                'body': 'Severe rainfall forecast in Visakhapatnam over the next 48 hours. Emergency helpline: 1070.',
                'ai_generated': False
            }
        )
        CampaignContent.objects.get_or_create(
            campaign=c2,
            language=lang_objs['Telugu'],
            channel='EMAIL',
            defaults={
                'subject': 'అత్యవసర హెచ్చరిక: తీరప్రాంత భారీ వర్ష సూచన',
                'title': c2.title,
                'body': 'విశాఖపట్నం తీరప్రాంత ప్రజలకు హెచ్చరిక. రాగల 48 గంటల్లో భారీ వర్షాలు కురిసే అవకాశం ఉంది.',
                'ai_generated': False
            }
        )

        self.stdout.write(self.style.SUCCESS("Demo data successfully seeded for Milestone 2!"))
