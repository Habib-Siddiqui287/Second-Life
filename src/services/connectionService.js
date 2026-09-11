import api from './api';

export const connectionService = {
  async getConnections(params = {}) {
    const res = await api.get('/connections/', { params });
    return res.data;
  },
  async getConnectionById(id) {
    const res = await api.get(`/connections/${id}/`);
    return res.data;
  },
  async updateSchedule(id, payload) {
    const res = await api.patch(`/connections/${id}/`, payload);
    return res.data;
  },
  async completeConnection(id) {
    const res = await api.post(`/connections/${id}/complete/`);
    return res.data;
  },
};
