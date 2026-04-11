import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Star, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import styles from './Home.module.css';

export default function Home() {
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
    restaurant.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Delicious Food,
              <br />
              <span className={styles.heroHighlight}>Delivered Fast</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Order from your favorite local restaurants and get food delivered to your doorstep in minutes.
            </p>
            
            <div className={styles.searchBox}>
              <Search size={20} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <Link to="/restaurants" className={`btn btn-primary ${styles.searchBtn}`}>
                Find Food
              </Link>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>500+</span>
                <span className={styles.statLabel}>Restaurants</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>50k+</span>
                <span className={styles.statLabel}>Happy Customers</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>30 min</span>
                <span className={styles.statLabel}>Avg. Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <MapPin size={24} />
              </div>
              <h3 className={styles.featureTitle}>Track Your Order</h3>
              <p className={styles.featureDesc}>Real-time tracking from restaurant to your doorstep</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Clock size={24} />
              </div>
              <h3 className={styles.featureTitle}>Fast Delivery</h3>
              <p className={styles.featureDesc}>Get your food delivered hot and fresh within minutes</p>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Star size={24} />
              </div>
              <h3 className={styles.featureTitle}>Best Quality</h3>
              <p className={styles.featureDesc}>Partnered with top-rated restaurants in your area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurants Section */}
      <section className={styles.restaurantsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Popular Restaurants</h2>
              <p className={styles.sectionSubtitle}>Discover the best restaurants near you</p>
            </div>
            <Link to="/restaurants" className={styles.viewAll}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading restaurants...</p>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className={styles.empty}>
              <p>No restaurants found</p>
            </div>
          ) : (
            <div className={styles.restaurantsGrid}>
              {filteredRestaurants.slice(0, 6).map((restaurant) => (
                <Link
                  to={`/restaurant/${restaurant.id}`}
                  key={restaurant.id}
                  className={styles.restaurantCard}
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
                    <p className={styles.cardDesc}>{restaurant.description || 'Delicious food awaits'}</p>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardLocation}>
                        <MapPin size={14} />
                        {restaurant.address || 'Location'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Order?</h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of food lovers and start ordering delicious meals today
            </p>
            <div className={styles.ctaButtons}>
              <Link to="/restaurants" className="btn btn-primary">
                Browse Restaurants
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
