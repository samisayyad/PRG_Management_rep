import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
  ChevronDown
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(7);

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await analyticsAPI.getAnalyticsData(dateRange);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Tasks Completed',
      value: data?.tasks_completed || 0,
      change: '+12%',
      changeType: 'positive',
      icon: BarChart3,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Completion Rate',
      value: `${data?.completion_rate || 0}%`,
      change: '+8%',
      changeType: 'positive',
      icon: Calendar,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Team Productivity',
      value: `${data?.team_productivity || 0}%`,
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Active Projects',
      value: data?.active_projects || 0,
      change: '+2',
      changeType: 'positive',
      icon: TrendingUp,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  const productivityChartData = {
    labels: data?.daily_completed?.map(d => d.date.slice(5)) || [],
    datasets: [
      {
        label: 'Tasks Completed',
        data: data?.daily_completed?.map(d => d.count) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const statusDistributionData = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [
      {
        data: [
          data?.status_distribution?.find(s => s.status === 'todo')?.count || 0,
          data?.status_distribution?.find(s => s.status === 'in_progress')?.count || 0,
          data?.status_distribution?.find(s => s.status === 'review')?.count || 0,
          data?.status_distribution?.find(s => s.status === 'done')?.count || 0,
        ],
        backgroundColor: [
          'rgba(107, 114, 128, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500">Track productivity and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(Number(e.target.value))}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{stat.label}</span>
              <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className={`text-sm ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">vs last period</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Trends</h3>
          <div className="h-64">
            {data?.daily_completed?.length > 0 ? (
              <Line data={productivityChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No productivity data available
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            {data?.status_distribution?.length > 0 ? (
              <Doughnut 
                data={statusDistributionData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }} 
              />
            ) : (
              <div className="text-gray-400">
                No task distribution data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
        {data?.team_performance?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Team Member</th>
                  <th className="pb-3 font-medium">Tasks Assigned</th>
                  <th className="pb-3 font-medium">Completed</th>
                  <th className="pb-3 font-medium">In Progress</th>
                  <th className="pb-3 font-medium">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.team_performance.map((member, index) => (
                  <tr key={index} className="border-b border-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                          {member.name?.[0] || 'U'}
                        </div>
                        <span className="font-medium text-gray-900">{member.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-600">{member.tasks_assigned}</td>
                    <td className="py-4 text-gray-600">{member.tasks_completed}</td>
                    <td className="py-4 text-gray-600">{member.in_progress}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ 
                              width: `${member.tasks_assigned ? (member.tasks_completed / member.tasks_assigned) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {member.tasks_assigned ? Math.round((member.tasks_completed / member.tasks_assigned) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No team performance data available
          </div>
        )}
      </div>
    </div>
  );
}
