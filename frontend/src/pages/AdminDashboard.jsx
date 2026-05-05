import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { CheckCircle, XCircle, Clock, User, Store, Mail } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingOwners, setPendingOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchPendingOwners();
  }, []);

  const fetchPendingOwners = async () => {
    try {
      const res = await api.get('/user/admin/pending-owners');
      setPendingOwners(res.data);
    } catch (err) {
      toast.error('Failed to fetch pending owners');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/user/admin/approve/${id}`);
      toast.success('Owner approved successfully!');
      setPendingOwners(p => p.filter(o => o.id !== id));
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage restaurant owner approvals</p>
      </div>

      <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="var(--primary)" />
            Pending Approvals ({pendingOwners.length})
          </h2>
        </div>

        {pendingOwners.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>No pending owner registrations at the moment.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Owner</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Contact</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOwners.map(owner => (
                  <tr key={owner.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{owner.name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ID: #{owner.id}</div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                        <Mail size={14} /> {owner.email}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: '#FEF3C7', color: '#92400E', fontSize: '12px', fontWeight: 600 }}>
                        PENDING
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleApprove(owner.id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '8px 16px' }}
                      >
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
