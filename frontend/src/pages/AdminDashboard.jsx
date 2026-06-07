import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Store, ShoppingBag, Star,
  Trash2, ToggleLeft, ToggleRight, CheckCircle, Clock,
  MapPin, Mail, RefreshCw, Menu, X, TrendingUp, LogOut
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts';

/* ── Tabs config ───────────────────────────────────────── */
const TABS = [
  { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'users',     label: 'Users',        icon: Users            },
  { id: 'restaurants', label: 'Restaurants', icon: Store           },
  { id: 'orders',    label: 'Orders',       icon: ShoppingBag      },
  { id: 'reviews',   label: 'Reviews',      icon: Star             },
];

const STATUS_COLORS = {
  PENDING:   { bg: '#FEF3C7', color: '#92400E', hex: '#F59E0B' },
  CONFIRMED: { bg: '#DBEAFE', color: '#1E40AF', hex: '#3B82F6' },
  DELIVERED: { bg: '#D1FAE5', color: '#065F46', hex: '#10B981' },
  CANCELLED: { bg: '#FEE2E2', color: '#991B1B', hex: '#EF4444' },
  PREPARING: { bg: '#EDE9FE', color: '#5B21B6', hex: '#8B5CF6' },
};

/* ── Reusable sub-components (inline styles, global classes) */

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all var(--transition)',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div style={{
        width: 48, height: 48,
        borderRadius: 'var(--radius-md)',
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

function SectionCard({ children, style }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionHeader({ children, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '14px 20px',
      borderBottom: '1px solid var(--border-light)',
      background: 'var(--border-light)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function TH({ children }) {
  return (
    <th style={{ padding: '12px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', textAlign: 'left', whiteSpace: 'nowrap' }}>
      {children}
    </th>
  );
}

function TD({ children, style }) {
  return (
    <td style={{ padding: '13px 16px', fontSize: 14, color: 'var(--text-primary)', borderTop: '1px solid var(--border-light)', verticalAlign: 'middle', ...style }}>
      {children}
    </td>
  );
}

function DeleteBtn({ onDelete }) {
  return (
    <button onClick={onDelete} className="btn btn-danger btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Trash2 size={13} /> Delete
    </button>
  );
}

function EmptyState({ message }) {
  return (
    <div className="empty-state">
      <CheckCircle size={40} className="empty-state-icon" />
      <p>{message}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ display: 'block', width: 4, height: 16, background: 'var(--primary)', borderRadius: 4 }} />
        {title}
      </h3>
      {children}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function AdminDashboard() {
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState({ users: [], restaurants: [], pending: [], orders: [], reviews: [] });
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [users, restaurants, pending, orders, reviews] = await Promise.all([
        api.get('/user/admin/all'),
        api.get('/restaurants/all'),
        api.get('/restaurants/pending'),
        api.get('/orders/all'),
        api.get('/reviews/all'),
      ]);
      setData({
        users: users.data || [],
        restaurants: restaurants.data || [],
        pending: pending.data || [],
        orders: orders.data || [],
        reviews: reviews.data || [],
      });
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Close sidebar when switching tabs on mobile
  const goTab = (id) => { setActiveTab(id); setSidebarOpen(false); };

  /* ── Actions ─────────────────────────────────────────── */
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

  /* ── Chart helpers ───────────────────────────────────── */
  const getTrendData = () => {
    const groups = {};
    (data.orders || []).forEach(o => {
      if (!o.orderDate) return;
      const d = new Date(o.orderDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!groups[d]) groups[d] = { date: d, revenue: 0, count: 0 };
      groups[d].revenue += o.totalAmount || 0;
      groups[d].count += 1;
    });
    return Object.values(groups).slice(-7);
  };

  const getStatusData = () => {
    const counts = {};
    (data.orders || []).forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.keys(counts).map(status => ({
      name: status, value: counts[status], color: STATUS_COLORS[status]?.hex || '#94A3B8',
    }));
  };

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, background: 'var(--bg)' }}>
        <div className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading admin data…</p>
      </div>
    );
  }

  /* ── Sidebar content ─────────────────────────────────── */
  const Sidebar = () => (
    <aside style={{
      width: 260,
      background: 'var(--secondary)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      overflowY: 'auto',
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'white', flexShrink: 0 }}>C</div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'white', letterSpacing: '-0.02em' }}>CraveCart</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)', padding: '8px 10px 4px' }}>Navigation</div>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => goTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: active ? 'var(--primary)' : 'transparent',
                border: 'none',
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: 14, fontWeight: active ? 600 : 400,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all var(--transition)',
                boxShadow: active ? '0 4px 16px rgba(255,69,0,0.35)' : 'none',
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; } }}
            >
              <Icon size={16} />{tab.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={fetchAll}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.07)', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all var(--transition)', marginBottom: '8px' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
        <button
          onClick={() => {
            logout();
            toast.success('Logged out successfully');
            navigate('/login');
          }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#FCA5A5', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all var(--transition)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'; e.currentTarget.style.color = '#FECACA'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.color = '#FCA5A5'; }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );

  /* ── Render ──────────────────────────────────────────── */
  return (
    <>
      {/* Scoped responsive styles – only media queries, no separate file */}
      <style>{`
        .adm-wrapper { display: flex; min-height: 100vh; background: var(--bg); }
        .adm-sidebar-desktop { display: flex; }
        .adm-topbar { display: none; }
        .adm-sidebar-mobile { display: none; position: fixed; top: 0; left: 0; height: 100vh; z-index: 400; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); box-shadow: var(--shadow-xl); }
        .adm-sidebar-mobile.open { transform: translateX(0); }
        .adm-overlay { display: none; position: fixed; inset: 0; background: rgba(15,15,26,0.55); backdrop-filter: blur(3px); z-index: 399; }
        .adm-overlay.visible { display: block; }
        .adm-stat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 28px; }
        .adm-chart-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr)); gap: 20px; margin-bottom: 28px; }
        .adm-content { flex: 1; min-width: 0; padding: 32px; overflow-y: auto; }
        @media (max-width: 1024px) {
          .adm-chart-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .adm-sidebar-desktop { display: none !important; }
          .adm-topbar { display: flex !important; align-items: center; justify-content: space-between; padding: 0 16px; height: 56px; background: var(--secondary); position: sticky; top: 0; z-index: 300; box-shadow: 0 2px 8px rgba(0,0,0,0.25); }
          .adm-sidebar-mobile { display: flex !important; }
          .adm-wrapper { flex-direction: column; }
          .adm-content { padding: 16px; }
          .adm-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .adm-chart-grid { grid-template-columns: 1fr; gap: 14px; }
        }
        @media (max-width: 480px) {
          .adm-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .adm-content { padding: 12px; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div className={`adm-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Mobile top bar */}
      <div className="adm-topbar">
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'white', letterSpacing: '-0.02em' }}>
          Crave<span style={{ color: 'var(--primary)' }}>Cart</span>
        </div>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer' }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="adm-wrapper">
        {/* Desktop sidebar */}
        <div className="adm-sidebar-desktop"><Sidebar /></div>

        {/* Mobile sidebar (off-canvas) */}
        <div className={`adm-sidebar-mobile ${sidebarOpen ? 'open' : ''}`}><Sidebar /></div>

        {/* Main content */}
        <main className="adm-content">

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Welcome back, Admin. Here's your system overview.</p>
              </div>

              {/* Stat cards */}
              <div className="adm-stat-grid">
                <StatCard icon={Users}      label="Total Users"          value={data.users.length}       color="#6366F1" />
                <StatCard icon={Store}      label="Approved Restaurants"  value={data.restaurants.length} color="var(--primary)" />
                <StatCard icon={Clock}      label="Pending Restaurants"   value={data.pending.length}     color="var(--warning)" />
                <StatCard icon={ShoppingBag} label="Total Orders"         value={data.orders.length}      color="var(--success)" />
                <StatCard icon={Star}       label="Total Reviews"         value={data.reviews.length}     color="#EC4899" />
              </div>

              {/* Charts */}
              <div className="adm-chart-grid">
                <ChartCard title="Daily Revenue Trend">
                  <div style={{ width: '100%', height: 280, minWidth: 0, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getTrendData()}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 13 }} />
                        <Area type="monotone" dataKey="revenue" name="Revenue (Rs.)" stroke="var(--primary)" strokeWidth={2.5} fill="url(#revGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>

                <ChartCard title="Order Status Analysis">
                  <div style={{ width: '100%', height: 280, minWidth: 0, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={getStatusData()} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                          {getStatusData().map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', fontSize: 13 }} />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 13 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </ChartCard>
              </div>

              {/* Pending approvals quick view */}
              {data.pending.length > 0 && (
                <SectionCard style={{ border: '1px solid #FDE68A' }}>
                  <SectionHeader style={{ background: '#FFFBEB', borderBottomColor: '#FDE68A' }}>
                    <Clock size={16} color="#D97706" />
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: '#92400E' }}>
                      Pending Approvals ({data.pending.length})
                    </span>
                  </SectionHeader>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
                      <thead style={{ background: 'var(--border-light)' }}>
                        <tr><TH>Restaurant</TH><TH>Category</TH><TH>Action</TH></tr>
                      </thead>
                      <tbody>
                        {data.pending.map(r => (
                          <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                            <TD><strong>{r.name}</strong></TD>
                            <TD>{r.category || '—'}</TD>
                            <TD>
                              <button onClick={() => approveRestaurant(r.id)} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <CheckCircle size={13} /> Approve
                              </button>
                            </TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              )}
            </div>
          )}

          {/* ── USERS ── */}
          {activeTab === 'users' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>User Management</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{data.users.length} registered users</p>
              </div>
              <SectionCard>
                {data.users.length === 0 ? <EmptyState message="No users found" /> : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                      <thead style={{ background: 'var(--border-light)' }}>
                        <tr><TH>ID</TH><TH>Name</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH><TH>Actions</TH></tr>
                      </thead>
                      <tbody>
                        {data.users.map(u => (
                          <tr key={u.id}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = ''}
                          >
                            <TD><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{u.id}</span></TD>
                            <TD><strong>{u.name}</strong></TD>
                            <TD>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
                                <Mail size={13} />{u.email}
                              </span>
                            </TD>
                            <TD>
                              <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                                style={{ padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--border)', fontSize: 13, background: 'var(--surface)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', cursor: 'pointer', outline: 'none' }}>
                                <option>CUSTOMER</option>
                                <option>RESTAURANT_OWNER</option>
                                <option>ADMIN</option>
                              </select>
                            </TD>
                            <TD>
                              <span className={`badge ${u.enabled ? 'badge-success' : 'badge-error'}`}>
                                {u.enabled ? 'Active' : 'Disabled'}
                              </span>
                            </TD>
                            <TD>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <button onClick={() => toggleUser(u.id)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    padding: '6px 10px', borderRadius: 'var(--radius-md)',
                                    background: u.enabled ? '#FEF3C7' : '#D1FAE5',
                                    color: u.enabled ? '#92400E' : '#065F46',
                                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                                    fontFamily: 'var(--font-body)', transition: 'all var(--transition)',
                                  }}>
                                  {u.enabled ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                                  {u.enabled ? 'Disable' : 'Enable'}
                                </button>
                                <DeleteBtn onDelete={() => deleteUser(u.id)} />
                              </div>
                            </TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ── RESTAURANTS ── */}
          {activeTab === 'restaurants' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Restaurant Management</h1>
              </div>

              {/* Pending */}
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <Clock size={16} color="var(--warning)" /> Pending Approval ({data.pending.length})
                </h2>
                <SectionCard>
                  {data.pending.length === 0 ? <EmptyState message="No pending restaurants" /> : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
                        <thead style={{ background: 'var(--border-light)' }}>
                          <tr><TH>Restaurant</TH><TH>Category</TH><TH>Address</TH><TH>Actions</TH></tr>
                        </thead>
                        <tbody>
                          {data.pending.map(r => (
                            <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                              <TD>
                                <strong>{r.name}</strong>
                                <br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Owner #{r.ownerId}</span>
                              </TD>
                              <TD>{r.category || '—'}</TD>
                              <TD><span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} color="var(--text-muted)" />{r.address || '—'}</span></TD>
                              <TD>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button onClick={() => approveRestaurant(r.id)} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <CheckCircle size={13} /> Approve
                                  </button>
                                  <DeleteBtn onDelete={() => deleteRestaurant(r.id)} />
                                </div>
                              </TD>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SectionCard>
              </div>

              {/* Approved */}
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)' }}>
                  <CheckCircle size={16} color="var(--success)" /> Approved ({data.restaurants.length})
                </h2>
                <SectionCard>
                  {data.restaurants.length === 0 ? <EmptyState message="No approved restaurants" /> : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
                        <thead style={{ background: 'var(--border-light)' }}>
                          <tr><TH>Restaurant</TH><TH>Category</TH><TH>Rating</TH><TH>Action</TH></tr>
                        </thead>
                        <tbody>
                          {data.restaurants.map(r => (
                            <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                              <TD>
                                <strong>{r.name}</strong>
                                <br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>#{r.id}</span>
                              </TD>
                              <TD>{r.category || '—'}</TD>
                              <TD>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  ⭐ <strong>{r.averageRating?.toFixed(1) || '0.0'}</strong>
                                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({r.reviewCount} reviews)</span>
                                </span>
                              </TD>
                              <TD><DeleteBtn onDelete={() => deleteRestaurant(r.id)} /></TD>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </SectionCard>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>All Orders</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{data.orders.length} total orders</p>
              </div>
              <SectionCard>
                {data.orders.length === 0 ? <EmptyState message="No orders yet" /> : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
                      <thead style={{ background: 'var(--border-light)' }}>
                        <tr><TH>Order ID</TH><TH>Customer</TH><TH>Restaurant</TH><TH>Amount</TH><TH>Status</TH><TH>Action</TH></tr>
                      </thead>
                      <tbody>
                        {data.orders.map(o => {
                          const sc = STATUS_COLORS[o.status] || STATUS_COLORS.PENDING;
                          return (
                            <tr key={o.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                              <TD><span style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{o.id}</span></TD>
                              <TD>{o.customer?.name || '—'}</TD>
                              <TD>{o.restaurant?.name || '—'}</TD>
                              <TD><strong>Rs. {o.totalAmount?.toFixed(2)}</strong></TD>
                              <TD>
                                <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, background: sc.bg, color: sc.color }}>
                                  {o.status}
                                </span>
                              </TD>
                              <TD><DeleteBtn onDelete={() => deleteOrder(o.id)} /></TD>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Review Moderation</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>{data.reviews.length} total reviews</p>
              </div>
              <SectionCard>
                {data.reviews.length === 0 ? <EmptyState message="No reviews yet" /> : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                      <thead style={{ background: 'var(--border-light)' }}>
                        <tr><TH>Reviewer</TH><TH>Rating</TH><TH>Comment</TH><TH>Action</TH></tr>
                      </thead>
                      <tbody>
                        {data.reviews.map(r => (
                          <tr key={r.id} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                            <TD><strong>{r.reviewerName || '—'}</strong></TD>
                            <TD>{'⭐'.repeat(r.rating)}</TD>
                            <TD style={{ maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                              {r.comment || '—'}
                            </TD>
                            <TD><DeleteBtn onDelete={() => deleteReview(r.id)} /></TD>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

        </main>
      </div>
    </>
  );
}