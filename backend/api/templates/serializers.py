import re
from rest_framework import serializers
from api.models import Template


class TemplateSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    detected_variables = serializers.SerializerMethodField()

    class Meta:
        model = Template
        fields = [
            'id',
            'title',
            'scenario',
            'subject_template',
            'body_template',
            'default_languages',
            'active',
            'detected_variables',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at'
        ]

    def get_detected_variables(self, obj):
        text = f"{obj.subject_template} {obj.body_template}"
        vars_found = set(re.findall(r'\{\{([a-zA-Z0-9_]+)\}\}', text))
        return list(vars_found)

    def create(self, validated_data):
        if 'created_by' not in validated_data and 'request' in self.context:
            validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
