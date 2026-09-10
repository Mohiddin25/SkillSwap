import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  LayoutDashboard,
  Users,
  Send,
  Calendar,
  TrendingUp,
  MessageSquare,
  Zap,
  Award,
  LogOut,
  LogIn,
  Settings
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, onOpenAuth, onOpenSkills }) => {
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'matches', label: 'Find Matches', icon: Users },
    { id: 'requests', label: 'Requests', icon: Send },
    { id: 'sessions', label: 'Sessions & Credits', icon: Calendar },
    { id: 'analytics', label: 'Trending Demand', icon: TrendingUp },
    { id: 'chat', label: 'Chat', icon: MessageSquare }
  ];

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: '16px',
      zIndex: 100,
      margin: '0 24px 24px 24px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    }}>
      {/* Brand Logo */}
      <div
        onClick={() => setActiveTab('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={22} color="#fff" />
        </div>
        <div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.5px' }} className="gradient-text">
            SkillSwap
          </span>
          <span className="badge badge-indigo" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>
            CAMPUS PEER API
          </span>
        </div>
      </div>

      {/* Nav Links */}
      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? 'var(--primary-gradient)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* User Actions & Profile Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated ? (
          <>
            {/* Skill Credits Badge */}
            <div className="badge badge-amber" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Zap size={14} fill="#fbbf24" />
              <span>{user?.skillCredits || 0} Credits</span>
            </div>

            {/* Contributor Level */}
            <div className="badge badge-cyan" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Award size={14} />
              <span>Lvl {user?.contributorLevel || 1}</span>
            </div>

            {/* Manage Skills Button */}
            <button
              onClick={onOpenSkills}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
              title="Manage Teach/Learn Skills & Availability"
            >
              <Settings size={15} />
              <span>My Skills</span>
            </button>

            {/* User Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '6px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--secondary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <button
                onClick={logout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px'
                }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <button onClick={onOpenAuth} className="btn-primary">
            <LogIn size={18} />
            <span>Sign In / Demo Login</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
