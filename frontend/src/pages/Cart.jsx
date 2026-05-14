import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, MapPin, CreditCard, Banknote, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderAPI } from '../utils/api';
import LocationPicker from '../components/LocationPicker';

import Swal from 'sweetalert2';

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, totalPrice, totalItems, restaurantId, restaurantName } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [placing, setPlacing] = useState(false);
  const [orderType, setOrderType] = useState('DELIVERY');

  const deliveryFee = orderType === 'DELIVERY' ? 150 : 0;
  const total = totalPrice + deliveryFee;

  const handlePlaceOrder = async () => {
    if (orderType === 'DELIVERY' && !address.trim()) { 
      toast.error('Please select your delivery location first! 📍'); 
      return; 
    }

    const userPhone = user?.phone || user?.phoneNumber;
    if (!userPhone || userPhone === 'N/A' || userPhone.trim() === '') {
      toast.error('Please update your profile with a valid phone number before ordering! 📱');
      return;
    }
    
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
        deliveryAddress: orderType === 'PICKUP' ? 'PICK UP AT RESTAURANT' : address,
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
      
      Swal.fire({
        title: 'Order Placed! 🎉',
        text: 'Your delicious food is being prepared. You can track it in your orders.',
        icon: 'success',
        confirmButtonText: 'View My Orders',
        confirmButtonColor: 'var(--primary)',
        backdrop: `rgba(26, 26, 46, 0.4)`,
        padding: '2em',
        borderRadius: '20px',
        customClass: {
          title: 'swal-title-custom',
          confirmButton: 'swal-button-custom'
        }
      }).then(() => {
        navigate('/orders');
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  // MD5 Hashing for PayHere Security
  const md5 = (s) => {
    var k = [], i = 0;
    for (; i < 64;) k[i] = 0 | (Math.abs(Math.sin(++i)) * 4294967296);
    var a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
    var x = [], j = 0;
    var str = unescape(encodeURIComponent(s));
    for (i = 0; i < str.length; i++) x[i >> 2] |= (str.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    x[str.length >> 2] |= 0x80 << ((str.length % 4) * 8);
    var n = ((str.length + 8) >> 6 << 4) + 16;
    while (x.length < n) x.push(0);
    x[n - 2] = str.length * 8;
    for (i = 0; i < x.length; i += 16) {
      var a0 = a, b0 = b, c0 = c, d0 = d;
      for (j = 0; j < 64; j++) {
        var f, g;
        if (j < 16) { f = (b & c) | (~b & d); g = j; }
        else if (j < 32) { f = (d & b) | (~d & c); g = (5 * j + 1) % 16; }
        else if (j < 48) { f = b ^ c ^ d; g = (3 * j + 5) % 16; }
        else { f = c ^ (b | ~d); g = (7 * j) % 16; }
        var t = d; d = c; c = b;
        var s_val = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][(Math.floor(j / 16) << 2) | (j % 4)];
        b = (b + rotateLeft((a + f + k[j] + (x[i + g] || 0)) | 0, s_val)) | 0;
        a = t;
      }
      a = (a + a0) | 0; b = (b + b0) | 0; c = (c + c0) | 0; d = (d + d0) | 0;
    }
    return (hex(a) + hex(b) + hex(c) + hex(d)).toLowerCase();
    function rotateLeft(n, s) { return (n << s) | (n >>> (32 - s)); }
    function hex(n) {
      var s = "", v;
      for (var i = 0; i < 4; i++) {
        v = (n >>> (i * 8)) & 0xff;
        s += (v < 16 ? "0" : "") + v.toString(16);
      }
      return s;
    }
  };

  const startPayHere = () => {
    const merchantId = "1235611"; 
    const merchantSecret = "NDAyNDA3OTc1MDE4MzYxNTE5NTgxNDU3MzMzNjMzNTU5NTA4NTI1"; 
    
    const orderId = "ORD" + Math.floor(Math.random() * 100000);
    const amount = total.toFixed(2);
    const currency = "LKR";

    const hashedSecret = md5(merchantSecret).toUpperCase();
    const hash = md5(merchantId + orderId + amount + currency + hashedSecret).toUpperCase();

    const payment = {
      sandbox: true,
      merchant_id: merchantId,
      return_url: window.location.origin + "/orders",
      cancel_url: window.location.origin + "/cart",
      notify_url: "http://sample.com/notify",
      order_id: orderId,
      items: "CraveCart Order",
      amount: amount,
      currency: currency,
      hash: hash, 
      first_name: user.name?.split(' ')[0] || "Valued",
      last_name: user.name?.split(' ')[1] || "Customer",
      email: user.email || "customer@cravecart.com",
      phone: user.phone || "0771234567",
      address: address || "Colombo, Sri Lanka",
      city: "Colombo",
      country: "Sri Lanka",
    };

    // Ensure PayHere script is loaded before proceeding
    if (!window.payhere) {
      if (window.__payhereLoading) {
        toast.info('Waiting for PayHere to load...');
        return;
      }
      window.__payhereLoading = true;
      toast.info('Connecting to PayHere... 📡');
      const script = document.createElement('script');
      script.src = "https://www.payhere.lk/lib/payhere.js";
      script.async = true;
      script.onload = () => {
        toast.success('PayHere Ready! 💳');
        window.__payhereLoading = false;
        startPayHere(); 
      };
      script.onerror = () => {
        toast.error('Could not load PayHere. Please check connection or disable blockers! 🚫');
        window.__payhereLoading = false;
      };
      document.head.appendChild(script);
      return;
    }

    window.payhere.onCompleted = function onCompleted(orderId) {
      toast.success('Payment Successful! 💳');
      executeOrderPlacement();
    };

    window.payhere.onDismissed = function onDismissed() {
      toast.error('Payment Cancelled');
    };

    window.payhere.onError = function onError(error) {
      toast.error('PayHere Error: ' + error);
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

          <button 
            onClick={() => {
              Swal.fire({
                title: 'Clear your cart?',
                text: "You will lose all items added from " + (restaurantName || "this restaurant"),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'var(--error)',
                cancelButtonColor: 'var(--text-muted)',
                confirmButtonText: 'Yes, clear it',
                borderRadius: '16px',
                backdrop: `rgba(26, 26, 46, 0.4)`
              }).then((result) => {
                if (result.isConfirmed) {
                  clearCart();
                  toast.success('Cart cleared');
                }
              });
            }} 
            className="btn btn-danger btn-sm" 
            style={{ alignSelf: 'flex-start', marginTop: '8px' }}
          >
            <Trash2 size={14} />
            Clear Cart
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

          {/* Order Type Toggle */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '5px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setOrderType('DELIVERY')}
              style={{ 
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
                background: orderType === 'DELIVERY' ? '#FF4500' : 'transparent', 
                color: orderType === 'DELIVERY' ? 'white' : 'var(--text-secondary)', 
                fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                boxShadow: orderType === 'DELIVERY' ? '0 4px 12px rgba(255, 69, 0, 0.2)' : 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              🚚 Delivery
            </button>
            <button 
              onClick={() => setOrderType('PICKUP')}
              style={{ 
                flex: 1, padding: '12px', borderRadius: '12px', border: 'none', 
                background: orderType === 'PICKUP' ? '#FF4500' : 'transparent', 
                color: orderType === 'PICKUP' ? 'white' : 'var(--text-secondary)', 
                fontWeight: 800, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                boxShadow: orderType === 'PICKUP' ? '0 4px 12px rgba(255, 69, 0, 0.2)' : 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
              }}
            >
              🥡 Pick-Up
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            {orderType === 'DELIVERY' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Delivery fee</span>
                <span>Rs. {deliveryFee.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '24px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>Rs. {total.toLocaleString()}</span>
          </div>

          {/* Delivery address - only for delivery */}
          {orderType === 'DELIVERY' && (
            <div className="input-group" style={{ marginBottom: '20px' }}>
              <label className="input-label">Select Delivery Location</label>
              <LocationPicker onAddressSelect={setAddress} />
              
              {address && (
                <div style={{ 
                  background: 'var(--primary-bg)', padding: '12px', borderRadius: '12px',
                  border: '1px solid var(--primary-light)', fontSize: '13px', color: 'var(--primary-dark)',
                  display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '12px'
                }}>
                  <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{address}</span>
                </div>
              )}
            </div>
          )}

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
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{orderType === 'PICKUP' ? 'Cash' : 'Cash on Delivery'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{orderType === 'PICKUP' ? 'Pay at the restaurant' : 'Pay when you receive food'}</div>
                </div>
                {paymentMethod === 'CASH_ON_DELIVERY' && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} /></div>}
              </div>

              <div 
                onClick={() => setPaymentMethod('CARD')}
                style={{ 
                  padding: '16px', borderRadius: '16px', border: `2.5px solid ${paymentMethod === 'CARD' ? 'var(--primary)' : 'var(--border)'}`,
                  background: paymentMethod === 'CARD' ? 'var(--primary-bg)' : 'white',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: paymentMethod === 'CARD' ? '0 4px 12px rgba(255, 69, 0, 0.1)' : 'none'
                }}
              >
                <div style={{ 
                  width: '44px', height: '44px', borderRadius: '12px', background: paymentMethod === 'CARD' ? 'var(--primary)' : '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: paymentMethod === 'CARD' ? 'white' : '#64748B', transition: 'all 0.3s'
                }}>
                  <CreditCard size={22} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>Card Payment</div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" style={{ height: '10px', filter: paymentMethod === 'CARD' ? 'none' : 'grayscale(1)', opacity: 0.8 }} />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" style={{ height: '14px', filter: paymentMethod === 'CARD' ? 'none' : 'grayscale(1)', opacity: 0.8 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pay securely via PayHere Gateway</div>
                </div>
                {paymentMethod === 'CARD' && <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(255,69,0,0.3)' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} /></div>}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '18px', marginTop: '8px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(16, 185, 129, 0.05)', padding: '8px 16px', borderRadius: '50px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <Shield size={14} color="#10B981" /> 
              <span style={{ fontWeight: 600, color: '#059669' }}>Verified Secure Payment by PayHere</span>
            </div>
          </div>

          {orderType === 'DELIVERY' && !address && (
            <div style={{ 
              textAlign: 'center', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.08)', 
              padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)',
              animation: 'pulse-warning 2s infinite ease-in-out'
            }}>
              <div style={{ color: 'var(--error)', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <MapPin size={16} /> <span>Please Pick Your Delivery Location on the Map</span>
              </div>
            </div>
          )}

          <button 
            className="btn btn-primary btn-lg" 
            style={{ 
              width: '100%', height: '56px', fontSize: '18px', borderRadius: '16px',
              boxShadow: (orderType === 'DELIVERY' && !address) ? 'none' : '0 8px 24px rgba(255, 69, 0, 0.25)', 
              gap: '10px',
              opacity: (orderType === 'DELIVERY' && !address) ? 0.6 : 1,
              cursor: (orderType === 'DELIVERY' && !address) ? 'not-allowed' : 'pointer'
            }} 
            onClick={handlePlaceOrder} 
            disabled={placing || (orderType === 'DELIVERY' && !address)}
          >
            {placing ? <><span className="spinner" /> Processing…</> : <>Place Order <ArrowRight size={20} /></>}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse-warning {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.2); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @media(max-width:768px){
            grid-template-columns:1fr!important;
          }
          div[style*="position: sticky"]{
            position:static!important;
          }
      `}</style>
    </div>
  );
}
