from api.models import AuditLog

def get_client_ip(request):
    """
    Extract client IP address from HttpRequest considering proxies.
    """
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def log_audit_event(user, action, request=None, details=None):
    """
    Helper function to record security audit logs.
    """
    ip_address = get_client_ip(request) if request else None
    user_agent = request.META.get('HTTP_USER_AGENT', '') if request else ''
    
    AuditLog.objects.create(
        user=user if getattr(user, 'is_authenticated', False) else None,
        action=action,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details or {}
    )
