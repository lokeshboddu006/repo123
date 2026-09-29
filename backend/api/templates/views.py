from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from api.models import Template
from api.templates.serializers import TemplateSerializer


class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.select_related('created_by').all().order_by('-created_at')
    serializer_class = TemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'scenario', 'subject_template', 'body_template']
    ordering_fields = ['created_at', 'title', 'active']

    def get_queryset(self):
        qs = super().get_queryset()
        active_param = self.request.query_params.get('active')
        if active_param is not None:
            qs = qs.filter(active=active_param.lower() == 'true')
        scenario_param = self.request.query_params.get('scenario')
        if scenario_param:
            qs = qs.filter(scenario__iexact=scenario_param)
        return qs
