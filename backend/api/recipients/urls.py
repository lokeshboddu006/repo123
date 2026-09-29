from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.recipients.views import RecipientViewSet

router = DefaultRouter()
router.register(r'', RecipientViewSet, basename='recipients')

urlpatterns = [
    path('', include(router.urls)),
]
