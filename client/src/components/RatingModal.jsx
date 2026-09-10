import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { ratingService } from '../api/services';
import { useToast } from '../context/ToastContext';

const RatingModal = ({ isOpen, onClose, session, onRated }) => {
  const [score, setScore] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !session) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ratingService.createRating({
        sessionId: session._id,
        score,
        feedback,
        communication: score,
        teachingQuality: score,
        punctuality: score
      });
      showToast('Rating submitted successfully! Reputation updated.', 'success');
      onRated && onRated();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit rating.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Rate Session Partner</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>How was your learning experience?</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Star Selection */}
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  fill={star <= score ? '#fbbf24' : 'transparent'}
                  color={star <= score ? '#fbbf24' : '#475569'}
                  onClick={() => setScore(star)}
                  style={{ cursor: 'pointer', transition: 'all 0.1s ease' }}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fbbf24' }}>
              {score} Out of 5 Stars
            </span>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Feedback / Review (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Great explanation of concepts, very punctual!"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#0f172a',
                border: '1px solid var(--border-color)',
                color: '#fff',
                resize: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '12px' }}
          >
            <span>{loading ? 'Submitting...' : 'Submit Rating'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
