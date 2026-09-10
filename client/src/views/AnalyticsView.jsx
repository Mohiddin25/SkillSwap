import React, { useState, useEffect } from 'react';
import { analyticsService } from '../api/services';
import { TrendingUp, Users, GraduationCap, AlertCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const AnalyticsView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await analyticsService.getTrendingSkills();
      setData(res.data?.data || []);
    } catch (err) {
      showToast('Failed to load campus demand analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={24} color="#818cf8" /> Campus Skill Demand Analytics
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Real-time tracking of skills wanted by students vs teacher availability across campus
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading analytics...</div>
      ) : data.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No analytics data available yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {data.map((item, idx) => (
            <div key={idx} className="glass-panel glass-panel-hover" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{item.skill}</h4>
                <span className="badge badge-indigo">{item.category}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', fontSize: '0.85rem' }}>
                <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Learners Wanting</span>
                  <strong style={{ fontSize: '1.1rem', color: '#22d3ee' }}>{item.learners}</strong>
                </div>

                <div style={{ background: '#0f172a', padding: '10px', borderRadius: '8px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem' }}>Teachers Available</span>
                  <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>{item.teachers}</strong>
                </div>
              </div>

              {/* Demand Score Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Campus Demand Score</span>
                  <strong style={{ color: '#fbbf24' }}>{item.demandScore} pts</strong>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, item.demandScore * 5)}%`,
                    height: '100%',
                    background: 'var(--primary-gradient)',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyticsView;
