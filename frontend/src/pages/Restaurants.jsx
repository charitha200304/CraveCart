import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import RestaurantCard from '../components/RestaurantCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    rating: 0,
    sortBy: 'popular'
  });

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

  const filteredRestaurants = restaurants
    .filter(r => r.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(r => !filters.rating || (r.rating || 4.5) >= filters.rating)
    .sort((a, b) => {
      if (filters.sortBy === 'rating') return (b.rating || 4.5) - (a.rating || 4.5);
      if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-bg">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-navy mb-6">All Restaurants</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-light" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants..."
                className="input-field pl-12"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-colors ${
                showFilters 
                  ? 'bg-coral text-white border-coral' 
                  : 'bg-white text-navy border-gray-200 hover:border-coral'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-slate-bg rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-navy">Filters</h3>
                <button
                  onClick={() => setFilters({ rating: 0, sortBy: 'popular' })}
                  className="text-sm text-coral hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex gap-2">
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters({ ...filters, rating })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          filters.rating === rating
                            ? 'bg-coral text-white'
                            : 'bg-white text-navy hover:bg-gray-50'
                        }`}
                      >
                        {rating === 0 ? 'All' : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">
                    Sort By
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: 'popular', label: 'Popular' },
                      { value: 'rating', label: 'Rating' },
                      { value: 'name', label: 'Name' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilters({ ...filters, sortBy: option.value })}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                          filters.sortBy === option.value
                            ? 'bg-coral text-white'
                            : 'bg-white text-navy hover:bg-gray-50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-static p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <>
            <p className="text-muted mb-6">
              Showing {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant, index) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} index={index} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-muted-light" />
            </div>
            <h3 className="text-xl font-semibold text-navy mb-2">No restaurants found</h3>
            <p className="text-muted mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ rating: 0, sortBy: 'popular' });
              }}
              className="btn-outline inline-flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
