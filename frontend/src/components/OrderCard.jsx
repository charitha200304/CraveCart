import { Clock, CheckCircle, Truck, Package, XCircle, ChefHat } from 'lucide-react';

const STATUS_CONFIG = {
  PENDING:    { label: 'Pending',     color: 'var(--warning)',  bg: '#FFFBEB', icon: Clock },
  CONFIRMED:  { label: 'Confirmed',   color: '#3B82F6',         bg: '#EFF6FF', icon: CheckCircle },
  PREPARING:  { label: 'Preparing',   color: '#8B5CF6',         bg: '#F5F3FF', icon: ChefHat },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#0EA5E9', bg: '#F0F9FF', icon: Truck },
  DELIVERED:  { label: 'Delivered',   color: 'var(--success)',  bg: '#ECFDF5', icon: CheckCircle },
  CANCELLED:  { label: 'Cancelled',   color: 'var(--error)',    bg: '#FEF2F2', icon: XCircle },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: 'var(--radius-full)', background: cfg.bg, color: cfg.color, fontSize: '12px', fontWeight: 600 }}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
}

export default function OrderCard({ order, onUpdateStatus, isOwner }) {
  const date = new Date(order.orderTime || order.createdAt || Date.now());
  const fmt = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const nextStatuses = {
    PENDING: 'CONFIRMED',
    CONFIRMED: 'PREPARING',
    PREPARING: 'OUT_FOR_DELIVERY',
    OUT_FOR_DELIVERY: 'DELIVERED',
  };

  return (
    <div className="card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Order #{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{fmt}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="price price-primary" style={{ fontSize: '18px' }}>Rs. {Number(order.totalAmount || order.totalPrice || 0).toLocaleString()}</div>
        </div>
      </div>

      {order.orderItems && order.orderItems.length > 0 && (
        <div style={{ background: 'var(--border-light)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px' }}>
          {order.orderItems.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0' }}>
              <span style={{ fontWeight: 500 }}>{item.foodName || item.name} <span style={{ color: 'var(--text-muted)' }}>×{item.quantity || item.qty}</span></span>
              <span style={{ color: 'var(--text-secondary)' }}>Rs. {Number((item.price * (item.quantity || item.qty))).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {order.deliveryAddress && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          📍 {order.deliveryAddress}
        </div>
      )}

      {isOwner && nextStatuses[order.status] && onUpdateStatus && (
        <button className="btn btn-primary btn-sm" onClick={() => onUpdateStatus(order.id, nextStatuses[order.status])}>
          Mark as {STATUS_CONFIG[nextStatuses[order.status]]?.label}
        </button>
      )}
    </div>
  );
}
