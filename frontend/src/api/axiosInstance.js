import axios from 'axios';

/**
 * Configured Axios instance for all API calls.
 * - baseURL: set from VITE_API_URL env variable
 * - withCredentials: true — required so the browser sends the HttpOnly JWT cookie
 *   automatically on every request (cross-origin cookie handling)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor
 * Emits a custom DOM event when the server returns 401 (Unauthorized).
 * The AuthContext listens for this event to clear the auth state without
 * creating a circular import (api → context → api).
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Dispatch a custom event so AuthContext can react and clear state
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
