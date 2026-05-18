import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!token) {
    return null;
  }

  return children;
}
