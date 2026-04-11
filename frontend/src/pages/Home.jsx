import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import RestaurantCard from '../components/RestaurantCard';
import { 
  Search, 
  MapPin, 
  Pizza, 
  Beef, 
  IceCream, 
  Coffee,
  Salad,
  Sandwich,
  ArrowRight,
  Star,
  Clock,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'Burgers', icon: Beef, color: 'bg-orange-100 text-orange-600' },
  { name: 'Pizza', icon: Pizza, color: 'bg-red-100 text-red-600' },
  { name: 'Desserts', icon: IceCream, color: 'bg-pink-100 text-pink-600' },
  { name: 'Coffee', icon: Coffee, color: 'bg-amber-100 text-amber-600' },
  { name: 'Salads', icon: Salad, color: 'bg-green-100 text-green-600' },
  { name: 'Sandwiches', icon: Sandwich, color: 'bg-yellow-100 text-yellow-600' },
];

const features = [
  { icon: Clock, title: 'Fast Delivery', description: 'Get your food in 30 minutes or less' },
  { icon: Star, title: 'Best Quality', description: 'Fresh ingredients from local restaurants' },
  { icon: Shield, title: 'Secure Payment', description: 'Safe and secure payment options' },
];

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.RESTAURANTS);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter(r =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-bg">
      {/* Hero Section */}
      <section className="bg-navy relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-coral rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-coral rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 text-balance"
            >
              Delicious food,<br />
              <span className="text-coral">delivered fast</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg mb-8"
            >
              Order from your favorite local restaurants and enjoy amazing food delivered right to your doorstep.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for restaurants or dishes..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-navy placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-coral"
                />
              </div>
              <div className="flex items-center gap-2 px-4 py-4 bg-navy-light rounded-2xl text-white">
                <MapPin className="w-5 h-5 text-coral" />
                <span>Colombo</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-navy mb-6">Browse by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 hover:border-coral hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${category.color} group-hover:scale-110 transition-transform`}>
                <category.icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium text-navy">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-navy">Popular Restaurants</h2>
          <Link to="/restaurants" className="flex items-center gap-2 text-coral font-medium hover:gap-3 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-static p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.slice(0, 6).map((restaurant, index) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted text-lg">No restaurants found</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-4">Why Choose CraveCart?</h2>
            <p className="text-muted max-w-2xl mx-auto">
              We make ordering food easy, fast, and reliable. Here is what sets us apart.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8"
              >
                <div className="w-16 h-16 bg-coral-light rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-coral" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-navy rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-coral rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
              Ready to order your favorite food?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of happy customers and start ordering today.
            </p>
            <Link to="/restaurants" className="btn-primary inline-flex items-center gap-2">
              Browse Restaurants <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
