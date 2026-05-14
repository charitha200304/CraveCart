import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ChefHat, ArrowLeft } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import FormField from '../components/FormField';
import { validateEmail } from '../utils/validation';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const toast = useToast();

  const handleEmailChange = (val) => {
    setEmail(val);
    if (error) setError(null);
  };

  const validate = () => {
    if (!validateEmail(email)) {
      setError('Invalid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setIsSuccess(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '48px 32px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--primary-bg)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Mail size={32} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Check your email</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
              We've sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. 
              Please check your inbox.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={26} color="white" />
            </div>
          </Link>
          <h1 style={{ fontSize: '28px', marginTop: '12px' }}>Forgot Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Enter your email to receive a reset link</p>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormField label="Email address" icon={Mail} error={error}>
              <input className={`input ${error ? 'input-error' : ''}`} type="email" placeholder="you@example.com" 
                value={email} onChange={e => handleEmailChange(e.target.value)} />
            </FormField>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '4px' }}>
              {loading ? <><span className="spinner" /> Sending…</> : 'Send Reset Link'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px' }}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500, textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
