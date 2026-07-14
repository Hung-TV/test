import axiosClient from './axiosClient';
import { API_ENDPOINTS } from './apiConfig';

export const dashboardApi = {
  getStats() {
    return axiosClient.get(API_ENDPOINTS.dashboard.stats);
  }
};

export default dashboardApi;
