import { useState, useEffect } from 'react';
import { isAuthenticated, login, logout } from '../services/AuthService';

type UseAuthResult = {
  isAdmin: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const authed = await isAuthenticated();
      setIsAdmin(authed);
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const success = await login(username, password);
    setIsAdmin(success);
    return success;
  };

  const handleLogout = async () => {
    await logout();
    setIsAdmin(false);
  };

  return { isAdmin, loading, login: handleLogin, logout: handleLogout, checkAuth };
}