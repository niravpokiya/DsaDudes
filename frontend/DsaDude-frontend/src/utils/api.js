import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log(api.defaults.baseURL);

// add token to every request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization =
            `Bearer ${token}`;
    }

    return config;
});

// Auth helpers
export function setAuthToken(token) {
  if (token) {
    console.log('Auth token set:', token);
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
