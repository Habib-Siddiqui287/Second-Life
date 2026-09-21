import api from './api';

export const savedItemService = {
  async getSavedItems() {
    const res = await api.get('/saved-items/');
    return res.data;
  },
  async toggleSave(donationId) {
    const res = await api.post(`/donations/${donationId}/save/`);
    return res.data;
  },
};

export const notificationService = {
  async getNotifications(params = {}) {
    const res = await api.get('/notifications/', { params });
    return res.data;
  },
  async markAsRead(id) {
    const res = await api.post(`/notifications/${id}/read/`);
    return res.data;
  },
  async markAllAsRead() {
    const res = await api.post('/notifications/mark-all-read/');
    return res.data;
  },
};

export const dashboardService = {
  async getPublicStats() {
    const res = await api.get('/stats/public/');
    return res.data;
  },
  async getDonorStats() {
    const res = await api.get('/stats/donor/');
    return res.data;
  },
  async getReceiverStats() {
    const res = await api.get('/stats/receiver/');
    return res.data;
  },
  async sendContactMessage(data) {
    const res = await api.post('/contact/', data);
    return res.data;
  },
};

export const chatbotService = {
  async sendMessage(message) {
    const res = await api.post('/chat/', { message });
    return res.data;
  },
};

export const adminService = {
  async getDashboardStats() {
    const res = await api.get('/admin/dashboard/');
    return res.data;
  },
  async getReports(period = '30d') {
    const res = await api.get('/admin/reports/', { params: { period } });
    return res.data;
  },
  async getUsers(params = {}) {
    const res = await api.get('/admin/users/', { params });
    return res.data;
  },
  async getUserById(id) {
    const res = await api.get(`/admin/users/${id}/`);
    return res.data;
  },
  async updateUserStatus(id, data) {
    const res = await api.patch(`/admin/users/${id}/`, data);
    return res.data;
  },
  async getOrganizations(params = {}) {
    const res = await api.get('/admin/organizations/', { params });
    return res.data;
  },
  async getOrganizationById(id) {
    const res = await api.get(`/admin/organizations/${id}/`);
    return res.data;
  },
  async verifyOrganization(id, action, notes = '') {
    const res = await api.post(`/admin/organizations/${id}/verify/`, { action, notes });
    return res.data;
  },
  async getDonations(params = {}) {
    const res = await api.get('/admin/donations/', { params });
    return res.data;
  },
  async getRequests(params = {}) {
    const res = await api.get('/admin/requests/', { params });
    return res.data;
  },
  async getConnections(params = {}) {
    const res = await api.get('/admin/connections/', { params });
    return res.data;
  },
  async getActivityLogs() {
    const res = await api.get('/admin/activity/');
    return res.data;
  },
  async getContactMessages() {
    const res = await api.get('/admin/messages/');
    return res.data;
  },
  async updateContactMessage(id, data) {
    const res = await api.patch(`/admin/messages/${id}/`, data);
    return res.data;
  },
  async deleteContactMessage(id) {
    const res = await api.delete(`/admin/messages/${id}/`);
    return res.data;
  },
  async getSettings() {
    const res = await api.get('/admin/settings/');
    return res.data;
  },
  async updateSettings(data) {
    const res = await api.post('/admin/settings/', data);
    return res.data;
  },
};
