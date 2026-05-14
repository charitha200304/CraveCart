import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Store, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../utils/api';
import FormField from '../components/FormField';
import { validateEmail } from '../utils/validation';

export default function OwnerLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login: saveSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!validateEmail(form.email)) newErrors.email = 'Invalid business email';
    if (!form.password) newErrors.password = 'Password required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const user = res.data;

      if (user.role === 'RESTAURANT_OWNER') {
        saveSession(user, user.token);
        toast.success('Welcome back to your business dashboard!');
        navigate('/dashboard');
      } else {
        toast.error('This portal is for Restaurant Owners only.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
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
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormField label="Business Email" icon={Mail} error={errors.email}>
              <input className={`input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="owner@restaurant.com" 
                value={form.email} onChange={e => set('email', e.target.value)} />
            </FormField>

            <FormField label="Password" icon={Lock} error={errors.password}>
              <input className={`input ${errors.password ? 'input-error' : ''}`} type={showPw ? 'text' : 'password'} placeholder="••••••••" 
                value={form.password} onChange={e => set('password', e.target.value)}
                style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', border: 'none', background: 'none', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </FormField>

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
