from rest_framework import serializers
from api.models import (
    Language,
    Country,
    State,
    District,
    Occupation,
    Organization,
    OrganizationUnit
)


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'code', 'name', 'native_name', 'is_indic']


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = ['id', 'name', 'code']


class StateSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)

    class Meta:
        model = State
        fields = ['id', 'name', 'country', 'country_name']


class DistrictSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.name', read_only=True)

    class Meta:
        model = District
        fields = ['id', 'name', 'state', 'state_name']


class OccupationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Occupation
        fields = ['id', 'title', 'category']


class OrganizationUnitChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationUnit
        fields = ['id', 'name', 'unit_type']


class OrganizationUnitSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    parent_unit_name = serializers.CharField(source='parent_unit.name', read_only=True)
    sub_units = OrganizationUnitChildSerializer(many=True, read_only=True)

    class Meta:
        model = OrganizationUnit
        fields = [
            'id',
            'organization',
            'organization_name',
            'name',
            'unit_type',
            'parent_unit',
            'parent_unit_name',
            'sub_units'
        ]


class OrganizationSerializer(serializers.ModelSerializer):
    units = OrganizationUnitSerializer(many=True, read_only=True)

    class Meta:
        model = Organization
        fields = ['id', 'name', 'department', 'units']
