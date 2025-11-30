import { useState, useEffect } from 'react';
import { projectsAPI, analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  MoreHorizontal,
  Mail,
  Calendar,
  X,
  AlertCircle
} from 'lucide-react';

export default function Team() {
  const { user } = useAuth();
  const [teamData, setTeamData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [memberFormData, setMemberFormData] = useState({
    email: '',
    projectId: '',
  });
  const [memberError, setMemberError] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);

  useEffect(() => {
    fetchTeamStats();
    fetchProjects();
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

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.list();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    setMemberLoading(true);

    if (!memberFormData.email || !memberFormData.projectId) {
      setMemberError('Please select a project and enter an email');
      setMemberLoading(false);
      return;
    }

    try {
      await projectsAPI.addMember(memberFormData.projectId, {
        email: memberFormData.email,
        role: 'member',
      });

      setShowAddMemberModal(false);
      setMemberFormData({ email: '', projectId: '' });
      fetchTeamStats();
    } catch (error) {
      setMemberError(error.response?.data?.error || error.response?.data?.detail || 'Failed to add member');
    } finally {
      setMemberLoading(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500">Manage team members and track their performance</p>
        </div>
        {user?.role === 'scrum_master' && (
          <button 
            onClick={() => setShowAddMemberModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
            <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
        </div>

        {teamData?.members?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {teamData.members.map((member, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {member.name?.[0] || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{member.name || 'Unnamed'}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {member.email}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {member.role === 'scrum_master' ? 'Scrum Master' : 'Employee'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Tasks Completed</p>
                    <p className="text-xl font-bold text-gray-900">{member.tasks_completed}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Hours This Month</p>
                    <p className="text-xl font-bold text-gray-900">{member.hours_this_month}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Efficiency</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${member.efficiency}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{member.efficiency}%</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                      member.is_active ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        member.is_active ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-6">Add team members to start tracking performance</p>
            {user?.role === 'scrum_master' && (
              <button 
                onClick={() => setShowAddMemberModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
              <button 
                onClick={() => {
                  setShowAddMemberModal(false);
                  setMemberError('');
                  setMemberFormData({ email: '', projectId: '' });
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              {memberError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{memberError}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
                <select
                  value={memberFormData.projectId}
                  onChange={(e) => setMemberFormData({ ...memberFormData, projectId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={memberFormData.email}
                  onChange={(e) => setMemberFormData({ ...memberFormData, email: e.target.value })}
                  placeholder="member@example.com"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setMemberError('');
                    setMemberFormData({ email: '', projectId: '' });
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={memberLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {memberLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
