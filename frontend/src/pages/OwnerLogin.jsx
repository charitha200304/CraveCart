import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OwnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'RESTAURANT_OWNER' || user.role === 'ADMIN') {
        toast.success('Welcome back to your business dashboard!');
        navigate('/dashboard');
      } else {
        toast.error('This portal is for Restaurant Owners only. Please use the customer login.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '24px', fontSize: '14px' }}>
          <ArrowLeft size={16} />
          Customer Login
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={26} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '28px', marginTop: '12px', color: 'var(--text-primary)' }}>Business Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Sign in to manage your restaurant</p>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label className="input-label">Business Email</label>
              <div className="input-icon">
                <Mail size={18} className="icon" />
                <input className="input" type="email" placeholder="owner@restaurant.com" value={email}
                  onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-icon" style={{ position: 'relative' }}>
                <Lock size={18} className="icon" />
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required
                  style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', border: 'none', background: 'none', cursor: 'pointer' }}>
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In to Dashboard'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            New to CraveCart?{' '}
            <Link to="/owner/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create business account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
