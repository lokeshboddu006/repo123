from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

from api.models import AudienceSegment, AudienceMember, Recipient
from api.audiences.serializers import AudienceSegmentSerializer
from api.recipients.serializers import RecipientSerializer
from api.audiences.rule_engine import evaluate_rules_to_queryset, get_audience_recipients
from api.authentication.services import log_audit_event


class AudienceMemberPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'


class AudienceSegmentViewSet(viewsets.ModelViewSet):
    queryset = AudienceSegment.objects.prefetch_related('rules', 'members').all().order_by('-created_at')
    serializer_class = AudienceSegmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name', 'segment_type']

    def perform_create(self, serializer):
        segment = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='AUDIENCE_CREATED',
            request=self.request,
            details={'audience_id': str(segment.id), 'name': segment.name, 'type': segment.segment_type}
        )

    @action(detail=False, methods=['post'], url_path='preview')
    def preview_rules(self, request):
        """
        POST /api/v1/audiences/preview/
        Accepts: {"rules": [{"field": "state", "operator": "=", "value": "Andhra Pradesh"}, ...]}
        Returns matching recipient count and sample recipients.
        """
        rules = request.data.get('rules', [])
        qs = evaluate_rules_to_queryset(rules)
        total_count = qs.count()
        samples = RecipientSerializer(qs[:10], many=True).data

        return Response({
            'matching_count': total_count,
            'sample_recipients': samples,
            'applied_rules': rules
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='preview')
    def preview_audience(self, request, pk=None):
        """
        GET/POST /api/v1/audiences/{id}/preview/
        Returns matching recipients for existing audience.
        """
        audience = self.get_object()
        qs = get_audience_recipients(audience)
        total_count = qs.count()
        samples = RecipientSerializer(qs[:10], many=True).data
        applied_rules = [
            {'field': r.field, 'operator': r.operator, 'value': r.value}
            for r in audience.rules.all()
        ]

        return Response({
            'audience_id': audience.id,
            'name': audience.name,
            'segment_type': audience.segment_type,
            'matching_count': total_count,
            'sample_recipients': samples,
            'applied_rules': applied_rules
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='members')
    def members(self, request, pk=None):
        """
        GET /api/v1/audiences/{id}/members/
        Returns paginated members of the audience.
        """
        audience = self.get_object()
        qs = get_audience_recipients(audience).order_by('first_name')
        paginator = AudienceMemberPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = RecipientSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
