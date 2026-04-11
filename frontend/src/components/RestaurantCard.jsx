import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RestaurantCard({ restaurant, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/restaurant/${restaurant.id}`}
        className="card group block"
      >
        <div className="relative overflow-hidden rounded-t-2xl">
          <img
            src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop'}
            alt={restaurant.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <span className="badge badge-success">Open</span>
          </div>
        </div>
        
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-navy text-lg group-hover:text-coral transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-semibold text-navy text-sm">{restaurant.rating || '4.5'}</span>
            </div>
          </div>
          
          <p className="text-muted text-sm line-clamp-2 mb-4">
            {restaurant.description || 'Delicious food awaits you!'}
          </p>
          
          <div className="flex items-center gap-4 text-sm text-muted">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{restaurant.deliveryTime || '25-35'} min</span>
            </div>
            <div className="flex items-center gap-1 flex-1 min-w-0">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{restaurant.address || 'Colombo'}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
