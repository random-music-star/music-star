import axios from 'axios';
import { getCookie } from 'cookies-next';

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = getCookie('userNickname') || '';
      if (token) {
        config.headers.Authorization = `${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  response => response,
  error => {
    return Promise.reject(error.response?.data || error.message);
  },
);

export default api;
