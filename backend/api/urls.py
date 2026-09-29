from django.urls import path, include
from .views import health_check, ai_generate, ai_translate

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('ai/generate/', ai_generate, name='ai_generate'),
    path('ai/translate/', ai_translate, name='ai_translate'),
    path('auth/', include('api.authentication.urls')),
    path('recipients/', include('api.recipients.urls')),
    path('audiences/', include('api.audiences.urls')),
    path('campaigns/', include('api.campaigns.urls')),
    path('templates/', include('api.templates.urls')),
    path('content-library/', include('api.content_library.urls')),
    path('master-data/', include('api.master_data.urls')),
    path('', include('api.delivery.urls')),
]
