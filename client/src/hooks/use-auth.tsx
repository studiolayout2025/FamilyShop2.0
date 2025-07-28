import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, accessCode?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('familyShop_token');
    const savedUser = localStorage.getItem('familyShop_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      // Set authorization header for future requests
      queryClient.setDefaultOptions({
        queries: {
          queryFn: async ({ queryKey }) => {
            const res = await fetch(queryKey.join("/") as string, {
              credentials: "include",
              headers: {
                'Authorization': `Bearer ${savedToken}`
              }
            });
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
          }
        }
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await response.json();
    
    setUser(data.user);
    setToken(data.token);
    
    localStorage.setItem('familyShop_token', data.token);
    localStorage.setItem('familyShop_user', JSON.stringify(data.user));
    
    // Set authorization header for future requests
    queryClient.setDefaultOptions({
      queries: {
        queryFn: async ({ queryKey }) => {
          const res = await fetch(queryKey.join("/") as string, {
            credentials: "include",
            headers: {
              'Authorization': `Bearer ${data.token}`
            }
          });
          if (!res.ok) throw new Error('Network response was not ok');
          return await res.json();
        }
      }
    });
  };

  const register = async (email: string, password: string, name: string, accessCode?: string) => {
    const response = await apiRequest("POST", "/api/auth/register", { email, password, name, accessCode });
    const data = await response.json();
    
    setUser(data.user);
    setToken(data.token);
    
    localStorage.setItem('familyShop_token', data.token);
    localStorage.setItem('familyShop_user', JSON.stringify(data.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('familyShop_token');
    localStorage.removeItem('familyShop_user');
    queryClient.clear();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
