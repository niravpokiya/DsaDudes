// Simple logout helper: removes auth token and user info from localStorage
export default function logout() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (e) {
    console.error('Logout error:', e);
  }
}
