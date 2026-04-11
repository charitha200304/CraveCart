import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Plus, Minus, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useCart } from '../context/CartContext';
import styles from './RestaurantDetail.module.css';

export default function RestaurantDetail() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [restaurantRes, foodRes] = await Promise.all([
        axios.get(API_ENDPOINTS.RESTAURANT_BY_ID(id)),
        axios.get(API_ENDPOINTS.FOOD_ITEMS),
      ]);
      
      setRestaurant(restaurantRes.data);
      // Filter food items by restaurant
      const restaurantFood = foodRes.data.filter(
        item => item.restaurantId === Number(id)
      );
      setFoodItems(restaurantFood);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCartQuantity = (itemId) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const categories = ['all', ...new Set(foodItems.map(item => item.category).filter(Boolean))];

  const filteredItems = selectedCategory === 'all'
    ? foodItems
    : foodItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading restaurant...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className={styles.notFound}>
        <p>Restaurant not found</p>
        <Link to="/restaurants" className="btn btn-primary">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  return (
    <main className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerImage}>
          {restaurant.imageUrl ? (
            <img src={restaurant.imageUrl} alt={restaurant.name} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span>{restaurant.name.charAt(0)}</span>
            </div>
          )}
          <div className={styles.headerOverlay}></div>
        </div>
        
        <div className={`container ${styles.headerContent}`}>
          <Link to="/restaurants" className={styles.backBtn}>
            <ArrowLeft size={20} />
            Back
          </Link>
          
          <div className={styles.restaurantInfo}>
            <h1 className={styles.name}>{restaurant.name}</h1>
            {restaurant.description && (
              <p className={styles.description}>{restaurant.description}</p>
            )}
            <div className={styles.meta}>
              {restaurant.address && (
                <span className={styles.metaItem}>
                  <MapPin size={16} />
                  {restaurant.address}
                </span>
              )}
              {restaurant.contactNumber && (
                <span className={styles.metaItem}>
                  <Phone size={16} />
                  {restaurant.contactNumber}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container">
        <div className={styles.menu}>
          <div className={styles.menuHeader}>
            <h2 className={styles.menuTitle}>Menu</h2>
            <p className={styles.menuCount}>{foodItems.length} items</p>
          </div>

          {/* Categories */}
          {categories.length > 1 && (
            <div className={styles.categories}>
              {categories.map(category => (
                <button
                  key={category}
                  className={`${styles.categoryBtn} ${selectedCategory === category ? styles.active : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All Items' : category}
                </button>
              ))}
            </div>
          )}

          {/* Food Items */}
          {filteredItems.length === 0 ? (
            <div className={styles.empty}>
              <p>No menu items available</p>
            </div>
          ) : (
            <div className={styles.foodGrid}>
              {filteredItems.map(item => (
                <FoodCard
                  key={item.id}
                  item={item}
                  quantity={getCartQuantity(item.id)}
                  onAddToCart={() => addToCart(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Summary */}
      {cartItems.length > 0 && (
        <Link to="/cart" className={styles.cartSummary}>
          <div className={styles.cartInfo}>
            <ShoppingCart size={20} />
            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
          </div>
          <span className={styles.cartTotal}>
            View Cart - Rs. {cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
          </span>
        </Link>
      )}
    </main>
  );
}

function FoodCard({ item, quantity, onAddToCart }) {
  return (
    <div className={styles.foodCard}>
      <div className={styles.foodImage}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} />
        ) : (
          <div className={styles.foodPlaceholder}>
            <span>{item.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className={styles.foodContent}>
        <div className={styles.foodInfo}>
          <h3 className={styles.foodName}>{item.name}</h3>
          {item.description && (
            <p className={styles.foodDesc}>{item.description}</p>
          )}
          <p className={styles.foodPrice}>Rs. {item.price.toFixed(2)}</p>
        </div>
        
        <div className={styles.foodActions}>
          {quantity > 0 ? (
            <div className={styles.quantityBadge}>
              {quantity} in cart
            </div>
          ) : null}
          <button
            className={styles.addBtn}
            onClick={onAddToCart}
          >
            <Plus size={18} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
