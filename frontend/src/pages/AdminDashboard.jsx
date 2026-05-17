import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { CheckCircle, Clock, Mail, Store, MapPin } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingOwners, setPendingOwners] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('owners');
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ownersRes, restaurantsRes] = await Promise.all([
        api.get('/user/admin/pending-owners'),
        api.get('/restaurants/pending'),
      ]);
      setPendingOwners(ownersRes.data);
      setPendingRestaurants(restaurantsRes.data);
    } catch (err) {
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOwner = async (id) => {
    try {
      await api.post(`/user/admin/approve/${id}`);
      toast.success('Owner approved successfully!');
      setPendingOwners(p => p.filter(o => o.id !== id));
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const handleApproveRestaurant = async (id) => {
    try {
      await api.post(`/restaurants/approve/${id}`);
      toast.success('Restaurant approved! It is now visible to customers.');
      setPendingRestaurants(p => p.filter(r => r.id !== id));
    } catch (err) {
      toast.error('Restaurant approval failed');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }} />
      </div>
    );
  }

  const tabStyle = (tab) => ({
    padding: '10px 24px',
    borderRadius: 'var(--radius-full)',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    background: activeTab === tab ? 'var(--primary)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
    transition: 'all 0.2s',
  });

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800 }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage approvals for owners and restaurants</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#F1F5F9', padding: '6px', borderRadius: 'var(--radius-full)', width: 'fit-content' }}>
        <button style={tabStyle('owners')} onClick={() => setActiveTab('owners')}>
          Pending Owners ({pendingOwners.length})
        </button>
        <button style={tabStyle('restaurants')} onClick={() => setActiveTab('restaurants')}>
          Pending Restaurants ({pendingRestaurants.length})
        </button>
      </div>

      {/* Owners Tab */}
      {activeTab === 'owners' && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="var(--primary)" />
              Pending Owner Registrations ({pendingOwners.length})
            </h2>
          </div>
          {pendingOwners.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>No pending owner registrations.</p>
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
                        <div style={{ fontWeight: 600 }}>{owner.name}</div>
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
                        <button onClick={() => handleApproveOwner(owner.id)} className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
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
      )}

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Store size={20} color="var(--primary)" />
              Pending Restaurant Approvals ({pendingRestaurants.length})
            </h2>
          </div>
          {pendingRestaurants.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>No pending restaurant approvals.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Restaurant</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Category</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Address</th>
                    <th style={{ padding: '16px 24px', fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRestaurants.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {r.imageUrl && (
                            <img src={r.imageUrl} alt={r.name} style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>{r.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Owner ID: #{r.ownerId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '12px', fontWeight: 600 }}>
                          {r.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                          <MapPin size={14} /> {r.address}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <button onClick={() => handleApproveRestaurant(r.id)} className="btn btn-primary btn-sm" style={{ padding: '8px 16px' }}>
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
      )}
    </div>
  );
}
