import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI } from '../utils/api';
import FormField from '../components/FormField';
import { validateEmail, validatePhone, validateName } from '../utils/validation';
import Swal from 'sweetalert2';

export default function Profile() {
  const { user, login } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const [errors, setErrors] = useState({});
  const [editingField, setEditingField] = useState(null); // 'name', 'email', 'phone', 'address'

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: null }));
  };

  const validate = (field) => {
    const newErrors = {};
    if (field === 'name' && !validateName(form.name)) newErrors.name = 'Name too short';
    if (field === 'email' && !validateEmail(form.email)) newErrors.email = 'Invalid email';
    if (field === 'phone' && form.phone && !validatePhone(form.phone)) newErrors.phone = '10 digits required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (field) => {
    if (!validate(field)) return;

    const isEmailChanging = field === 'email' && form.email !== user.email;

    if (isEmailChanging && user.isGoogle) {
      toast.error('Email managed by Google cannot be changed here.');
      return;
    }

    if (isEmailChanging) {
      const confirm = await Swal.fire({
        title: 'Change Email Address?',
        text: 'For security, you will be logged out and must verify your new email before signing in again.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'var(--primary)',
        confirmButtonText: 'Yes, change it'
      });
      if (!confirm.isConfirmed) return;
    }

    setLoading(true);
    try {
      const res = await userAPI.update(user.id, {
        ...user,
        ...form,
        username: form.email,
        phoneNumber: form.phone
      });
      
      if (isEmailChanging) {
        await Swal.fire({
          title: 'Verification Required! ✉️',
          text: 'We have sent a verification link to your new email. Please verify it to log back in.',
          icon: 'info',
          confirmButtonColor: 'var(--primary)'
        });
        window.location.href = '/login';
        return;
      }

      // Update session with new user data
      const updatedUser = { 
        ...user, 
        ...res.data, 
        phone: res.data.phoneNumber,
        address: res.data.address
      };
      login(updatedUser, localStorage.getItem('cc_token') || sessionStorage.getItem('cc_token'));
      
      setEditingField(null);
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated! ✨`);
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = (field) => {
    setEditingField(null);
    setForm(p => ({ ...p, [field]: user[field] || (field === 'phone' ? user.phoneNumber : '') }));
    setErrors(p => ({ ...p, [field]: null }));
  };

  const EditableRow = ({ label, field, icon: Icon, value, type = 'text', isTextArea = false, disabled = false }) => {
    const isEditing = editingField === field;

    return (
      <div style={{ padding: '20px 0', borderBottom: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              <Icon size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              {!isEditing && (
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px' }}>
                  {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}
                </div>
              )}
            </div>
          </div>
          
          {!isEditing && !disabled && (
            <button onClick={() => setEditingField(field)} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary)' }}>
              Edit
            </button>
          )}

          {disabled && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--border-light)', padding: '4px 8px', borderRadius: '4px' }}>
              Managed by Google
            </span>
          )}
        </div>

        {isEditing && (
          <div className="edit-container" style={{ animation: 'fadeIn 0.2s ease' }}>
            <FormField error={errors[field]}>
              {isTextArea ? (
                <textarea className="input" value={form[field]} onChange={e => set(field, e.target.value)} autoFocus style={{ minHeight: '100px' }} />
              ) : (
                <input className={`input ${errors[field] ? 'input-error' : ''}`} type={type} value={form[field]} 
                  onChange={e => set(field, e.target.value)} autoFocus />
              )}
            </FormField>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => handleSave(field)} className="btn btn-primary btn-sm" disabled={loading} style={{ minWidth: '80px' }}>
                {loading ? <span className="spinner" /> : 'Save'}
              </button>
              <button onClick={() => cancelEdit(field)} className="btn btn-ghost btn-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <button onClick={() => window.history.back()} className="btn btn-ghost" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: '32px', fontWeight: 800 }}>Account Settings</h1>
        </div>

        <div className="profile-layout" style={{ display: 'grid', alignItems: 'start' }}>
          {/* Profile Card */}
          <div className="profile-sidebar" style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '32px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-bg) 0%, #fff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '48px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </span>
                <button style={{ position: 'absolute', bottom: '4px', right: '4px', width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', boxShadow: 'var(--shadow-sm)' }}>
                  <Camera size={16} />
                </button>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>{user?.email}</p>
              
              <div style={{ padding: '10px', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '13px', fontWeight: 700 }}>
                <ShieldCheck size={16} />
                Verified Customer
              </div>
            </div>
          </div>

          {/* Settings List */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '40px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Personal Information</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Manage your account details and delivery preferences.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <EditableRow label="Full Name" field="name" icon={User} value={form.name} />
              <EditableRow label="Email Address" field="email" icon={Mail} value={form.email} disabled={user?.isGoogle} />
              <EditableRow label="Phone Number" field="phone" icon={Phone} value={form.phone} />
              <EditableRow label="Delivery Address" field="address" icon={MapPin} value={form.address} isTextArea={true} />
            </div>

            <div style={{ marginTop: '40px', padding: '24px', background: '#F8FAFC', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
              <h5 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>Security Tip</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
                Always keep your phone number updated to ensure our delivery riders can reach you quickly when your order is nearby.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
