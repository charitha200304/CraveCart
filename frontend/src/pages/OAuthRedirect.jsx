import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChefHat } from 'lucide-react';

export default function OAuthRedirect() {
  const { login, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    
    const handleRedirect = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const email = params.get('email');
        const role  = params.get('role');

        if (!token || !email || !role) {
          navigate('/login', { replace: true });
          return;
        }

        handled.current = true;

        login({ 
          id: params.get('id') ? Number(params.get('id')) : null, 
          name: params.get('name') || email, 
          email, 
          role,
          isGoogle: true 
        }, token, true);

        toast.success(`Login successful! Redirecting...`);

        // Force wait for mobile storage persistence
        await new Promise(r => setTimeout(r, 600));

        const target = role === 'RESTAURANT_OWNER' ? '/dashboard' : (role === 'ADMIN' ? '/admin' : '/');
        navigate(target, { replace: true });
      } catch (err) {
        console.error("OAuth Error:", err);
        navigate('/login', { replace: true });
      }
    };

    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else {
      handleRedirect();
    }
  }, [navigate, login, toast, isAuthenticated]);

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

      {/* Fallback button if redirect takes too long */}
      <button 
        onClick={() => navigate('/')}
        className="btn btn-ghost btn-sm"
        style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '13px' }}
      >
        Taking too long? Click here to continue
      </button>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
    </div>
  );
}
