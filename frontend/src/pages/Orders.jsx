import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { Package, Clock, CheckCircle, XCircle, Truck, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig = {
  PENDING: { icon: Clock, color: 'text-warning', bg: 'bg-amber-100', label: 'Pending' },
  CONFIRMED: { icon: ChefHat, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Preparing' },
  PREPARING: { icon: ChefHat, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Preparing' },
  OUT_FOR_DELIVERY: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'On the Way' },
  DELIVERED: { icon: CheckCircle, color: 'text-success', bg: 'bg-success-light', label: 'Delivered' },
  CANCELLED: { icon: XCircle, color: 'text-error', bg: 'bg-red-100', label: 'Cancelled' },
};

export default function Orders() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.CUSTOMER_ORDERS(user.id));
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-bg flex flex-col items-center justify-center px-4">
        <Package className="w-16 h-16 text-muted-light mb-4" />
        <h2 className="text-2xl font-bold text-navy mb-2">Sign in to view orders</h2>
        <p className="text-muted mb-6">Please sign in to see your order history</p>
        <Link to="/auth" className="btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-coral border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-navy mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="card-static p-12 text-center">
            <Package className="w-16 h-16 text-muted-light mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-navy mb-2">No orders yet</h2>
            <p className="text-muted mb-6">You have not placed any orders yet</p>
            <Link to="/restaurants" className="btn-primary">
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-static overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted mb-1">
                          Order #{order.id} - {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <h3 className="font-semibold text-navy text-lg">
                          {order.restaurantName || 'Restaurant'}
                        </h3>
                      </div>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${status.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className={`font-medium text-sm ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {order.orderItems && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {order.orderItems.slice(0, 3).map((item, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-bg rounded-lg text-sm text-muted">
                            {item.foodItem?.name || `Item ${i + 1}`} x{item.quantity}
                          </span>
                        ))}
                        {order.orderItems.length > 3 && (
                          <span className="px-3 py-1 bg-slate-bg rounded-lg text-sm text-muted">
                            +{order.orderItems.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-sm text-muted">
                        {order.deliveryAddress}
                      </div>
                      <div className="text-right">
                        <p className="text-coral font-bold text-lg">
                          Rs. {order.totalAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Active Orders */}
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="px-6 pb-4">
                      <div className="flex items-center gap-2">
                        {['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((step) => {
                          const steps = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                          const currentIndex = steps.indexOf(order.status);
                          const stepIndex = steps.indexOf(step);
                          const isComplete = stepIndex <= currentIndex;
                          
                          return (
                            <div key={step} className="flex-1 flex items-center">
                              <div className={`flex-1 h-1 rounded-full ${isComplete ? 'bg-coral' : 'bg-gray-200'}`} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
