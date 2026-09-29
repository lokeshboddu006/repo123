import api from './axios';

export const contentLibraryApi = {
  getContentList: async (params = {}) => {
    const response = await api.get('/content-library/', { params });
    return response.data;
  },

  getContentItem: async (id) => {
    const response = await api.get(`/content-library/${id}/`);
    return response.data;
  },

  createContentItem: async (data) => {
    const response = await api.post('/content-library/', data);
    return response.data;
  },

  updateContentItem: async (id, data) => {
    const response = await api.put(`/content-library/${id}/`, data);
    return response.data;
  },

  deleteContentItem: async (id) => {
    const response = await api.delete(`/content-library/${id}/`);
    return response.data;
  },
};
