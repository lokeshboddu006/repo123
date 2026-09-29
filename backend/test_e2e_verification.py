import sys
import io
import requests

# Ensure stdout handles UTF-8
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("=" * 60)
print("GOVCOMM AI — FULL END-TO-END VERIFICATION SUITE")
print("=" * 60)

# 1. Health Checks
print("\n[1/9] Verifying Platform Health...")
res_be = requests.get('http://127.0.0.1:8000/api/v1/health/')
assert res_be.status_code == 200, f"Django health failed: {res_be.text}"
print("✓ Django Core REST API is Online (Port 8000)")

res_ai = requests.get('http://127.0.0.1:8001/health')
assert res_ai.status_code == 200, f"AI service health failed: {res_ai.text}"
print("✓ FastAPI AI Microservice is Online (Port 8001)")

# 2. Email Availability Check
print("\n[2/9] Verifying Check-Email Endpoint...")
res_exist = requests.post('http://127.0.0.1:8000/api/v1/auth/check-email/', json={'email': 'admin@example.com'})
assert res_exist.status_code == 200
assert res_exist.json()['available'] is False, "admin@example.com should be reported unavailable"
print("✓ Existing email correctly flagged as unavailable")

unique_email = "dr.boddu.lokesh@disaster.ap.gov.in"
res_avail = requests.post('http://127.0.0.1:8000/api/v1/auth/check-email/', json={'email': unique_email})
assert res_avail.status_code == 200
print(f"✓ New email checked: available = {res_avail.json()['available']}")

# 3. Creator Registration with 6-Step Data
print("\n[3/9] Testing Creator Registration / Multi-Step Signup...")
signup_payload = {
    'full_name': 'Dr. Boddu Lokesh',
    'email': unique_email,
    'password': 'CreatorPassword@2026',
    'confirm_password': 'CreatorPassword@2026',
    'phone': '+91 98480 99999',
    'display_name': 'Dr. Lokesh',
    'designation': 'State Disaster Communication Officer',
    'bio': 'Coordinating public safety warnings, flood alerts, and citizen awareness campaigns.',
    'organization_name': 'AP State Disaster Management Authority',
    'organization_type': 'Government Department',
    'department': 'Emergency Response & Public Alert Division',
    'role_title': 'Communication Officer',
    'country': 'India',
    'state': 'Andhra Pradesh',
    'district': 'Visakhapatnam',
    'city': 'Visakhapatnam',
    'postal_code': '530003',
    'primary_language': 'Telugu',
    'additional_languages': ['English', 'Hindi', 'Tamil', 'Odia'],
    'preferred_channels': ['SMS', 'WhatsApp', 'Email', 'Push'],
    'notification_preferences': {
        'campaign_updates': True,
        'delivery_alerts': True,
        'ai_notifications': True,
        'system_notifications': True,
        'marketing_announcements': False
    }
}

res_reg = requests.post('http://127.0.0.1:8000/api/v1/auth/register/', json=signup_payload)
if res_reg.status_code == 201:
    reg_data = res_reg.json()
    token = reg_data['access']
    user = reg_data['user']
    print(f"✓ Account successfully created: {user['username']}")
    print(f"✓ Response message: '{reg_data.get('message')}'")
else:
    print(f"Account already exists ({res_reg.status_code}), logging in...")
    login_res = requests.post('http://127.0.0.1:8000/api/v1/auth/login/', json={'login': unique_email, 'password': 'CreatorPassword@2026'})
    assert login_res.status_code == 200
    token = login_res.json()['access']
    user = login_res.json()['user']

auth_headers = {'Authorization': f'Bearer {token}'}

# Verify role security
assert user['role'] == 'CAMPAIGN_MANAGER', f"Expected CAMPAIGN_MANAGER, got {user['role']}"
assert user['role'] != 'ADMIN', "Public signup MUST NEVER assign ADMIN role!"
assert 'password' not in user, "Password MUST NOT be returned in API responses!"
print("✓ Role Security Verified: Default role is CAMPAIGN_MANAGER (non-admin)")

# 4. Profile Retrieval & Data Completeness
print("\n[4/9] Verifying Profile Data Completeness...")
prof_res = requests.get('http://127.0.0.1:8000/api/v1/auth/profile/', headers=auth_headers)
assert prof_res.status_code == 200
profile = prof_res.json()
print(f"✓ Display Name: {profile.get('display_name')}")
print(f"✓ Organization: {profile.get('organization_name')} ({profile.get('organization_type')})")
print(f"✓ Jurisdiction: {profile.get('district')}, {profile.get('state')}, {profile.get('country')}")
print(f"✓ Primary Language: {profile.get('primary_language')}")
print(f"✓ Additional Languages: {profile.get('additional_languages')}")
print(f"✓ Preferred Channels: {profile.get('preferred_channels')}")

assert profile.get('primary_language') == 'Telugu'
assert profile.get('state') == 'Andhra Pradesh'
assert profile.get('district') == 'Visakhapatnam'

# 5. Profile Editing & Persistence
print("\n[5/9] Testing Profile Editing and Persistence...")
patch_data = {
    'display_name': 'Dr. Boddu Lokesh, Ph.D.',
    'phone': '+91 98480 88888',
    'city': 'Visakhapatnam Smart City'
}
patch_res = requests.patch('http://127.0.0.1:8000/api/v1/auth/profile/', json=patch_data, headers=auth_headers)
assert patch_res.status_code == 200
updated_profile = patch_res.json()
assert updated_profile['display_name'] == 'Dr. Boddu Lokesh, Ph.D.'
assert updated_profile['phone'] == '+91 98480 88888'
print(f"✓ Profile updated successfully: {updated_profile['display_name']} ({updated_profile['phone']})")

# 6. User Preferences Endpoint
print("\n[6/9] Verifying Communication Preferences Endpoint...")
pref_res = requests.get('http://127.0.0.1:8000/api/v1/auth/preferences/', headers=auth_headers)
assert pref_res.status_code == 200
prefs = pref_res.json()
assert prefs['campaign_updates'] is True
assert prefs['ai_notifications'] is True
print("✓ Communication preferences verified")

# 7. AI Content Generation (Brief / Standard / Detailed)
print("\n[7/9] Verifying AI Content Generation (Groq/Gemini)...")
# A. Brief
brief_res = requests.post('http://127.0.0.1:8000/api/v1/ai/generate/', json={
    'prompt': 'Cyclone warning: Coastal fishermen advisory for Visakhapatnam. [LENGTH DIRECTIVE: Keep output very brief, concise, and punchy (1-2 sentences max).]',
    'language': profile['primary_language'],
    'channel': 'SMS',
    'tone': 'urgent'
}, headers=auth_headers)
assert brief_res.status_code == 200
brief_data = brief_res.json()
brief_text = brief_data.get('generated_content', '')
print(f"✓ Brief SMS Output (Length: {len(brief_text)} chars | Provider: {brief_data.get('provider')}):")
print(f"   \"{brief_text[:120]}...\"")
assert len(brief_text) > 0

# B. Detailed
detailed_res = requests.post('http://127.0.0.1:8000/api/v1/ai/generate/', json={
    'prompt': 'Monsoon safety guidelines and emergency shelter locations for district residents. [LENGTH DIRECTIVE: Provide a detailed, comprehensive public announcement with clear instructions, helpful background context, and actionable bullet points.]',
    'language': 'English',
    'channel': 'EMAIL',
    'tone': 'formal'
}, headers=auth_headers)
assert detailed_res.status_code == 200
detailed_data = detailed_res.json()
detailed_text = detailed_data.get('generated_content', '')
print(f"✓ Detailed Email Output (Length: {len(detailed_text)} chars | Provider: {detailed_data.get('provider')}):")
print(f"   \"{detailed_text[:120]}...\"")
assert len(detailed_text) > 0

# 8. IndicTrans2 Translation with Placeholder Preservation
print("\n[8/9] Verifying IndicTrans2 Translation & Placeholder Preservation...")
template_text = "Important notice: Relief camp for {{name}} opens on {{date}} at {{location}}. Stay safe."
trans_res = requests.post('http://127.0.0.1:8000/api/v1/ai/translate/', json={
    'text': template_text,
    'source_language': 'English',
    'target_language': 'Telugu'
}, headers=auth_headers)
assert trans_res.status_code == 200
trans_data = trans_res.json()
translated_text = trans_data.get('translated_text', '')
print(f"✓ Original English: {template_text}")
print(f"✓ Translated Telugu: {translated_text}")
assert '{{name}}' in translated_text, "Placeholder {{name}} was not preserved!"
assert '{{date}}' in translated_text, "Placeholder {{date}} was not preserved!"
assert '{{location}}' in translated_text, "Placeholder {{location}} was not preserved!"
print("✓ Placeholder Preservation Verified: {{name}}, {{date}}, {{location}} intact!")

# 9. Campaign Creation Associated with Authenticated Creator
print("\n[9/9] Verifying Campaign Creation & Creator Association...")
camp_payload = {
    'title': 'Visakhapatnam Cyclone Emergency Alert 2026',
    'description': 'Emergency multilingual alert coordinated by District Disaster Officer',
    'campaign_type': 'EMERGENCY_ALERT',
    'priority': 'CRITICAL',
    'channels': ['SMS', 'WHATSAPP'],
    'target_languages': ['te', 'en']
}
camp_res = requests.post('http://127.0.0.1:8000/api/v1/campaigns/', json=camp_payload, headers=auth_headers)
assert camp_res.status_code == 201
camp = camp_res.json()
print(f"✓ Campaign created: '{camp['title']}' (ID: {camp['id']})")
print(f"✓ Associated Creator: {camp.get('created_by_username')}")
assert camp.get('created_by_username') == user['username'], f"Expected created_by to be {user['username']}"

print("\n" + "=" * 60)
print("SUCCESS: ALL 9 END-TO-END VERIFICATION CHECKS PASSED 100%!")
print("=" * 60)
