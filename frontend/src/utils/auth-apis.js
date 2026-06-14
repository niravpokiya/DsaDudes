import { api, clearAuthToken, setAuthToken } from "./api";

function normalizeError(error) {
  if (error?.response?.data) {
    const data = error.response.data;
    const message = data.error || data.message || data.detail || JSON.stringify(data);
    const err = new Error(message);
    err.response = error.response;
    err.fieldErrors = data.fieldErrors || data.errors || null;
    throw err;
  } else {
    throw new Error('Network error');
  }
}

// register API call
export const register = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
};

// login API call
export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        const { token } = response.data;
        setAuthToken(token);
        return response.data;
    } catch (error) {
        normalizeError(error);
    }
}

// logout helper
export const signout = async () => {
  const token = localStorage.getItem('token');
  clearAuthToken();

  try {
    await api.post('/auth/logout', null, token ? {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    } : undefined);
  } catch (error) {
    return false;
  }

  return true;
};
