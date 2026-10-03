// src/api/axios.js
import axios from 'axios';
import { getToken, clearToken } from '../utils/auth';

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://courier-tracking-website.onrender.com/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  // Render's free tier can take ~50s to wake up
  timeout: 60000,
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired/invalid session on an authenticated call sends the admin back to login
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest && getToken()) {
      clearToken();
      window.location.assign('/login?expired=1');
    }
    return Promise.reject(error);
  }
);

export default instance;
