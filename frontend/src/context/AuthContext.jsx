import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('cc_token');
    const storedUser = localStorage.getItem('cc_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('cc_token', authToken);
    localStorage.setItem('cc_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
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
