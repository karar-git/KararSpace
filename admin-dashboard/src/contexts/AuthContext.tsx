import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Use Railway backend URL in production, proxy in development
const API_BASE = import.meta.env.PROD 
  ? 'https://kararspace-production.up.railway.app/api'
  : '/api';

const TOKEN_KEY = 'admin_token';

interface Admin {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async function checkAuth() {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, { 
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.authenticated) {
        setAdmin(data.admin);
      } else {
        // Token invalid, remove it
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    // Store token in localStorage
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
    }
    setAdmin(data.admin);
  }

  async function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, isLoading, isAuthenticated: !!admin, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
