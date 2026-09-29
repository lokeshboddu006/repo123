from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.content_library.views import ContentLibraryViewSet

router = DefaultRouter()
router.register(r'', ContentLibraryViewSet, basename='content-library')

urlpatterns = [
    path('', include(router.urls)),
]
