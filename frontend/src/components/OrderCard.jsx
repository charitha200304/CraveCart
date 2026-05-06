import { Clock, CheckCircle, Truck, Package, XCircle, ChefHat, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',     color: '#F59E0B',  bg: '#FFFBEB', icon: Clock },
  CONFIRMED:  { label: 'Confirmed',   color: '#3B82F6',  bg: '#EFF6FF', icon: CheckCircle },
  PREPARING:  { label: 'Preparing',   color: '#8B5CF6',  bg: '#F5F3FF', icon: ChefHat },
  READY:      { label: 'Ready',       color: '#10B981',  bg: '#ECFDF5', icon: Package },
  DELIVERED:  { label: 'Delivered',   color: '#64748B',  bg: '#F8FAFC', icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',   color: '#EF4444',  bg: '#FEF2F2', icon: XCircle },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '50px', background: cfg.bg, color: cfg.color, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
}

export default function OrderCard({ order, onUpdateStatus, onCancel, isOwner }) {
  const date = new Date(order.orderDate || order.createdAt || Date.now());
  const fmt = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const nextStatusMap = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'DELIVERED',
  };

  const nextStatus = nextStatusMap[order.status];

  return (
    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{order.restaurant?.name || 'Restaurant'}</h3>
            <StatusBadge status={order.status} />
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Order #{order.id} • {fmt}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>Rs. {Number(order.totalAmount || 0).toLocaleString()}</div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{order.paymentMethod?.replace('_', ' ') || 'CASH ON DELIVERY'}</div>
        </div>
      </div>

      {/* Items List */}
      <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
        {(order.items || order.orderItems || []).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '6px 0', borderBottom: idx < (order.items?.length - 1) ? '1px solid #EDF2F7' : 'none' }}>
            <span>
              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.quantity || item.qty}x</span> 
              <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>{item.foodItem?.name || item.foodName || 'Item'}</span>
            </span>
            <span style={{ fontWeight: 600 }}>Rs. {(item.price || 0).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Delivery Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
        <Truck size={16} />
        <span style={{ fontWeight: 500 }}>{order.deliveryAddress || 'Pick up at restaurant'}</span>
      </div>

      {/* Cancellation Reason */}
      {order.status === 'CANCELLED' && order.cancellationReason && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', gap: '10px', color: '#EF4444' }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '13px' }}>
            <div style={{ fontWeight: 700, marginBottom: '2px' }}>Cancellation Reason:</div>
            {order.cancellationReason}
          </div>
        </div>
      )}

      {/* Owner Controls */}
      {isOwner && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
        <div style={{ display: 'flex', gap: '12px' }}>
          {nextStatus && (
            <button 
              className="btn btn-primary" 
              style={{ flex: 2, padding: '12px' }}
              onClick={() => onUpdateStatus(order.id, nextStatus)}
            >
              <CheckCircle size={18} style={{ marginRight: '8px' }} />
              Mark as {STATUS_CONFIG[nextStatus].label}
            </button>
          )}
          <button 
            className="btn btn-outline" 
            style={{ flex: 1, borderColor: '#EF4444', color: '#EF4444', padding: '12px' }}
            onClick={() => onCancel(order.id)}
          >
            <XCircle size={18} style={{ marginRight: '8px' }} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
