import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner spinner-dark" style={{ width: '36px', height: '36px', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading…</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
}
