import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Flame, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';
import ReviewSection from './ReviewSection';

const FOOD_PH = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

export default function FoodCard({ food, restaurant, onDataChanged }) {
  const { items, addItem, updateQty, removeItem } = useCart();
  const { isAuthenticated, isCustomer } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [showReviews, setShowReviews] = useState(false);

  const cartItem = items.find(i => i.id === food.id);
  const qty = cartItem?.qty || 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    addItem(food, restaurant);
    toast.success(`${food.name} added to cart!`);
  };

  const handleReviewAdded = () => {
    if (onDataChanged) {
      onDataChanged();
    }
  };

  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={() => setShowReviews(true)}>
        <div style={{ position: 'relative', height: '160px', overflow: 'hidden', flexShrink: 0 }}>
          <img
            src={food.imageUrl || FOOD_PH}
            alt={food.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onError={e => e.target.src = FOOD_PH}
            onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
          {food.isPopular && (
            <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
              <span className="badge badge-warning" style={{ fontSize: '11px' }}><Flame size={10} /> Popular</span>
            </div>
          )}
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{food.name}</h4>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <StarRating rating={food.averageRating} count={food.reviewCount} size={12} />
            </div>
            {food.description && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {food.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }} onClick={e => e.stopPropagation()}>
            <span className="price price-primary" style={{ fontSize: '18px' }}>
              Rs. {Number(food.price).toLocaleString()}
            </span>
            {qty === 0 ? (
              <button className="btn btn-primary btn-sm" onClick={handleAdd} style={{ gap: '6px' }}>
                <Plus size={14} /> Add
              </button>
            ) : (
              <div className="qty-control">
                <button className="qty-btn" onClick={() => qty === 1 ? removeItem(food.id) : updateQty(food.id, qty - 1)}>−</button>
                <span className="qty-value">{qty}</span>
                <button className="qty-btn" onClick={() => updateQty(food.id, qty + 1)}>+</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showReviews && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', margin: 0 }}>{food.name}</h3>
              <button onClick={() => setShowReviews(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <img src={food.imageUrl || FOOD_PH} alt={food.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} onError={e => e.target.src = FOOD_PH} />
                <div>
                  <StarRating rating={food.averageRating} count={food.reviewCount} size={16} />
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px' }}>{food.description}</p>
                </div>
              </div>
              <ReviewSection targetType="FOOD" targetId={food.id} onReviewAdded={handleReviewAdded} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
