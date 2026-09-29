from rest_framework import serializers
from api.models import ContentLibrary


class ContentLibrarySerializer(serializers.ModelSerializer):
    language_name = serializers.CharField(source='language.name', read_only=True)
    language_code = serializers.CharField(source='language.code', read_only=True)

    class Meta:
        model = ContentLibrary
        fields = [
            'id',
            'title',
            'category',
            'language',
            'language_name',
            'language_code',
            'content',
            'active',
            'created_at',
            'updated_at'
        ]
