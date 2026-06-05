import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, Edit3, Trash2, Package, ChefHat, Image, X, 
  DollarSign, TrendingUp, ShoppingBag, List, LayoutDashboard,
  Moon, Sun
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';
import { restaurantAPI, foodAPI, orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OrderCard from '../components/OrderCard';

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} style={{ zIndex: 1000 }}>
      <div className="modal" style={{ maxWidth: '500px', width: '90%' }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '32px' }}>
        <div style={{ 
          width: '64px', height: '64px', background: '#FEE2E2', color: '#EF4444', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <Trash2 size={32} />
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner btn-spinner" /> : 'Delete Item'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('dashboardDarkMode') === 'true');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('dashboardDarkMode', darkMode);
  }, [darkMode]);

  // Live Polling for Orders
  useEffect(() => {
    if (!restaurant?.id) return;
    
    // Initial check to set the baseline
    orderAPI.getRestaurantOrders(restaurant.id).then(res => {
      setLastOrderCount(res.data?.length || 0);
    });

    const poll = setInterval(async () => {
      try {
        const oRes = await orderAPI.getRestaurantOrders(restaurant.id);
        const currentOrders = oRes.data || [];
        
        setLastOrderCount(prevCount => {
          if (currentOrders.length > prevCount && prevCount > 0) {
            const latest = currentOrders[currentOrders.length - 1];
            setNewOrderAlert(latest);
            toast.success(`🎉 New Order Received!`);
          }
          return currentOrders.length;
        });
        
        setOrders(currentOrders);
      } catch (e) {
        console.error("Polling failed", e);
      }
    }, 5000); // Increased speed: Poll every 5 seconds for a "Live" feel

    return () => clearInterval(poll);
  }, [restaurant?.id, toast]);

  const pendingCount = useMemo(() => orders.filter(o => o.status === 'PENDING').length, [orders]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('tab');
    if (t) {
      setTab(t);
      if (t === 'settings' && restaurant) {
        setRForm({ ...restaurant });
      }
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate, restaurant]);

  // Modals
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // stores food object to delete
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [rForm, setRForm] = useState({ name:'', description:'', address:'', contactNumber:'', imageUrl:'' });
  const [fForm, setFForm] = useState({ name:'', description:'', price:'', imageUrl:'', category: 'General', stockQuantity: 100 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    console.log("Dashboard: Loading data for user:", user?.id);
    setLoading(true);
    try {
      const [rRes, fRes] = await Promise.all([restaurantAPI.getAll(), foodAPI.getAll()]);
      const allRestaurants = rRes.data || [];
      console.log("Dashboard: All restaurants found:", allRestaurants.length);
      
      const mine = allRestaurants.find(r => String(r.ownerId || r.owner?.id) === String(user?.id));
      console.log("Dashboard: My restaurant:", mine?.name || "None Found");
      setRestaurant(mine);
      
      // Auto-fill form if we have a restaurant
      if (mine) {
        setRForm({ ...mine });
        const oRes = await orderAPI.getRestaurantOrders(mine.id);
        setOrders(oRes.data || []);
        
        const myFoods = await foodAPI.getAll();
        setFoods((myFoods.data || []).filter(f => String(f.restaurantId || f.restaurant?.id) === String(mine.id)));
      }
    } catch(e) { 
      console.error("Dashboard Load Error:", e);
      toast.error('Failed to connect to real-time data');
    } finally { 
      setLoading(false); 
    }
  };

  const dashboardStats = useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const ordersToday = orders.filter(o => {
      const oDate = (o.orderDate || o.createdAt || '').split('T')[0];
      return oDate === today;
    }).length;

    return { totalRevenue, ordersToday };
  }, [orders]);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = orders.filter(o => {
        const oDate = (o.orderDate || o.createdAt || '').split('T')[0];
        return oDate === date;
      });
      
      const daySales = dayOrders
        .filter(o => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      return { name: dayName, sales: daySales, orders: dayOrders.length };
    });
  }, [orders]);

  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null, reason: '' });

  const handleUpdateStatus = async (orderId, status, reason = '') => {
    try {
      await orderAPI.updateStatus(orderId, status, reason);
      toast.success(`Order ${status.toLowerCase()}!`);
      loadData();
      setCancelModal({ show: false, orderId: null, reason: '' });
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#F59E0B';
      case 'PREPARING': return '#3B82F6';
      case 'READY': return '#10B981';
      case 'DELIVERED': return '#64748B';
      case 'CANCELLED': return '#EF4444';
      default: return '#64748B';
    }
  };

  const handleImageUpload = (e, target) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'restaurant') setRForm(p => ({ ...p, imageUrl: reader.result }));
        else setFForm(p => ({ ...p, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    if (!restaurant?.id) {
      toast.error('No restaurant found! Please create your restaurant first.');
      return;
    }

    try {
      const payload = { 
        ...fForm, 
        price: parseFloat(fForm.price), // Ensure price is a number
        restaurantId: restaurant.id 
      };
      
      console.log('Sending payload:', payload);

      if (editingFood) {
        await foodAPI.update(editingFood.id, payload);
        toast.success('Menu item updated!');
      } else {
        const res = await foodAPI.add(payload);
        console.log('Save response:', res.data);
        toast.success('New item added to menu!');
      }
      setShowFoodForm(false);
      loadData();
    } catch(err) { 
      console.error('Save failed:', err);
      const msg = err.response?.data || 'Failed to save item';
      toast.error(typeof msg === 'string' ? msg : 'Internal Server Error');
    }
  };

  const handleDeleteFood = (food) => {
    setConfirmDelete(food);
  };

  const performDelete = async () => {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      await foodAPI.delete(confirmDelete.id);
      toast.success('Item removed successfully');
      setConfirmDelete(null);
      loadData();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to remove item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { 
    if (tab === 'overview') {
      setHasMounted(false);
      const timer = setTimeout(() => setHasMounted(true), 150);
      return () => clearTimeout(timer);
    }
  }, [tab]);

  if (loading) return <div className="container" style={{ padding: '100px', textAlign: 'center' }}><span className="spinner" /></div>;

  return (
    <div className={darkMode ? 'dark-dashboard' : ''} style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
      {/* Header Section */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '32px 0', transition: 'background 0.3s' }}>
        <div className="container">
          <div className="flex-resp">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Welcome back, {user?.name}</p>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                style={{ 
                  background: 'var(--border-light)', border: 'none', padding: '8px', 
                  borderRadius: '50%', cursor: 'pointer', color: 'var(--text-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }} className="no-scrollbar">
              <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
                <LayoutDashboard size={18} /> <span className="hide-mobile">Overview</span>
              </button>
              <button className={`tab-btn ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>
                <List size={18} /> <span className="hide-mobile">Menu</span>
              </button>
              <button className={`tab-btn ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')} style={{ position: 'relative' }}>
                <ShoppingBag size={18} /> 
                <span className="hide-mobile">Orders</span>
                {pendingCount > 0 && (
                  <span style={{ 
                    position: 'absolute', top: '0px', right: '4px', background: 'var(--error)', 
                    color: 'white', fontSize: '10px', fontWeight: 800, padding: '2px 5px', 
                    borderRadius: 'var(--radius-full)', minWidth: '16px', textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                  }}>
                    {pendingCount}
                  </span>
                )}
              </button>
              <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => { 
                setTab('settings'); 
                if (restaurant) setRForm({...restaurant}); 
              }}>
                <ChefHat size={18} /> <span className="hide-mobile">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '100px' }}>
        {tab === 'settings' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--surface)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Restaurant Settings</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Update your restaurant's public profile</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                if (restaurant?.id) {
                  await restaurantAPI.update(restaurant.id, rForm);
                  toast.success('Profile updated successfully!');
                  loadData();
                } else {
                  await restaurantAPI.add({...rForm, ownerId: user.id});
                  toast.success('Restaurant created!');
                  loadData();
                  setTab('overview');
                }
              } catch (err) {
                toast.error('Failed to save settings');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div className="input-group">
                <label className="input-label">Restaurant Name</label>
                <input className="input" value={rForm.name} onChange={e => setRForm(p=>({...p, name: e.target.value}))} required />
              </div>

              <div className="input-group">
                <label className="input-label">Short Description</label>
                <input className="input" value={rForm.description} onChange={e => setRForm(p=>({...p, description: e.target.value}))} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Contact Number</label>
                  <input className="input" value={rForm.contactNumber} onChange={e => setRForm(p=>({...p, contactNumber: e.target.value}))} />
                </div>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <input className="input" placeholder="e.g. Italian, Sri Lankan" value={rForm.category} onChange={e => setRForm(p=>({...p, category: e.target.value}))} />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Restaurant Address</label>
                <textarea className="input" rows="2" value={rForm.address} onChange={e => setRForm(p=>({...p, address: e.target.value}))} required />
              </div>

              <div className="input-group">
                <label className="input-label">Cover Image</label>
                <div 
                  onClick={() => document.getElementById('res-img-input').click()}
                  style={{ 
                    width: '100%', height: '160px', border: '2px dashed var(--border)', borderRadius: '16px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden', background: 'var(--surface-hover)', position: 'relative'
                  }}
                >
                  {rForm.imageUrl ? (
                    <img src={rForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <Image size={24} color="#64748B" />
                      <span style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>Upload Cover Photo</span>
                    </>
                  )}
                  <input id="res-img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'restaurant')} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '12px' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        )}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div className="card-stat">
                <div className="icon-box" style={{ background: '#EFF6FF', color: '#3B82F6' }}><TrendingUp size={24} /></div>
                <div>
                  <div className="label">Total Revenue</div>
                  <div className="value">Rs. {dashboardStats.totalRevenue.toLocaleString()}</div>
                </div>
              </div>
              <div className="card-stat">
                <div className="icon-box" style={{ background: '#F0FDF4', color: '#22C55E' }}><ShoppingBag size={24} /></div>
                <div>
                  <div className="label">Orders Today</div>
                  <div className="value">{dashboardStats.ordersToday}</div>
                </div>
              </div>
              <div className="card-stat">
                <div className="icon-box" style={{ background: '#FFF7ED', color: '#F97316' }}><Package size={24} /></div>
                <div>
                  <div className="label">Active Menu</div>
                  <div className="value">{foods.length} Items</div>
                </div>
              </div>
            </div>

            {/* Analytics Chart */}
            <div style={{
        background: 'var(--surface)',
        padding: '32px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        minHeight: '450px',
        width: '100%'
      }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Sales Performance</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Revenue trends for the last 7 days</p>
              </div>
              <div style={{ width: '100%', minHeight: '350px', position: 'relative' }}>
                {hasMounted && (
                  <ResponsiveContainer width="100%" height={300} debounce={1}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Menu Management</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Add, edit or remove items from your store</p>
              </div>
              <button className="btn btn-primary" onClick={() => { setEditingFood(null); setFForm({ name:'', description:'', price:'', imageUrl:'', category: 'General' }); setShowFoodForm(true); }}>
                <Plus size={18} /> Add New Item
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {foods.map(item => (
                <div key={item.id} className="food-manage-card">
                  <div className="food-img-container">
                    <img src={item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} alt={item.name} />
                    <div className="food-price-badge">Rs. {item.price}</div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 700 }}>{item.name}</h4>
                      <span className="category-tag">{item.category}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px', minHeight: '40px' }}>{item.description}</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => { setEditingFood(item); setFForm({...item}); setShowFoodForm(true); }}>
                        <Edit3 size={14} /> Edit
                      </button>
                      <button className="btn btn-danger-outline btn-sm" style={{ flex: 1 }} onClick={() => handleDeleteFood(item)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Live Orders</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Manage your active restaurant orders</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
              {orders.length > 0 ? (
                orders.map(o => (
                  <OrderCard 
                    key={o.id} 
                    order={o} 
                    isOwner 
                    onUpdateStatus={handleUpdateStatus}
                    onCancel={(id) => setCancelModal({ show: true, orderId: id, reason: '' })}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                  <ShoppingBag size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-secondary)' }}>No orders yet</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Orders from customers will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancelModal.show && (
        <Modal title="Reject Order" onClose={() => setCancelModal({ show: false, orderId: null, reason: '' })}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Please provide a reason for rejecting Order #{cancelModal.orderId}. This will be shown to the customer.
            </p>
            <textarea 
              className="input" 
              placeholder="e.g., We are currently out of ingredients for this item..." 
              value={cancelModal.reason}
              onChange={(e) => setCancelModal(p => ({ ...p, reason: e.target.value }))}
              style={{ minHeight: '120px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setCancelModal({ show: false, orderId: null, reason: '' })}>Back</button>
            <button 
              className="btn btn-danger" 
              style={{ flex: 2 }} 
              onClick={() => handleUpdateStatus(cancelModal.orderId, 'CANCELLED', cancelModal.reason)}
              disabled={!cancelModal.reason.trim()}
            >
              Confirm Rejection
            </button>
          </div>
        </Modal>
      )}

      {/* Food Form Modal */}
      {showFoodForm && (
        <Modal title={editingFood ? 'Edit Item' : 'Add New Item'} onClose={() => setShowFoodForm(false)}>
          <form onSubmit={handleSaveFood} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label className="input-label">Item Name</label>
              <input className="input" value={fForm.name} onChange={e => setFForm(p=>({...p, name: e.target.value}))} required />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group">
                <label className="input-label">Price (Rs.)</label>
                <input className="input" type="number" value={fForm.price} onChange={e => setFForm(p=>({...p, price: e.target.value}))} required />
              </div>
              <div className="input-group">
                <label className="input-label">Stock Quantity</label>
                <input className="input" type="number" value={fForm.stockQuantity} onChange={e => setFForm(p=>({...p, stockQuantity: e.target.value}))} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input" value={fForm.category} onChange={e => setFForm(p=>({...p, category: e.target.value}))}>
                  <option value="General">General</option>
                  <option value="Mains">Mains</option>
                  <option value="Starters">Starters</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" rows="3" value={fForm.description} onChange={e => setFForm(p=>({...p, description: e.target.value}))} />
            </div>

            <div className="input-group">
              <label className="input-label">Food Image</label>
              <div 
                onClick={() => document.getElementById('food-img-input').click()}
                style={{ 
                  width: '100%', height: '120px', border: '2px dashed var(--border)', borderRadius: '12px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', overflow: 'hidden', background: 'var(--surface-hover)'
                }}
              >
                {fForm.imageUrl ? (
                  <img src={fForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Upload size={20} color="#64748B" />
                    <span style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Upload Photo</span>
                  </>
                )}
                <input id="food-img-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, 'food')} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              {editingFood ? 'Update Item' : 'Add to Menu'}
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <ConfirmModal 
          title="Delete Menu Item?"
          message={`Are you sure you want to remove "${confirmDelete.name}"? This action cannot be undone.`}
          onConfirm={performDelete}
          onCancel={() => setConfirmDelete(null)}
          loading={deleteLoading}
        />
      )}

      {/* New Order Alert Popup */}
      {newOrderAlert && (
        <div className="modal-overlay" style={{ zIndex: 2000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="modal" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 32px', border: '2px solid var(--primary)', position: 'relative', overflow: 'visible' }}>
            <div style={{ 
              position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
              width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
              boxShadow: '0 8px 32px rgba(255, 69, 0, 0.4)', animation: 'pulse-alert 2s infinite'
            }}>
              <ShoppingBag size={40} />
            </div>
            
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginTop: '20px', marginBottom: '8px' }}>New Order! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You just received a new order for your restaurant.</p>
            
            <div style={{ background: 'var(--primary-bg)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--primary-light)' }}>
              <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Order Items</div>
              <div style={{ maxHeight: '120px', overflowY: 'auto', textAlign: 'left', marginBottom: '12px' }}>
                {(newOrderAlert.items || newOrderAlert.orderItems || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--primary-light)' }}>
                    <span><span style={{ fontWeight: 800 }}>{item.quantity || item.qty}x</span> {item.foodItem?.name || item.foodName || 'Item'}</span>
                    <span style={{ fontWeight: 600 }}>Rs. {(item.price || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '2px dashed var(--primary-light)', paddingTop: '12px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>Total Amount</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Rs. {newOrderAlert.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => {
                setTab('orders');
                setNewOrderAlert(null);
              }}>
                View & Accept Order
              </button>
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setNewOrderAlert(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-alert {
          0% { transform: translateX(-50%) scale(1); box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.7); }
          70% { transform: translateX(-50%) scale(1.05); box-shadow: 0 0 0 15px rgba(255, 69, 0, 0); }
          100% { transform: translateX(-50%) scale(1); box-shadow: 0 0 0 0 rgba(255, 69, 0, 0); }
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-lg);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background: var(--primary-bg);
          color: var(--primary);
        }
        .card-stat {
          background: white;
          padding: 24px;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 20px;
          box-shadow: var(--shadow-sm);
        }
        .card-stat .icon-box {
          flex-direction: column;
          gap: 8px;
        }
        .card-stat .label {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        .card-stat .value {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-primary);
        }
        .food-manage-card {
          background: white;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: transform 0.2s;
        }
        .food-manage-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }
        .food-img-container {
          height: 180px;
          position: relative;
        }
        .food-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .food-price-badge {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: white;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-weight: 800;
          font-size: 14px;
          box-shadow: var(--shadow-sm);
          color: var(--primary);
        }
        .category-tag {
          font-size: 11px;
          background: #F1F5F9;
          color: #64748B;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .btn-danger-outline {
          border: 1px solid #FEE2E2;
          background: white;
          color: #EF4444;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
        }
        .btn-danger-outline:hover {
          background: #FEF2F2;
        }
        
        /* Dark Mode Overrides for Dashboard */
        .dark-dashboard {
          --bg: #0F172A;
          --surface: #1E293B;
          --surface-hover: #334155;
          --text-primary: #F8FAFC;
          --text-secondary: #94A3B8;
          --border: #334155;
          --border-light: #1E293B;
          --primary-bg: rgba(255, 69, 0, 0.1);
        }
        
        .dark-dashboard .card-stat,
        .dark-dashboard .food-manage-card {
          background: var(--surface);
          border-color: var(--border);
        }
        
        .dark-dashboard .food-price-badge {
          background: var(--surface);
          color: var(--primary);
        }
        
        .dark-dashboard .input {
          background: var(--bg);
          color: var(--text-primary);
          border-color: var(--border);
        }
        
        .dark-dashboard .modal {
          background: var(--surface);
        }
        
        .dark-dashboard .tab-btn.active {
          background: var(--primary-bg);
        }
      `}</style>
    </div>
  );
}
