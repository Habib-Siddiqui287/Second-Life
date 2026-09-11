import api from './api';

export const donationService = {
  async getCategories() {
    const res = await api.get('/categories/');
    return res.data;
  },
  async getDonations(params = {}) {
    const res = await api.get('/donations/', { params });
    return res.data;
  },
  async getDonationById(id) {
    const res = await api.get(`/donations/${id}/`);
    return res.data;
  },
  async createDonation(data) {
    const res = await api.post('/donations/', data);
    return res.data;
  },
  async updateDonation(id, data) {
    const res = await api.patch(`/donations/${id}/`, data);
    return res.data;
  },
  async deleteDonation(id) {
    const res = await api.delete(`/donations/${id}/`);
    return res.data;
  },
  async getMyDonations(params = {}) {
    const res = await api.get('/donations/my/', { params });
    return res.data;
  },
  async getRecommendedDonations() {
    const res = await api.get('/donations/recommended/');
    return res.data;
  },
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await api.post('/donations/upload-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
