import api from './axios';

export const templatesApi = {
  getTemplates: async (params = {}) => {
    const response = await api.get('/templates/', { params });
    return response.data;
  },

  getTemplate: async (id) => {
    const response = await api.get(`/templates/${id}/`);
    return response.data;
  },

  createTemplate: async (data) => {
    const response = await api.post('/templates/', data);
    return response.data;
  },

  updateTemplate: async (id, data) => {
    const response = await api.put(`/templates/${id}/`, data);
    return response.data;
  },

  deleteTemplate: async (id) => {
    const response = await api.delete(`/templates/${id}/`);
    return response.data;
  },
};
