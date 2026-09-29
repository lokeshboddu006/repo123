from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from api.models import ContentLibrary
from api.content_library.serializers import ContentLibrarySerializer


class ContentLibraryViewSet(viewsets.ModelViewSet):
    queryset = ContentLibrary.objects.select_related('language').all().order_by('-created_at')
    serializer_class = ContentLibrarySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'category', 'content']
    ordering_fields = ['created_at', 'title', 'category']

    def get_queryset(self):
        qs = super().get_queryset()
        cat = self.request.query_params.get('category')
        if cat:
            qs = qs.filter(category__iexact=cat)
        lang = self.request.query_params.get('language')
        if lang:
            qs = qs.filter(language__code=lang)
        active = self.request.query_params.get('active')
        if active is not None:
            qs = qs.filter(active=active.lower() == 'true')
        return qs
