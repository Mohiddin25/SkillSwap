import React, { useState, useEffect } from 'react';
import { sessionService, creditService } from '../api/services';
import { Calendar, CheckCircle2, Zap, Clock, Star } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const SessionsView = ({ onOpenRating }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [creditHistory, setCreditHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessRes, credRes] = await Promise.all([
        sessionService.getMySessions(),
        creditService.getHistory()
      ]);
      setSessions(sessRes.data?.data || []);
      setCreditHistory(credRes.data?.data?.history || []);
      setBalance(credRes.data?.data?.balance || 0);
    } catch (err) {
      showToast('Failed to load session and credit data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async (session) => {
    try {
      await sessionService.completeSession(session._id);
      showToast('Session marked complete! +1 Skill Credit awarded.', 'success');
      loadData();
      onOpenRating(session);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete session', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Credit Balance Header Widget */}
      <div className="glass-panel" style={{
        padding: '24px',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={28} color="#0f172a" fill="#0f172a" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Skill Credit Balance</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>1 Credit earned per 30 minutes taught</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24' }}>
            {balance} Credits
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={20} color="#22d3ee" /> My Swap Sessions
        </h3>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No sessions created yet. Accept a swap request to schedule a session!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {sessions.map((sess) => {
              const isTeacher = sess.teacher?._id === user?._id || sess.teacher === user?._id;
              return (
                <div key={sess._id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className="badge badge-indigo" style={{ marginBottom: '4px' }}>{isTeacher ? 'TEACHING' : 'LEARNING'}</span>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{sess.skill?.name || 'Skill Session'}</h4>
                    </div>
                    <span className={`badge ${sess.status === 'completed' ? 'badge-emerald' : 'badge-amber'}`}>
                      {sess.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Scheduled:</strong> {new Date(sess.scheduledStart).toLocaleString()}</div>
                    <div><strong>Location:</strong> {sess.location}</div>
                  </div>

                  {sess.status === 'scheduled' && (
                    <button onClick={() => handleCompleteSession(sess)} className="btn-success" style={{ width: '100%', justifyContent: 'center', padding: '8px', marginTop: '6px' }}>
                      <CheckCircle2 size={16} /> Mark Completed (+1 Credit)
                    </button>
                  )}

                  {sess.status === 'completed' && (
                    <button onClick={() => onOpenRating(sess)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px', marginTop: '6px' }}>
                      <Star size={16} color="#fbbf24" /> Rate Partner
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Credit History Table */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#818cf8" /> Credit Transaction History
        </h3>

        {creditHistory.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No transaction history recorded.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Date</th>
                <th style={{ padding: '10px' }}>Type</th>
                <th style={{ padding: '10px' }}>Reason</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {creditHistory.map((tx) => (
                <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '10px' }}><span className="badge badge-indigo">{tx.type}</span></td>
                  <td style={{ padding: '10px' }}>{tx.reason}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: tx.amount > 0 ? '#34d399' : '#f87171' }}>
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SessionsView;
