import { createContext, useContext, useState, useCallback } from 'react';
import { ROLES } from '../utils/constants';

const AuthContext = createContext(null);

/**
 * AuthProvider — manages user authentication state.
 *
 * NOTE: Real authentication is backend-owned.
 * This context manages client-side session state only.
 * TODO: Integrate with backend auth endpoint when available.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('kneeai_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((userData) => {
    const sessionUser = {
      id: userData.id || 'demo-user',
      name: userData.name || 'Dr. Demo',
      role: userData.role || ROLES.RADIOLOGIST,
      email: userData.email || '',
    };
    setUser(sessionUser);
    sessionStorage.setItem('kneeai_user', JSON.stringify(sessionUser));
    return sessionUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('kneeai_user');
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook — access authentication state from any component.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
