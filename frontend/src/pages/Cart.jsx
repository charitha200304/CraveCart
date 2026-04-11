import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-bg flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-muted-light" />
          </div>
          <h2 className="text-2xl font-bold text-navy mb-2">Your cart is empty</h2>
          <p className="text-muted mb-8">Add some delicious items to get started!</p>
          <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Browse Restaurants
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-navy">Your Cart</h1>
          <button
            onClick={clearCart}
            className="text-error text-sm font-medium hover:underline"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card-static p-4 flex gap-4"
              >
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop'}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-navy text-lg">{item.name}</h3>
                  <p className="text-muted text-sm line-clamp-1">{item.description}</p>
                  <p className="text-coral font-bold text-lg mt-2">
                    Rs. {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-error hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 rounded-xl bg-slate-bg flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-navy w-8 text-center text-lg">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-coral text-white flex items-center justify-center hover:bg-coral-dark transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-static p-6 sticky top-24">
              <h2 className="text-xl font-bold text-navy mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-muted">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium text-navy">Rs. {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span>Delivery Fee</span>
                  <span className="font-medium text-success">Free</span>
                </div>
                <div className="flex items-center justify-between text-muted">
                  <span>Service Fee</span>
                  <span className="font-medium text-navy">Rs. 50.00</span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy text-lg">Total</span>
                    <span className="font-bold text-coral text-2xl">
                      Rs. {(getCartTotal() + 50).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link 
                to="/restaurants" 
                className="block text-center text-coral font-medium mt-4 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
