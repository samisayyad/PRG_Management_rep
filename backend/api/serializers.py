from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import (
    User, Project, ProjectMember, Sprint, Task, Comment, 
    Attachment, ActivityLog, BehavioralEvent, TimeEntry, Notification
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)
    role = serializers.ChoiceField(choices=['employee', 'scrum_master'], default='employee')
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('This email is already registered.')
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'employee')
        )
        return user

class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'role', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    tasks_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'key', 'description', 'created_by', 'members_count', 
                  'tasks_count', 'progress', 'is_archived', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def get_tasks_count(self, obj):
        return obj.tasks.exclude(status='done').count()
    
    def get_progress(self, obj):
        total = obj.tasks.count()
        if total == 0:
            return 0
        done = obj.tasks.filter(status='done').count()
        return int((done / total) * 100)

class SprintSerializer(serializers.ModelSerializer):
    tasks_count = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Sprint
        fields = ['id', 'project', 'name', 'goal', 'start_date', 'end_date', 
                  'is_active', 'is_completed', 'tasks_count', 'completed_tasks', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()
    
    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='done').count()

class TaskListSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    project_key = serializers.CharField(source='project.key', read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'project', 'project_key', 'title', 'description', 'task_type', 
                  'priority', 'status', 'reporter', 'assignee', 'sprint', 'story_points',
                  'estimated_hours', 'due_date', 'start_date', 'labels', 'order',
                  'comments_count', 'created_at', 'updated_at', 'completed_at']
    
    def get_comments_count(self, obj):
        return obj.comments.count()

class TaskDetailSerializer(serializers.ModelSerializer):
    reporter = UserSerializer(read_only=True)
    assignee = UserSerializer(read_only=True)
    project_key = serializers.CharField(source='project.key', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    sprint_name = serializers.CharField(source='sprint.name', read_only=True)
    comments = serializers.SerializerMethodField()
    activity_logs = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = ['id', 'project', 'project_key', 'project_name', 'title', 'description', 
                  'task_type', 'priority', 'status', 'reporter', 'assignee', 'sprint',
                  'sprint_name', 'parent_task', 'story_points', 'estimated_hours', 
                  'due_date', 'start_date', 'labels', 'order', 'comments', 'activity_logs',
                  'created_at', 'updated_at', 'completed_at']
    
    def get_comments(self, obj):
        return CommentSerializer(obj.comments.all()[:10], many=True).data
    
    def get_activity_logs(self, obj):
        return ActivityLogSerializer(obj.activity_logs.all()[:20], many=True).data

class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'project', 'title', 'description', 'task_type', 'priority', 
                  'status', 'assignee', 'sprint', 'parent_task', 'story_points',
                  'estimated_hours', 'due_date', 'start_date', 'labels', 'order']
    
    def create(self, validated_data):
        validated_data['reporter'] = self.context['request'].user
        return super().create(validated_data)

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        return super().create(validated_data)

class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Attachment
        fields = ['id', 'task', 'file', 'filename', 'uploaded_by', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_by', 'uploaded_at']

class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = ['id', 'task', 'user', 'action_type', 'from_value', 'to_value', 'timestamp']

class BehavioralEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = BehavioralEvent
        fields = ['id', 'user', 'task', 'project', 'event_type', 'duration_seconds', 
                  'metadata', 'timestamp']
        read_only_fields = ['id', 'user', 'timestamp']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class TimeEntrySerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = TimeEntry
        fields = ['id', 'user', 'task', 'task_title', 'description', 'start_time', 
                  'end_time', 'duration_seconds', 'is_running', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'task', 'notification_type', 'title', 'message', 
                  'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']
