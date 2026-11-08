import api from './api';

export const petitionService = {
  // Fetch petitions with filters, search, sort and pagination
  async getPetitions(params = {}) {
    const res = await api.get('/petitions', { params });
    return res.data;
  },

  // Get petition by ID
  async getPetitionById(id) {
    const res = await api.get(`/petitions/${id}`);
    return res.data;
  },

  // Create a new petition
  async createPetition(data) {
    const res = await api.post('/petitions', data);
    return res.data;
  },

  // Update a petition
  async updatePetition(id, data) {
    const res = await api.put(`/petitions/${id}`, data);
    return res.data;
  },

  // Delete a petition
  async deletePetition(id) {
    const res = await api.delete(`/petitions/${id}`);
    return res.data;
  },

  // Sign a petition
  async signPetition(id, comment = '') {
    const res = await api.post(`/petitions/${id}/sign`, { comment });
    return res.data;
  },

  // Add an update to a petition
  async addPetitionUpdate(id, updateData) {
    const res = await api.post(`/petitions/${id}/updates`, updateData);
    return res.data;
  },

  // Change petition status
  async updateStatus(id, status) {
    const res = await api.patch(`/petitions/${id}/status`, { status });
    return res.data;
  },

  // Get current user's created petitions
  async getMyPetitions() {
    const res = await api.get('/petitions/user/my-petitions');
    return res.data;
  },

  // Get petitions signed by the current user
  async getMySignedPetitions() {
    const res = await api.get('/petitions/user/my-signatures');
    return res.data;
  },

  // Get platform-wide statistics
  async getStats() {
    const res = await api.get('/petitions/stats');
    return res.data;
  }
};

export default petitionService;
