import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Plus, Minus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FoodCard({ item, restaurantId }) {
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  
  const cartItem = cartItems.find(ci => ci.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(item, restaurantId);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleIncrement = () => {
    updateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity === 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, quantity - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-static overflow-hidden group"
    >
      <div className="relative overflow-hidden">
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop'}
          alt={item.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {item.isPopular && (
          <div className="absolute top-3 left-3">
            <span className="badge badge-primary">Popular</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-navy line-clamp-1">{item.name}</h3>
          {item.category && (
            <span className="text-xs px-2 py-1 bg-slate-bg rounded-full text-muted shrink-0">
              {item.category}
            </span>
          )}
        </div>
        
        <p className="text-muted text-sm line-clamp-2 mb-4 min-h-[40px]">
          {item.description || 'A delicious dish prepared with fresh ingredients'}
        </p>
        
        <div className="flex items-center justify-between">
          <p className="text-coral font-bold text-lg">Rs. {item.price?.toFixed(2) || '0.00'}</p>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
                className="w-9 h-9 rounded-xl bg-slate-bg flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Minus className="w-4 h-4 text-navy" />
              </button>
              <span className="font-bold text-navy w-6 text-center">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-9 h-9 rounded-xl bg-coral text-white flex items-center justify-center hover:bg-coral-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex items-center gap-2 px-4 py-2 bg-coral text-white rounded-xl font-medium hover:bg-coral-dark transition-all disabled:opacity-75"
            >
              {isAdding ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
