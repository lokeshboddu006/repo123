from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from api.models import Campaign, DeliveryLog, DeliveryEvent, Recipient, Language
from api.delivery.serializers import DeliveryLogSerializer, DeliveryDetailSerializer, DeliveryEventSerializer
from api.delivery.services.dispatch_engine import dispatch_campaign
from api.delivery.services.retry_engine import retry_delivery
from api.delivery.services.event_service import record_delivery_event
from api.authentication.services import log_audit_event

class DeliveryPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'

class SendCampaignView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        campaign = get_object_or_404(Campaign, pk=pk)
        result = dispatch_campaign(str(campaign.id))
        
        log_audit_event(
            user=request.user,
            action='CAMPAIGN_DISPATCHED',
            request=request,
            details={'campaign_id': str(campaign.id), 'deliveries': result['total_deliveries']}
        )
        return Response(result, status=status.HTTP_200_OK)

class CampaignDeliverySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        campaign = get_object_or_404(Campaign, pk=pk)
        logs = DeliveryLog.objects.filter(campaign=campaign).select_related('recipient', 'recipient__preferred_language')
        
        total_count = logs.count()
        queued_count = logs.filter(status=DeliveryLog.DeliveryStatus.QUEUED).count()
        processing_count = logs.filter(status=DeliveryLog.DeliveryStatus.PROCESSING).count()
        sent_count = logs.filter(status=DeliveryLog.DeliveryStatus.SENT).count()
        delivered_count = logs.filter(status=DeliveryLog.DeliveryStatus.DELIVERED).count()
        read_count = logs.filter(status=DeliveryLog.DeliveryStatus.READ).count()
        clicked_count = logs.filter(status=DeliveryLog.DeliveryStatus.CLICKED).count()
        failed_count = logs.filter(status=DeliveryLog.DeliveryStatus.FAILED).count()
        retrying_count = logs.filter(status=DeliveryLog.DeliveryStatus.RETRYING).count()

        # Effective totals
        effective_delivered = delivered_count + read_count + clicked_count
        effective_sent = sent_count + effective_delivered

        delivery_rate = round((effective_delivered / total_count * 100), 1) if total_count > 0 else 0.0
        read_rate = round(((read_count + clicked_count) / effective_delivered * 100), 1) if effective_delivered > 0 else 0.0
        click_rate = round((clicked_count / (read_count + clicked_count) * 100), 1) if (read_count + clicked_count) > 0 else 0.0
        failure_rate = round((failed_count / total_count * 100), 1) if total_count > 0 else 0.0

        # Channel Breakdown
        raw_channel = logs.values('channel').annotate(
            total=Count('id'),
            sent=Count('id', filter=Q(status__in=['SENT', 'DELIVERED', 'READ', 'CLICKED'])),
            delivered=Count('id', filter=Q(status__in=['DELIVERED', 'READ', 'CLICKED'])),
            read=Count('id', filter=Q(status__in=['READ', 'CLICKED'])),
            clicked=Count('id', filter=Q(status='CLICKED')),
            failed=Count('id', filter=Q(status='FAILED'))
        )

        # Language Breakdown
        raw_lang = logs.values('recipient__preferred_language__name').annotate(
            total=Count('id'),
            delivered=Count('id', filter=Q(status__in=['DELIVERED', 'READ', 'CLICKED'])),
            read=Count('id', filter=Q(status__in=['READ', 'CLICKED'])),
            clicked=Count('id', filter=Q(status='CLICKED'))
        )
        language_breakdown = [
            {
                'language': r['recipient__preferred_language__name'] or 'English',
                'count': r['total'],
                'total': r['total'],
                'delivered': r['delivered'],
                'read': r['read'],
                'clicked': r['clicked']
            } for r in raw_lang
        ]

        # Recipient table list with filtering
        recipient_logs = logs
        status_filter = request.query_params.get('status')
        if status_filter:
            recipient_logs = recipient_logs.filter(status=status_filter)
        
        channel_filter = request.query_params.get('channel')
        if channel_filter:
            recipient_logs = recipient_logs.filter(channel=channel_filter)

        search_filter = request.query_params.get('search')
        if search_filter:
            recipient_logs = recipient_logs.filter(
                Q(recipient__first_name__icontains=search_filter) |
                Q(recipient__last_name__icontains=search_filter) |
                Q(recipient__email__icontains=search_filter) |
                Q(recipient__phone__icontains=search_filter)
            )

        paginator = DeliveryPagination()
        page = paginator.paginate_queryset(recipient_logs, request)
        serializer = DeliveryLogSerializer(page, many=True)
        paginated_data = paginator.get_paginated_response(serializer.data).data

        kpis_data = {
            'total_recipients': total_count,
            'queued': queued_count,
            'processing': processing_count,
            'sent': effective_sent,
            'delivered': effective_delivered,
            'read': read_count + clicked_count,
            'clicked': clicked_count,
            'failed': failed_count,
            'retrying': retrying_count,
            'delivery_rate': delivery_rate,
            'read_rate': read_rate,
            'click_rate': click_rate,
            'failure_rate': failure_rate,
        }

        funnel_dict = {
            'queued': total_count,
            'sent': effective_sent,
            'delivered': effective_delivered,
            'read': read_count + clicked_count,
            'clicked': clicked_count
        }

        return Response({
            'campaign': {
                'id': str(campaign.id),
                'title': campaign.title,
                'status': campaign.status,
                'priority': campaign.priority,
                'campaign_type': campaign.campaign_type,
                'created_at': campaign.created_at,
                'scheduled_at': campaign.scheduled_at,
                'channels': campaign.channels,
                'target_languages': campaign.target_languages,
            },
            'campaign_status': campaign.status,
            'kpis': kpis_data,
            'summary': kpis_data,
            'funnel': funnel_dict,
            'funnel_stages': [
                {'stage': 'Total Target', 'count': total_count, 'percentage': 100.0},
                {'stage': 'Queued', 'count': queued_count + effective_sent, 'percentage': 100.0 if total_count > 0 else 0},
                {'stage': 'Sent', 'count': effective_sent, 'percentage': round((effective_sent / total_count * 100), 1) if total_count > 0 else 0},
                {'stage': 'Delivered', 'count': effective_delivered, 'percentage': delivery_rate},
                {'stage': 'Read', 'count': read_count + clicked_count, 'percentage': round(((read_count + clicked_count) / total_count * 100), 1) if total_count > 0 else 0},
                {'stage': 'Clicked', 'count': clicked_count, 'percentage': round((clicked_count / total_count * 100), 1) if total_count > 0 else 0},
            ],
            'channel_breakdown': list(raw_channel),
            'language_breakdown': language_breakdown,
            'deliveries': paginated_data,
            'recipient_deliveries': paginated_data
        }, status=status.HTTP_200_OK)

class DeliveryDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk=None):
        delivery = get_object_or_404(DeliveryLog.objects.select_related('campaign', 'recipient', 'recipient__preferred_language').prefetch_related('events'), pk=pk)
        serializer = DeliveryDetailSerializer(delivery)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RetryDeliveryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        res = retry_delivery(str(pk))
        return Response(res, status=status.HTTP_200_OK if res.get('success') else status.HTTP_400_BAD_REQUEST)

class GlobalDeliveryLogView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        logs = DeliveryLog.objects.select_related('campaign', 'recipient').all()
        
        status_param = request.query_params.get('status')
        if status_param:
            logs = logs.filter(status=status_param)

        channel_param = request.query_params.get('channel')
        if channel_param:
            logs = logs.filter(channel=channel_param)

        search_param = request.query_params.get('search')
        if search_param:
            logs = logs.filter(
                Q(campaign__title__icontains=search_param) |
                Q(recipient__first_name__icontains=search_param) |
                Q(recipient__email__icontains=search_param) |
                Q(provider_message_id__icontains=search_param)
            )

        paginator = DeliveryPagination()
        page = paginator.paginate_queryset(logs, request)
        serializer = DeliveryLogSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

class ProviderWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, channel=None, provider=None):
        payload = request.data
        provider_message_id = payload.get('provider_message_id') or payload.get('message_id') or payload.get('id')
        event_name = payload.get('event') or payload.get('status') or 'DELIVERED'
        provider_event_id = payload.get('event_id') or payload.get('provider_event_id') or ''

        if not provider_message_id:
            return Response({'error': 'Missing provider_message_id in payload'}, status=status.HTTP_400_BAD_REQUEST)

        delivery = DeliveryLog.objects.filter(provider_message_id=provider_message_id).first()
        if not delivery:
            return Response({'error': 'Delivery record not found for provider_message_id'}, status=status.HTTP_404_NOT_FOUND)

        event_type_map = {
            'queued': DeliveryEvent.EventType.MESSAGE_QUEUED,
            'processing': DeliveryEvent.EventType.MESSAGE_PROCESSING,
            'sent': DeliveryEvent.EventType.MESSAGE_SENT,
            'delivered': DeliveryEvent.EventType.MESSAGE_DELIVERED,
            'read': DeliveryEvent.EventType.MESSAGE_READ,
            'opened': DeliveryEvent.EventType.MESSAGE_READ,
            'clicked': DeliveryEvent.EventType.MESSAGE_CLICKED,
            'failed': DeliveryEvent.EventType.MESSAGE_FAILED,
        }
        event_type = event_type_map.get(str(event_name).lower(), DeliveryEvent.EventType.MESSAGE_DELIVERED)

        event = record_delivery_event(
            delivery=delivery,
            event_type=event_type,
            provider_event_id=provider_event_id,
            metadata=payload
        )

        return Response({
            'status': 'received',
            'delivery_id': str(delivery.id),
            'event_id': str(event.id),
            'new_status': delivery.status
        }, status=status.HTTP_200_OK)
