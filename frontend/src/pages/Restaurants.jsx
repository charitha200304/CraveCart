import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Filter } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import styles from './Restaurants.module.css';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

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

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>All Restaurants</h1>
            <p className={styles.subtitle}>
              {restaurants.length} restaurants available
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <button className={`btn btn-secondary ${styles.filterBtn}`}>
            <Filter size={18} />
            Filters
          </button>
        </div>

        {/* Restaurant Grid */}
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading restaurants...</p>
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className={styles.empty}>
            <p>No restaurants found matching your search</p>
            {searchQuery && (
              <button 
                className="btn btn-secondary"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredRestaurants.map((restaurant) => (
              <Link
                to={`/restaurant/${restaurant.id}`}
                key={restaurant.id}
                className={styles.card}
              >
                <div className={styles.cardImage}>
                  {restaurant.imageUrl ? (
                    <img src={restaurant.imageUrl} alt={restaurant.name} />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>{restaurant.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{restaurant.name}</h3>
                  <p className={styles.cardDesc}>
                    {restaurant.description || 'Delicious food awaits'}
                  </p>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardLocation}>
                      <MapPin size={14} />
                      {restaurant.address || 'Location not specified'}
                    </span>
                  </div>
                  {restaurant.contactNumber && (
                    <p className={styles.cardContact}>
                      {restaurant.contactNumber}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
