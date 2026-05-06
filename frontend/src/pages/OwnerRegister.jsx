import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ChefHat, Store, Upload } from 'lucide-react';
import { authAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

export default function OwnerRegister() {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: '', 
    role: 'RESTAURANT_OWNER',
    restaurantName: '',
    restaurantAddress: '',
    restaurantImageUrl: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image is too large! Please pick a file under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        set('restaurantImageUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match!'); return; }
    
    setLoading(true);
    try {
      await authAPI.register({ ...form, username: form.email, phoneNumber: form.phone });
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
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Verify your business email</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '16px' }}>
              We've sent a link to <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong> to verify your account.
              <br/><br/>
              <span style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>Note: After email verification, an Admin will review and approve your restaurant.</span>
            </p>
            <Link to="/owner/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>Go to Owner Login</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #FFF5F2 0%, #FAFAFA 100%)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', background: 'var(--primary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={26} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '28px', marginTop: '12px' }}>CraveCart for Business</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', marginTop: '6px' }}>Register your restaurant and start growing</p>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Owner Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-icon">
                    <User size={18} className="icon" />
                    <input className="input" type="text" placeholder="Manager Name" value={form.name}
                      onChange={e => set('name', e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Business Email</label>
                  <div className="input-icon">
                    <Mail size={18} className="icon" />
                    <input className="input" type="email" placeholder="contact@restaurant.com" value={form.email}
                      onChange={e => set('email', e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Phone Number</label>
                  <div className="input-icon">
                    <Phone size={18} className="icon" />
                    <input className="input" type="tel" placeholder="Manager phone number" value={form.phone}
                      onChange={e => set('phone', e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Password</label>
                  <div className="input-icon" style={{ position: 'relative' }}>
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
                  <div className="input-icon" style={{ position: 'relative' }}>
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
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Restaurant Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Restaurant Name</label>
                  <div className="input-icon">
                    <ChefHat size={18} className="icon" />
                    <input className="input" type="text" placeholder="e.g. Royal Taste" value={form.restaurantName}
                      onChange={e => set('restaurantName', e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Restaurant Address</label>
                  <div className="input-icon">
                    <Store size={18} className="icon" />
                    <input className="input" type="text" placeholder="Street, City" value={form.restaurantAddress}
                      onChange={e => set('restaurantAddress', e.target.value)} required />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Restaurant Image</label>
                  <div 
                    onClick={() => document.getElementById('image-upload').click()}
                    style={{ 
                      width: '100%', 
                      height: '140px', 
                      border: '2px dashed var(--border)', 
                      borderRadius: 'var(--radius-lg)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#FAFAFA',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    {form.restaurantImageUrl ? (
                      <img src={form.restaurantImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Click to upload restaurant photo</span>
                      </>
                    )}
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: '16px' }}>
              {loading ? <><span className="spinner" /> Creating account…</> : 'Register Restaurant'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            Already registered?{' '}
            <Link to="/owner/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
