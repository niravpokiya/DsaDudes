import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Adjust the base URL as needed
    headers: {
        'Content-Type': 'application/json',
    },
});
 
// Initialize with token from localStorage if available
const storedToken = localStorage.getItem('token');
if (storedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}
