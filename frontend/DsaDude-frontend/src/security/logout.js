import { clearAuthToken } from "../utils/api";

// Simple logout helper: removes auth token and user info from localStorage
export default function logout() {
  try {
    clearAuthToken();
    localStorage.removeItem('user');
  } catch (e) {
    console.error('Logout error:', e);
  }
}
