import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ChefHat } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'CUSTOMER' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match!'); return; }
    
    setLoading(true);
    try {
      await authAPI.register({ ...form, username: form.email });
      setIsSuccess(true);
      toast.success('Registration successful! Please check your email for verification.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '48px 32px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--primary-bg)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Mail size={32} color="var(--primary)" />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Check your email!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
              We've sent a verification link to <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong>. 
              Please click the link to activate your account.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={26} color="white" />
            </div>
          </Link>
          <h1 style={{ fontSize: '28px', marginTop: '12px' }}>Create account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Join CraveCart for free today</p>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Full name</label>
              <div className="input-icon">
                <User size={18} className="icon" />
                <input className="input" type="text" placeholder="Your full name" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email address</label>
              <div className="input-icon">
                <Mail size={18} className="icon" />
                <input className="input" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-icon">
                <Lock size={18} className="icon" />
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={e => set('password', e.target.value)} required
                  style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', border: 'none', background: 'none', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <div className="input-icon">
                <Lock size={18} className="icon" />
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="Retype password"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required
                  style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', border: 'none', background: 'none', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '8px' }}>
              {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account'}
            </button>
          </form>

          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <a 
            href={`http://localhost:8080/oauth2/authorization/google?role=CUSTOMER`}
            className="btn btn-outline" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              padding: '12px',
              textDecoration: 'none',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px' }} />
            Sign up with Google
          </a>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
            <Link to="/owner/register" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Register as a Restaurant</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
