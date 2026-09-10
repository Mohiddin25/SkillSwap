import React, { useState } from 'react';
import { Star, MapPin, Clock, ChevronDown, ChevronUp, Send, CheckCircle2, Award, Zap } from 'lucide-react';

const MatchCard = ({ matchData, onRequestSwap }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { candidate, matchScore, skillScore, availabilityScore, levelScore, locationScore, matchedSkills, commonAvailability } = matchData;

  const getScoreColor = (score) => {
    if (score >= 85) return 'var(--status-success)';
    if (score >= 65) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#94a3b8';
  };

  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.3rem',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)'
          }}>
            {candidate.name ? candidate.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{candidate.name}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span className="badge badge-indigo">{candidate.department}</span>
              <span className="badge badge-cyan">{candidate.year}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={13} />
                {candidate.campus}
              </span>
            </div>
          </div>
        </div>

        {/* Match Score Gauge Badge */}
        <div style={{
          textAlign: 'right',
          background: `rgba(15, 23, 42, 0.8)`,
          border: `1.5px solid ${getScoreColor(matchScore)}`,
          padding: '8px 14px',
          borderRadius: '14px'
        }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: getScoreColor(matchScore) }}>
            {matchScore}%
          </div>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
            Match Score
          </span>
        </div>
      </div>

      {/* Taught & Desired Skills Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '10px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Teaches
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(matchedSkills?.theyTeachWhatIWant || []).length > 0 ? (
              matchedSkills.theyTeachWhatIWant.map((item, idx) => (
                <span key={idx} className="badge badge-emerald">
                  {item.skill?.name || 'Skill'} ({item.teacherLevel})
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {(candidate.skillsToTeach || []).map(s => s.skill?.name).join(', ') || 'Various Skills'}
              </span>
            )}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Wants to Learn
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {(matchedSkills?.iTeachWhatTheyWant || []).length > 0 ? (
              matchedSkills.iTeachWhatTheyWant.map((item, idx) => (
                <span key={idx} className="badge badge-amber">
                  {item.skill?.name || 'Skill'}
                </span>
              ))
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {(candidate.skillsToLearn || []).map(s => s.skill?.name).join(', ') || 'Various Skills'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Common Availability Time Slots */}
      {(commonAvailability || []).length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(6, 182, 212, 0.1)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
          <Clock size={16} color="#22d3ee" />
          <span style={{ fontSize: '0.82rem', color: '#22d3ee', fontWeight: 500 }}>
            Common Availability: {commonAvailability.map(slot => `${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`).join(', ')}
          </span>
        </div>
      )}

      {/* Accordion Breakdown Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        {showDetails ? 'Hide Score Breakdown' : 'View Score Breakdown (50/25/15/10)'}
      </button>

      {/* Breakdown Accordion Details */}
      {showDetails && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          padding: '12px',
          background: '#0f172a',
          borderRadius: '8px',
          fontSize: '0.8rem'
        }}>
          <div>Skill Match (50%): <strong style={{ color: '#818cf8' }}>{skillScore}%</strong></div>
          <div>Availability (25%): <strong style={{ color: '#22d3ee' }}>{availabilityScore}%</strong></div>
          <div>Skill Level (15%): <strong style={{ color: '#34d399' }}>{levelScore}%</strong></div>
          <div>Location (10%): <strong style={{ color: '#fbbf24' }}>{locationScore}%</strong></div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onRequestSwap(candidate)}
        className="btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: '4px' }}
      >
        <Send size={16} />
        <span>Send Swap Request</span>
      </button>
    </div>
  );
};

export default MatchCard;
