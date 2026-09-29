import api from './axios';

export const masterDataApi = {
  getLanguages: async () => {
    const response = await api.get('/master-data/languages/');
    return response.data;
  },

  getCountries: async () => {
    const response = await api.get('/master-data/countries/');
    return response.data;
  },

  getStates: async (params = {}) => {
    const response = await api.get('/master-data/states/', { params });
    return response.data;
  },

  getDistricts: async (params = {}) => {
    const response = await api.get('/master-data/districts/', { params });
    return response.data;
  },

  getOccupations: async () => {
    const response = await api.get('/master-data/occupations/');
    return response.data;
  },

  getOrganizations: async () => {
    const response = await api.get('/master-data/organizations/');
    return response.data;
  },

  getOrganizationUnits: async (params = {}) => {
    const response = await api.get('/master-data/organization-units/', { params });
    return response.data;
  },
};
