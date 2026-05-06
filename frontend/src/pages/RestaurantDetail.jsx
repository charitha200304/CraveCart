import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, ArrowLeft, ShoppingCart, Search, UtensilsCrossed } from 'lucide-react';
import { restaurantAPI, foodAPI } from '../utils/api';
import FoodCard from '../components/FoodCard';
import { useCart } from '../context/CartContext';

const PH = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=400&fit=crop';

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { totalItems, totalPrice, restaurantId } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rRes, fRes] = await Promise.all([
          restaurantAPI.getById(id),
          foodAPI.getAll(),
        ]);
        
        setRestaurant(rRes.data);
        const all = fRes.data || [];
        const mine = all.filter(f => String(f.restaurantId) === String(id) || String(f.restaurant?.id) === String(id));
        setFoods(mine.length > 0 ? mine : all.map(f => ({ ...f, restaurantId: id })));
      } catch (err) {
        console.error("Failed to load restaurant details", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 10000); // Poll every 10s to keep menu live
    return () => clearInterval(interval);
  }, [id]);

  const filtered = foods.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div>
      <div className="skeleton" style={{ height: '280px' }} />
      <div className="container" style={{ marginTop: '32px' }}>
        <div className="grid-auto">
          {[1,2,3,4].map(i => (
            <div key={i} className="card">
              <div className="skeleton" style={{ height: '160px' }} />
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton" style={{ height: '18px', width: '65%' }} />
                <div className="skeleton" style={{ height: '13px' }} />
                <div className="skeleton" style={{ height: '13px', width: '50%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div className="empty-state" style={{ paddingTop: '120px' }}>
      <UtensilsCrossed size={64} className="empty-state-icon" />
      <h3>Restaurant not found</h3>
      <Link to="/restaurants" className="btn btn-primary">Browse Restaurants</Link>
    </div>
  );

  return (
    <div style={{ paddingBottom: totalItems > 0 ? '100px' : '60px' }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: '280px', overflow: 'hidden' }}>
        <img src={restaurant.imageUrl || PH} alt={restaurant.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = PH} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)' }} />
        <div style={{ position: 'absolute', top: '20px', left: '24px' }}>
          <Link to="/restaurants" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderRadius: 'var(--radius-full)', color: 'white', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.2s' }}>
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px' }}>
          <h1 style={{ color: 'white', fontSize: 'clamp(24px, 4vw, 40px)', marginBottom: '12px' }}>{restaurant.name}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {restaurant.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                <MapPin size={14} />{restaurant.address}
              </div>
            )}
            {restaurant.contactNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.85)', fontSize: '14px' }}>
                <Phone size={14} />{restaurant.contactNumber}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {restaurant.description && (
        <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
          <div className="container">
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px' }}>{restaurant.description}</p>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="container" style={{ paddingTop: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px' }}>Menu</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{foods.length} items available</p>
          </div>
          <div className="input-icon" style={{ width: '100%', maxWidth: '300px' }}>
            <Search size={17} className="icon" />
            <input className="input" placeholder="Search menu…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <UtensilsCrossed size={56} className="empty-state-icon" />
            <h3>No items found</h3>
            <p>{search ? `No results for "${search}"` : 'This restaurant has no menu items yet'}</p>
          </div>
        ) : (
          <div className="grid-auto">
            {filtered.map(food => <FoodCard key={food.id} food={food} restaurant={restaurant} />)}
          </div>
        )}
      </div>

      {/* Sticky cart bar */}
      {totalItems > 0 && restaurantId === id && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid var(--border)', padding: '16px 24px', zIndex: 50, boxShadow: '0 -8px 32px rgba(0,0,0,0.1)' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>{totalItems} item{totalItems > 1 ? 's' : ''} in cart</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', marginLeft: '12px' }}>Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <Link to="/cart" className="btn btn-primary" style={{ gap: '8px' }}>
              <ShoppingCart size={18} /> View Cart
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
