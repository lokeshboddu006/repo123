from rest_framework import serializers
from api.models import AudienceSegment, AudienceSegmentRule, AudienceMember, Recipient
from api.audiences.rule_engine import get_audience_recipients


class AudienceSegmentRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudienceSegmentRule
        fields = ['id', 'field', 'operator', 'value']


class AudienceSegmentSerializer(serializers.ModelSerializer):
    rules = AudienceSegmentRuleSerializer(many=True, required=False)
    member_count = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = AudienceSegment
        fields = [
            'id',
            'name',
            'description',
            'segment_type',
            'filter_criteria',
            'is_active',
            'rules',
            'member_count',
            'created_by',
            'created_by_username',
            'created_at',
            'updated_at'
        ]

    def get_member_count(self, obj):
        try:
            return get_audience_recipients(obj).count()
        except Exception:
            return 0

    def create(self, validated_data):
        rules_data = self.context.get('request').data.get('rules', []) if self.context.get('request') else []
        member_ids = self.context.get('request').data.get('member_ids', []) if self.context.get('request') else []

        if 'rules' in validated_data:
            del validated_data['rules']

        validated_data['created_by'] = self.context['request'].user if 'request' in self.context else None
        segment = AudienceSegment.objects.create(**validated_data)

        # Create rules for dynamic audience
        for r_data in rules_data:
            AudienceSegmentRule.objects.create(
                audience=segment,
                field=r_data.get('field', ''),
                operator=r_data.get('operator', '='),
                value=str(r_data.get('value', ''))
            )

        # If static audience with initial member IDs
        if segment.segment_type == 'STATIC' and member_ids:
            for m_id in member_ids:
                try:
                    rec = Recipient.objects.get(id=m_id)
                    AudienceMember.objects.get_or_create(audience=segment, recipient=rec)
                except Recipient.DoesNotExist:
                    pass

        return segment

    def update(self, instance, validated_data):
        rules_data = self.context.get('request').data.get('rules', None) if self.context.get('request') else None
        member_ids = self.context.get('request').data.get('member_ids', None) if self.context.get('request') else None

        if 'rules' in validated_data:
            del validated_data['rules']

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if rules_data is not None:
            instance.rules.all().delete()
            for r_data in rules_data:
                AudienceSegmentRule.objects.create(
                    audience=instance,
                    field=r_data.get('field', ''),
                    operator=r_data.get('operator', '='),
                    value=str(r_data.get('value', ''))
                )

        if member_ids is not None and instance.segment_type == 'STATIC':
            instance.members.all().delete()
            for m_id in member_ids:
                try:
                    rec = Recipient.objects.get(id=m_id)
                    AudienceMember.objects.get_or_create(audience=instance, recipient=rec)
                except Recipient.DoesNotExist:
                    pass

        return instance
