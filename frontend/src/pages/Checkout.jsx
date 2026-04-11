import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Phone, CreditCard, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import styles from './Checkout.module.css';

export default function Checkout() {
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    contactNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { cartItems, restaurantId, clearCart, getCartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const total = getCartTotal();
  const deliveryFee = 150;
  const grandTotal = total + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!formData.deliveryAddress || !formData.contactNumber) {
      setError('Please fill in all delivery details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        customerId: 1, // In real app, get from auth context
        restaurantId: restaurantId,
        items: cartItems.map(item => ({
          foodItemId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        deliveryAddress: formData.deliveryAddress,
        contactNumber: formData.contactNumber,
        totalAmount: grandTotal,
      };

      await axios.post(API_ENDPOINTS.PLACE_ORDER, orderData);
      
      setSuccess(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !success) {
    return (
      <main className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <p>Your cart is empty</p>
            <Link to="/restaurants" className="btn btn-primary">
              Browse Restaurants
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className={styles.page}>
        <div className="container">
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <CheckCircle size={64} />
            </div>
            <h2 className={styles.successTitle}>Order Placed Successfully!</h2>
            <p className={styles.successText}>
              Your order has been placed and will be delivered soon.
            </p>
            <p className={styles.redirectText}>Redirecting to orders...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Checkout</h1>

        <div className={styles.layout}>
          {/* Checkout Form */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && (
                <div className={styles.error}>
                  {error}
                </div>
              )}

              {!isAuthenticated && (
                <div className={styles.authNotice}>
                  <p>Please sign in to complete your order</p>
                  <Link to="/login" className="btn btn-primary">
                    Sign In
                  </Link>
                </div>
              )}

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <MapPin size={20} />
                  Delivery Address
                </h2>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  className={`input ${styles.textarea}`}
                  placeholder="Enter your full delivery address..."
                  rows={3}
                  required
                />
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <Phone size={20} />
                  Contact Number
                </h2>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <CreditCard size={20} />
                  Payment Method
                </h2>
                <div className={styles.paymentOption}>
                  <input
                    type="radio"
                    id="cod"
                    name="payment"
                    value="cod"
                    defaultChecked
                  />
                  <label htmlFor="cod">Cash on Delivery</label>
                </div>
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={loading || !isAuthenticated}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order - Rs. ${grandTotal.toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
            <div className={styles.items}>
              {cartItems.map(item => (
                <div key={item.id} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                  <span className={styles.itemPrice}>
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Delivery Fee</span>
                <span>Rs. {deliveryFee.toFixed(2)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.total}`}>
                <span>Total</span>
                <span>Rs. {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
