import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  login: (token: string, remember: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    // Solo recupera si el usuario pidió recordar sesión
    localStorage.getItem('token')
  );

  const login = (newToken: string, remember: boolean) => {
    if (remember) {
      localStorage.setItem('token', newToken); // persiste aunque cierres el navegador
    } else {
      sessionStorage.setItem('token', newToken); // se borra al cerrar la pestaña
    }
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}