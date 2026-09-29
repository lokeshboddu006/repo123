from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from datetime import timedelta

from api.models import (
    Campaign,
    CampaignType,
    CampaignAudience,
    CampaignContent,
    CampaignSchedule
)
from api.campaigns.serializers import (
    CampaignSerializer,
    CampaignTypeSerializer,
    CampaignContentSerializer
)
from api.campaigns.validator import validate_campaign
from api.authentication.services import log_audit_event


class CampaignPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'


class CampaignTypeViewSet(viewsets.ModelViewSet):
    queryset = CampaignType.objects.all()
    serializer_class = CampaignTypeSerializer
    permission_classes = [IsAuthenticated]


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.select_related(
        'created_by', 'template', 'campaign_schedule'
    ).prefetch_related(
        'contents', 'audiences', 'campaign_audiences'
    ).all().order_by('-created_at')

    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CampaignPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'campaign_type']
    ordering_fields = ['created_at', 'title', 'status', 'priority']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        priority_param = self.request.query_params.get('priority')
        if priority_param:
            qs = qs.filter(priority=priority_param)

        type_param = self.request.query_params.get('campaign_type')
        if type_param:
            qs = qs.filter(campaign_type__iexact=type_param)

        return qs

    def perform_create(self, serializer):
        campaign = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='CAMPAIGN_CREATED',
            request=self.request,
            details={'campaign_id': str(campaign.id), 'title': campaign.title}
        )

    @action(detail=True, methods=['post'], url_path='validate')
    def validate_campaign_action(self, request, pk=None):
        """
        POST /api/v1/campaigns/{id}/validate/
        Runs real 12-rule validation and returns result.
        """
        campaign = self.get_object()
        result = validate_campaign(campaign)

        if result['valid']:
            if campaign.status in [Campaign.StatusChoices.DRAFT, Campaign.StatusChoices.READY_FOR_REVIEW]:
                campaign.status = Campaign.StatusChoices.VALIDATED
                campaign.save(update_fields=['status', 'updated_at'])

            log_audit_event(
                user=request.user,
                action='CAMPAIGN_VALIDATED',
                request=request,
                details={'campaign_id': str(campaign.id), 'valid': True}
            )

        return Response(result, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='schedule')
    def schedule_campaign(self, request, pk=None):
        """
        POST /api/v1/campaigns/{id}/schedule/
        Accepts: {"schedule_type": "SEND_NOW"|"SCHEDULED", "scheduled_time": "...", "timezone": "Asia/Kolkata"}
        """
        campaign = self.get_object()

        schedule_type = request.data.get('schedule_type', 'SCHEDULED')
        scheduled_time_str = request.data.get('scheduled_time')
        tz_str = request.data.get('timezone', 'Asia/Kolkata')

        if schedule_type == 'SEND_NOW':
            scheduled_time = timezone.now() + timedelta(minutes=1)
        else:
            if not scheduled_time_str:
                scheduled_time = timezone.now() + timedelta(hours=2)
            else:
                try:
                    from dateutil import parser
                    scheduled_time = parser.parse(scheduled_time_str)
                except Exception:
                    scheduled_time = timezone.now() + timedelta(hours=2)

        campaign.scheduled_at = scheduled_time
        campaign.status = Campaign.StatusChoices.SCHEDULED
        campaign.save(update_fields=['scheduled_at', 'status', 'updated_at'])

        CampaignSchedule.objects.update_or_create(
            campaign=campaign,
            defaults={
                'schedule_type': schedule_type,
                'scheduled_time': scheduled_time,
                'timezone': tz_str,
                'status': 'PENDING'
            }
        )

        log_audit_event(
            user=request.user,
            action='CAMPAIGN_SCHEDULED',
            request=request,
            details={
                'campaign_id': str(campaign.id),
                'schedule_type': schedule_type,
                'scheduled_time': scheduled_time.isoformat()
            }
        )

        return Response({
            'status': campaign.status,
            'scheduled_at': scheduled_time.isoformat(),
            'schedule_type': schedule_type,
            'message': 'Campaign successfully scheduled.'
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel_campaign(self, request, pk=None):
        """
        POST /api/v1/campaigns/{id}/cancel/
        """
        campaign = self.get_object()
        campaign.status = Campaign.StatusChoices.CANCELLED
        campaign.save(update_fields=['status', 'updated_at'])

        if hasattr(campaign, 'campaign_schedule'):
            campaign.campaign_schedule.status = 'CANCELLED'
            campaign.campaign_schedule.save(update_fields=['status', 'updated_at'])

        log_audit_event(
            user=request.user,
            action='CAMPAIGN_CANCELLED',
            request=request,
            details={'campaign_id': str(campaign.id)}
        )

        return Response({'status': campaign.status, 'message': 'Campaign cancelled.'})

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate_campaign(self, request, pk=None):
        """
        POST /api/v1/campaigns/{id}/duplicate/
        Clones campaign and all its contents/audiences.
        """
        orig = self.get_object()
        clone = Campaign.objects.create(
            title=f"Copy of {orig.title}",
            description=orig.description,
            campaign_type=orig.campaign_type,
            priority=orig.priority,
            status=Campaign.StatusChoices.DRAFT,
            template=orig.template,
            channels=orig.channels,
            target_languages=orig.target_languages,
            created_by=request.user
        )

        # Clone audiences
        for ca in orig.campaign_audiences.all():
            CampaignAudience.objects.create(campaign=clone, audience_segment=ca.audience_segment)

        # Clone contents
        for c in orig.contents.all():
            CampaignContent.objects.create(
                campaign=clone,
                language=c.language,
                channel=c.channel,
                subject=c.subject,
                title=c.title,
                body=c.body,
                tone=c.tone,
                ai_generated=False
            )

        serializer = CampaignSerializer(clone)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
