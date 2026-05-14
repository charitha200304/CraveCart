import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChefHat } from 'lucide-react';

export default function OAuthRedirect() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const id    = params.get('id');
    const email = params.get('email');
    const name  = params.get('name');
    const role  = params.get('role');

    if (!token || !email || !role) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    login({ 
      id: id ? Number(id) : null, 
      name: name || email, 
      email, 
      role,
      isGoogle: true 
    }, token);
    toast.success(`Welcome, ${name || email}! 🎉`);

    if (role === 'RESTAURANT_OWNER') navigate('/dashboard', { replace: true });
    else if (role === 'ADMIN')       navigate('/admin',     { replace: true });
    else                             navigate('/',          { replace: true });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)',
      gap: '24px',
    }}>
      {/* Animated logo */}
      <div style={{
        width: '64px', height: '64px',
        background: 'var(--primary)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}>
        <ChefHat size={34} color="white" />
      </div>

      {/* Spinner */}
      <div style={{
        width: '40px', height: '40px',
        border: '4px solid #f0e6e6',
        borderTop: '4px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />

      <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500 }}>
        Signing you in with Google…
      </p>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
    </div>
  );
}
