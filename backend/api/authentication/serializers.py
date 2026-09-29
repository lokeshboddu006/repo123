import re
from rest_framework import serializers
from django.db import transaction
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from rest_framework_simplejwt.tokens import RefreshToken

from api.models import User, UserProfile, UserCommunicationPreferences


class UserCommunicationPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCommunicationPreferences
        fields = [
            'id',
            'email_notifications',
            'campaign_updates',
            'delivery_alerts',
            'ai_notifications',
            'system_notifications',
            'marketing_announcements',
            'updated_at'
        ]
        read_only_fields = ['id', 'updated_at']


class UserProfileDetailSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id',
            'display_name',
            'phone',
            'avatar',
            'avatar_url',
            'designation',
            'bio',
            'organization_name',
            'organization_type',
            'department',
            'role_title',
            'country',
            'state',
            'district',
            'city',
            'postal_code',
            'primary_language',
            'additional_languages',
            'preferred_channels',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_avatar_url(self, obj):
        if obj.avatar:
            try:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.avatar.url)
                return obj.avatar.url
            except Exception:
                return None
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    profile = UserProfileDetailSerializer(read_only=True)
    communication_preferences = UserCommunicationPreferencesSerializer(read_only=True)

    # Convenience top-level fields for backwards and direct access
    display_name = serializers.CharField(required=False, write_only=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    designation = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    organization_name = serializers.CharField(required=False, allow_blank=True)
    organization = serializers.CharField(required=False, allow_blank=True)  # alias for organization_name
    organization_type = serializers.CharField(required=False, allow_blank=True)
    department = serializers.CharField(required=False, allow_blank=True)
    role_title = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, allow_blank=True)
    state = serializers.CharField(required=False, allow_blank=True)
    district = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    postal_code = serializers.CharField(required=False, allow_blank=True)
    primary_language = serializers.CharField(required=False, allow_blank=True)
    preferred_language = serializers.CharField(required=False, allow_blank=True)  # alias for primary_language
    additional_languages = serializers.ListField(child=serializers.CharField(), required=False)
    preferred_channels = serializers.ListField(child=serializers.CharField(), required=False)
    notification_preferences = serializers.DictField(required=False, write_only=True)
    avatar = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'is_active',
            'is_email_verified',
            'auth_provider',
            'profile',
            'communication_preferences',
            'display_name',
            'phone',
            'designation',
            'bio',
            'organization_name',
            'organization',
            'organization_type',
            'department',
            'role_title',
            'country',
            'state',
            'district',
            'city',
            'postal_code',
            'primary_language',
            'preferred_language',
            'additional_languages',
            'preferred_channels',
            'notification_preferences',
            'avatar',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'role', 'is_active', 'is_email_verified', 'auth_provider', 'created_at', 'updated_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Populate profile fields into representation for seamless compatibility
        profile = getattr(instance, 'profile', None)
        if profile:
            data['display_name'] = profile.display_name or f"{instance.first_name} {instance.last_name}".strip() or instance.username
            data['phone'] = profile.phone
            data['designation'] = profile.designation
            data['bio'] = profile.bio
            data['organization_name'] = profile.organization_name
            data['organization'] = profile.organization_name
            data['organization_type'] = profile.organization_type
            data['department'] = profile.department
            data['role_title'] = profile.role_title
            data['country'] = profile.country
            data['state'] = profile.state
            data['district'] = profile.district
            data['city'] = profile.city
            data['postal_code'] = profile.postal_code
            data['primary_language'] = profile.primary_language
            data['preferred_language'] = profile.primary_language
            data['additional_languages'] = profile.additional_languages or []
            data['preferred_channels'] = profile.preferred_channels or []
            try:
                request = self.context.get('request')
                data['avatar'] = request.build_absolute_uri(profile.avatar.url) if profile.avatar and request else (profile.avatar.url if profile.avatar else None)
            except Exception:
                data['avatar'] = None
        else:
            data['display_name'] = f"{instance.first_name} {instance.last_name}".strip() or instance.username
            data['preferred_language'] = 'English'
            data['primary_language'] = 'English'
            data['organization'] = ''
            data['organization_name'] = ''

        return data

    def update(self, instance, validated_data):
        # Extract user core fields
        first_name = validated_data.get('first_name')
        if first_name is not None:
            instance.first_name = first_name
        last_name = validated_data.get('last_name')
        if last_name is not None:
            instance.last_name = last_name

        email = validated_data.get('email')
        if email and email.lower().strip() != instance.email.lower().strip():
            email_clean = email.lower().strip()
            if User.objects.filter(email__iexact=email_clean).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError({'email': ['An account with this email address already exists.']})
            instance.email = email_clean

        instance.save()

        # Update profile
        profile, _ = UserProfile.objects.get_or_create(user=instance)

        profile_fields = [
            'display_name', 'phone', 'designation', 'bio', 'organization_name',
            'organization_type', 'department', 'role_title', 'country', 'state',
            'district', 'city', 'postal_code', 'primary_language', 'additional_languages',
            'preferred_channels'
        ]

        for field in profile_fields:
            if field in validated_data:
                setattr(profile, field, validated_data[field])

        # Aliases
        if 'organization' in validated_data and not validated_data.get('organization_name'):
            profile.organization_name = validated_data['organization']
        if 'preferred_language' in validated_data and not validated_data.get('primary_language'):
            profile.primary_language = validated_data['preferred_language']

        # Avatar file upload if provided
        if 'avatar' in validated_data:
            avatar_val = validated_data.get('avatar')
            if avatar_val is not None:
                profile.avatar = avatar_val

        profile.save()
        instance.profile = profile

        # Update communication preferences if provided
        notif_prefs = validated_data.get('notification_preferences')
        if notif_prefs and isinstance(notif_prefs, dict):
            prefs, _ = UserCommunicationPreferences.objects.get_or_create(user=instance)
            for k, v in notif_prefs.items():
                if hasattr(prefs, k) and isinstance(v, bool):
                    setattr(prefs, k, v)
            prefs.save()
            instance.communication_preferences = prefs

        return instance


class RegisterSerializer(serializers.Serializer):
    # Step 1: Account
    full_name = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True, default='')

    # Step 2: Profile
    display_name = serializers.CharField(required=False, allow_blank=True, default='')
    designation = serializers.CharField(required=False, allow_blank=True, default='')
    bio = serializers.CharField(required=False, allow_blank=True, default='')
    avatar = serializers.FileField(required=False, allow_null=True)

    # Step 3: Organization
    organization_name = serializers.CharField(required=False, allow_blank=True, default='')
    organization_type = serializers.CharField(required=False, allow_blank=True, default='Government Department')
    department = serializers.CharField(required=False, allow_blank=True, default='')
    role_title = serializers.CharField(required=False, allow_blank=True, default='Communication Coordinator')

    # Step 4: Location
    country = serializers.CharField(required=False, default='India')
    state = serializers.CharField(required=False, allow_blank=True, default='')
    district = serializers.CharField(required=False, allow_blank=True, default='')
    city = serializers.CharField(required=False, allow_blank=True, default='')
    postal_code = serializers.CharField(required=False, allow_blank=True, default='')

    # Step 5: Communication Preferences
    primary_language = serializers.CharField(required=False, default='English')
    additional_languages = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    preferred_channels = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    notification_preferences = serializers.DictField(required=False, default=dict)

    def validate_full_name(self, value):
        trimmed = value.strip()
        if len(trimmed) < 2:
            raise serializers.ValidationError("Full name must contain at least 2 characters.")
        return trimmed

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("An account with this email address already exists. Please sign in.")
        return normalized

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    def validate_phone(self, value):
        if not value:
            return ''
        cleaned = re.sub(r'[\s\-\(\)]', '', value)
        if cleaned and not re.match(r'^\+?[0-9]{7,15}$', cleaned):
            raise serializers.ValidationError("Enter a valid phone number.")
        return value.strip()

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})

        return attrs

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        full_name = validated_data['full_name']
        phone = validated_data.get('phone', '')

        # Split full name into first and last name
        name_parts = full_name.split()
        first_name = name_parts[0] if name_parts else ''
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

        # Generate unique username from email
        base_username = re.sub(r'[^a-zA-Z0-9_]', '_', email.split('@')[0])[:30]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        # Use database transaction for atomic account creation
        with transaction.atomic():
            # 1. Create Django user with safe creator role (never ADMIN from public signup)
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role=User.RoleChoices.CAMPAIGN_MANAGER,
                is_active=True,
                is_email_verified=False,
                auth_provider='local'
            )

            # 2. Create or update UserProfile
            display_name = validated_data.get('display_name') or full_name
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.display_name = display_name
            profile.phone = phone
            profile.designation = validated_data.get('designation', '')
            profile.bio = validated_data.get('bio', '')
            profile.organization_name = validated_data.get('organization_name', '')
            profile.organization_type = validated_data.get('organization_type', 'Government Department')
            profile.department = validated_data.get('department', '')
            profile.role_title = validated_data.get('role_title', 'Communication Coordinator')
            profile.country = validated_data.get('country', 'India')
            profile.state = validated_data.get('state', '')
            profile.district = validated_data.get('district', '')
            profile.city = validated_data.get('city', '')
            profile.postal_code = validated_data.get('postal_code', '')
            profile.primary_language = validated_data.get('primary_language', 'English')
            profile.additional_languages = validated_data.get('additional_languages', [])
            profile.preferred_channels = validated_data.get('preferred_channels', ['Email', 'SMS'])

            avatar = validated_data.get('avatar')
            if avatar:
                profile.avatar = avatar

            profile.save()

            # 3. Create or update UserCommunicationPreferences
            notif_prefs = validated_data.get('notification_preferences', {})
            prefs, _ = UserCommunicationPreferences.objects.get_or_create(user=user)
            if 'email_notifications' in notif_prefs:
                prefs.email_notifications = bool(notif_prefs['email_notifications'])
            if 'campaign_updates' in notif_prefs:
                prefs.campaign_updates = bool(notif_prefs['campaign_updates'])
            if 'delivery_alerts' in notif_prefs:
                prefs.delivery_alerts = bool(notif_prefs['delivery_alerts'])
            if 'ai_notifications' in notif_prefs:
                prefs.ai_notifications = bool(notif_prefs['ai_notifications'])
            if 'system_notifications' in notif_prefs:
                prefs.system_notifications = bool(notif_prefs['system_notifications'])
            if 'marketing_announcements' in notif_prefs:
                prefs.marketing_announcements = bool(notif_prefs['marketing_announcements'])
            prefs.save()

            # Attach refreshed profile and preferences to user instance
            user.profile = profile
            user.communication_preferences = prefs

            # 4. Generate JWT tokens for immediate seamless login
            refresh = RefreshToken.for_user(user)

            return {
                'user': user,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }



class CheckEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return value.strip().lower()


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=True)
    full_name = serializers.CharField(required=False, default='')
    google_id = serializers.CharField(required=False, default='')
    avatar_url = serializers.CharField(required=False, default='')

    def validate_email(self, value):
        return value.strip().lower()

    def save(self):
        email = self.validated_data['email']
        full_name = self.validated_data.get('full_name', '')
        avatar_url = self.validated_data.get('avatar_url', '')

        with transaction.atomic():
            # Check if user already exists
            user = User.objects.filter(email__iexact=email).first()

            if user:
                # Link account
                user.is_email_verified = True
                user.save(update_fields=['is_email_verified', 'updated_at'])
                is_new = False
            else:
                # Create new creator account
                name_parts = full_name.split() if full_name else ['Creator']
                first_name = name_parts[0]
                last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

                base_username = re.sub(r'[^a-zA-Z0-9_]', '_', email.split('@')[0])[:30]
                username = base_username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{counter}"
                    counter += 1

                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    role=User.RoleChoices.CAMPAIGN_MANAGER,
                    is_active=True,
                    is_email_verified=True,
                    auth_provider='google'
                )

                profile, _ = UserProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'display_name': full_name or username,
                        'primary_language': 'English',
                    }
                )
                UserCommunicationPreferences.objects.get_or_create(user=user)
                is_new = True

            refresh = RefreshToken.for_user(user)

            return {
                'user': user,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'is_new_user': is_new
            }


class VerifyEmailSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)

    def validate(self, attrs):
        uid = attrs.get('uid')
        token = attrs.get('token')

        try:
            decoded_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=decoded_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid verification token.")

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Verification token has expired or is invalid.")

        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        user.is_email_verified = True
        user.save(update_fields=['is_email_verified', 'updated_at'])
        return user


class AdminLoginSerializer(serializers.Serializer):
    login = serializers.CharField(required=True, write_only=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        login_input = attrs.get('login', '').strip()
        password = attrs.get('password', '')

        if not login_input or not password:
            raise serializers.ValidationError("Both login identifier and password are required.")

        # Support login via either username or email
        user = None
        if '@' in login_input:
            try:
                found_user = User.objects.get(email__iexact=login_input)
                user = authenticate(username=found_user.username, password=password)
            except User.DoesNotExist:
                user = None
        else:
            user = authenticate(username=login_input, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials provided.")

        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled.")

        refresh = RefreshToken.for_user(user)

        return {
            'user': user,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=True)

    def validate(self, attrs):
        self.refresh_token = attrs.get('refresh')
        return attrs

    def save(self, **kwargs):
        try:
            token = RefreshToken(self.refresh_token)
            token.blacklist()
        except Exception:
            raise serializers.ValidationError("Invalid or already blacklisted refresh token.")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value

    def validate_new_password(self, value):
        user = self.context['request'].user
        try:
            validate_password(value, user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        uid = attrs.get('uid')
        token = attrs.get('token')
        new_password = attrs.get('new_password')

        try:
            decoded_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=decoded_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError("Invalid or expired reset token.")

        if not default_token_generator.check_token(user, token):
            raise serializers.ValidationError("Invalid or expired reset token.")

        try:
            validate_password(new_password, user=user)
        except DjangoValidationError as e:
            raise serializers.ValidationError({'new_password': list(e.messages)})

        attrs['user'] = user
        return attrs

    def save(self, **kwargs):
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
