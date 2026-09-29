from rest_framework import serializers
from api.models import DeliveryLog, DeliveryEvent, Recipient, Campaign

class DeliveryEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryEvent
        fields = ['id', 'event_type', 'provider_event_id', 'timestamp', 'metadata', 'created_at']

class DeliveryLogSerializer(serializers.ModelSerializer):
    recipient_name = serializers.SerializerMethodField()
    recipient_email = serializers.SerializerMethodField()
    recipient_phone = serializers.SerializerMethodField()
    recipient_language = serializers.SerializerMethodField()
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = DeliveryLog
        fields = [
            'id', 'campaign', 'campaign_title', 'recipient', 'recipient_name', 'recipient_email',
            'recipient_phone', 'recipient_language', 'channel', 'status', 'provider',
            'provider_message_id', 'queued_at', 'processing_at', 'sent_at', 'delivered_at',
            'read_at', 'clicked_at', 'failed_at', 'retry_count', 'error_code', 'error_message',
            'details', 'metadata', 'created_at', 'updated_at'
        ]

    def get_recipient_name(self, obj):
        return f"{obj.recipient.first_name} {obj.recipient.last_name}".strip()

    def get_recipient_email(self, obj):
        return obj.recipient.email

    def get_recipient_phone(self, obj):
        return obj.recipient.phone

    def get_recipient_language(self, obj):
        return obj.recipient.preferred_language.name if obj.recipient.preferred_language else 'English'

class DeliveryDetailSerializer(DeliveryLogSerializer):
    events = DeliveryEventSerializer(many=True, read_only=True)

    class Meta(DeliveryLogSerializer.Meta):
        fields = DeliveryLogSerializer.Meta.fields + ['events']
