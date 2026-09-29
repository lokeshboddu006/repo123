import api from './axios';

export const campaignsApi = {
  getCampaigns: async (params = {}) => {
    const response = await api.get('/campaigns/', { params });
    return response.data;
  },

  getCampaign: async (id) => {
    const response = await api.get(`/campaigns/${id}/`);
    return response.data;
  },

  createCampaign: async (data) => {
    const response = await api.post('/campaigns/', data);
    return response.data;
  },

  updateCampaign: async (id, data) => {
    const response = await api.put(`/campaigns/${id}/`, data);
    return response.data;
  },

  patchCampaign: async (id, data) => {
    const response = await api.patch(`/campaigns/${id}/`, data);
    return response.data;
  },

  deleteCampaign: async (id) => {
    const response = await api.delete(`/campaigns/${id}/`);
    return response.data;
  },

  validateCampaign: async (id) => {
    const response = await api.post(`/campaigns/${id}/validate/`);
    return response.data;
  },

  scheduleCampaign: async (id, scheduleData) => {
    const response = await api.post(`/campaigns/${id}/schedule/`, scheduleData);
    return response.data;
  },

  cancelCampaign: async (id) => {
    const response = await api.post(`/campaigns/${id}/cancel/`);
    return response.data;
  },

  duplicateCampaign: async (id) => {
    const response = await api.post(`/campaigns/${id}/duplicate/`);
    return response.data;
  },

  getCampaignTypes: async () => {
    const response = await api.get('/campaigns/types/');
    return response.data;
  },
};
