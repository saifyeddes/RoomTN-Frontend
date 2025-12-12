import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


interface User {
  id: string;
  email: string;
  role: string;
  full_name: string;
  isApproved?: boolean;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>; // <-- obligatoire
  signOut: () => void;
  loading: boolean;
}



const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Identifiants invalides');
    }

    // Stocker séparément le token admin
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminInfo', JSON.stringify(data.user));

    setUser(data.user);
  } catch (error) {
    console.error('Login admin failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Login admin échoué');
  }
};


  const signOut = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/admin');
  };

  return (
  <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
    {!loading && children}
  </AuthContext.Provider>


  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};