import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register/', data);
    return res.data;
  },
  async login(credentials) {
    const res = await api.post('/auth/login/', credentials);
    return res.data;
  },
  async getCurrentUser() {
    const res = await api.get('/auth/me/');
    return res.data;
  },
  async updateProfile(data) {
    const res = await api.patch('/auth/me/', data);
    return res.data;
  },
  async changePassword(data) {
    const res = await api.post('/auth/change-password/', data);
    return res.data;
  },
  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password/', { email });
    return res.data;
  },
  async resetPassword(data) {
    const res = await api.post('/auth/reset-password/', data);
    return res.data;
  },
};
