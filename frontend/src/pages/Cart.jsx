import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderAPI } from '../utils/api';

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, totalPrice, totalItems, restaurantId, restaurantName } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  const delivery = 150;
  const total = totalPrice + delivery;

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error('Please enter a delivery address'); return; }
    setPlacing(true);
    try {
      const payload = {
        customerId: user.id,
        restaurantId,
        deliveryAddress: address,
        totalAmount: total,
        orderItems: items.map(i => ({
          foodId: i.id,
          foodName: i.name,
          quantity: i.qty,
          price: i.price,
        })),
      };
      await orderAPI.place(payload);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) return (
    <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="empty-state">
        <ShoppingCart size={80} className="empty-state-icon" />
        <h3>Your cart is empty</h3>
        <p>Add some delicious items from our restaurants to get started</p>
        <Link to="/restaurants" className="btn btn-primary btn-lg">Browse Restaurants</Link>
      </div>
    </div>
  );

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Link to="/restaurants" className="btn btn-ghost" style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '28px' }}>Your Cart</h1>
          {restaurantName && <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '2px' }}>from {restaurantName}</p>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', transition: 'all 0.2s' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'}
                  alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{item.name}</h4>
                <p className="price price-primary" style={{ fontSize: '16px' }}>Rs. {Number(item.price).toLocaleString()}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                  <span className="qty-value">{item.qty}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
                <div style={{ fontWeight: 700, fontSize: '15px', minWidth: '80px', textAlign: 'right' }}>
                  Rs. {(item.price * item.qty).toLocaleString()}
                </div>
                <button onClick={() => removeItem(item.id)} style={{ color: 'var(--error)', padding: '6px', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="btn btn-danger btn-sm" style={{ alignSelf: 'flex-start', marginTop: '8px' }}>
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '28px', position: 'sticky', top: '80px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '24px' }}>Order Summary</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{item.name} × {item.qty}</span>
                <span style={{ fontWeight: 500 }}>Rs. {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery fee</span>
              <span>Rs. {delivery.toLocaleString()}</span>
            </div>
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>Rs. {total.toLocaleString()}</span>
          </div>

          {/* Delivery address */}
          <div className="input-group" style={{ marginBottom: '20px' }}>
            <label className="input-label">Delivery Address</label>
            <div className="input-icon">
              <MapPin size={17} className="icon" />
              <textarea className="input" placeholder="Enter your full delivery address…" value={address}
                onChange={e => setAddress(e.target.value)} style={{ minHeight: '80px', paddingLeft: '44px', paddingTop: '12px' }} />
            </div>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handlePlaceOrder} disabled={placing}>
            {placing ? <><span className="spinner" /> Placing Order…</> : <>Place Order <ArrowRight size={18} /></>}
          </button>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){
          div[style*="gridTemplateColumns: 1fr 360px"]{
            grid-template-columns:1fr!important;
          }
          div[style*="position: sticky"]{
            position:static!important;
          }
        }
      `}</style>
    </div>
  );
}
