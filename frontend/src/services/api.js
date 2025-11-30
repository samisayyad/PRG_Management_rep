import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  getProfile: () => api.get('/users/me/'),
  updateProfile: (data) => api.put('/users/me/', data),
};

export const projectsAPI = {
  list: () => api.get('/projects/'),
  get: (id) => api.get(`/projects/${id}/`),
  create: (data) => api.post('/projects/', data),
  update: (id, data) => api.put(`/projects/${id}/`, data),
  delete: (id) => api.delete(`/projects/${id}/`),
  getBoard: (id) => api.get(`/projects/${id}/board/`),
  getBacklog: (id) => api.get(`/projects/${id}/backlog/`),
  getMembers: (id) => api.get(`/projects/${id}/members/`),
  addMember: (id, data) => api.post(`/projects/${id}/add_member/`, data),
};

export const tasksAPI = {
  list: (params) => api.get('/tasks/', { params }),
  get: (id) => api.get(`/tasks/${id}/`),
  create: (data) => api.post('/tasks/', data),
  update: (id, data) => api.put(`/tasks/${id}/`, data),
  patch: (id, data) => api.patch(`/tasks/${id}/`, data),
  delete: (id) => api.delete(`/tasks/${id}/`),
  move: (id, data) => api.post(`/tasks/${id}/move/`, data),
};

export const sprintsAPI = {
  list: (projectId) => api.get('/sprints/', { params: { project: projectId } }),
  get: (id) => api.get(`/sprints/${id}/`),
  create: (data) => api.post('/sprints/', data),
  update: (id, data) => api.put(`/sprints/${id}/`, data),
  delete: (id) => api.delete(`/sprints/${id}/`),
  start: (id) => api.post(`/sprints/${id}/start/`),
  complete: (id) => api.post(`/sprints/${id}/complete/`),
};

export const commentsAPI = {
  list: (taskId) => api.get('/comments/', { params: { task: taskId } }),
  create: (data) => api.post('/comments/', data),
  update: (id, data) => api.put(`/comments/${id}/`, data),
  delete: (id) => api.delete(`/comments/${id}/`),
};

export const timeEntriesAPI = {
  list: () => api.get('/time-entries/'),
  create: (data) => api.post('/time-entries/', data),
  stop: (id) => api.post(`/time-entries/${id}/stop/`),
  delete: (id) => api.delete(`/time-entries/${id}/`),
};

export const notificationsAPI = {
  list: () => api.get('/notifications/'),
  markRead: (id) => api.patch(`/notifications/${id}/`, { is_read: true }),
  markAllRead: () => api.post('/notifications/mark_all_read/'),
};

export const analyticsAPI = {
  logEvent: (data) => api.post('/analytics/events/', data),
  getDashboardStats: () => api.get('/dashboard/stats/'),
  getAnalyticsData: (days = 7) => api.get('/analytics/data/', { params: { days } }),
  getCalendarTasks: (month, year) => api.get('/calendar/tasks/', { params: { month, year } }),
  getTeamStats: () => api.get('/team/stats/'),
};

export const usersAPI = {
  list: () => api.get('/users/'),
};

export default api;
