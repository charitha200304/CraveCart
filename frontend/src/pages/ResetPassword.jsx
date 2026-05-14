import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, ChefHat } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';
import FormField from '../components/FormField';
import { validatePassword } from '../utils/validation';

export default function ResetPassword() {
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    if (!urlToken) {
      toast.error('Invalid reset token.');
      navigate('/login');
    } else {
      setToken(urlToken);
    }
  }, [location, navigate, toast]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!validatePassword(form.newPassword)) newErrors.newPassword = 'Min. 6 characters';
    if (form.newPassword !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authAPI.resetPassword({ token, newPassword: form.newPassword });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChefHat size={26} color="white" />
            </div>
          </Link>
          <h1 style={{ fontSize: '28px', marginTop: '12px' }}>Set New Password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Please enter your new password below</p>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <FormField label="New Password" icon={Lock} error={errors.newPassword}>
              <input className={`input ${errors.newPassword ? 'input-error' : ''}`} type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                value={form.newPassword} onChange={e => set('newPassword', e.target.value)}
                style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', border: 'none', background: 'none', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </FormField>

            <FormField label="Confirm New Password" icon={Lock} error={errors.confirmPassword}>
              <input className={`input ${errors.confirmPassword ? 'input-error' : ''}`} type={showPw ? 'text' : 'password'} placeholder="Retype new password"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', border: 'none', background: 'none', cursor: 'pointer' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </FormField>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '4px' }}>
              {loading ? <><span className="spinner" /> Resetting…</> : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
