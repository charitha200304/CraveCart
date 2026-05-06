import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, MapPin, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderAPI } from '../utils/api';
import LocationPicker from '../components/LocationPicker';

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, totalPrice, totalItems, restaurantId, restaurantName } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [placing, setPlacing] = useState(false);

  const delivery = 150;
  const total = totalPrice + delivery;

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error('Please select a delivery location'); return; }
    
    if (paymentMethod === 'CARD') {
      startPayHere();
      return;
    }

    await executeOrderPlacement();
  };

  const executeOrderPlacement = async () => {
    setPlacing(true);
    try {
      const payload = {
        customerId: Number(user.id),
        restaurantId: Number(restaurantId),
        deliveryAddress: address,
        totalAmount: total,
        paymentMethod: paymentMethod,
        contactNumber: user.phone || 'N/A',
        items: items.map(i => ({
          foodItemId: Number(i.id),
          quantity: i.qty
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

  const startPayHere = () => {
    // PayHere Sandbox Configuration
    const payment = {
      sandbox: true,
      merchant_id: "1211149",       // Replace with your Merchant ID
      return_url: window.location.href,
      cancel_url: window.location.href,
      notify_url: "http://sample.com/notify", // Backend notify endpoint
      order_id: "ORD-" + Math.floor(Math.random() * 100000),
      items: restaurantName + " Order",
      amount: total,
      currency: "LKR",
      first_name: user.name?.split(' ')[0] || "Customer",
      last_name: user.name?.split(' ')[1] || "User",
      email: user.email,
      phone: "0771234567",
      address: address,
      city: "Colombo",
      country: "Sri Lanka",
    };

    window.payhere.onCompleted = function onCompleted(orderId) {
      console.log("Payment completed. OrderID:" + orderId);
      executeOrderPlacement();
    };

    window.payhere.onDismissed = function onDismissed() {
      console.log("Payment dismissed");
      toast.error('Payment was cancelled');
    };

    window.payhere.onError = function onError(error) {
      console.log("Error:"  + error);
      toast.error('Payment failed. Please try again.');
    };

    window.payhere.startPayment(payment);
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
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
        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', padding: '28px' }}>
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
            <label className="input-label">Select Delivery Location</label>
            <LocationPicker onAddressSelect={setAddress} />
            
            {address && (
              <div style={{ 
                background: 'var(--primary-bg)', padding: '12px', borderRadius: '12px',
                border: '1px solid var(--primary-light)', fontSize: '13px', color: 'var(--primary-dark)',
                display: 'flex', gap: '8px', alignItems: 'flex-start'
              }}>
                <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{address}</span>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="input-group" style={{ marginBottom: '24px' }}>
            <label className="input-label">Payment Method</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div 
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                style={{ 
                  padding: '16px', borderRadius: '12px', border: `2px solid ${paymentMethod === 'CASH_ON_DELIVERY' ? 'var(--primary)' : 'var(--border)'}`,
                  background: paymentMethod === 'CASH_ON_DELIVERY' ? 'var(--primary-bg)' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', background: paymentMethod === 'CASH_ON_DELIVERY' ? 'var(--primary)' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: paymentMethod === 'CASH_ON_DELIVERY' ? 'white' : '#64748B'
                }}>
                  <Banknote size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Cash on Delivery</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pay when you receive food</div>
                </div>
                {paymentMethod === 'CASH_ON_DELIVERY' && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} /></div>}
              </div>

              <div 
                onClick={() => setPaymentMethod('CARD')}
                style={{ 
                  padding: '16px', borderRadius: '12px', border: `2px solid ${paymentMethod === 'CARD' ? 'var(--primary)' : 'var(--border)'}`,
                  background: paymentMethod === 'CARD' ? 'var(--primary-bg)' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '10px', background: paymentMethod === 'CARD' ? 'var(--primary)' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: paymentMethod === 'CARD' ? 'white' : '#64748B'
                }}>
                  <CreditCard size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>Card Payment</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pay securely via Card</div>
                </div>
                {paymentMethod === 'CARD' && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} /></div>}
              </div>
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
