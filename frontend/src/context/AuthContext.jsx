import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localToken = localStorage.getItem('cc_token');
    const localUser = localStorage.getItem('cc_user');
    const sessionToken = sessionStorage.getItem('cc_token');
    const sessionUser = sessionStorage.getItem('cc_user');

    if (localToken && localUser) {
      setToken(localToken);
      setUser(JSON.parse(localUser));
    } else if (sessionToken && sessionUser) {
      setToken(sessionToken);
      setUser(JSON.parse(sessionUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken, rememberMe = false) => {
    setUser(userData);
    setToken(authToken);
    if (rememberMe) {
      localStorage.setItem('cc_token', authToken);
      localStorage.setItem('cc_user', JSON.stringify(userData));
      sessionStorage.removeItem('cc_token');
      sessionStorage.removeItem('cc_user');
    } else {
      sessionStorage.setItem('cc_token', authToken);
      sessionStorage.setItem('cc_user', JSON.stringify(userData));
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    sessionStorage.removeItem('cc_token');
    sessionStorage.removeItem('cc_user');
  };

  const isAuthenticated = !!token;
  const isCustomer = user?.role === 'CUSTOMER';
  const isOwner = user?.role === 'RESTAURANT_OWNER';
  const isAdmin = user?.role === 'ADMIN';
  const isRider = user?.role === 'RIDER';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated, isCustomer, isOwner, isAdmin, isRider }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
