from django.urls import path
from api.authentication.views import (
    RegisterView,
    CheckEmailView,
    GoogleAuthView,
    SendVerificationEmailView,
    VerifyEmailView,
    LoginView,
    LogoutView,
    CustomTokenRefreshView,
    ProfileView,
    PreferencesView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    AdminDashboardSummaryView
)

urlpatterns = [
    # Creator Onboarding & Registration
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('check-email/', CheckEmailView.as_view(), name='auth_check_email'),
    path('google/', GoogleAuthView.as_view(), name='auth_google'),
    path('send-verification/', SendVerificationEmailView.as_view(), name='auth_send_verification'),
    path('verify-email/', VerifyEmailView.as_view(), name='auth_verify_email'),

    # Session & Authentication
    path('login/', LoginView.as_view(), name='auth_login'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='auth_refresh'),

    # Profile & Preferences
    path('profile/', ProfileView.as_view(), name='auth_profile'),
    path('profile/preferences/', PreferencesView.as_view(), name='auth_profile_preferences'),
    path('preferences/', PreferencesView.as_view(), name='auth_preferences'),

    # Password Management
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),

    # Admin Portal
    path('dashboard-summary/', AdminDashboardSummaryView.as_view(), name='auth_admin_dashboard_summary'),
]
