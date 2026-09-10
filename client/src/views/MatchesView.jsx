import React, { useState, useEffect } from 'react';
import { matchingService } from '../api/services';
import MatchCard from '../components/MatchCard';
import { SlidersHorizontal, Search, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const MatchesView = ({ onSendRequest }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(50);
  const [skillSearch, setSkillSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [campus, setCampus] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    loadMatches();
  }, [minScore, department, campus]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await matchingService.getMatches({
        minScore,
        skill: skillSearch || undefined,
        department: department || undefined,
        campus: campus || undefined,
        limit: 20
      });
      setMatches(res.data?.data?.matches || []);
    } catch (err) {
      showToast('Failed to load matches.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadMatches();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search & Filter Header Control Bar */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Smart Match Engine</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Intelligent 50/25/15/10 weighting algorithm matching skills, schedule overlap, and levels
            </p>
          </div>
          <button onClick={loadMatches} className="btn-secondary" style={{ padding: '8px 14px' }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* Filter Controls */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Minimum Match Score ({minScore}%)
            </label>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: 'var(--accent-indigo)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Filter by Skill
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="e.g. Python, UI/UX"
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff', fontSize: '0.85rem' }}
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '9px', justifyContent: 'center' }}>
            <Filter size={16} /> Filter Results
          </button>
        </form>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Calculating matches...</div>
      ) : matches.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No compatible matches found matching your filters. Try lowering the minimum match score slider!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {matches.map((matchItem, idx) => (
            <MatchCard
              key={idx}
              matchData={matchItem}
              onRequestSwap={(candidate) => onSendRequest(candidate)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchesView;
