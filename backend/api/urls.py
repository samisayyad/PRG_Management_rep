from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet, basename='project')
router.register(r'sprints', views.SprintViewSet, basename='sprint')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'time-entries', views.TimeEntryViewSet, basename='time-entry')
router.register(r'notifications', views.NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register, name='register'),
    path('auth/login/', views.login, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/me/', views.user_profile, name='user_profile'),
    path('users/', views.users_list, name='users_list'),
    path('analytics/events/', views.log_behavioral_event, name='log_event'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('analytics/data/', views.analytics_data, name='analytics_data'),
    path('calendar/tasks/', views.calendar_tasks, name='calendar_tasks'),
    path('team/stats/', views.team_stats, name='team_stats'),
]
