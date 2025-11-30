import { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Mail,
  Calendar
} from 'lucide-react';

export default function Team() {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamStats();
  }, []);

  const fetchTeamStats = async () => {
    try {
      const response = await analyticsAPI.getTeamStats();
      setTeamData(response.data);
    } catch (error) {
      console.error('Failed to fetch team stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Members',
      value: teamData?.total_members || 0,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Active Tasks',
      value: teamData?.active_tasks || 0,
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Avg Efficiency',
      value: teamData?.avg_efficiency || '0%',
      icon: TrendingUp,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      label: 'Total Hours',
      value: teamData?.total_hours || '0',
      icon: Clock,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500">Manage team members and track their performance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
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
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>

        {teamData?.members?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {teamData.members.map((member, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                      {member.name?.[0] || '?'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name || 'Unnamed'}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          {member.role === 'scrum_master' ? 'Scrum Master' : 'Employee'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tasks Completed</p>
                    <p className="text-lg font-semibold text-gray-900">{member.tasks_completed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hours This Month</p>
                    <p className="text-lg font-semibold text-gray-900">{member.hours_this_month}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Efficiency</p>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${member.efficiency}%` }}
                        />
                      </div>
                      <span className="text-lg font-semibold text-gray-900">{member.efficiency}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-flex items-center gap-1 ${
                      member.is_active ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        member.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-6">Add team members to start tracking performance</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
