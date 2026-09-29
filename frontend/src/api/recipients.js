import api from './axios';

export const recipientsApi = {
  getRecipients: async (params = {}) => {
    const response = await api.get('/recipients/', { params });
    return response.data;
  },

  getRecipient: async (id) => {
    const response = await api.get(`/recipients/${id}/`);
    return response.data;
  },

  createRecipient: async (data) => {
    const response = await api.post('/recipients/', data);
    return response.data;
  },

  updateRecipient: async (id, data) => {
    const response = await api.put(`/recipients/${id}/`, data);
    return response.data;
  },

  patchRecipient: async (id, data) => {
    const response = await api.patch(`/recipients/${id}/`, data);
    return response.data;
  },

  deleteRecipient: async (id) => {
    const response = await api.delete(`/recipients/${id}/`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.post(`/recipients/${id}/toggle-status/`);
    return response.data;
  },

  getPreferences: async (id) => {
    const response = await api.get(`/recipients/${id}/preferences/`);
    return response.data;
  },

  updatePreferences: async (id, preferences) => {
    const response = await api.put(`/recipients/${id}/preferences/`, preferences);
    return response.data;
  },

  importFile: async (formData) => {
    const response = await api.post('/recipients/import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
