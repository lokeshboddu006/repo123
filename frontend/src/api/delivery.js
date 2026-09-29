import api from './axios';

/**
 * Dispatch/Send a campaign
 */
export const sendCampaign = async (campaignId) => {
  const response = await api.post(`/campaigns/${campaignId}/send/`);
  return response.data;
};

/**
 * Get comprehensive campaign delivery summary & stats
 */
export const getCampaignDeliverySummary = async (campaignId, params = {}) => {
  const response = await api.get(`/campaigns/${campaignId}/delivery/`, { params });
  return response.data;
};

/**
 * Get detailed recipient delivery info & timeline events
 */
export const getDeliveryDetail = async (deliveryId) => {
  const response = await api.get(`/deliveries/${deliveryId}/`);
  return response.data;
};

/**
 * Retry a failed message delivery
 */
export const retryDelivery = async (deliveryId) => {
  const response = await api.post(`/deliveries/${deliveryId}/retry/`);
  return response.data;
};

/**
 * Get global delivery logs for admin view
 */
export const getGlobalDeliveryLogs = async (params = {}) => {
  const response = await api.get(`/delivery/logs/`, { params });
  return response.data;
};
