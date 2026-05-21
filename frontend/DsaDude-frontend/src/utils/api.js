import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth helpers
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  }
}

export function clearAuthToken() {
  delete api.defaults.headers.common['Authorization'];
  localStorage.removeItem('token');
}

// Initialize with token from localStorage if available
const storedToken = localStorage.getItem('token');
if (storedToken) {
  setAuthToken(storedToken);
}
