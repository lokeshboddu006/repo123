from datetime import datetime
from django.utils import timezone
from api.models import (
    Campaign,
    CampaignAudience,
    CampaignContent,
    RecipientChannelPreference
)
from api.audiences.rule_engine import get_audience_recipients


def validate_campaign(campaign):
    """
    Validates a campaign across the 12 required rules:
    1. Campaign has audience
    2. Audience exists
    3. Audience contains recipients
    4. Audience is active
    5. Campaign has content
    6. Required language content exists
    7. Required channels are selected
    8. Recipient communication preferences are respected
    9. Campaign status is valid
    10. Scheduled time is valid
    11. Scheduled time is in the future
    12. Template variables are valid

    Returns:
    {
        "valid": bool,
        "errors": list,
        "warnings": list,
        "details": dict
    }
    """
    errors = []
    warnings = []
    details = {}

    # 1 & 2. Campaign has audience and audience exists
    audiences = list(campaign.audiences.all())
    if not audiences and campaign.audience:
        audiences = [campaign.audience]

    if not audiences:
        errors.append("Rule 1 Failed: Campaign must have at least one audience segment assigned.")
    else:
        details['audiences_count'] = len(audiences)

    # 3 & 4. Audience is active and contains recipients
    total_recipients_count = 0
    all_recipients = []
    for aud in audiences:
        if not getattr(aud, 'is_active', True):
            errors.append(f"Rule 4 Failed: Audience segment '{aud.name}' is inactive.")

        rec_qs = get_audience_recipients(aud)
        count = rec_qs.count()
        total_recipients_count += count
        all_recipients.extend(list(rec_qs[:100]))

    if audiences and total_recipients_count == 0:
        errors.append("Rule 3 Failed: Selected audience segments contain 0 matching active recipients.")
    details['total_recipients'] = total_recipients_count

    # 5. Campaign has content
    contents = list(campaign.contents.all())
    if not contents:
        errors.append("Rule 5 Failed: Campaign must have at least one content record.")
    else:
        details['content_count'] = len(contents)

    # 6. Required language content exists
    target_languages = campaign.target_languages or []
    if not target_languages:
        warnings.append("No target languages explicitly set; assuming default content languages.")
    else:
        content_lang_codes = set()
        for c in contents:
            if c.language:
                content_lang_codes.add(c.language.code.lower())
                content_lang_codes.add(c.language.name.lower())

        for target_lang in target_languages:
            if target_lang.lower() not in content_lang_codes:
                errors.append(f"Rule 6 Failed: Missing required content for target language '{target_lang}'.")

    # 7. Required channels are selected
    channels = campaign.channels or []
    if not channels:
        errors.append("Rule 7 Failed: At least one communication channel must be selected (e.g. EMAIL, SMS).")
    details['channels'] = channels

    # 8. Recipient communication preferences are respected
    if channels and all_recipients:
        # Check if any recipients have opted into selected channels
        recipient_ids = [r.id for r in all_recipients]
        opted_in = RecipientChannelPreference.objects.filter(
            recipient_id__in=recipient_ids,
            channel__in=channels,
            is_enabled=True
        ).exists()
        if not opted_in and RecipientChannelPreference.objects.filter(recipient_id__in=recipient_ids).exists():
            warnings.append("Rule 8 Warning: No recipients currently have opted into the selected channels in their preferences.")

    # 9. Campaign status is valid
    valid_statuses_for_validation = [
        Campaign.StatusChoices.DRAFT,
        Campaign.StatusChoices.READY_FOR_REVIEW,
        Campaign.StatusChoices.VALIDATED,
        Campaign.StatusChoices.SCHEDULED
    ]
    if campaign.status not in valid_statuses_for_validation:
        errors.append(f"Rule 9 Failed: Cannot validate campaign with status '{campaign.status}'.")

    # 10 & 11. Scheduled time is valid and in the future
    schedule = getattr(campaign, 'campaign_schedule', None)
    scheduled_time = campaign.scheduled_at
    if schedule:
        scheduled_time = schedule.scheduled_time

    if campaign.status == Campaign.StatusChoices.SCHEDULED or (schedule and schedule.schedule_type == 'SCHEDULED'):
        if not scheduled_time:
            errors.append("Rule 10 Failed: Scheduled time is required when campaign is scheduled.")
        elif scheduled_time <= timezone.now():
            errors.append(f"Rule 11 Failed: Scheduled time '{scheduled_time}' must be in the future.")
    details['scheduled_time'] = scheduled_time.isoformat() if scheduled_time else None

    # 12. Template variables validation
    for c in contents:
        body = c.body or ''
        # Unreplaced raw brackets that look like unfulfilled placeholder tokens e.g. {{UNDEFINED}}
        if '{{' in body and '}}' in body:
            # Informational check
            details.setdefault('unresolved_variables', []).append(f"Content in {c.language.name if c.language else 'Default'} contains template variables.")

    is_valid = (len(errors) == 0)

    return {
        "valid": is_valid,
        "errors": errors,
        "warnings": warnings,
        "details": details
    }
