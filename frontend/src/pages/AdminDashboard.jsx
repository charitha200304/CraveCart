import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard, Users, Store, ShoppingBag, Star, Utensils,
  Trash2, ToggleLeft, ToggleRight, ChevronDown, CheckCircle, Clock,
  MapPin, Mail, Shield, RefreshCw, TrendingUp
} from 'lucide-react';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users',     label: 'Users',     icon: Users },
  { id: 'restaurants', label: 'Restaurants', icon: Store },
  { id: 'food',      label: 'Food Items', icon: Utensils },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { id: 'reviews',   label: 'Reviews',   icon: Star },
];

const STATUS_COLORS = {
  PENDING:   { bg: '#FEF3C7', color: '#92400E' },
  CONFIRMED: { bg: '#DBEAFE', color: '#1E40AF' },
  DELIVERED: { bg: '#D1FAE5', color: '#065F46' },
  CANCELLED: { bg: '#FEE2E2', color: '#991B1B' },
  PREPARING: { bg: '#EDE9FE', color: '#5B21B6' },
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: '24px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-lg)', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>{value ?? '—'}</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
      </div>
    </div>
  );
}

function DeleteBtn({ onDelete }) {
  return (
    <button onClick={onDelete} style={{ padding: '6px 8px', borderRadius: 'var(--radius-md)', background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
      <Trash2 size={14} /> Delete
    </button>
  );
}

function TableHeader({ cols }) {
  return (
    <thead>
      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', background: '#F8FAFC' }}>
        {cols.map(c => <th key={c} style={{ padding: '12px 16px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>{c}</th>)}
      </tr>
    </thead>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData]           = useState({ users: [], restaurants: [], pending: [], food: [], orders: [], reviews: [] });
  const [loading, setLoading]     = useState(true);
  const toast = useToast();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [users, restaurants, pending, food, orders, reviews] = await Promise.all([
        api.get('/user/admin/all'),
        api.get('/restaurants/all'),
        api.get('/restaurants/pending'),
        api.get('/food/all'),
        api.get('/orders/all'),
        api.get('/reviews/all'),
      ]);
      setData({
        users: users.data,
        restaurants: restaurants.data,
        pending: pending.data,
        food: food.data,
        orders: orders.data,
        reviews: reviews.data,
      });
    } catch (e) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Actions ────────────────────────────────────────────────
  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    await api.delete(`/user/admin/${id}`);
    setData(d => ({ ...d, users: d.users.filter(u => u.id !== id) }));
    toast.success('User deleted');
  };

  const toggleUser = async (id) => {
    const res = await api.put(`/user/admin/${id}/toggle`);
    setData(d => ({ ...d, users: d.users.map(u => u.id === id ? res.data : u) }));
    toast.success('User status updated');
  };

  const changeRole = async (id, role) => {
    const res = await api.put(`/user/admin/${id}/role?role=${role}`);
    setData(d => ({ ...d, users: d.users.map(u => u.id === id ? res.data : u) }));
    toast.success('Role updated');
  };

  const approveRestaurant = async (id) => {
    await api.post(`/restaurants/approve/${id}`);
    const approved = data.pending.find(r => r.id === id);
    setData(d => ({ ...d, pending: d.pending.filter(r => r.id !== id), restaurants: [...d.restaurants, { ...approved, approved: true }] }));
    toast.success('Restaurant approved!');
  };

  const deleteRestaurant = async (id) => {
    if (!confirm('Delete this restaurant?')) return;
    await api.delete(`/restaurants/${id}`);
    setData(d => ({ ...d, restaurants: d.restaurants.filter(r => r.id !== id), pending: d.pending.filter(r => r.id !== id) }));
    toast.success('Restaurant deleted');
  };

  const deleteFood = async (id) => {
    if (!confirm('Delete this food item?')) return;
    await api.delete(`/food/delete/${id}`);
    setData(d => ({ ...d, food: d.food.filter(f => f.id !== id) }));
    toast.success('Food item deleted');
  };

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order?')) return;
    await api.delete(`/orders/${id}`);
    setData(d => ({ ...d, orders: d.orders.filter(o => o.id !== id) }));
    toast.success('Order deleted');
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}`);
    setData(d => ({ ...d, reviews: d.reviews.filter(r => r.id !== id) }));
    toast.success('Review deleted');
  };

  // ── Shared UI ──────────────────────────────────────────────
  const cardWrap = {
    background: 'white', borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
    overflow: 'hidden', marginTop: '24px',
  };
  const tdStyle = { padding: '14px 16px', fontSize: '14px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' };
  const emptyState = (msg) => (
    <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <CheckCircle size={40} style={{ opacity: 0.2, marginBottom: 12 }} /><p>{msg}</p>
    </div>
  );

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
      <p style={{ marginTop: 16, color: 'var(--text-muted)' }}>Loading admin data…</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', flexShrink: 0, background: 'white', borderRight: '1px solid var(--border)', padding: '24px 12px', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--primary)', marginBottom: '24px', padding: '0 8px' }}>⚙ Admin Panel</div>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: active ? 'var(--primary-bg)' : 'transparent', color: active ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: active ? 700 : 500, fontSize: '14px', cursor: 'pointer', marginBottom: '4px', transition: 'all 0.15s' }}>
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
        <button onClick={fetchAll} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', marginTop: '12px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

        {/* ── DASHBOARD ── */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Welcome back, Admin. Here's what's happening.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              <StatCard icon={Users}       label="Total Users"       value={data.users.length}       color="#6366F1" />
              <StatCard icon={Store}       label="Approved Restaurants" value={data.restaurants.length} color="#F59E0B" />
              <StatCard icon={Clock}       label="Pending Restaurants" value={data.pending.length}    color="#EF4444" />
              <StatCard icon={ShoppingBag} label="Total Orders"      value={data.orders.length}      color="#10B981" />
              <StatCard icon={Utensils}    label="Food Items"        value={data.food.length}        color="#3B82F6" />
              <StatCard icon={Star}        label="Total Reviews"     value={data.reviews.length}     color="#EC4899" />
            </div>

            {data.pending.length > 0 && (
              <div style={{ ...cardWrap, border: '1px solid #FDE68A' }}>
                <div style={{ padding: '16px 20px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#D97706" /><span style={{ fontWeight: 700, color: '#92400E' }}>Pending Restaurant Approvals ({data.pending.length})</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <TableHeader cols={['Restaurant', 'Category', 'Action']} />
                  <tbody>
                    {data.pending.map(r => (
                      <tr key={r.id}>
                        <td style={tdStyle}><strong>{r.name}</strong></td>
                        <td style={tdStyle}>{r.category || '—'}</td>
                        <td style={tdStyle}>
                          <button onClick={() => approveRestaurant(r.id)} className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: '13px' }}>Approve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>User Management</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{data.users.length} total users</p>
            <div style={cardWrap}>
              {data.users.length === 0 ? emptyState('No users found') : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <TableHeader cols={['ID', 'Name', 'Email', 'Role', 'Status', 'Actions']} />
                    <tbody>
                      {data.users.map(u => (
                        <tr key={u.id} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <td style={tdStyle}><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>#{u.id}</span></td>
                          <td style={tdStyle}><strong>{u.name}</strong></td>
                          <td style={tdStyle}><span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={13} />{u.email}</span></td>
                          <td style={tdStyle}>
                            <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                              style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '13px', background: 'white', cursor: 'pointer' }}>
                              <option>CUSTOMER</option>
                              <option>RESTAURANT_OWNER</option>
                              <option>ADMIN</option>
                            </select>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, background: u.enabled ? '#D1FAE5' : '#FEE2E2', color: u.enabled ? '#065F46' : '#991B1B' }}>
                              {u.enabled ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => toggleUser(u.id)} style={{ padding: '6px 8px', borderRadius: 'var(--radius-md)', background: u.enabled ? '#FEF3C7' : '#D1FAE5', color: u.enabled ? '#92400E' : '#065F46', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                              {u.enabled ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                              {u.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <DeleteBtn onDelete={() => deleteUser(u.id)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── RESTAURANTS ── */}
        {activeTab === 'restaurants' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Restaurant Management</h1>

            {/* Pending */}
            <div style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#D97706" /> Pending Approval ({data.pending.length})
              </h2>
              <div style={cardWrap}>
                {data.pending.length === 0 ? emptyState('No pending restaurants') : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <TableHeader cols={['Restaurant', 'Category', 'Address', 'Actions']} />
                      <tbody>
                        {data.pending.map(r => (
                          <tr key={r.id}>
                            <td style={tdStyle}><strong>{r.name}</strong><br /><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Owner #{r.ownerId}</span></td>
                            <td style={tdStyle}>{r.category || '—'}</td>
                            <td style={tdStyle}><span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} />{r.address || '—'}</span></td>
                            <td style={{ ...tdStyle, display: 'flex', gap: '8px' }}>
                              <button onClick={() => approveRestaurant(r.id)} className="btn btn-primary btn-sm" style={{ padding: '6px 14px', fontSize: '13px' }}>Approve</button>
                              <DeleteBtn onDelete={() => deleteRestaurant(r.id)} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Approved */}
            <div style={{ marginTop: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} color="#10B981" /> Approved ({data.restaurants.length})
              </h2>
              <div style={cardWrap}>
                {data.restaurants.length === 0 ? emptyState('No approved restaurants') : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <TableHeader cols={['Restaurant', 'Category', 'Rating', 'Action']} />
                      <tbody>
                        {data.restaurants.map(r => (
                          <tr key={r.id}>
                            <td style={tdStyle}><strong>{r.name}</strong><br /><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#{r.id}</span></td>
                            <td style={tdStyle}>{r.category || '—'}</td>
                            <td style={tdStyle}>⭐ {r.averageRating?.toFixed(1) || '0.0'} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({r.reviewCount} reviews)</span></td>
                            <td style={tdStyle}><DeleteBtn onDelete={() => deleteRestaurant(r.id)} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOD ITEMS ── */}
        {activeTab === 'food' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Food Items</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{data.food.length} total items</p>
            <div style={cardWrap}>
              {data.food.length === 0 ? emptyState('No food items') : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <TableHeader cols={['Item', 'Price', 'Stock', 'Restaurant', 'Action']} />
                    <tbody>
                      {data.food.map(f => (
                        <tr key={f.id}>
                          <td style={tdStyle}><strong>{f.name}</strong><br /><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{f.category}</span></td>
                          <td style={tdStyle}>Rs. {f.price?.toFixed(2)}</td>
                          <td style={tdStyle}>{f.stockQuantity ?? '—'}</td>
                          <td style={tdStyle}>#{f.restaurantId}</td>
                          <td style={tdStyle}><DeleteBtn onDelete={() => deleteFood(f.id)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {activeTab === 'orders' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>All Orders</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{data.orders.length} total orders</p>
            <div style={cardWrap}>
              {data.orders.length === 0 ? emptyState('No orders yet') : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <TableHeader cols={['Order ID', 'Customer', 'Restaurant', 'Amount', 'Status', 'Action']} />
                    <tbody>
                      {data.orders.map(o => {
                        const sc = STATUS_COLORS[o.status] || STATUS_COLORS.PENDING;
                        return (
                          <tr key={o.id}>
                            <td style={tdStyle}><span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>#{o.id}</span></td>
                            <td style={tdStyle}>{o.customer?.name || '—'}</td>
                            <td style={tdStyle}>{o.restaurant?.name || '—'}</td>
                            <td style={tdStyle}>Rs. {o.totalAmount?.toFixed(2)}</td>
                            <td style={tdStyle}>
                              <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, background: sc.bg, color: sc.color }}>
                                {o.status}
                              </span>
                            </td>
                            <td style={tdStyle}><DeleteBtn onDelete={() => deleteOrder(o.id)} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === 'reviews' && (
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Review Moderation</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{data.reviews.length} total reviews</p>
            <div style={cardWrap}>
              {data.reviews.length === 0 ? emptyState('No reviews yet') : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <TableHeader cols={['Reviewer', 'Rating', 'Comment', 'Action']} />
                    <tbody>
                      {data.reviews.map(r => (
                        <tr key={r.id}>
                          <td style={tdStyle}>{r.reviewerName || '—'}</td>
                          <td style={tdStyle}>{'⭐'.repeat(r.rating)}</td>
                          <td style={{ ...tdStyle, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.comment || '—'}</td>
                          <td style={tdStyle}><DeleteBtn onDelete={() => deleteReview(r.id)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
