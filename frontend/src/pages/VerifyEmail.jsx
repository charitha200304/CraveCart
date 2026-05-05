import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, ChefHat, Loader2, Mail } from 'lucide-react';
import api from '../utils/api';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') === 'pending' ? 'pending' : 'verifying'); 
  const [message, setMessage] = useState(searchParams.get('status') === 'pending' ? 'Please check your email to verify your account.' : '');
  const code = searchParams.get('code');
  const email = searchParams.get('email');

  useEffect(() => {
    if (status === 'pending') return;

    if (!code) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/user/verify?code=${code}&email=${email || ''}`);
        
        // res.data is now AuthResponse (id, token, email, role, name)
        const userData = res.data;
        localStorage.setItem('cc_token', userData.token);
        localStorage.setItem('cc_user', JSON.stringify(userData));

        setStatus('success');
        setMessage('Email verified! Logging you in...');
        
        // Auto redirect to dashboard after 2 seconds
        setTimeout(() => {
          if (userData.role === 'ADMIN') navigate('/admin');
          else if (userData.role === 'RESTAURANT_OWNER') navigate('/owner');
          else navigate('/customer');
        }, 2000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The link may be expired.');
      }
    };

    verify();
  }, [code]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '56px', height: '56px', background: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <ChefHat size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>CraveCart Verification</h1>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '48px 32px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          {status === 'pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--primary-bg)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <Mail size={32} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Verify your email</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>
                We've sent a verification link to <strong>{email}</strong>. Please check your inbox.
              </p>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>Back to Login</Link>
            </div>
          )}

          {status === 'verifying' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <Loader2 size={48} className="spinner-dark" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <CheckCircle2 size={64} color="var(--success)" />
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Verified!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{message}</p>
              <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Sign In Now</Link>
            </div>
          )}

          {status === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <XCircle size={64} color="var(--error)" />
              <h2 style={{ fontSize: '20px', color: 'var(--text-primary)' }}>Oops!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{message}</p>
              <Link to="/register" className="btn btn-secondary btn-lg" style={{ width: '100%' }}>Try Registering Again</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
