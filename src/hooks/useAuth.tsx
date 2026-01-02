import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/api';

type AppRole = 'customer' | 'vendor' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null;
  loading: boolean;
  roles: AppRole[];
  signOut: () => Promise<void>;
  isCustomer: boolean;
  isVendor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user_data');
    const savedRoles = localStorage.getItem('user_roles');
    
    // Clean up old mock token if it exists
    const oldToken = localStorage.getItem('auth_token');
    if (oldToken && oldToken.includes('mock-token')) {
      localStorage.removeItem('auth_token');
    }
    
    if (token && savedUser && savedRoles) {
      setUser(JSON.parse(savedUser));
      setSession({ user: JSON.parse(savedUser) });
      setRoles(JSON.parse(savedRoles));
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_roles');
      
      setUser(null);
      setSession(null);
      setRoles([]);
    }
  };

  const value = {
    user,
    session,
    loading,
    roles,
    signOut,
    isCustomer: roles.includes('customer'),
    isVendor: roles.includes('vendor'),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
