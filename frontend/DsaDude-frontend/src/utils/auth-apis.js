import { api, clearAuthToken, setAuthToken } from "./api";

function normalizeError(error) {
  if (error?.response?.data) {
    const data = error.response.data;
    const message = data.error || data.message || JSON.stringify(data);
    const err = new Error(message);
    err.response = error.response;
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
export const logout = () => {
  clearAuthToken();
};
