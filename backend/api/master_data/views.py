from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from api.models import (
    Language,
    Country,
    State,
    District,
    Occupation,
    Organization,
    OrganizationUnit
)
from api.master_data.serializers import (
    LanguageSerializer,
    CountrySerializer,
    StateSerializer,
    DistrictSerializer,
    OccupationSerializer,
    OrganizationSerializer,
    OrganizationUnitSerializer
)


class LanguageViewSet(viewsets.ModelViewSet):
    queryset = Language.objects.all().order_by('name')
    serializer_class = LanguageSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'native_name']


class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all().order_by('name')
    serializer_class = CountrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code']


class StateViewSet(viewsets.ModelViewSet):
    queryset = State.objects.select_related('country').all().order_by('name')
    serializer_class = StateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        qs = super().get_queryset()
        country_id = self.request.query_params.get('country')
        if country_id:
            qs = qs.filter(country_id=country_id)
        return qs


class DistrictViewSet(viewsets.ModelViewSet):
    queryset = District.objects.select_related('state').all().order_by('name')
    serializer_class = DistrictSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def get_queryset(self):
        qs = super().get_queryset()
        state_param = self.request.query_params.get('state')
        if state_param:
            from django.db.models import Q
            try:
                import uuid
                uuid_obj = uuid.UUID(state_param)
                qs = qs.filter(state_id=uuid_obj)
            except (ValueError, AttributeError):
                qs = qs.filter(Q(state__name__iexact=state_param) | Q(state_id__iexact=state_param))
        return qs


class OccupationViewSet(viewsets.ModelViewSet):
    queryset = Occupation.objects.all().order_by('title')
    serializer_class = OccupationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'category']


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.prefetch_related('units').all().order_by('name')
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'department']


class OrganizationUnitViewSet(viewsets.ModelViewSet):
    queryset = OrganizationUnit.objects.select_related('organization', 'parent_unit').all().order_by('name')
    serializer_class = OrganizationUnitSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'unit_type']

    def get_queryset(self):
        qs = super().get_queryset()
        org_id = self.request.query_params.get('organization')
        if org_id:
            qs = qs.filter(organization_id=org_id)
        return qs
