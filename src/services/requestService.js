import api from './api';

export const requestService = {
  async getRequests(params = {}) {
    const res = await api.get('/requests/', { params });
    return res.data;
  },
  async getRequestById(id) {
    const res = await api.get(`/requests/${id}/`);
    return res.data;
  },
  async createRequest(data) {
    const res = await api.post('/requests/', data);
    return res.data;
  },
  async cancelRequest(id) {
    const res = await api.delete(`/requests/${id}/`);
    return res.data;
  },
  async approveRequest(id, payload = {}) {
    const res = await api.post(`/requests/${id}/approve/`, payload);
    return res.data;
  },
  async rejectRequest(id, payload = {}) {
    const res = await api.post(`/requests/${id}/reject/`, payload);
    return res.data;
  },
};
