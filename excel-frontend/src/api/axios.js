import axios from 'axios';
import { TOKEN_KEY, ROLE_KEY } from '../constants';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

// ---------- REQUEST INTERCEPTOR ----------
// Har request pe token automatically attach
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token expire/invalid → auto logout
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // 401 SIRF tab jab token ho — login fail pe nahi redirect karna!
//     if (error.response?.status === 401 && localStorage.getItem(TOKEN_KEY)) {
//       localStorage.removeItem(TOKEN_KEY);
//       localStorage.removeItem(ROLE_KEY);
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );
// api/axios.js — response interceptor update

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if ((status === 401 || status === 403) && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;