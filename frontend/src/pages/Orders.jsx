import { useEffect, useState, useRef } from 'react';
import { Package } from 'lucide-react';
import { orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OrderCard from '../components/OrderCard';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');

  const toast = useToast();
  const ordersRef = useRef([]);

  useEffect(() => {
    if (!user?.id) return;

    const loadOrders = async () => {
      try {
        const r = await orderAPI.getByCustomer(user.id);
        const newOrders = r.data || [];
        
        // Detect status changes for notifications
        if (ordersRef.current.length > 0) {
          newOrders.forEach(no => {
            const old = ordersRef.current.find(o => o.id === no.id);
            if (old && old.status !== no.status) {
              const resName = no.restaurant?.name || 'Your order';
              toast.success(`${resName} is now ${no.status.replace(/_/g, ' ')}! 🔔`);
            }
          });
        }
        
        ordersRef.current = newOrders;
        setOrders(newOrders);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [user?.id, toast]);

  const TABS = ['ALL', 'PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  const filtered = tab === 'ALL' ? orders : orders.filter(o => o.status === tab);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title" style={{ marginBottom: '20px' }}>My Orders</h1>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {TABS.map(t => (
              <button key={t} className={`chip ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'ALL' ? 'All Orders' : t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="skeleton" style={{ height: '20px', width: '30%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '60%' }} />
                  <div className="skeleton" style={{ height: '60px' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Package size={72} className="empty-state-icon" />
            <h3>No orders yet</h3>
            <p>{tab === 'ALL' ? "You haven't placed any orders yet" : `No ${tab.replace(/_/g,' ').toLowerCase()} orders`}</p>
            <a href="/restaurants" className="btn btn-primary">Order Now</a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filtered.sort((a,b) => new Date(b.orderTime||b.createdAt||0) - new Date(a.orderTime||a.createdAt||0))
              .map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}
