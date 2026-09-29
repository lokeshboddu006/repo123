from rest_framework import serializers
from api.models import (
    Recipient,
    RecipientChannelPreference,
    Language,
    Occupation,
    Organization,
    OrganizationUnit,
    Country,
    State,
    District
)


class RecipientChannelPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipientChannelPreference
        fields = ['id', 'channel', 'is_enabled', 'consent_given_at']


class RecipientSerializer(serializers.ModelSerializer):
    language_name = serializers.CharField(source='preferred_language.name', read_only=True)
    occupation_name = serializers.CharField(source='occupation.title', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    organization_unit_name = serializers.CharField(source='organization_unit.name', read_only=True)
    state_name = serializers.CharField(source='state.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    country_name = serializers.CharField(source='country.name', read_only=True)

    channel_preferences = RecipientChannelPreferenceSerializer(many=True, read_only=True)

    class Meta:
        model = Recipient
        fields = [
            'id',
            'external_reference_id',
            'first_name',
            'last_name',
            'email',
            'phone',
            'date_of_birth',
            'gender',
            'occupation',
            'occupation_name',
            'organization',
            'organization_name',
            'organization_unit',
            'organization_unit_name',
            'country',
            'country_name',
            'state',
            'state_name',
            'district',
            'district_name',
            'city',
            'pincode',
            'preferred_language',
            'language_name',
            'preferred_channel',
            'timezone',
            'status',
            'consent',
            'channel_preferences',
            'created_at',
            'updated_at'
        ]

    def validate(self, attrs):
        # Email or Phone must be provided
        email = attrs.get('email') or (self.instance and self.instance.email)
        phone = attrs.get('phone') or (self.instance and self.instance.phone)
        ext_id = attrs.get('external_reference_id') or (self.instance and self.instance.external_reference_id)

        if not email and not phone:
            raise serializers.ValidationError("At least one contact method (email or phone) is required.")

        # Duplicate detection (email OR phone OR external_reference_id)
        qs = Recipient.objects.all()
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if email and qs.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": f"A recipient with email '{email}' already exists."})

        if phone and qs.filter(phone=phone).exists():
            raise serializers.ValidationError({"phone": f"A recipient with phone '{phone}' already exists."})

        if ext_id and qs.filter(external_reference_id=ext_id).exists():
            raise serializers.ValidationError({"external_reference_id": f"A recipient with external ID '{ext_id}' already exists."})

        return attrs

    def create(self, validated_data):
        recipient = super().create(validated_data)
        # Default channel preferences: EMAIL, SMS, WHATSAPP, PUSH
        channels = ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH']
        for ch in channels:
            RecipientChannelPreference.objects.get_or_create(
                recipient=recipient,
                channel=ch,
                defaults={'is_enabled': True}
            )
        return recipient
