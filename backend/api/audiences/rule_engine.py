from django.db.models import Q
from api.models import Recipient


FIELD_MAPPINGS = {
    'state': ['state__name', 'location__state'],
    'district': ['district__name', 'location__district'],
    'language': ['preferred_language__name', 'preferred_language__code', 'language__name', 'language__code'],
    'occupation': ['occupation__title'],
    'organization': ['organization__name'],
    'gender': ['gender'],
    'status': ['status'],
    'city': ['city'],
    'pincode': ['pincode'],
}


def build_field_q(field_name, operator, value):
    """
    Safely builds a Q object for a given field, operator, and value without raw SQL.
    """
    field_name = field_name.lower().strip()
    op = operator.strip()
    val = str(value).strip()

    target_fields = FIELD_MAPPINGS.get(field_name, [field_name])

    field_q = Q()

    for tf in target_fields:
        if op == '=':
            field_q |= Q(**{f"{tf}__iexact": val})
        elif op == '!=':
            field_q &= ~Q(**{f"{tf}__iexact": val})
        elif op == 'contains':
            field_q |= Q(**{f"{tf}__icontains": val})
        elif op == 'in':
            items = [item.strip() for item in val.split(',') if item.strip()]
            field_q |= Q(**{f"{tf}__in": items})
        else:
            field_q |= Q(**{f"{tf}__iexact": val})

    return field_q


def evaluate_rules_to_queryset(rules):
    """
    Takes a list of rule dictionaries:
    [{"field": "state", "operator": "=", "value": "Andhra Pradesh"}, ...]
    and returns a filtered Recipient QuerySet.
    """
    qs = Recipient.objects.select_related(
        'preferred_language', 'occupation', 'state', 'district', 'organization'
    ).filter(status='ACTIVE')

    if not rules:
        return qs

    combined_q = Q()
    for rule in rules:
        field = rule.get('field', '')
        op = rule.get('operator', '=')
        val = rule.get('value', '')
        if field and val:
            rule_q = build_field_q(field, op, val)
            combined_q &= rule_q

    return qs.filter(combined_q)


def get_audience_recipients(audience):
    """
    Returns the recipients for a given AudienceSegment.
    If STATIC: returns audience.members.all()
    If DYNAMIC: evaluates the AudienceSegmentRule objects attached to the audience.
    """
    if audience.segment_type == 'STATIC':
        return Recipient.objects.filter(audience_memberships__audience=audience)

    rules = [
        {'field': r.field, 'operator': r.operator, 'value': r.value}
        for r in audience.rules.all()
    ]

    # Fallback to filter_criteria JSON if no rule objects exist
    if not rules and audience.filter_criteria:
        if isinstance(audience.filter_criteria, dict):
            for k, v in audience.filter_criteria.items():
                rules.append({'field': k, 'operator': '=', 'value': str(v)})
        elif isinstance(audience.filter_criteria, list):
            rules = audience.filter_criteria

    return evaluate_rules_to_queryset(rules)
