import { Link } from 'react-router-dom';
import { ChefHat, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--secondary)', color: 'rgba(255,255,255,0.7)', padding: '48px 0 24px', marginTop: 'auto' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChefHat size={20} color="white" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'white' }}>CraveCart</span>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.7 }}>Your favourite food, delivered fast and fresh to your door.</p>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['/', 'Home'],['/restaurants', 'Restaurants'],['/orders', 'My Orders']].map(([to, label]) => (
                <Link key={to} to={to} style={{ fontSize: '14px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='white'}
                  onMouseLeave={e => e.target.style.color=''}>{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[['/login', 'Sign In'],['/register', 'Register']].map(([to, label]) => (
                <Link key={to} to={to} style={{ fontSize: '14px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color='white'}
                  onMouseLeave={e => e.target.style.color=''}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <span>Made with</span> <Heart size={14} color="var(--primary)" fill="var(--primary)" /> <span>by CraveCart</span>
        </div>
      </div>
    </footer>
  );
}
