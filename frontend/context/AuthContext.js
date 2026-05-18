import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Fetch user data from /about endpoint to persist full user info
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const res = await fetch(`${BACKEND_URL}/about`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
