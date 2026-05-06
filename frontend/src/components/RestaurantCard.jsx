import { Link } from 'react-router-dom';
import { MapPin, Phone, ChevronRight, Utensils } from 'lucide-react';
import StarRating from './StarRating';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop';

export default function RestaurantCard({ restaurant }) {
  return (
    <Link to={`/restaurants/${restaurant.id}`}>
      <div className="card" style={{ cursor: 'pointer' }}>
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
          <img
            src={restaurant.imageUrl || PLACEHOLDER}
            alt={restaurant.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onError={e => e.target.src = PLACEHOLDER}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.95)', color: 'var(--primary)', backdropFilter: 'blur(4px)' }}>
              <Utensils size={10} /> Open
            </span>
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, lineHeight: '1.3' }}>{restaurant.name}</h3>
            <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <StarRating rating={restaurant.averageRating} count={restaurant.reviewCount} size={14} />
          </div>
          {restaurant.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {restaurant.description}
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {restaurant.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <MapPin size={14} color="var(--primary)" />
                <span className="truncate">{restaurant.address}</span>
              </div>
            )}
            {restaurant.contactNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <Phone size={14} color="var(--primary)" />
                {restaurant.contactNumber}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
