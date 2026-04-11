import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    // Load cart from localStorage on mount
    const savedCart = localStorage.getItem('cravecart_cart');
    const savedRestaurantId = localStorage.getItem('cravecart_restaurant');
    
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    if (savedRestaurantId) {
      setRestaurantId(Number(savedRestaurantId));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage when it changes
    localStorage.setItem('cravecart_cart', JSON.stringify(cartItems));
    if (restaurantId) {
      localStorage.setItem('cravecart_restaurant', String(restaurantId));
    }
  }, [cartItems, restaurantId]);

  const addToCart = (item) => {
    // Check if item is from a different restaurant
    if (restaurantId && item.restaurantId !== restaurantId) {
      if (!confirm('Adding items from a different restaurant will clear your current cart. Continue?')) {
        return false;
      }
      setCartItems([]);
    }
    
    setRestaurantId(item.restaurantId);
    
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    return true;
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => {
      const newCart = prev.filter(i => i.id !== itemId);
      if (newCart.length === 0) {
        setRestaurantId(null);
        localStorage.removeItem('cravecart_restaurant');
      }
      return newCart;
    });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(i =>
        i.id === itemId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    localStorage.removeItem('cravecart_cart');
    localStorage.removeItem('cravecart_restaurant');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    restaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
