import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { reviewAPI } from '../utils/api';
import StarRating from './StarRating';

export default function ReviewSection({ targetType, targetId, onReviewAdded }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    loadReviews();
  }, [targetType, targetId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      let res;
      if (targetType === 'RESTAURANT') {
        res = await reviewAPI.getRestaurantReviews(targetId);
      } else {
        res = await reviewAPI.getFoodReviews(targetId);
      }
      setReviews(res.data || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating,
        comment,
        ...(targetType === 'RESTAURANT' ? { restaurantId: targetId } : { foodItemId: targetId })
      };
      
      await reviewAPI.add(payload);
      toast.success('Review submitted successfully!');
      
      // Reset form
      setRating(0);
      setComment('');
      setShowForm(false);
      
      // Reload reviews
      await loadReviews();
      
      // Notify parent to maybe reload entity (to update avg rating)
      if (onReviewAdded) onReviewAdded();
      
    } catch (err) {
      toast.error(err.response?.data || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '20px' }}>Reviews ({reviews.length})</h3>
        {user && user.role === 'CUSTOMER' && !showForm && (
          <button className="btn btn-secondary" onClick={() => setShowForm(true)} style={{ padding: '6px 12px', fontSize: '14px' }}>
            Write a Review
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: '#FAFAFA', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
          <h4 style={{ marginBottom: '12px', fontSize: '15px' }}>Your Review</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Rating *</label>
              <StarRating rating={rating} size={24} interactive={true} onRate={setRating} showCount={false} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: 'var(--text-secondary)' }}>Comment (optional)</label>
              <textarea 
                className="input" 
                rows="3" 
                placeholder="Share your experience..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', background: '#FAFAFA', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map(rev => (
            <div key={rev.id} style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{rev.reviewerName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <StarRating rating={rev.rating} showCount={false} />
              </div>
              {rev.comment && (
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '8px' }}>
                  {rev.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
