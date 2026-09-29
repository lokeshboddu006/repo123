from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.campaigns.views import CampaignViewSet, CampaignTypeViewSet

router = DefaultRouter()
router.register(r'types', CampaignTypeViewSet, basename='campaign-types')
router.register(r'', CampaignViewSet, basename='campaigns')

urlpatterns = [
    path('', include(router.urls)),
]
