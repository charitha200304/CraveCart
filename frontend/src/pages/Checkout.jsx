import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { MapPin, CreditCard, Wallet, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart, restaurantId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState({
    deliveryAddress: user?.address || '',
    phone: user?.phone || '',
    notes: '',
    paymentMethod: 'cod'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customerId: user?.id,
        restaurantId: restaurantId,
        items: cartItems.map(item => ({
          foodItemId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getCartTotal() + 50,
        deliveryAddress: formData.deliveryAddress,
        phone: formData.phone,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod
      };

      await axios.post(API_ENDPOINTS.PLACE_ORDER, orderData);
      setOrderPlaced(true);
      clearCart();
      
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-slate-bg flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-success" />
          </div>
          <h2 className="text-3xl font-bold text-navy mb-4">Order Placed!</h2>
          <p className="text-muted mb-8">
            Your order has been placed successfully. You will be redirected to your orders page shortly.
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 3 }}
              className="h-full bg-coral"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Delivery Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="card-static p-6">
                <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-coral" />
                  Delivery Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Full Address
                    </label>
                    <textarea
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Enter your delivery address"
                      rows={3}
                      className="input-field resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions?"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card-static p-6">
                <h2 className="text-xl font-bold text-navy mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-coral" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'cod' ? 'border-coral bg-coral-light' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.paymentMethod === 'cod' ? 'border-coral' : 'border-gray-300'
                    }`}>
                      {formData.paymentMethod === 'cod' && (
                        <div className="w-3 h-3 rounded-full bg-coral" />
                      )}
                    </div>
                    <Wallet className="w-6 h-6 text-muted" />
                    <div>
                      <p className="font-medium text-navy">Cash on Delivery</p>
                      <p className="text-sm text-muted">Pay when you receive your order</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    formData.paymentMethod === 'card' ? 'border-coral bg-coral-light' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      formData.paymentMethod === 'card' ? 'border-coral' : 'border-gray-300'
                    }`}>
                      {formData.paymentMethod === 'card' && (
                        <div className="w-3 h-3 rounded-full bg-coral" />
                      )}
                    </div>
                    <CreditCard className="w-6 h-6 text-muted" />
                    <div>
                      <p className="font-medium text-navy">Card Payment</p>
                      <p className="text-sm text-muted">Pay securely with your card</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card-static p-6 sticky top-24">
                <h2 className="text-xl font-bold text-navy mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=60&h=60&fit=crop'}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-navy text-sm truncate">{item.name}</p>
                        <p className="text-muted text-xs">x{item.quantity}</p>
                      </div>
                      <p className="font-medium text-navy text-sm">
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="text-navy">Rs. {getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Delivery</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Service Fee</span>
                    <span className="text-navy">Rs. 50.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-100">
                    <span className="text-navy">Total</span>
                    <span className="text-coral">Rs. {(getCartTotal() + 50).toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : (
                    'Place Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
