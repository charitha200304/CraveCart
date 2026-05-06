import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, count = 0, size = 16, showCount = true, interactive = false, onRate }) {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= Math.round(rating);
    stars.push(
      <Star
        key={i}
        size={size}
        color={isFilled ? '#F59E0B' : '#E5E7EB'} // Amber-500 / Gray-200
        fill={isFilled ? '#F59E0B' : 'transparent'}
        style={{ cursor: interactive ? 'pointer' : 'default', transition: 'transform 0.1s' }}
        onClick={() => interactive && onRate && onRate(i)}
        onMouseEnter={(e) => interactive && (e.currentTarget.style.transform = 'scale(1.2)')}
        onMouseLeave={(e) => interactive && (e.currentTarget.style.transform = 'scale(1)')}
      />
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div style={{ display: 'flex' }}>
        {stars}
      </div>
      {showCount && (
        <span style={{ fontSize: size * 0.8 + 'px', color: 'var(--text-muted)', marginLeft: '4px' }}>
          {rating > 0 ? rating.toFixed(1) : 'New'} {count > 0 ? `(${count})` : ''}
        </span>
      )}
    </div>
  );
}
