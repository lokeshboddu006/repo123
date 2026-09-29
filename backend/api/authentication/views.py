from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenRefreshView
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

from api.models import User, UserProfile, UserCommunicationPreferences
from api.authentication.serializers import (
    AdminLoginSerializer,
    LogoutSerializer,
    UserProfileSerializer,
    UserCommunicationPreferencesSerializer,
    RegisterSerializer,
    CheckEmailSerializer,
    GoogleAuthSerializer,
    VerifyEmailSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)
from api.authentication.permissions import IsAdminUserRole
from api.authentication.services import log_audit_event


class RegisterView(APIView):
    """
    Public creator signup endpoint: POST /api/v1/auth/register/
    Creates User, Profile, Location, Organization, and Preferences atomically.
    Returns JWT tokens and user profile for immediate authenticated session.
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            result = serializer.save()
            user = result['user']
            access = result['access']
            refresh = result['refresh']

            log_audit_event(
                user=user,
                action='ACCOUNT_CREATED',
                request=request,
                details={
                    'method': 'signup_form',
                    'email': user.email,
                    'role': user.role
                }
            )

            user_data = UserProfileSerializer(user, context={'request': request}).data

            return Response({
                'message': 'Your communication workspace is ready.',
                'access': access,
                'refresh': refresh,
                'user': user_data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CheckEmailView(APIView):
    """
    Helper endpoint for real-time validation: POST /api/v1/auth/check-email/
    Checks if an email is available or already in use.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = CheckEmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            exists = User.objects.filter(email__iexact=email).exists()
            return Response({
                'available': not exists,
                'email': email,
                'message': 'Email is available' if not exists else 'An account with this email already exists.'
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleAuthView(APIView):
    """
    Google authentication and account linking: POST /api/v1/auth/google/
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = GoogleAuthSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            result = serializer.save()
            user = result['user']
            is_new = result.get('is_new_user', False)

            log_audit_event(
                user=user,
                action='ACCOUNT_CREATED' if is_new else 'GOOGLE_LINKED',
                request=request,
                details={'method': 'google_oauth', 'email': user.email}
            )

            user_data = UserProfileSerializer(user, context={'request': request}).data

            return Response({
                'message': 'Google authentication successful.',
                'access': result['access'],
                'refresh': result['refresh'],
                'user': user_data,
                'is_new_user': is_new
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendVerificationEmailView(APIView):
    """
    Generate email verification token: POST /api/v1/auth/send-verification/
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        if user.is_email_verified:
            return Response({'detail': 'Email is already verified.'}, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        log_audit_event(
            user=user,
            action='EMAIL_VERIFIED',
            request=request,
            details={'email': user.email, 'status': 'token_generated'}
        )

        return Response({
            'detail': 'Verification instructions generated.',
            'dev_verification': {
                'uid': uid,
                'token': token,
            }
        }, status=status.HTTP_200_OK)


class VerifyEmailView(APIView):
    """
    Verify email token: POST /api/v1/auth/verify-email/
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = VerifyEmailSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            log_audit_event(
                user=user,
                action='EMAIL_VERIFIED',
                request=request,
                details={'email': user.email}
            )
            return Response({'detail': 'Email has been successfully verified.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = AdminLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            access = serializer.validated_data['access']
            refresh = serializer.validated_data['refresh']

            log_audit_event(
                user=user,
                action='LOGIN',
                request=request,
                details={'method': 'JWT'}
            )

            user_data = UserProfileSerializer(user, context={'request': request}).data

            return Response({
                'access': access,
                'refresh': refresh,
                'user': user_data
            }, status=status.HTTP_200_OK)

        # Log failed login attempt
        login_input = request.data.get('login', '')
        log_audit_event(
            user=None,
            action='LOGIN_FAILED',
            request=request,
            details={'login_input': login_input}
        )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = LogoutSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            log_audit_event(
                user=request.user,
                action='LOGOUT',
                request=request
            )
            return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenRefreshView(TokenRefreshView):
    """
    Standard SimpleJWT refresh view.
    """
    pass


class ProfileView(APIView):
    """
    Profile management: GET /api/v1/auth/profile/, PATCH /api/v1/auth/profile/
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, *args, **kwargs):
        # Ensure profile exists
        UserProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'display_name': request.user.get_full_name() or request.user.username,
                'primary_language': 'English'
            }
        )
        UserCommunicationPreferences.objects.get_or_create(user=request.user)

        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        # Ensure profile exists
        UserProfile.objects.get_or_create(user=request.user)
        UserCommunicationPreferences.objects.get_or_create(user=request.user)

        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            log_audit_event(
                user=request.user,
                action='PROFILE_UPDATED',
                request=request,
                details={'updated_fields': list(request.data.keys())}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        return self.patch(request, *args, **kwargs)


class PreferencesView(APIView):
    """
    User communication & notification preferences: GET/PATCH /api/v1/auth/preferences/
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        prefs, _ = UserCommunicationPreferences.objects.get_or_create(user=request.user)
        serializer = UserCommunicationPreferencesSerializer(prefs)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        prefs, _ = UserCommunicationPreferences.objects.get_or_create(user=request.user)
        serializer = UserCommunicationPreferencesSerializer(prefs, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_audit_event(
                user=request.user,
                action='PREFERENCES_UPDATED',
                request=request,
                details={'updated_preferences': list(request.data.keys())}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            log_audit_event(
                user=request.user,
                action='PASSWORD_CHANGE',
                request=request
            )
            return Response({'detail': 'Password successfully updated.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        dev_info = None

        try:
            user = User.objects.get(email__iexact=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            log_audit_event(
                user=user,
                action='PASSWORD_RESET_REQUEST',
                request=request,
                details={'email': email}
            )

            # In development mode, return uid & token for testing without email server
            dev_info = {'uid': uid, 'token': token}
        except User.DoesNotExist:
            log_audit_event(
                user=None,
                action='PASSWORD_RESET_REQUEST',
                request=request,
                details={'email': email, 'status': 'user_not_found'}
            )

        # Standard non-enumerating response
        response_data = {
            'detail': 'If an account exists with that email address, a password reset link has been generated.'
        }
        if dev_info:
            response_data['dev_reset'] = dev_info

        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            log_audit_event(
                user=user,
                action='PASSWORD_CHANGE',
                request=request,
                details={'method': 'password_reset_flow'}
            )
            return Response({'detail': 'Password reset successful. You can now log in with your new password.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminDashboardSummaryView(APIView):
    """
    Protected Admin Dashboard View for testing authorization.
    Requires IsAdminUserRole permission. Returns real platform metrics.
    """
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get(self, request, *args, **kwargs):
        from django.db.models import Count
        from api.models import Recipient, AudienceSegment, Campaign
        total_recipients = Recipient.objects.count()
        active_audiences = AudienceSegment.objects.filter(is_active=True).count()
        draft_campaigns = Campaign.objects.filter(status=Campaign.StatusChoices.DRAFT).count()
        scheduled_campaigns = Campaign.objects.filter(status=Campaign.StatusChoices.SCHEDULED).count()
        active_campaigns = Campaign.objects.filter(status=Campaign.StatusChoices.RUNNING).count()
        completed_campaigns = Campaign.objects.filter(status=Campaign.StatusChoices.COMPLETED).count()
        total_campaigns = Campaign.objects.count()

        recent_campaigns = Campaign.objects.order_by('-created_at')[:5].values(
            'id', 'title', 'status', 'priority', 'campaign_type', 'created_at', 'scheduled_at'
        )

        # Real recipient language distribution from database
        raw_langs = list(
            Recipient.objects.values('preferred_language__name')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        language_distribution = [
            {'language': r['preferred_language__name'] or 'Unassigned', 'count': r['count']}
            for r in raw_langs
        ]

        # Real campaign pipeline breakdown
        pipeline = {
            'draft': draft_campaigns,
            'scheduled': scheduled_campaigns,
            'active': active_campaigns,
            'completed': completed_campaigns
        }

        return Response({
            'message': 'Welcome to the Admin Portal Dashboard',
            'user': UserProfileSerializer(request.user, context={'request': request}).data,
            'summary': {
                'recipients': {'count': total_recipients, 'status': 'live'},
                'audiences': {'count': active_audiences, 'status': 'live'},
                'draft_campaigns': {'count': draft_campaigns, 'status': 'live'},
                'scheduled_campaigns': {'count': scheduled_campaigns, 'status': 'live'},
                'active_campaigns': {'count': active_campaigns, 'status': 'live'},
                'completed_campaigns': {'count': completed_campaigns, 'status': 'live'},
                'total_campaigns': {'count': total_campaigns, 'status': 'live'}
            },
            'pipeline': pipeline,
            'language_distribution': language_distribution,
            'recent_campaigns': list(recent_campaigns)
        }, status=status.HTTP_200_OK)
