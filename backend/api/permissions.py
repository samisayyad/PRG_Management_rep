from rest_framework import permissions


class IsScrumMasterOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'scrum_master'


class IsScrumMaster(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'scrum_master'


class IsOwnerOrScrumMaster(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'scrum_master':
            return True
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user
        if hasattr(obj, 'assignee'):
            return obj.assignee == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class CanManageTask(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'scrum_master':
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.method in ['PUT', 'PATCH']:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'scrum_master':
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        if obj.assignee == request.user:
            return True
        if obj.reporter == request.user:
            return True
        return False


class CanManageProject(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'scrum_master':
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'scrum_master':
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        if obj.created_by == request.user:
            return True
        return False


class CanManageSprint(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if request.user.role == 'scrum_master':
            return True
        if request.method in permissions.SAFE_METHODS:
            return True
        return False
