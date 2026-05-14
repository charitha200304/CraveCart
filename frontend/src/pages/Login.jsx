import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ChefHat } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail } from '../utils/validation';
import FormField from '../components/FormField';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!validateEmail(form.email)) newErrors.email = 'Invalid email address';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authAPI.login(form);
      const { token, user, role, name, email, id, phoneNumber } = res.data;
      
      if (role !== 'CUSTOMER') {
        toast.error(`This login is for customers only. Please use the ${role === 'ADMIN' ? 'Admin' : 'Restaurant Owner'} portal.`);
        return;
      }

      login({ id, name, email, role, phone: phoneNumber }, token, form.rememberMe);
      toast.success(`Welcome back, ${name || 'there'}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={26} color="white" />
            </div>
          </Link>
          <h1 style={{ fontSize: '28px', marginTop: '12px' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Sign in to your CraveCart account</p>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormField label="Email address" icon={Mail} error={errors.email}>
              <input className={`input ${errors.email ? 'input-error' : ''}`} type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set('email', e.target.value)} />
            </FormField>

            <FormField label="Password" icon={Lock} error={errors.password}>
              <input className={`input ${errors.password ? 'input-error' : ''}`} type={showPw ? 'text' : 'password'} placeholder="Your password"
                value={form.password} onChange={e => set('password', e.target.value)}
                style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </FormField>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <input 
                  type="checkbox" 
                  checked={form.rememberMe}
                  onChange={(e) => set('rememberMe', e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 500, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '4px' }}>
              {loading ? <><span className="spinner" /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>

          <a 
            href="http://localhost:8080/oauth2/authorization/google"
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
            Continue with Google
          </a>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
