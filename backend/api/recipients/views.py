from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from api.models import Recipient, RecipientChannelPreference
from api.recipients.serializers import RecipientSerializer, RecipientChannelPreferenceSerializer
from api.recipients.import_service import parse_tabular_file, process_import_rows
from api.authentication.services import log_audit_event


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class RecipientViewSet(viewsets.ModelViewSet):
    queryset = Recipient.objects.select_related(
        'preferred_language',
        'occupation',
        'organization',
        'organization_unit',
        'country',
        'state',
        'district'
    ).prefetch_related('channel_preferences').all().order_by('-created_at')

    serializer_class = RecipientSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'external_reference_id',
        'city'
    ]
    ordering_fields = ['created_at', 'first_name', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)

        lang_param = self.request.query_params.get('language')
        if lang_param:
            qs = qs.filter(Q(preferred_language_id=lang_param) | Q(language_id=lang_param))

        occ_param = self.request.query_params.get('occupation')
        if occ_param:
            qs = qs.filter(occupation_id=occ_param)

        state_param = self.request.query_params.get('state')
        if state_param:
            qs = qs.filter(state_id=state_param)

        gender_param = self.request.query_params.get('gender')
        if gender_param:
            qs = qs.filter(gender=gender_param)

        return qs

    def perform_create(self, serializer):
        recipient = serializer.save()
        log_audit_event(
            user=self.request.user,
            action='RECIPIENT_CREATED',
            request=self.request,
            details={'recipient_id': str(recipient.id), 'name': f"{recipient.first_name} {recipient.last_name}"}
        )

    @action(detail=True, methods=['post'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        recipient = self.get_object()
        if recipient.status == Recipient.StatusChoices.ACTIVE:
            recipient.status = Recipient.StatusChoices.INACTIVE
        else:
            recipient.status = Recipient.StatusChoices.ACTIVE
        recipient.save(update_fields=['status', 'updated_at'])
        return Response({'id': recipient.id, 'status': recipient.status})

    @action(detail=True, methods=['get', 'put'], url_path='preferences')
    def preferences(self, request, pk=None):
        recipient = self.get_object()
        if request.method == 'GET':
            prefs = recipient.channel_preferences.all()
            return Response(RecipientChannelPreferenceSerializer(prefs, many=True).data)

        # PUT: Update preferences list e.g. [{"channel": "EMAIL", "is_enabled": false}]
        data = request.data
        if not isinstance(data, list):
            data = [data]

        for item in data:
            ch = item.get('channel')
            enabled = item.get('is_enabled', True)
            if ch:
                RecipientChannelPreference.objects.update_or_create(
                    recipient=recipient,
                    channel=ch,
                    defaults={'is_enabled': enabled}
                )

        updated_prefs = recipient.channel_preferences.all()
        return Response(RecipientChannelPreferenceSerializer(updated_prefs, many=True).data)

    @action(detail=False, methods=['post'], url_path='import')
    def import_recipients(self, request):
        """
        POST /api/v1/recipients/import/
        Accepts: file (CSV or XLSX), mode ('preview' | 'confirm'), duplicate_choice ('SKIP' | 'UPDATE' | 'CREATE_NEW')
        """
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file uploaded. Please upload a .csv or .xlsx file.'}, status=status.HTTP_400_BAD_REQUEST)

        mode = request.data.get('mode', 'preview')
        duplicate_choice = request.data.get('duplicate_choice', 'SKIP')

        try:
            rows = parse_tabular_file(file_obj)
            if not rows:
                return Response({'error': 'The uploaded file is empty or contains no valid rows.'}, status=status.HTTP_400_BAD_REQUEST)

            result = process_import_rows(rows, mode=mode, duplicate_choice=duplicate_choice)

            if mode == 'confirm':
                log_audit_event(
                    user=request.user,
                    action='RECIPIENT_IMPORT',
                    request=request,
                    details=result
                )

            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
