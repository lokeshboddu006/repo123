from rest_framework.permissions import BasePermission
from api.models import User

class HasRole(BasePermission):
    """
    Base permission class to enforce role-based access control (RBAC).
    Subclass or instantiate with target roles.
    """
    allowed_roles = []

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        # Superuser always bypasses role checks
        if getattr(request.user, 'is_superuser', False):
            return True
            
        user_role = getattr(request.user, 'role', None)
        return user_role in self.allowed_roles


class IsAdminUserRole(HasRole):
    """
    Permission class allowing access only to users with ADMIN role.
    """
    allowed_roles = [User.RoleChoices.ADMIN]


# Alias for convenience
AdminOnly = IsAdminUserRole


class HasAnyRole(BasePermission):
    """
    Factory-like permission class to create custom role checkers on the fly.
    """
    def __init__(self, *roles):
        self.roles = roles

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if getattr(request.user, 'is_superuser', False):
            return True
        return getattr(request.user, 'role', None) in self.roles
