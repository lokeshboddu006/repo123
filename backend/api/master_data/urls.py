from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.master_data.views import (
    LanguageViewSet,
    CountryViewSet,
    StateViewSet,
    DistrictViewSet,
    OccupationViewSet,
    OrganizationViewSet,
    OrganizationUnitViewSet
)

router = DefaultRouter()
router.register(r'languages', LanguageViewSet, basename='languages')
router.register(r'countries', CountryViewSet, basename='countries')
router.register(r'states', StateViewSet, basename='states')
router.register(r'districts', DistrictViewSet, basename='districts')
router.register(r'occupations', OccupationViewSet, basename='occupations')
router.register(r'organizations', OrganizationViewSet, basename='organizations')
router.register(r'organization-units', OrganizationUnitViewSet, basename='organization-units')

urlpatterns = [
    path('', include(router.urls)),
]
