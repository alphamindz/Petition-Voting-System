import api from './api';

export const protestService = {
  // Public list of published protests
  async getPublishedProtests(params = {}) {
    const res = await api.get('/protests', { params });
    return res.data;
  },

  // Single protest details with vote count & hasVoted
  async getProtestById(id) {
    const res = await api.get(`/protests/${id}`);
    return res.data;
  },

  // Create new protest (verified user)
  async createProtest(data) {
    const res = await api.post('/protests', data);
    return res.data;
  },

  // Logged-in user's own protests
  async getMyProtests() {
    const res = await api.get('/protests/mine');
    return res.data;
  },

  // Cast vote on a published protest
  async castVote(id) {
    const res = await api.post(`/protests/${id}/vote`);
    return res.data;
  },

  // Withdraw vote
  async withdrawVote(id) {
    const res = await api.delete(`/protests/${id}/vote`);
    return res.data;
  },

  // Get logged in user's voting history
  async getMyVotes() {
    const res = await api.get('/users/me/votes');
    return res.data;
  }
};

export default protestService;

