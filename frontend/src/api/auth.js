import api from './axios';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/auth/login/', credentials);
    return response.data;
  },

  register: async (signupData) => {
    // Check if signupData is FormData or JSON
    const headers = signupData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.post('/auth/register/', signupData, { headers });
    return response.data;
  },

  checkEmail: async (email) => {
    const response = await api.post('/auth/check-email/', { email });
    return response.data;
  },

  googleAuth: async (payload) => {
    const response = await api.post('/auth/google/', payload);
    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await api.post('/auth/logout/', { refresh: refreshToken });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (data) => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.patch('/auth/profile/', data, { headers });
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/auth/preferences/');
    return response.data;
  },

  updatePreferences: async (data) => {
    const response = await api.patch('/auth/preferences/', data);
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await api.get('/auth/dashboard-summary/');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await api.post('/auth/change-password/', data);
    return response.data;
  },

  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password/', data);
    return response.data;
  },

  verifyEmail: async (data) => {
    const response = await api.post('/auth/verify-email/', data);
    return response.data;
  },

  sendVerification: async () => {
    const response = await api.post('/auth/send-verification/');
    return response.data;
  },
};
