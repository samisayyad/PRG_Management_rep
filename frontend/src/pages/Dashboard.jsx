import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  BarChart3,
  Calendar,
  Plus,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await analyticsAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.email || 'User';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Tasks Completed',
      value: stats?.tasks_completed || 0,
      change: '+12%',
      changeType: 'positive',
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Avg Completion Time',
      value: stats?.avg_completion_time || '0h',
      change: '-8%',
      changeType: 'positive',
      icon: Clock,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Team Productivity',
      value: `${stats?.team_productivity || 0}%`,
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Overdue Tasks',
      value: stats?.overdue_tasks || 0,
      change: '-3',
      changeType: 'positive',
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  const insightCards = [
    {
      icon: Target,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'Daily Focus Time',
      subtitle: 'Peak productivity between 9-11 AM',
      value: stats?.best_work_hours || 'NaNh',
    },
    {
      icon: Zap,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Completion Rate',
      subtitle: 'Above team average',
      value: `${stats?.completion_rate || 0}%`,
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Team Velocity',
      subtitle: 'Consistent sprint performance',
      value: `${stats?.team_velocity || 0} pts`,
    },
    {
      icon: Calendar,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Best Work Hours',
      subtitle: 'Highest task completion rate',
      value: stats?.best_work_hours || '9-11 AM',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {displayName}</p>
        </div>
        <Link
          to="/kanban"
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 font-medium transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="card-hover bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-md hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-600">{stat.label}</span>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center transform transition-transform group-hover:scale-110`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stat.value}</span>
                <span className={`text-sm font-semibold flex items-center gap-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-xs text-gray-500">vs last week</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-hover bg-gradient-to-br from-white via-blue-50 to-white rounded-2xl border border-gray-100 p-8 shadow-md hover:shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Productivity Insights</h2>
              <p className="text-sm text-gray-500 mt-1">Performance metrics & recommendations</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-3">
            {insightCards.map((insight, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl border border-gray-100 hover:border-blue-200 transition-all">
                <div className={`w-12 h-12 ${insight.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <insight.icon className={`w-6 h-6 ${insight.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{insight.title}</p>
                  <p className="text-sm text-gray-500">{insight.subtitle}</p>
                </div>
                <span className="text-lg font-semibold text-gray-900">{insight.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
            <span className="text-sm text-gray-400">{stats?.active_projects?.length || 0} projects</span>
          </div>
          {stats?.active_projects?.length > 0 ? (
            <div className="space-y-4">
              {stats.active_projects.map((project, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <span className="text-sm text-gray-500">
                      {project.due_date ? `Due ${new Date(project.due_date).toLocaleDateString()}` : 'No due date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(project.members_count || 1, 4) }).map((_, i) => (
                        <div
                          key={i}
                          className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-xs"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">{project.members_count || 1} members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          project.progress > 70 ? 'bg-green-500' : project.progress > 40 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{project.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No active projects</p>
              <Link to="/projects" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
                Create your first project
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
          <Link to="/kanban" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
        </div>
        {stats?.recent_tasks?.length > 0 ? (
          <div className="space-y-3">
            {stats.recent_tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  task.status === 'done' ? 'bg-green-100' : 
                  task.status === 'in_progress' ? 'bg-blue-100' : 
                  task.status === 'review' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${
                    task.status === 'done' ? 'text-green-600' : 
                    task.status === 'in_progress' ? 'text-blue-600' : 
                    task.status === 'review' ? 'text-purple-600' : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500 capitalize">{task.priority} Priority</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  task.status === 'done' ? 'bg-green-100 text-green-700' :
                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  task.status === 'review' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent tasks</p>
          </div>
        )}
      </div>
    </div>
  );
}
