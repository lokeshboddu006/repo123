import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    class RoleChoices(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        CAMPAIGN_MANAGER = 'CAMPAIGN_MANAGER', 'Campaign Manager'
        COMMUNICATION_TEAM = 'COMMUNICATION_TEAM', 'Communication Team'
        COMMUNICATION_OFFICER = 'COMMUNICATION_OFFICER', 'Communication Officer'
        CONTENT_CREATOR = 'CONTENT_CREATOR', 'Content Creator'
        ANALYST = 'ANALYST', 'Analyst'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(
        max_length=50,
        choices=RoleChoices.choices,
        default=RoleChoices.CAMPAIGN_MANAGER,
        help_text="Role determining permissions across the platform"
    )
    is_email_verified = models.BooleanField(default=False)
    auth_provider = models.CharField(max_length=30, default='local', help_text="local, google, etc.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_admin_role(self):
        return self.role == self.RoleChoices.ADMIN

    def __str__(self):
        return f"{self.username} ({self.role})"


class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    display_name = models.CharField(max_length=150, blank=True, default='')
    phone = models.CharField(max_length=30, blank=True, default='')
    avatar = models.FileField(upload_to='avatars/', null=True, blank=True)
    designation = models.CharField(max_length=150, blank=True, default='', help_text="Designation / Job Title")
    bio = models.TextField(blank=True, default='', help_text="Creator biography / about")

    organization_name = models.CharField(max_length=200, blank=True, default='')
    organization_type = models.CharField(max_length=100, blank=True, default='Government Department')
    department = models.CharField(max_length=150, blank=True, default='')
    role_title = models.CharField(max_length=100, blank=True, default='Communication Coordinator')

    country = models.CharField(max_length=100, default='India')
    state = models.CharField(max_length=100, blank=True, default='')
    district = models.CharField(max_length=100, blank=True, default='')
    city = models.CharField(max_length=100, blank=True, default='')
    postal_code = models.CharField(max_length=20, blank=True, default='')

    primary_language = models.CharField(max_length=50, default='English')
    additional_languages = models.JSONField(default=list, blank=True)
    preferred_channels = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username} ({self.display_name or self.user.username})"


class UserCommunicationPreferences(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='communication_preferences')

    email_notifications = models.BooleanField(default=True)
    campaign_updates = models.BooleanField(default=True)
    delivery_alerts = models.BooleanField(default=True)
    ai_notifications = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    marketing_announcements = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user.username}"


class AuditLog(models.Model):
    class ActionChoices(models.TextChoices):
        LOGIN = 'LOGIN', 'Login'
        LOGOUT = 'LOGOUT', 'Logout'
        PASSWORD_CHANGE = 'PASSWORD_CHANGE', 'Password Change'
        PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST', 'Password Reset Request'
        LOGIN_FAILED = 'LOGIN_FAILED', 'Login Failed'
        ACCOUNT_CREATED = 'ACCOUNT_CREATED', 'Account Created'
        PROFILE_UPDATED = 'PROFILE_UPDATED', 'Profile Updated'
        PREFERENCES_UPDATED = 'PREFERENCES_UPDATED', 'Preferences Updated'
        GOOGLE_LINKED = 'GOOGLE_LINKED', 'Google Account Linked'
        EMAIL_VERIFIED = 'EMAIL_VERIFIED', 'Email Verified'
        RECIPIENT_IMPORT = 'RECIPIENT_IMPORT', 'Recipient Import'
        RECIPIENT_CREATED = 'RECIPIENT_CREATED', 'Recipient Created'
        AUDIENCE_CREATED = 'AUDIENCE_CREATED', 'Audience Created'
        CAMPAIGN_CREATED = 'CAMPAIGN_CREATED', 'Campaign Created'
        CAMPAIGN_VALIDATED = 'CAMPAIGN_VALIDATED', 'Campaign Validated'
        CAMPAIGN_SCHEDULED = 'CAMPAIGN_SCHEDULED', 'Campaign Scheduled'
        CAMPAIGN_DISPATCHED = 'CAMPAIGN_DISPATCHED', 'Campaign Dispatched'
        CAMPAIGN_CANCELLED = 'CAMPAIGN_CANCELLED', 'Campaign Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=50, choices=ActionChoices.choices)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, default='')
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        user_repr = self.user.username if self.user else "Anonymous"
        return f"[{self.created_at}] {user_repr} - {self.action}"


from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile_and_preferences(sender, instance, created, **kwargs):
    """
    Ensure every User has an associated UserProfile and UserCommunicationPreferences.
    """
    if created:
        UserProfile.objects.get_or_create(
            user=instance,
            defaults={
                'display_name': instance.get_full_name() or instance.username,
                'primary_language': 'English',
            }
        )
        UserCommunicationPreferences.objects.get_or_create(user=instance)



# Master Data Models
class Language(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10, unique=True, help_text="e.g. en, hi, kn, ta, te")
    name = models.CharField(max_length=100)
    native_name = models.CharField(max_length=100, blank=True, default='')
    is_indic = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.code})"


class Country(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name


class State(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.CASCADE, null=True, blank=True, related_name='states')

    class Meta:
        unique_together = ('name', 'country')

    def __str__(self):
        return self.name


class District(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    state = models.ForeignKey(State, on_delete=models.CASCADE, related_name='districts')

    class Meta:
        unique_together = ('name', 'state')

    def __str__(self):
        return f"{self.name}, {self.state.name}"


class Location(models.Model):
    """Preserved for backwards compatibility"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)

    class Meta:
        unique_together = ('state', 'district')

    def __str__(self):
        return f"{self.district}, {self.state}"


class Occupation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=100, blank=True, default='General')

    def __str__(self):
        return self.title


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    department = models.CharField(max_length=150, blank=True, default='')

    def __str__(self):
        return f"{self.name} - {self.department}" if self.department else self.name


class OrganizationUnit(models.Model):
    """
    Organization hierarchy: Organization -> Department -> Unit -> Team
    Self-referencing parent_unit relationship
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='units')
    name = models.CharField(max_length=150)
    unit_type = models.CharField(max_length=50, default='Department', help_text="Department, Unit, Team")
    parent_unit = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='sub_units')

    def __str__(self):
        return f"{self.organization.name} - {self.name} ({self.unit_type})"


# Recipient Model
class Recipient(models.Model):
    class StatusChoices(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
        UNSUBSCRIBED = 'UNSUBSCRIBED', 'Unsubscribed'

    class GenderChoices(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'
        OTHER = 'OTHER', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    external_reference_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    external_ref_id = models.CharField(max_length=100, blank=True, null=True, db_index=True)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100, blank=True, default='')
    email = models.EmailField(blank=True, null=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True, db_index=True)

    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GenderChoices.choices, default=GenderChoices.OTHER, blank=True)

    occupation = models.ForeignKey(Occupation, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipients')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipients')
    organization_unit = models.ForeignKey(OrganizationUnit, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipients')

    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipients')
    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipients')
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipients')
    city = models.CharField(max_length=100, blank=True, default='')
    pincode = models.CharField(max_length=20, blank=True, default='')

    # Backward compatibility
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipients')
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True, blank=True, related_name='recipients')
    preferred_language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True, blank=True, related_name='preferred_recipients')

    preferred_channel = models.CharField(max_length=50, default='EMAIL', help_text="EMAIL, SMS, WHATSAPP, PUSH, WEB, SOCIAL")
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.ACTIVE)
    consent = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.external_reference_id and not self.external_ref_id:
            self.external_ref_id = self.external_reference_id
        elif self.external_ref_id and not self.external_reference_id:
            self.external_reference_id = self.external_ref_id
        if self.language and not self.preferred_language:
            self.preferred_language = self.language
        elif self.preferred_language and not self.language:
            self.language = self.preferred_language
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email or self.phone or self.external_reference_id})"


class RecipientChannelPreference(models.Model):
    class ChannelChoices(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'
        PUSH = 'PUSH', 'Push'
        WEB = 'WEB', 'Web'
        SOCIAL = 'SOCIAL', 'Social'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE, related_name='channel_preferences')
    channel = models.CharField(max_length=20, choices=ChannelChoices.choices)
    is_enabled = models.BooleanField(default=True)
    consent_given_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('recipient', 'channel')

    def __str__(self):
        status = "Enabled" if self.is_enabled else "Disabled"
        return f"{self.recipient.first_name} - {self.channel}: {status}"


class RecipientEngagementEvent(models.Model):
    class EventType(models.TextChoices):
        SENT = 'SENT', 'Sent'
        DELIVERED = 'DELIVERED', 'Delivered'
        OPENED = 'OPENED', 'Opened'
        CLICKED = 'CLICKED', 'Clicked'
        RESPONDED = 'RESPONDED', 'Responded'
        FAILED = 'FAILED', 'Failed'
        BOUNCED = 'BOUNCED', 'Bounced'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE, related_name='engagement_events')
    campaign = models.ForeignKey('Campaign', on_delete=models.SET_NULL, null=True, blank=True, related_name='engagement_events')
    channel = models.CharField(max_length=20, default='EMAIL')
    event_type = models.CharField(max_length=20, choices=EventType.choices, default=EventType.SENT)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


# Audience Segmentation Models
class AudienceSegment(models.Model):
    class SegmentType(models.TextChoices):
        STATIC = 'STATIC', 'Static'
        DYNAMIC = 'DYNAMIC', 'Dynamic'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    segment_type = models.CharField(max_length=20, choices=SegmentType.choices, default=SegmentType.DYNAMIC)
    
    # Stores dynamic query rules e.g.: {"state": "Andhra Pradesh", "language": "Telugu", "occupation": "Student"}
    filter_criteria = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_audiences')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.segment_type})"


class AudienceSegmentRule(models.Model):
    class OperatorChoices(models.TextChoices):
        EQUALS = '=', 'Equals'
        NOT_EQUALS = '!=', 'Not Equals'
        CONTAINS = 'contains', 'Contains'
        IN = 'in', 'In'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audience = models.ForeignKey(AudienceSegment, on_delete=models.CASCADE, related_name='rules')
    field = models.CharField(max_length=50, help_text="state, district, language, occupation, status, gender, city, etc.")
    operator = models.CharField(max_length=20, choices=OperatorChoices.choices, default=OperatorChoices.EQUALS)
    value = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.audience.name}: {self.field} {self.operator} {self.value}"


class AudienceMember(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    audience = models.ForeignKey(AudienceSegment, on_delete=models.CASCADE, related_name='members')
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE, related_name='audience_memberships')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('audience', 'recipient')


# Alias for spec alignment
AudienceSegmentMember = AudienceMember


# Communication Templates
class Template(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=150)
    scenario = models.CharField(max_length=100, help_text="e.g. Awareness, Emergency, Announcement, Health")
    subject_template = models.CharField(max_length=255, blank=True, default='')
    body_template = models.TextField(help_text="Supports {{title}}, {{message}}, {{location}}, {{date}}")
    default_languages = models.JSONField(default=list, blank=True, help_text="List of language codes e.g. ['en', 'hi', 'kn', 'te', 'ta']")
    active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.scenario})"


# Alias for spec alignment
CommunicationTemplate = Template


# Content Library
class ContentLibrary(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100, default='General', help_text="Dengue Prevention, Flood Safety, Public Health, Water Conservation, Education Scholarship, Emergency Preparedness")
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True, blank=True, related_name='content_library_items')
    content = models.TextField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Content libraries'

    def __str__(self):
        return f"{self.title} [{self.category}]"


# Campaign Models
class CampaignType(models.Model):
    class CodeChoices(models.TextChoices):
        AWARENESS = 'AWARENESS', 'Awareness'
        EMERGENCY_ALERT = 'EMERGENCY_ALERT', 'Emergency Alert'
        EDUCATIONAL = 'EDUCATIONAL', 'Educational'
        ORGANIZATIONAL_ANNOUNCEMENT = 'ORGANIZATIONAL_ANNOUNCEMENT', 'Organizational Announcement'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, choices=CodeChoices.choices, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.name


class Campaign(models.Model):
    class PriorityChoices(models.TextChoices):
        LOW = 'LOW', 'Low'
        NORMAL = 'NORMAL', 'Normal'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    class StatusChoices(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        READY_FOR_REVIEW = 'READY_FOR_REVIEW', 'Ready for Review'
        VALIDATED = 'VALIDATED', 'Validated'
        SCHEDULED = 'SCHEDULED', 'Scheduled'
        RUNNING = 'RUNNING', 'Running'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    campaign_type = models.CharField(max_length=100, default='AWARENESS', help_text="AWARENESS, EMERGENCY_ALERT, EDUCATIONAL, ORGANIZATIONAL_ANNOUNCEMENT")
    priority = models.CharField(max_length=20, choices=PriorityChoices.choices, default=PriorityChoices.NORMAL)
    status = models.CharField(max_length=20, choices=StatusChoices.choices, default=StatusChoices.DRAFT)
    description = models.TextField(blank=True, default='')

    # Backward compatibility single audience
    audience = models.ForeignKey(AudienceSegment, on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns')
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns')

    # Multi-audience support via M2M CampaignAudience
    audiences = models.ManyToManyField(AudienceSegment, through='CampaignAudience', related_name='associated_campaigns', blank=True)

    channels = models.JSONField(default=list, help_text="List of channels e.g. ['EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'WEB', 'SOCIAL']")
    target_languages = models.JSONField(default=list, help_text="List of language codes e.g. ['en', 'hi', 'kn', 'ta', 'te']")

    scheduled_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} [{self.status}]"


class CampaignAudience(models.Model):
    """Many-to-many through model supporting multiple audience segments per campaign"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='campaign_audiences')
    audience_segment = models.ForeignKey(AudienceSegment, on_delete=models.CASCADE, related_name='campaign_audiences')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('campaign', 'audience_segment')

    def __str__(self):
        return f"{self.campaign.title} -> {self.audience_segment.name}"


class CampaignContent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='contents')
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='campaign_contents')
    channel = models.CharField(max_length=20, default='EMAIL', help_text="EMAIL, SMS, WHATSAPP, PUSH, WEB, SOCIAL, or ALL")
    subject = models.CharField(max_length=255, blank=True, default='')
    title = models.CharField(max_length=255, blank=True, default='')
    body = models.TextField()
    tone = models.CharField(max_length=50, default='Informative')
    sentiment_score = models.FloatField(default=0.8)
    ai_generated = models.BooleanField(default=False)
    version = models.IntegerField(default=1)
    status = models.CharField(max_length=20, default='DRAFT')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.campaign.title} - {self.language.code} ({self.channel})"


class CampaignSchedule(models.Model):
    class ScheduleType(models.TextChoices):
        SEND_NOW = 'SEND_NOW', 'Send Now'
        SCHEDULED = 'SCHEDULED', 'Scheduled'

    class ScheduleStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        EXECUTED = 'EXECUTED', 'Executed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.OneToOneField(Campaign, on_delete=models.CASCADE, related_name='campaign_schedule')
    schedule_type = models.CharField(max_length=20, choices=ScheduleType.choices, default=ScheduleType.SCHEDULED)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')
    status = models.CharField(max_length=20, choices=ScheduleStatus.choices, default=ScheduleStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.campaign.title}: {self.schedule_type} at {self.scheduled_time} ({self.timezone})"


# Delivery & Engagement Tracking
class DeliveryLog(models.Model):
    class ChannelChoices(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        WHATSAPP = 'WHATSAPP', 'WhatsApp'
        PUSH = 'PUSH', 'Push Notification'
        WEB = 'WEB', 'Web Notification'

    class DeliveryStatus(models.TextChoices):
        QUEUED = 'QUEUED', 'Queued'
        PROCESSING = 'PROCESSING', 'Processing'
        SENT = 'SENT', 'Sent'
        DELIVERED = 'DELIVERED', 'Delivered'
        READ = 'READ', 'Read'
        CLICKED = 'CLICKED', 'Clicked'
        FAILED = 'FAILED', 'Failed'
        RETRYING = 'RETRYING', 'Retrying'
        CANCELLED = 'CANCELLED', 'Cancelled'
        SKIPPED = 'SKIPPED', 'Skipped'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='delivery_logs')
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE, related_name='delivery_logs')
    channel = models.CharField(max_length=20, choices=ChannelChoices.choices)
    status = models.CharField(max_length=20, choices=DeliveryStatus.choices, default=DeliveryStatus.QUEUED, db_index=True)
    provider = models.CharField(max_length=50, default='development', db_index=True)
    provider_message_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    
    queued_at = models.DateTimeField(null=True, blank=True)
    processing_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)
    
    retry_count = models.IntegerField(default=0)
    error_code = models.CharField(max_length=50, blank=True, default='')
    error_message = models.TextField(blank=True, default='')
    
    details = models.JSONField(default=dict, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ('campaign', 'recipient', 'channel')

    def __str__(self):
        return f"{self.campaign.title} -> {self.recipient.email or self.recipient.phone} [{self.channel}: {self.status}]"


class DeliveryEvent(models.Model):
    class EventType(models.TextChoices):
        MESSAGE_QUEUED = 'MESSAGE_QUEUED', 'Queued'
        MESSAGE_PROCESSING = 'MESSAGE_PROCESSING', 'Processing'
        MESSAGE_SENT = 'MESSAGE_SENT', 'Sent'
        MESSAGE_DELIVERED = 'MESSAGE_DELIVERED', 'Delivered'
        MESSAGE_READ = 'MESSAGE_READ', 'Read'
        MESSAGE_CLICKED = 'MESSAGE_CLICKED', 'Clicked'
        MESSAGE_FAILED = 'MESSAGE_FAILED', 'Failed'
        MESSAGE_RETRIED = 'MESSAGE_RETRIED', 'Retried'
        MESSAGE_CANCELLED = 'MESSAGE_CANCELLED', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    delivery = models.ForeignKey(DeliveryLog, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=30, choices=EventType.choices, db_index=True)
    provider_event_id = models.CharField(max_length=100, blank=True, default='', db_index=True)
    timestamp = models.DateTimeField(default=timezone.now)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.delivery.id} - {self.event_type} at {self.timestamp}"


class EngagementMetric(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='engagement_metrics')
    recipient = models.ForeignKey(Recipient, on_delete=models.CASCADE, related_name='engagement_metrics')
    opened = models.BooleanField(default=False)
    clicked = models.BooleanField(default=False)
    responded = models.BooleanField(default=False)
    feedback_text = models.TextField(blank=True, default='')
    sentiment_rating = models.CharField(max_length=20, default='NEUTRAL')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('campaign', 'recipient')

