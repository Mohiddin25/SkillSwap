import React, { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import SendRequestModal from './components/SendRequestModal';
import RatingModal from './components/RatingModal';
import SkillManagerModal from './components/SkillManagerModal';
import ChatModal from './components/ChatModal';

import DashboardView from './views/DashboardView';
import MatchesView from './views/MatchesView';
import RequestsView from './views/RequestsView';
import SessionsView from './views/SessionsView';
import AnalyticsView from './views/AnalyticsView';
import { Sparkles, Users, Lock, LogIn } from 'lucide-react';

const MainLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedSessionForRating, setSelectedSessionForRating] = useState(null);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        <Sparkles size={32} className="gradient-text" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSkills={() => setIsSkillsOpen(true)}
      />

      <main style={{ padding: '0 24px' }}>
        {isAuthenticated ? (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onOpenSkills={() => setIsSkillsOpen(true)}
                onSendRequest={(candidate) => setSelectedCandidate(candidate)}
              />
            )}

            {activeTab === 'matches' && (
              <MatchesView
                onSendRequest={(candidate) => setSelectedCandidate(candidate)}
              />
            )}

            {activeTab === 'requests' && (
              <RequestsView
                onOpenChat={() => setIsChatOpen(true)}
              />
            )}

            {activeTab === 'sessions' && (
              <SessionsView
                onOpenRating={(session) => setSelectedSessionForRating(session)}
              />
            )}

            {activeTab === 'analytics' && <AnalyticsView />}

            {activeTab === 'chat' && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <button onClick={() => setIsChatOpen(true)} className="btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                  Open Live Matches Chat
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <Lock size={30} color="#fff" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>
              Campus Peer Learning Platform
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              Connect with students on campus to teach what you know, learn what you need, and earn Skill Credits.
            </p>
            <button onClick={() => setIsAuthOpen(true)} className="btn-primary" style={{ padding: '12px 24px', fontSize: '1rem', margin: '0 auto' }}>
              <LogIn size={20} /> Sign In / Demo Quick Login
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SendRequestModal
        isOpen={!!selectedCandidate}
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
      <RatingModal
        isOpen={!!selectedSessionForRating}
        session={selectedSessionForRating}
        onClose={() => setSelectedSessionForRating(null)}
      />
      <SkillManagerModal isOpen={isSkillsOpen} onClose={() => setIsSkillsOpen(false)} />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ToastProvider>
  );
}
