import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Package, ChefHat, Image, X, DollarSign } from 'lucide-react';
import { restaurantAPI, foodAPI, orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OrderCard from '../components/OrderCard';

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
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

  // Modals
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  const [rForm, setRForm] = useState({ name:'', description:'', address:'', contactNumber:'', image:null });
  const [fForm, setFForm] = useState({ name:'', description:'', price:'', image:null });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rRes, fRes] = await Promise.all([restaurantAPI.getAll(), foodAPI.getAll()]);
      const allRestaurants = rRes.data || [];
      // Find owner's restaurant (by ownerId or first one if only one)
      const mine = allRestaurants.find(r => String(r.ownerId) === String(user?.id)) || allRestaurants[0];
      setRestaurant(mine);
      if (mine) {
        const myFoods = (fRes.data || []).filter(f => String(f.restaurantId) === String(mine.id) || String(f.restaurant?.id) === String(mine.id));
        setFoods(myFoods);
        // Simulated orders - in real app: orderAPI.getByRestaurant(mine.id)
        try {
          const oRes = await orderAPI.getByCustomer(user.id);
          setOrders(oRes.data || []);
        } catch { setOrders([]); }
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSaveRestaurant = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(rForm).forEach(([k,v]) => { if(v) fd.append(k,v); });
    if(user?.id) fd.append('ownerId', user.id);
    try {
      if (restaurant) {
        await restaurantAPI.update(restaurant.id, { ...rForm, ownerId: user.id });
      } else {
        await restaurantAPI.add(fd);
      }
      toast.success(restaurant ? 'Restaurant updated!' : 'Restaurant created!');
      setShowRestaurantForm(false);
      loadData();
    } catch(err) { toast.error(err.response?.data?.message || 'Failed to save restaurant'); }
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(fForm).forEach(([k,v]) => { if(v) fd.append(k,v); });
    if(restaurant?.id) fd.append('restaurantId', restaurant.id);
    try {
      if (editingFood) {
        await foodAPI.update(editingFood.id, { ...fForm, restaurantId: restaurant.id });
        toast.success('Food item updated!');
      } else {
        await foodAPI.add(fd);
        toast.success('Food item added!');
      }
      setShowFoodForm(false);
      setEditingFood(null);
      setFForm({ name:'', description:'', price:'', image:null });
      loadData();
    } catch(err) { toast.error(err.response?.data?.message || 'Failed to save food item'); }
  };

  const handleDeleteFood = async (id) => {
    if (!confirm('Delete this food item?')) return;
    try {
      await foodAPI.delete(id);
      toast.success('Food item deleted');
      loadData();
    } catch { toast.error('Failed to delete'); }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      toast.success('Order status updated!');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch { toast.error('Failed to update status'); }
  };

  const openEditFood = (food) => {
    setEditingFood(food);
    setFForm({ name: food.name, description: food.description || '', price: food.price, image: null });
    setShowFoodForm(true);
  };

  const stats = [
    { label: 'Menu Items', value: foods.length, color: 'var(--primary)' },
    { label: 'Total Orders', value: orders.length, color: '#3B82F6' },
    { label: 'Revenue', value: `Rs. ${orders.reduce((s,o) => s + (o.totalAmount||0), 0).toLocaleString()}`, color: 'var(--success)' },
    { label: 'Pending', value: orders.filter(o=>o.status==='PENDING').length, color: 'var(--warning)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="page-title">Owner Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
                Welcome back, {user?.name}
              </p>
            </div>
            {!restaurant && (
              <button className="btn btn-primary" onClick={() => setShowRestaurantForm(true)}>
                <Plus size={16} /> Add My Restaurant
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '24px', flexWrap: 'wrap' }}>
            {['overview','menu','orders'].map(t => (
              <button key={t} className={`tab-item ${tab===t?'active':''}`} onClick={() => setTab(t)}
                style={{ textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {/* Overview */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Stats */}
            <div className="grid-4">
              {stats.map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color, fontSize: '28px' }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Restaurant info */}
            {restaurant ? (
              <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {restaurant.imageUrl && (
                  <div style={{ height: '200px', overflow: 'hidden' }}>
                    <img src={restaurant.imageUrl} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{restaurant.name}</h2>
                    {restaurant.description && <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>{restaurant.description}</p>}
                    {restaurant.address && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>📍 {restaurant.address}</p>}
                    {restaurant.contactNumber && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>📞 {restaurant.contactNumber}</p>}
                  </div>
                  <button className="btn btn-secondary" onClick={() => { setRForm({ name: restaurant.name, description: restaurant.description||'', address: restaurant.address||'', contactNumber: restaurant.contactNumber||'', image: null }); setShowRestaurantForm(true); }}>
                    <Edit3 size={15} /> Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '60px' }}>
                <ChefHat size={64} className="empty-state-icon" />
                <h3>No restaurant yet</h3>
                <p>Add your restaurant to start listing food items and receiving orders</p>
                <button className="btn btn-primary" onClick={() => setShowRestaurantForm(true)}><Plus size={16} /> Add Restaurant</button>
              </div>
            )}
          </div>
        )}

        {/* Menu */}
        {tab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px' }}>Menu Items ({foods.length})</h2>
              {restaurant && (
                <button className="btn btn-primary" onClick={() => { setEditingFood(null); setFForm({ name:'', description:'', price:'', image:null }); setShowFoodForm(true); }}>
                  <Plus size={16} /> Add Item
                </button>
              )}
            </div>

            {!restaurant ? (
              <div className="empty-state"><p>Create your restaurant first to manage menu items</p></div>
            ) : foods.length === 0 ? (
              <div className="empty-state">
                <Package size={64} className="empty-state-icon" />
                <h3>No menu items</h3>
                <p>Add your first food item to start taking orders</p>
                <button className="btn btn-primary" onClick={() => setShowFoodForm(true)}><Plus size={16} /> Add First Item</button>
              </div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map(food => (
                      <tr key={food.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--border-light)' }}>
                              {food.imageUrl
                                ? <img src={food.imageUrl} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} color="var(--text-muted)" /></div>
                              }
                            </div>
                            <span style={{ fontWeight: 600 }}>{food.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', maxWidth: '200px' }}>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {food.description || '—'}
                          </span>
                        </td>
                        <td><span className="price price-primary">Rs. {Number(food.price).toLocaleString()}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEditFood(food)}><Edit3 size={14} /></button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFood(food.id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '22px', marginBottom: '24px' }}>Orders ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="empty-state">
                <Package size={64} className="empty-state-icon" />
                <h3>No orders yet</h3>
                <p>Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map(o => <OrderCard key={o.id} order={o} onUpdateStatus={handleUpdateOrderStatus} isOwner />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Restaurant Form Modal */}
      {showRestaurantForm && (
        <Modal title={restaurant ? 'Edit Restaurant' : 'Add Restaurant'} onClose={() => setShowRestaurantForm(false)}>
          <form onSubmit={handleSaveRestaurant} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Restaurant Name *</label>
              <input className="input" placeholder="e.g. Spice Garden" value={rForm.name}
                onChange={e => setRForm(p=>({...p,name:e.target.value}))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" placeholder="What makes your restaurant special?" value={rForm.description}
                onChange={e => setRForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Address</label>
              <input className="input" placeholder="Full restaurant address" value={rForm.address}
                onChange={e => setRForm(p=>({...p,address:e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Contact Number</label>
              <input className="input" placeholder="+94 77 123 4567" value={rForm.contactNumber}
                onChange={e => setRForm(p=>({...p,contactNumber:e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Restaurant Image</label>
              <input className="input" type="file" accept="image/*" onChange={e => setRForm(p=>({...p,image:e.target.files[0]}))} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowRestaurantForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Restaurant</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Food Form Modal */}
      {showFoodForm && (
        <Modal title={editingFood ? 'Edit Food Item' : 'Add Food Item'} onClose={() => { setShowFoodForm(false); setEditingFood(null); }}>
          <form onSubmit={handleSaveFood} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">Item Name *</label>
              <input className="input" placeholder="e.g. Chicken Biryani" value={fForm.name}
                onChange={e => setFForm(p=>({...p,name:e.target.value}))} required />
            </div>
            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea className="input" placeholder="Describe this dish…" value={fForm.description}
                onChange={e => setFForm(p=>({...p,description:e.target.value}))} />
            </div>
            <div className="input-group">
              <label className="input-label">Price (Rs.) *</label>
              <div className="input-icon">
                <DollarSign size={17} className="icon" />
                <input className="input" type="number" min="1" placeholder="350" value={fForm.price}
                  onChange={e => setFForm(p=>({...p,price:e.target.value}))} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Food Image</label>
              <input className="input" type="file" accept="image/*" onChange={e => setFForm(p=>({...p,image:e.target.files[0]}))} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setShowFoodForm(false); setEditingFood(null); }}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingFood ? 'Update Item' : 'Add Item'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
