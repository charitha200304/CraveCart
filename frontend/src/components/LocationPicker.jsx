import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

// Modern 'Voyager' Map Style (Free & Beautiful)
const TILE_LAYER_URL = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Custom CraveCart Premium Marker
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition, setAddress }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      reverseGeocode(lat, lng, setAddress);
    },
  });

  return position ? <Marker position={position} icon={orangeIcon} /> : null;
}

async function reverseGeocode(lat, lng, setAddress) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    if (data.display_name) {
      setAddress(data.display_name);
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
}

export default function LocationPicker({ onAddressSelect }) {
  const [position, setPosition] = useState([6.9271, 79.8612]); // Default Colombo
  const [locating, setLocating] = useState(false);

  const handleMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const newPos = [latitude, longitude];
      setPosition(newPos);
      reverseGeocode(latitude, longitude, onAddressSelect);
      setLocating(false);
    }, () => setLocating(false));
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '16px' }}>
      <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={TILE_LAYER_URL} attribution={ATTRIBUTION} />
        <LocationMarker position={position} setPosition={setPosition} setAddress={onAddressSelect} />
      </MapContainer>
      
      {/* Premium Controls */}
      <button 
        onClick={(e) => { e.preventDefault(); handleMyLocation(); }}
        className="btn-location-trigger"
        style={{ 
          position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000,
          background: 'white', color: 'var(--primary)', border: 'none',
          padding: '12px 20px', borderRadius: '14px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)', transition: 'all 0.2s'
        }}
      >
        {locating ? <Loader2 className="spinner" size={18} /> : <Navigation size={18} />}
        {locating ? 'Finding you...' : 'Near Me'}
      </button>
      
      <div style={{ 
        position: 'absolute', top: '20px', left: '20px', zIndex: 1000,
        background: 'rgba(255,255,255,0.9)', padding: '10px 16px', borderRadius: '12px',
        fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)',
        backdropFilter: 'blur(10px)', border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <div style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
        TAP TO PIN ADDRESS
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 107, 0, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 107, 0, 0); }
        }
        .btn-location-trigger:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.16);
        }
        .btn-location-trigger:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
