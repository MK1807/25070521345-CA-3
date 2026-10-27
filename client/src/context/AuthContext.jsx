import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('pulse_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // Sync token and user profile on mount
  useEffect(() => {
    const token = localStorage.getItem('pulse_token');
    if (token) {
      api
        .get('/auth/me')
        .then(({ data }) => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem('pulse_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // Token invalid or expired
        });
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('pulse_token', data.token);
    localStorage.setItem('pulse_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('pulse_token', data.token);
    localStorage.setItem('pulse_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('pulse_user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
