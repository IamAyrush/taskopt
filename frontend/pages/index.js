import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (token) {
        router.replace('/notes');
      } else {
        router.replace('/login');
      }
    }
  }, [token, loading, router]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      background: '#f7fafc'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    </div>
  );
}
