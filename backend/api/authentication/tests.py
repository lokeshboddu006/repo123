from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from api.models import User, AuditLog
from rest_framework_simplejwt.tokens import RefreshToken

class AuthenticationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_password = 'Admin@Password123'
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password=self.admin_password,
            first_name='Admin',
            last_name='User',
            role=User.RoleChoices.ADMIN
        )

        self.user_password = 'User@Password123'
        self.regular_user = User.objects.create_user(
            username='regular_test',
            email='regular@test.com',
            password=self.user_password,
            first_name='Regular',
            last_name='User',
            role=User.RoleChoices.CAMPAIGN_MANAGER
        )

    def test_login_success_with_username(self):
        url = reverse('auth_login')
        data = {
            'login': 'admin_test',
            'password': self.admin_password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'admin_test')
        self.assertEqual(response.data['user']['role'], 'ADMIN')

        # Check Audit Log
        self.assertTrue(AuditLog.objects.filter(user=self.admin_user, action='LOGIN').exists())

    def test_login_success_with_email(self):
        url = reverse('auth_login')
        data = {
            'login': 'admin@test.com',
            'password': self.admin_password
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_login_failure_invalid_credentials(self):
        url = reverse('auth_login')
        data = {
            'login': 'admin_test',
            'password': 'WrongPassword123!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(AuditLog.objects.filter(action='LOGIN_FAILED').exists())

    def test_profile_authenticated(self):
        url = reverse('auth_profile')
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'admin_test')

    def test_profile_unauthenticated(self):
        url = reverse('auth_profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        refresh = RefreshToken.for_user(self.admin_user)
        url = reverse('auth_refresh')
        data = {'refresh': str(refresh)}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_logout_blacklists_token(self):
        refresh = RefreshToken.for_user(self.admin_user)
        refresh_str = str(refresh)
        
        url = reverse('auth_logout')
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(url, {'refresh': refresh_str}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Attempt to refresh using blacklisted token
        refresh_url = reverse('auth_refresh')
        refresh_response = self.client.post(refresh_url, {'refresh': refresh_str}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertTrue(AuditLog.objects.filter(user=self.admin_user, action='LOGOUT').exists())

    def test_change_password(self):
        url = reverse('auth_change_password')
        self.client.force_authenticate(user=self.admin_user)
        new_password = 'NewAdminPassword@123'

        # Test invalid old password
        bad_data = {
            'old_password': 'WrongOldPassword',
            'new_password': new_password
        }
        bad_res = self.client.post(url, bad_data, format='json')
        self.assertEqual(bad_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Test valid change password
        good_data = {
            'old_password': self.admin_password,
            'new_password': new_password
        }
        res = self.client.post(url, good_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Verify old password no longer works
        login_url = reverse('auth_login')
        old_login = self.client.post(login_url, {'login': 'admin_test', 'password': self.admin_password}, format='json')
        self.assertEqual(old_login.status_code, status.HTTP_400_BAD_REQUEST)

        # Verify new password works
        new_login = self.client.post(login_url, {'login': 'admin_test', 'password': new_password}, format='json')
        self.assertEqual(new_login.status_code, status.HTTP_200_OK)

    def test_forgot_and_reset_password(self):
        forgot_url = reverse('auth_forgot_password')
        res = self.client.post(forgot_url, {'email': 'admin@test.com'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('dev_reset', res.data)

        dev_reset = res.data['dev_reset']
        reset_url = reverse('auth_reset_password')
        reset_data = {
            'uid': dev_reset['uid'],
            'token': dev_reset['token'],
            'new_password': 'ResetPass@999'
        }
        reset_res = self.client.post(reset_url, reset_data, format='json')
        self.assertEqual(reset_res.status_code, status.HTTP_200_OK)

    def test_admin_dashboard_permission(self):
        url = reverse('auth_admin_dashboard_summary')

        # Unauthenticated -> 401
        self.client.force_authenticate(user=None)
        res_unauth = self.client.get(url)
        self.assertEqual(res_unauth.status_code, status.HTTP_401_UNAUTHORIZED)

        # Regular non-admin role -> 403 Forbidden
        self.client.force_authenticate(user=self.regular_user)
        res_forbidden = self.client.get(url)
        self.assertEqual(res_forbidden.status_code, status.HTTP_403_FORBIDDEN)

        # Admin role -> 200 OK
        self.client.force_authenticate(user=self.admin_user)
        res_admin = self.client.get(url)
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(res_admin.data['user']['role'], 'ADMIN')

    def test_registration_success(self):
        url = reverse('auth_register')
        signup_data = {
            'full_name': 'Lokesh Boddu',
            'email': 'lokesh.creator@govcomm.ai',
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123',
            'phone': '+91 98765 43210',
            'designation': 'Senior Communication Officer',
            'organization_name': 'State Disaster Management Authority',
            'organization_type': 'Government Department',
            'department': 'Public Safety & Warning',
            'role_title': 'Communication Officer',
            'country': 'India',
            'state': 'Andhra Pradesh',
            'district': 'Visakhapatnam',
            'city': 'Visakhapatnam',
            'postal_code': '530001',
            'primary_language': 'Telugu',
            'additional_languages': ['English', 'Hindi'],
            'preferred_channels': ['Email', 'SMS', 'WhatsApp'],
            'notification_preferences': {
                'email_notifications': True,
                'campaign_updates': True,
                'delivery_alerts': True,
                'ai_notifications': True,
                'system_notifications': True,
                'marketing_announcements': False
            }
        }
        res = self.client.post(url, signup_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertIn('user', res.data)

        user_data = res.data['user']
        # Verify passwords never returned
        self.assertNotIn('password', user_data)
        self.assertNotIn('confirm_password', user_data)

        # Verify safe default role assigned (never ADMIN)
        self.assertEqual(user_data['role'], User.RoleChoices.CAMPAIGN_MANAGER)
        self.assertNotEqual(user_data['role'], User.RoleChoices.ADMIN)

        # Verify profile data created and accessible
        self.assertEqual(user_data['primary_language'], 'Telugu')
        self.assertEqual(user_data['preferred_language'], 'Telugu')
        self.assertEqual(user_data['state'], 'Andhra Pradesh')
        self.assertEqual(user_data['district'], 'Visakhapatnam')
        self.assertEqual(user_data['organization_name'], 'State Disaster Management Authority')

        # Verify Django user created in DB
        created_user = User.objects.get(email='lokesh.creator@govcomm.ai')
        self.assertTrue(created_user.check_password('SecurePassword@123'))
        self.assertFalse(created_user.is_superuser)
        self.assertFalse(created_user.is_staff)

        # Verify profile in DB
        self.assertEqual(created_user.profile.primary_language, 'Telugu')
        self.assertEqual(created_user.profile.state, 'Andhra Pradesh')
        self.assertEqual(created_user.profile.phone, '+91 98765 43210')

        # Verify communication preferences in DB
        self.assertTrue(created_user.communication_preferences.campaign_updates)
        self.assertTrue(created_user.communication_preferences.ai_notifications)

        # Verify audit log
        self.assertTrue(AuditLog.objects.filter(user=created_user, action='ACCOUNT_CREATED').exists())

    def test_registration_duplicate_email(self):
        url = reverse('auth_register')
        signup_data = {
            'full_name': 'Duplicate User',
            'email': 'admin@test.com',  # already exists from setUp
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123'
        }
        res = self.client.post(url, signup_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', res.data)

    def test_registration_password_mismatch(self):
        url = reverse('auth_register')
        signup_data = {
            'full_name': 'Mismatch User',
            'email': 'mismatch@govcomm.ai',
            'password': 'SecurePassword@123',
            'confirm_password': 'DifferentPassword@123'
        }
        res = self.client.post(url, signup_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('confirm_password', res.data)

    def test_registration_weak_password(self):
        url = reverse('auth_register')
        signup_data = {
            'full_name': 'Weak Pass User',
            'email': 'weakpass@govcomm.ai',
            'password': 'simple',
            'confirm_password': 'simple'
        }
        res = self.client.post(url, signup_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', res.data)

    def test_check_email_availability(self):
        url = reverse('auth_check_email')

        # Existing email -> available: False
        res1 = self.client.post(url, {'email': 'admin@test.com'}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertFalse(res1.data['available'])

        # New email -> available: True
        res2 = self.client.post(url, {'email': 'brandnew.creator@govcomm.ai'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertTrue(res2.data['available'])

    def test_profile_update_fields_and_security(self):
        url = reverse('auth_profile')
        self.client.force_authenticate(user=self.regular_user)

        # Update profile details
        update_data = {
            'display_name': 'Updated Regular Name',
            'phone': '+91 99999 88888',
            'designation': 'Chief Coordinator',
            'organization_name': 'Ministry of Environment',
            'state': 'Karnataka',
            'district': 'Bengaluru Urban',
            'city': 'Bengaluru',
            'primary_language': 'Kannada',
            'role': 'ADMIN'  # Attempt privilege escalation
        }
        res = self.client.patch(url, update_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Verify updated fields
        self.assertEqual(res.data['display_name'], 'Updated Regular Name')
        self.assertEqual(res.data['state'], 'Karnataka')
        self.assertEqual(res.data['primary_language'], 'Kannada')

        # Verify role cannot be escalated to ADMIN
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.role, User.RoleChoices.CAMPAIGN_MANAGER)
        self.assertNotEqual(self.regular_user.role, User.RoleChoices.ADMIN)

        # Verify audit log
        self.assertTrue(AuditLog.objects.filter(user=self.regular_user, action='PROFILE_UPDATED').exists())

    def test_preferences_endpoint(self):
        url = reverse('auth_preferences')
        self.client.force_authenticate(user=self.regular_user)

        # GET preferences
        get_res = self.client.get(url)
        self.assertEqual(get_res.status_code, status.HTTP_200_OK)
        self.assertTrue(get_res.data['email_notifications'])

        # PATCH preferences
        patch_res = self.client.patch(url, {'campaign_updates': False, 'delivery_alerts': True}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertFalse(patch_res.data['campaign_updates'])
        self.assertTrue(patch_res.data['delivery_alerts'])

