import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Camera
} from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
  });

  const [notifications, setNotifications] = useState({
    email_tasks: true,
    email_mentions: true,
    email_updates: false,
    push_tasks: true,
    push_mentions: true,
  });

  const handleSave = async () => {
    setLoading(true);
    setSuccess(false);
    
    try {
      const response = await authAPI.updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      updateUser(response.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = formData.first_name && formData.last_name
    ? `${formData.first_name} ${formData.last_name}`
    : user?.email || 'User';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-medium">
                      {getInitials(displayName)}
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
                      <Camera className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{displayName}</h3>
                    <p className="text-gray-500">{user?.email}</p>
                    <button className="text-sm text-blue-600 hover:text-blue-700 mt-1">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={`${formData.first_name} ${formData.last_name}`.trim()}
                      onChange={(e) => {
                        const [first, ...rest] = e.target.value.split(' ');
                        setFormData({
                          ...formData,
                          first_name: first || '',
                          last_name: rest.join(' ') || '',
                        });
                      }}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  {success && (
                    <span className="text-green-600 text-sm">Changes saved successfully!</span>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'email_tasks', label: 'Task assignments and updates' },
                        { key: 'email_mentions', label: 'Mentions in comments' },
                        { key: 'email_updates', label: 'Weekly summary reports' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between">
                          <span className="text-gray-600">{item.label}</span>
                          <button
                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                            className={`w-11 h-6 rounded-full transition-colors ${
                              notifications[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'push_tasks', label: 'Task reminders and deadlines' },
                        { key: 'push_mentions', label: 'Mentions and comments' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between">
                          <span className="text-gray-600">{item.label}</span>
                          <button
                            onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                            className={`w-11 h-6 rounded-full transition-colors ${
                              notifications[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                                notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Theme</h3>
                    <div className="flex gap-4">
                      {['Light', 'Dark', 'System'].map((theme) => (
                        <button
                          key={theme}
                          className={`px-6 py-3 rounded-lg border ${
                            theme === 'Light'
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Density</h3>
                    <div className="flex gap-4">
                      {['Comfortable', 'Compact'].map((density) => (
                        <button
                          key={density}
                          className={`px-6 py-3 rounded-lg border ${
                            density === 'Comfortable'
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {density}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <input
                          type="password"
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                    <p className="text-gray-500 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
