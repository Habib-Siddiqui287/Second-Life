import axios from 'axios';

// Sanitize base URL to ensure valid requests in both local dev and production
export const getBaseURL = () => {
  if (import.meta.env.DEV) {
    return '/api';
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('<your-render-url>') && !envUrl.includes('placeholder')) {
    return envUrl;
  }
  return 'https://second-life-e45t.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('secondlife_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('secondlife_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${getBaseURL()}/auth/refresh/`, { refresh: refreshToken });
          const newAccess = res.data.access;
          localStorage.setItem('secondlife_token', newAccess);
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
          originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('secondlife_token');
          localStorage.removeItem('secondlife_refresh_token');
          localStorage.removeItem('secondlife_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
