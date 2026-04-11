import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import FoodCard from '../components/FoodCard';
import { Star, Clock, MapPin, Phone, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [restaurantRes, foodRes] = await Promise.all([
        axios.get(API_ENDPOINTS.RESTAURANT_BY_ID(id)),
        axios.get(API_ENDPOINTS.FOOD_ITEMS)
      ]);
      
      setRestaurant(restaurantRes.data);
      const restaurantFoods = foodRes.data.filter(
        food => food.restaurantId === parseInt(id)
      );
      setFoodItems(restaurantFoods);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...new Set(foodItems.map(item => item.category || 'Other'))];
  
  const filteredItems = activeCategory === 'All' 
    ? foodItems 
    : foodItems.filter(item => (item.category || 'Other') === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-slate-bg flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-navy mb-4">Restaurant not found</h2>
        <Link to="/restaurants" className="btn-primary">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg">
      {/* Hero */}
      <div className="relative h-64 md:h-80">
        <img
          src={restaurant.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
        
        <Link 
          to="/restaurants" 
          className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-navy font-medium hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </Link>
      </div>

      {/* Restaurant Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="card-static p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">{restaurant.name}</h1>
              <p className="text-muted mb-4">{restaurant.description || 'Delicious food awaits you!'}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-warning fill-warning" />
                  <span className="font-semibold text-navy">{restaurant.rating || '4.5'}</span>
                  <span className="text-muted">({restaurant.reviewCount || '100'}+ reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-muted">
                  <Clock className="w-4 h-4" />
                  <span>{restaurant.deliveryTime || '25-35'} min</span>
                </div>
                <span className="badge badge-success">Open Now</span>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <MapPin className="w-4 h-4 text-coral" />
                <span>{restaurant.address || 'Colombo, Sri Lanka'}</span>
              </div>
              {restaurant.contactNumber && (
                <div className="flex items-center gap-2 text-muted">
                  <Phone className="w-4 h-4 text-coral" />
                  <span>{restaurant.contactNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-navy mb-6">Menu</h2>
        
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                activeCategory === category
                  ? 'bg-coral text-white'
                  : 'bg-white text-muted hover:text-navy border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Food Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <FoodCard key={item.id} item={item} restaurantId={parseInt(id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted text-lg">No items available in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
