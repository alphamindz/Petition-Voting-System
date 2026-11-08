import api from './api';

export const adminService = {
  // Get all protests with status filter
  async getProtests(params = {}) {
    const res = await api.get('/admin/protests', { params });
    return res.data;
  },

  // Transition protest status (approve, reject, publish, close)
  async updateStatus(id, status, notes = '') {
    const res = await api.patch(`/admin/protests/${id}/status`, { status, notes });
    return res.data;
  },

  // List all users
  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  // Block / unblock user
  async toggleUserStatus(id, isActive) {
    const res = await api.patch(`/admin/users/${id}/status`, { isActive });
    return res.data;
  },

  // Administrative stats
  async getStats() {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  // Audit activity log
  async getActivity(params = {}) {
    const res = await api.get('/admin/activity', { params });
    return res.data;
  }
};

export default adminService;

