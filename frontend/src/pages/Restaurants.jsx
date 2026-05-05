import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, ChefHat } from 'lucide-react';
import { restaurantAPI } from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    restaurantAPI.getAll()
      .then(r => setRestaurants(r.data || []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.address?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title" style={{ marginBottom: '20px' }}>All Restaurants</h1>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="input-icon" style={{ flex: '1', minWidth: '240px', maxWidth: '480px' }}>
              <Search size={18} className="icon" />
              <input className="input" placeholder="Search restaurants or cuisine…" value={search}
                onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {!loading && (
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Showing {filtered.length} of {restaurants.length} restaurants
            </p>
          )}
        </div>
      </div>

      <div className="container" style={{ paddingBottom: '80px' }}>
        {loading ? (
          <div className="grid-auto">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: '180px' }} />
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="skeleton" style={{ height: '20px', width: '70%' }} />
                  <div className="skeleton" style={{ height: '14px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ChefHat size={64} className="empty-state-icon" />
            <h3>No restaurants found</h3>
            <p>{search ? `No results for "${search}"` : 'No restaurants available right now'}</p>
            {search && <button className="btn btn-secondary" onClick={() => setSearch('')}>Clear search</button>}
          </div>
        ) : (
          <div className="grid-auto">
            {filtered.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}
