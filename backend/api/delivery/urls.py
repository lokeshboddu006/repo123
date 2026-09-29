from django.urls import path
from .views import (
    SendCampaignView,
    CampaignDeliverySummaryView,
    DeliveryDetailView,
    RetryDeliveryView,
    GlobalDeliveryLogView,
    ProviderWebhookView,
)

urlpatterns = [
    path('campaigns/<uuid:pk>/send/', SendCampaignView.as_view(), name='campaign-send'),
    path('campaigns/<uuid:pk>/delivery/', CampaignDeliverySummaryView.as_view(), name='campaign-delivery-summary'),
    path('deliveries/<uuid:pk>/', DeliveryDetailView.as_view(), name='delivery-detail'),
    path('deliveries/<uuid:pk>/retry/', RetryDeliveryView.as_view(), name='delivery-retry'),
    path('delivery/logs/', GlobalDeliveryLogView.as_view(), name='global-delivery-logs'),
    path('webhooks/<str:channel>/<str:provider>/', ProviderWebhookView.as_view(), name='provider-webhook'),
]
