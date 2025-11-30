from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, Project, ProjectMember, Sprint, Task, Comment,
    Attachment, ActivityLog, BehavioralEvent, TimeEntry, Notification
)

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'role', 'is_staff', 'created_at']
    list_filter = ['role', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'avatar')}),
    )

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'key', 'created_by', 'created_at']
    list_filter = ['is_archived', 'created_at']
    search_fields = ['name', 'key']

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assignee', 'created_at']
    list_filter = ['status', 'priority', 'task_type']
    search_fields = ['title', 'description']

@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'is_active', 'is_completed', 'start_date', 'end_date']
    list_filter = ['is_active', 'is_completed']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'created_at']

@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'task', 'start_time', 'duration_seconds', 'is_running']
    list_filter = ['is_running', 'start_time']

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read']

admin.site.register(ProjectMember)
admin.site.register(Attachment)
admin.site.register(ActivityLog)
admin.site.register(BehavioralEvent)
