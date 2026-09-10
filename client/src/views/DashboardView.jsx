import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../api/services';
import { Zap, Award, Star, Users, Send, Calendar, Bell, ArrowRight, CheckCircle2 } from 'lucide-react';

const DashboardView = ({ setActiveTab, onOpenSkills, onSendRequest }) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await dashboardService.getDashboard();
      setData(res.data?.data || null);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading Dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Welcome Banner */}
      <div className="glass-panel" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
        borderColor: 'var(--border-color-glow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>CAMPUS PEER LEARNING</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>
            Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span>! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {user?.department} • {user?.year} • {user?.campus}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setActiveTab('matches')} className="btn-primary">
            <Users size={18} />
            <span>Find Skill Matches</span>
          </button>

          <button onClick={onOpenSkills} className="btn-secondary">
            <span>Manage My Skills</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SKILL CREDITS</span>
            <Zap size={20} color="#fbbf24" fill="#fbbf24" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>
            {data?.skillCredits || user?.skillCredits || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            +1 credit earned per 30m taught
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONTRIBUTOR LEVEL</span>
            <Award size={20} color="#22d3ee" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22d3ee' }}>
            Level {data?.contributorLevel || user?.contributorLevel || 1}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {data?.sessionsCompleted || 0} sessions completed
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>REPUTATION RATING</span>
            <Star size={20} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
            {data?.rating || user?.rating || 5.0} / 5.0
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {data?.totalRatings || 0} peer reviews
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPATIBLE MATCHES</span>
            <Users size={20} color="#818cf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#818cf8' }}>
            {data?.newMatchesCount || 0}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            Ranked by matching algorithm
          </p>
        </div>
      </div>

      {/* Main Grid: Pending Requests & Upcoming Sessions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Pending Requests Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color="#818cf8" /> Pending Swap Requests
            </h3>
            <button onClick={() => setActiveTab('requests')} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.85rem' }}>
              View All <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>

          {(data?.pendingRequests || []).length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No pending incoming requests.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.pendingRequests.map((req) => (
                <div key={req._id} style={{ padding: '12px', background: '#0f172a', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.9rem' }}>{req.sender?.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{req.message || 'Wants to swap skills'}</span>
                  </div>
                  <span className="badge badge-emerald">{req.matchScore}% Match</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#22d3ee" /> Upcoming Sessions
            </h3>
            <button onClick={() => setActiveTab('sessions')} style={{ background: 'none', border: 'none', color: '#22d3ee', cursor: 'pointer', fontSize: '0.85rem' }}>
              View Sessions <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>

          {(data?.upcomingSessions || []).length === 0 ? (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No upcoming sessions scheduled.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.upcomingSessions.map((sess) => (
                <div key={sess._id} style={{ padding: '12px', background: '#0f172a', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sess.skill?.name || 'Skill Swap'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {new Date(sess.scheduledStart).toLocaleString()} • {sess.location}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
