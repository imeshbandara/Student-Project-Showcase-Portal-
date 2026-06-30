import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axiosInstance';

/**
 * AuthContext — holds the global authentication state.
 *
 * Shape:
 *   user       : { id, name, email, role, avatarUrl } | null
 *   isLoading  : boolean — true while the initial /auth/me check is in flight
 *   isAuthenticated : boolean — derived from !!user
 *   login(userData) : manually hydrate the user (called after callback resolves)
 *   logout()        : calls backend /auth/logout, then clears local state
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // start true — we don't know yet

  /**
   * Fetch the current session from the backend.
   * The backend reads the HttpOnly JWT cookie automatically (withCredentials).
   */
  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch {
      // 401 = no active session, not an error worth logging
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * On initial mount, rehydrate auth state from the cookie session.
   * This is what makes login persist across page refreshes.
   */
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  /**
   * Listen for the 401 custom event emitted by the Axios interceptor.
   * When any API call gets a 401, we clear auth state immediately.
   */
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  /**
   * login — manually set the user object in state.
   * Called by AuthCallbackPage after a successful Google OAuth redirect.
   * @param {object} userData - { id, name, email, role, avatarUrl }
   */
  const login = useCallback((userData) => {
    setUser(userData);
    setIsLoading(false);
  }, []);

  /**
   * logout — calls the backend to clear the HttpOnly cookie, then clears state.
   */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Proceed with local logout even if the server call fails
    } finally {
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refetch: fetchCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth — hook to consume the AuthContext.
 * Must be used inside an <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
