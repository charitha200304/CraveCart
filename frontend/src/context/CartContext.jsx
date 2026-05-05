import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cc_cart') || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cc_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (food, restaurant) => {
    setItems(prev => {
      // If cart has items from different restaurant, clear it
      if (prev.length > 0 && prev[0].restaurantId !== food.restaurantId) {
        const confirmed = window.confirm('Your cart has items from another restaurant. Clear cart and add this item?');
        if (!confirmed) return prev;
        return [{ ...food, qty: 1, restaurantName: restaurant?.name }];
      }
      const existing = prev.find(i => i.id === food.id);
      if (existing) {
        return prev.map(i => i.id === food.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...food, qty: 1, restaurantName: restaurant?.name }];
    });
  };

  const removeItem = (foodId) => {
    setItems(prev => prev.filter(i => i.id !== foodId));
  };

  const updateQty = (foodId, qty) => {
    if (qty <= 0) return removeItem(foodId);
    setItems(prev => prev.map(i => i.id === foodId ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const restaurantId = items[0]?.restaurantId || null;
  const restaurantName = items[0]?.restaurantName || null;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice, restaurantId, restaurantName }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
