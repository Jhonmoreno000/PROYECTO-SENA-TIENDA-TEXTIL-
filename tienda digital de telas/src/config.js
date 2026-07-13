const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const getApiUrl = (path) => `${API_BASE_URL}${path}`;

export default API_BASE_URL;
