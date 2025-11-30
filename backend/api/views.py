from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Count, Avg, Sum, Q
from django.utils import timezone
from datetime import timedelta

from .models import (
    User, Project, ProjectMember, Sprint, Task, Comment,
    Attachment, ActivityLog, BehavioralEvent, TimeEntry, Notification
)
from .serializers import (
    UserSerializer, UserRegisterSerializer, ProjectSerializer, ProjectMemberSerializer,
    SprintSerializer, TaskListSerializer, TaskDetailSerializer, TaskCreateUpdateSerializer,
    CommentSerializer, AttachmentSerializer, ActivityLogSerializer,
    BehavioralEventSerializer, TimeEntrySerializer, NotificationSerializer
)
from .permissions import CanManageProject, CanManageTask, CanManageSprint, IsScrumMaster

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    # Make password optional for validation and set a default if missing
    data = request.data.copy()
    if 'password' not in data:
        return Response({'error': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = UserRegisterSerializer(data=data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            user.is_active = True
            user.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        if user.check_password(password) and user.is_active:
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
    except User.DoesNotExist:
        pass
    
    return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    if request.method == 'GET':
        return Response(UserSerializer(request.user).data)
    elif request.method == 'PUT':
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def users_list(request):
    users = User.objects.all()
    return Response(UserSerializer(users, many=True).data)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, CanManageProject]
    
    def get_queryset(self):
        return Project.objects.filter(
            Q(created_by=self.request.user) | Q(members=self.request.user)
        ).distinct()
    
    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        ProjectMember.objects.create(project=project, user=self.request.user, role='admin')
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        project = self.get_object()
        members = ProjectMember.objects.filter(project=project)
        return Response(ProjectMemberSerializer(members, many=True).data)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        project = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'member')
        
        try:
            user = User.objects.get(id=user_id)
            member, created = ProjectMember.objects.get_or_create(
                project=project, user=user, defaults={'role': role}
            )
            return Response(ProjectMemberSerializer(member).data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['get'])
    def board(self, request, pk=None):
        project = self.get_object()
        tasks = project.tasks.all()
        
        board = {
            'todo': TaskListSerializer(tasks.filter(status='todo'), many=True).data,
            'in_progress': TaskListSerializer(tasks.filter(status='in_progress'), many=True).data,
            'review': TaskListSerializer(tasks.filter(status='review'), many=True).data,
            'done': TaskListSerializer(tasks.filter(status='done'), many=True).data,
        }
        return Response(board)
    
    @action(detail=True, methods=['get'])
    def backlog(self, request, pk=None):
        project = self.get_object()
        tasks = project.tasks.filter(status='backlog', sprint__isnull=True)
        return Response(TaskListSerializer(tasks, many=True).data)

class SprintViewSet(viewsets.ModelViewSet):
    serializer_class = SprintSerializer
    permission_classes = [IsAuthenticated, CanManageSprint]
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return Sprint.objects.filter(project_id=project_id)
        return Sprint.objects.filter(project__members=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        sprint = self.get_object()
        Sprint.objects.filter(project=sprint.project, is_active=True).update(is_active=False)
        sprint.is_active = True
        sprint.start_date = timezone.now().date()
        sprint.save()
        return Response(SprintSerializer(sprint).data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        sprint = self.get_object()
        sprint.is_active = False
        sprint.is_completed = True
        sprint.end_date = timezone.now().date()
        sprint.save()
        
        incomplete_tasks = sprint.tasks.exclude(status='done')
        incomplete_tasks.update(sprint=None, status='backlog')
        
        return Response(SprintSerializer(sprint).data)

class TaskViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, CanManageTask]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        if self.action == 'retrieve':
            return TaskDetailSerializer
        return TaskListSerializer
    
    def get_queryset(self):
        queryset = Task.objects.filter(
            Q(project__created_by=self.request.user) | Q(project__members=self.request.user)
        ).distinct()
        
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        assignee_filter = self.request.query_params.get('assignee')
        if assignee_filter == 'me':
            queryset = queryset.filter(assignee=self.request.user)
        elif assignee_filter:
            queryset = queryset.filter(assignee_id=assignee_filter)
        
        return queryset
    
    def perform_create(self, serializer):
        task = serializer.save()
        ActivityLog.objects.create(
            task=task,
            user=self.request.user,
            action_type='created'
        )
        BehavioralEvent.objects.create(
            user=self.request.user,
            task=task,
            project=task.project,
            event_type='task_created'
        )
    
    def perform_update(self, serializer):
        old_task = self.get_object()
        old_status = old_task.status
        old_assignee = old_task.assignee
        
        task = serializer.save()
        
        if old_status != task.status:
            ActivityLog.objects.create(
                task=task,
                user=self.request.user,
                action_type='status_changed',
                from_value=old_status,
                to_value=task.status
            )
            if task.status == 'done':
                BehavioralEvent.objects.create(
                    user=self.request.user,
                    task=task,
                    project=task.project,
                    event_type='task_completed'
                )
        
        if old_assignee != task.assignee:
            ActivityLog.objects.create(
                task=task,
                user=self.request.user,
                action_type='assigned',
                from_value=str(old_assignee) if old_assignee else '',
                to_value=str(task.assignee) if task.assignee else ''
            )
            if task.assignee:
                Notification.objects.create(
                    user=task.assignee,
                    task=task,
                    notification_type='task_assigned',
                    title='Task Assigned',
                    message=f'You have been assigned to task: {task.title}'
                )
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        task = self.get_object()
        new_status = request.data.get('status')
        new_order = request.data.get('order', 0)
        
        old_status = task.status
        task.status = new_status
        task.order = new_order
        task.save()
        
        ActivityLog.objects.create(
            task=task,
            user=request.user,
            action_type='status_changed',
            from_value=old_status,
            to_value=new_status
        )
        
        BehavioralEvent.objects.create(
            user=request.user,
            task=task,
            project=task.project,
            event_type='status_drag_drop',
            metadata={'from': old_status, 'to': new_status}
        )
        
        if new_status == 'done':
            BehavioralEvent.objects.create(
                user=request.user,
                task=task,
                project=task.project,
                event_type='task_completed'
            )
        
        return Response(TaskListSerializer(task).data)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        task_id = self.request.query_params.get('task')
        if task_id:
            return Comment.objects.filter(task_id=task_id)
        return Comment.objects.filter(task__project__members=self.request.user)
    
    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        ActivityLog.objects.create(
            task=comment.task,
            user=self.request.user,
            action_type='comment_added'
        )
        BehavioralEvent.objects.create(
            user=self.request.user,
            task=comment.task,
            project=comment.task.project,
            event_type='comment_added'
        )

class TimeEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TimeEntry.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        TimeEntry.objects.filter(user=self.request.user, is_running=True).update(
            is_running=False,
            end_time=timezone.now()
        )
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        entry = self.get_object()
        entry.is_running = False
        entry.end_time = timezone.now()
        entry.duration_seconds = int((entry.end_time - entry.start_time).total_seconds())
        entry.save()
        
        if entry.task:
            BehavioralEvent.objects.create(
                user=request.user,
                task=entry.task,
                project=entry.task.project,
                event_type='stopped_timer',
                duration_seconds=entry.duration_seconds
            )
        
        return Response(TimeEntrySerializer(entry).data)

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'ok'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_behavioral_event(request):
    serializer = BehavioralEventSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    now = timezone.now()
    week_ago = now - timedelta(days=7)
    
    user_tasks = Task.objects.filter(
        Q(assignee=user) | Q(reporter=user)
    ).distinct()
    
    completed_tasks = user_tasks.filter(status='done', completed_at__gte=week_ago).count()
    in_progress_tasks = user_tasks.filter(status='in_progress').count()
    overdue_tasks = user_tasks.filter(due_date__lt=now.date()).exclude(status='done').count()
    
    time_entries = TimeEntry.objects.filter(user=user, start_time__gte=week_ago)
    total_hours = sum(e.duration_seconds for e in time_entries) / 3600
    
    recent_tasks = user_tasks.order_by('-updated_at')[:10]
    
    projects = Project.objects.filter(
        Q(created_by=user) | Q(members=user)
    ).distinct()[:5]
    
    project_stats = []
    for project in projects:
        total = project.tasks.count()
        done = project.tasks.filter(status='done').count()
        progress = int((done / total * 100)) if total > 0 else 0
        project_stats.append({
            'id': project.id,
            'name': project.name,
            'members_count': project.members.count(),
            'progress': progress,
            'due_date': project.tasks.filter(due_date__isnull=False).order_by('due_date').first().due_date if project.tasks.filter(due_date__isnull=False).exists() else None
        })
    
    productivity_events = BehavioralEvent.objects.filter(
        user=user,
        event_type='task_completed',
        timestamp__gte=week_ago
    )
    
    best_hours = "9-11 AM"
    if productivity_events.exists():
        hours = [e.timestamp.hour for e in productivity_events]
        if hours:
            from collections import Counter
            most_common_hour = Counter(hours).most_common(1)[0][0]
            best_hours = f"{most_common_hour}-{most_common_hour + 2} AM" if most_common_hour < 12 else f"{most_common_hour - 12}-{most_common_hour - 10} PM"
    
    return Response({
        'tasks_completed': completed_tasks,
        'avg_completion_time': f"{total_hours:.1f}h",
        'team_productivity': 0 if not completed_tasks else min(100, completed_tasks * 10),
        'overdue_tasks': overdue_tasks,
        'in_progress_tasks': in_progress_tasks,
        'best_work_hours': best_hours,
        'team_velocity': 24,
        'completion_rate': 0 if not user_tasks.count() else int(completed_tasks / max(1, user_tasks.count()) * 100),
        'recent_tasks': TaskListSerializer(recent_tasks, many=True).data,
        'active_projects': project_stats,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_data(request):
    user = request.user
    days = int(request.query_params.get('days', 7))
    now = timezone.now()
    start_date = now - timedelta(days=days)
    
    tasks = Task.objects.filter(
        Q(project__created_by=user) | Q(project__members=user),
        created_at__gte=start_date
    ).distinct()
    
    completed_tasks = tasks.filter(status='done').count()
    total_tasks = tasks.count()
    
    status_distribution = tasks.values('status').annotate(count=Count('id'))
    
    priority_distribution = tasks.values('priority').annotate(count=Count('id'))
    
    daily_completed = []
    for i in range(days):
        day = start_date + timedelta(days=i)
        count = tasks.filter(
            status='done',
            completed_at__date=day.date()
        ).count()
        daily_completed.append({
            'date': day.strftime('%Y-%m-%d'),
            'count': count
        })
    
    team_members = User.objects.filter(
        Q(projects__created_by=user) | Q(projects__in=Project.objects.filter(members=user))
    ).distinct()[:10]
    
    team_performance = []
    for member in team_members:
        member_tasks = Task.objects.filter(assignee=member, created_at__gte=start_date)
        team_performance.append({
            'id': member.id,
            'name': f"{member.first_name} {member.last_name}" if member.first_name else member.email,
            'tasks_assigned': member_tasks.count(),
            'tasks_completed': member_tasks.filter(status='done').count(),
            'in_progress': member_tasks.filter(status='in_progress').count(),
        })
    
    return Response({
        'tasks_completed': completed_tasks,
        'completion_rate': int(completed_tasks / max(1, total_tasks) * 100),
        'team_productivity': 0,
        'active_projects': Project.objects.filter(
            Q(created_by=user) | Q(members=user)
        ).distinct().count(),
        'status_distribution': list(status_distribution),
        'priority_distribution': list(priority_distribution),
        'daily_completed': daily_completed,
        'team_performance': team_performance,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def calendar_tasks(request):
    user = request.user
    month = request.query_params.get('month')
    year = request.query_params.get('year')
    
    tasks = Task.objects.filter(
        Q(project__created_by=user) | Q(project__members=user),
        due_date__isnull=False
    ).distinct()
    
    if month and year:
        tasks = tasks.filter(due_date__month=month, due_date__year=year)
    
    return Response(TaskListSerializer(tasks, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_stats(request):
    user = request.user
    
    team_members = User.objects.filter(
        Q(projects__created_by=user) | Q(projects__in=Project.objects.filter(members=user))
    ).distinct()
    
    now = timezone.now()
    month_ago = now - timedelta(days=30)
    
    members_data = []
    for member in team_members:
        member_tasks = Task.objects.filter(assignee=member)
        time_entries = TimeEntry.objects.filter(user=member, start_time__gte=month_ago)
        total_hours = sum(e.duration_seconds for e in time_entries) / 3600
        
        tasks_completed = member_tasks.filter(status='done', completed_at__gte=month_ago).count()
        total_assigned = member_tasks.count()
        
        members_data.append({
            'id': member.id,
            'name': f"{member.first_name} {member.last_name}" if member.first_name else member.email,
            'email': member.email,
            'role': member.role,
            'tasks_completed': tasks_completed,
            'hours_this_month': f"{total_hours:.0f}h",
            'efficiency': min(100, int((tasks_completed / max(1, total_assigned)) * 100)),
            'is_active': member_tasks.filter(status='in_progress').exists(),
        })
    
    total_members = len(members_data)
    active_tasks = Task.objects.filter(
        Q(project__created_by=user) | Q(project__members=user)
    ).exclude(status='done').distinct().count()
    
    avg_efficiency = sum(m['efficiency'] for m in members_data) / max(1, total_members)
    total_hours = sum(float(m['hours_this_month'].replace('h', '')) for m in members_data)
    
    return Response({
        'total_members': total_members,
        'active_tasks': active_tasks,
        'avg_efficiency': f"{avg_efficiency:.0f}%",
        'total_hours': f"{total_hours:.0f}",
        'members': members_data,
    })
