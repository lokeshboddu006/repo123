from rest_framework import serializers
from django.utils import timezone
from api.models import (
    Campaign,
    CampaignType,
    CampaignAudience,
    CampaignContent,
    CampaignSchedule,
    AudienceSegment,
    Language,
    Template
)


class CampaignTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignType
        fields = ['id', 'code', 'name', 'description']


class CampaignContentSerializer(serializers.ModelSerializer):
    language_code = serializers.CharField(source='language.code', read_only=True)
    language_name = serializers.CharField(source='language.name', read_only=True)

    class Meta:
        model = CampaignContent
        fields = [
            'id',
            'language',
            'language_code',
            'language_name',
            'channel',
            'subject',
            'title',
            'body',
            'tone',
            'sentiment_score',
            'ai_generated',
            'version',
            'status',
            'created_at',
            'updated_at'
        ]


class CampaignScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignSchedule
        fields = [
            'id',
            'schedule_type',
            'scheduled_time',
            'timezone',
            'status',
            'created_at',
            'updated_at'
        ]


class CampaignAudienceSerializer(serializers.ModelSerializer):
    audience_id = serializers.CharField(source='audience_segment.id', read_only=True)
    name = serializers.CharField(source='audience_segment.name', read_only=True)
    segment_type = serializers.CharField(source='audience_segment.segment_type', read_only=True)

    class Meta:
        model = CampaignAudience
        fields = ['id', 'audience_id', 'name', 'segment_type', 'added_at']


class CampaignSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    contents = CampaignContentSerializer(many=True, required=False)
    schedule = CampaignScheduleSerializer(source='campaign_schedule', required=False, allow_null=True)
    campaign_audiences = CampaignAudienceSerializer(many=True, read_only=True)
    audience_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    audience_names = serializers.SerializerMethodField()

    class Meta:
        model = Campaign
        fields = [
            'id',
            'title',
            'description',
            'campaign_type',
            'priority',
            'status',
            'channels',
            'target_languages',
            'scheduled_at',
            'template',
            'audiences',
            'audience_ids',
            'campaign_audiences',
            'audience_names',
            'contents',
            'schedule',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['audiences', 'created_by']

    def get_audience_names(self, obj):
        return [a.name for a in obj.audiences.all()]

    def create(self, validated_data):
        contents_data = self.context.get('request').data.get('contents', []) if self.context.get('request') else []
        schedule_data = self.context.get('request').data.get('schedule', None) if self.context.get('request') else None
        audience_ids = validated_data.pop('audience_ids', [])

        validated_data['created_by'] = self.context['request'].user if 'request' in self.context else None
        campaign = Campaign.objects.create(**validated_data)

        # Connect audiences
        for aud_id in audience_ids:
            try:
                aud = AudienceSegment.objects.get(id=aud_id)
                CampaignAudience.objects.get_or_create(campaign=campaign, audience_segment=aud)
            except AudienceSegment.DoesNotExist:
                pass

        # Also set backward compatibility audience field if not set
        if audience_ids and not campaign.audience_id:
            campaign.audience_id = audience_ids[0]
            campaign.save(update_fields=['audience'])

        # Create contents
        for c_data in contents_data:
            lang_id = c_data.get('language')
            lang_code = c_data.get('language_code')
            lang_obj = None
            if lang_id:
                lang_obj = Language.objects.filter(id=lang_id).first()
            elif lang_code:
                lang_obj = Language.objects.filter(code__iexact=lang_code).first()

            if not lang_obj:
                lang_obj = Language.objects.first()

            CampaignContent.objects.create(
                campaign=campaign,
                language=lang_obj,
                channel=c_data.get('channel', 'EMAIL'),
                subject=c_data.get('subject', ''),
                title=c_data.get('title', campaign.title),
                body=c_data.get('body', ''),
                ai_generated=False
            )

        # Create schedule if provided
        if schedule_data:
            CampaignSchedule.objects.create(
                campaign=campaign,
                schedule_type=schedule_data.get('schedule_type', 'SCHEDULED'),
                scheduled_time=schedule_data.get('scheduled_time', campaign.scheduled_at),
                timezone=schedule_data.get('timezone', 'Asia/Kolkata'),
                status='PENDING'
            )
            if schedule_data.get('scheduled_time'):
                campaign.scheduled_at = schedule_data.get('scheduled_time')
                campaign.save(update_fields=['scheduled_at'])

        return campaign

    def update(self, instance, validated_data):
        contents_data = self.context.get('request').data.get('contents', None) if self.context.get('request') else None
        schedule_data = self.context.get('request').data.get('schedule', None) if self.context.get('request') else None
        audience_ids = validated_data.pop('audience_ids', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if audience_ids is not None:
            instance.campaign_audiences.all().delete()
            for aud_id in audience_ids:
                try:
                    aud = AudienceSegment.objects.get(id=aud_id)
                    CampaignAudience.objects.get_or_create(campaign=instance, audience_segment=aud)
                except AudienceSegment.DoesNotExist:
                    pass

        if contents_data is not None:
            instance.contents.all().delete()
            for c_data in contents_data:
                lang_id = c_data.get('language')
                lang_code = c_data.get('language_code')
                lang_obj = None
                if lang_id:
                    lang_obj = Language.objects.filter(id=lang_id).first()
                elif lang_code:
                    lang_obj = Language.objects.filter(code__iexact=lang_code).first()

                if not lang_obj:
                    lang_obj = Language.objects.first()

                CampaignContent.objects.create(
                    campaign=instance,
                    language=lang_obj,
                    channel=c_data.get('channel', 'EMAIL'),
                    subject=c_data.get('subject', ''),
                    title=c_data.get('title', instance.title),
                    body=c_data.get('body', ''),
                    ai_generated=False
                )

        if schedule_data is not None:
            CampaignSchedule.objects.update_or_create(
                campaign=instance,
                defaults={
                    'schedule_type': schedule_data.get('schedule_type', 'SCHEDULED'),
                    'scheduled_time': schedule_data.get('scheduled_time'),
                    'timezone': schedule_data.get('timezone', 'Asia/Kolkata'),
                    'status': schedule_data.get('status', 'PENDING')
                }
            )
            if schedule_data.get('scheduled_time'):
                instance.scheduled_at = schedule_data.get('scheduled_time')
                instance.save(update_fields=['scheduled_at'])

        return instance
