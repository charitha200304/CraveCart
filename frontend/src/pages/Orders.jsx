import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import styles from './Orders.module.css';

const statusConfig = {
  PENDING: { icon: Clock, color: 'warning', label: 'Pending' },
  CONFIRMED: { icon: CheckCircle, color: 'success', label: 'Confirmed' },
  PREPARING: { icon: Package, color: 'info', label: 'Preparing' },
  OUT_FOR_DELIVERY: { icon: Truck, color: 'primary', label: 'Out for Delivery' },
  DELIVERED: { icon: CheckCircle, color: 'success', label: 'Delivered' },
  CANCELLED: { icon: XCircle, color: 'error', label: 'Cancelled' },
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      // In real app, get customerId from auth context
      const response = await axios.get(API_ENDPOINTS.CUSTOMER_ORDERS(1));
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className={styles.page}>
        <div className="container">
          <div className={styles.authRequired}>
            <Package size={48} className={styles.authIcon} />
            <h2 className={styles.authTitle}>Sign in to view orders</h2>
            <p className={styles.authText}>
              Please sign in to see your order history
            </p>
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>My Orders</h1>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <Package size={48} className={styles.emptyIcon} />
            <h2 className={styles.emptyTitle}>No orders yet</h2>
            <p className={styles.emptyText}>
              {"You haven't placed any orders yet"}
            </p>
            <Link to="/restaurants" className="btn btn-primary">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className={styles.orders}>
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function OrderCard({ order }) {
  const status = statusConfig[order.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div className={styles.orderInfo}>
          <span className={styles.orderId}>Order #{order.id}</span>
          <span className={styles.orderDate}>
            {order.createdAt ? formatDate(order.createdAt) : 'Date not available'}
          </span>
        </div>
        <div className={`${styles.status} ${styles[status.color]}`}>
          <StatusIcon size={14} />
          {status.label}
        </div>
      </div>

      <div className={styles.orderItems}>
        {order.orderItems?.map((item, index) => (
          <div key={index} className={styles.orderItem}>
            <span className={styles.itemQuantity}>{item.quantity}x</span>
            <span className={styles.itemName}>
              {item.foodItem?.name || `Item #${item.foodItemId}`}
            </span>
            <span className={styles.itemPrice}>
              Rs. {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.orderFooter}>
        <div className={styles.deliveryInfo}>
          <span className={styles.deliveryLabel}>Delivery to:</span>
          <span className={styles.deliveryAddress}>{order.deliveryAddress}</span>
        </div>
        <div className={styles.orderTotal}>
          <span>Total:</span>
          <span className={styles.totalAmount}>
            Rs. {order.totalAmount?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>
    </div>
  );
}
