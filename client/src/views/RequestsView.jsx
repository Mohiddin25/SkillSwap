import React, { useState, useEffect } from 'react';
import { requestService } from '../api/services';
import { Send, CheckCircle2, XCircle, Clock, MessageSquare, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const RequestsView = ({ onOpenChat }) => {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const [recRes, sentRes] = await Promise.all([
        requestService.getReceivedRequests(),
        requestService.getSentRequests()
      ]);
      setReceivedRequests(recRes.data?.data || []);
      setSentRequests(sentRes.data?.data || []);
    } catch (err) {
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    try {
      await requestService.acceptRequest(id);
      showToast('Swap request accepted! You can now chat.', 'success');
      loadRequests();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to accept request', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      await requestService.rejectRequest(id);
      showToast('Request declined', 'info');
      loadRequests();
    } catch (err) {
      showToast('Failed to decline request', 'error');
    }
  };

  const handleCancel = async (id) => {
    try {
      await requestService.cancelRequest(id);
      showToast('Request cancelled', 'info');
      loadRequests();
    } catch (err) {
      showToast('Failed to cancel request', 'error');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'accepted') return <span className="badge badge-emerald">Accepted</span>;
    if (status === 'pending') return <span className="badge badge-amber">Pending</span>;
    if (status === 'rejected') return <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>Declined</span>;
    return <span className="badge badge-indigo">{status}</span>;
  };

  const list = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Tab Controls */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('received')}
            className={activeTab === 'received' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <ArrowDownLeft size={16} /> Received ({receivedRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={activeTab === 'sent' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
          >
            <ArrowUpRight size={16} /> Sent ({sentRequests.length})
          </button>
        </div>

        <button onClick={loadRequests} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          Refresh
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading requests...</div>
      ) : list.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No {activeTab} swap requests found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {list.map((req) => {
            const partner = activeTab === 'received' ? req.sender : req.receiver;
            return (
              <div key={req._id} className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--secondary-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    {partner?.name ? partner.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{partner?.name || 'Student'}</h4>
                      {getStatusBadge(req.status)}
                      <span className="badge badge-cyan">{req.matchScore}% Match</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      "{req.message || 'Skill swap invitation'}"
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {activeTab === 'received' && req.status === 'pending' && (
                    <>
                      <button onClick={() => handleAccept(req._id)} className="btn-success">
                        <CheckCircle2 size={16} /> Accept
                      </button>
                      <button onClick={() => handleReject(req._id)} className="btn-secondary">
                        <XCircle size={16} /> Decline
                      </button>
                    </>
                  )}

                  {activeTab === 'sent' && req.status === 'pending' && (
                    <button onClick={() => handleCancel(req._id)} className="btn-secondary">
                      Cancel
                    </button>
                  )}

                  {req.status === 'accepted' && (
                    <button onClick={onOpenChat} className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                      <MessageSquare size={16} /> Chat
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RequestsView;
