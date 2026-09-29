import api from './axios';

export const audiencesApi = {
  getAudiences: async (params = {}) => {
    const response = await api.get('/audiences/', { params });
    return response.data;
  },

  getAudience: async (id) => {
    const response = await api.get(`/audiences/${id}/`);
    return response.data;
  },

  createAudience: async (data) => {
    const response = await api.post('/audiences/', data);
    return response.data;
  },

  updateAudience: async (id, data) => {
    const response = await api.put(`/audiences/${id}/`, data);
    return response.data;
  },

  deleteAudience: async (id) => {
    const response = await api.delete(`/audiences/${id}/`);
    return response.data;
  },

  previewRules: async (rules) => {
    const response = await api.post('/audiences/preview/', { rules });
    return response.data;
  },

  previewAudience: async (id) => {
    const response = await api.get(`/audiences/${id}/preview/`);
    return response.data;
  },

  getAudienceMembers: async (id, params = {}) => {
    const response = await api.get(`/audiences/${id}/members/`, { params });
    return response.data;
  },
};
