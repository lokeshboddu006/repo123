from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.audiences.views import AudienceSegmentViewSet

router = DefaultRouter()
router.register(r'', AudienceSegmentViewSet, basename='audiences')

urlpatterns = [
    path('', include(router.urls)),
]
