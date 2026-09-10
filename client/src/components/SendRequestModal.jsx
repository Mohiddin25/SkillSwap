import React, { useState } from 'react';
import { Send, X, Clock, MessageSquare } from 'lucide-react';
import { requestService } from '../api/services';
import { useToast } from '../context/ToastContext';

const SendRequestModal = ({ isOpen, onClose, candidate, onSent }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  if (!isOpen || !candidate) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestService.createRequest({
        receiverId: candidate._id,
        message: message || `Hi ${candidate.name}, I would love to swap skills with you!`
      });
      showToast(`Swap request sent to ${candidate.name}!`, 'success');
      onSent && onSent();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send request.';
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Send Swap Request</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>To {candidate.name} ({candidate.department})</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Personalized Message (Optional)
            </label>
            <textarea
              rows={4}
              placeholder={`Hi ${candidate.name}, I saw you teach ${candidate.skillsToTeach?.[0]?.skill?.name || 'skills'}. Let's learn together!`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
            <Send size={16} />
            <span>{loading ? 'Sending Request...' : 'Send Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendRequestModal;
