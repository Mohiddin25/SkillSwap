import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, UserCheck, ShieldCheck, Mail, Lock, User, Building, GraduationCap, X } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const { login, register, quickDemoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Computer Science',
    year: '3rd Year',
    campus: 'Main Campus',
    bio: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (isRegister) {
      success = await register(formData);
    } else {
      success = await login(formData.email, formData.password);
    }
    if (success) {
      onClose();
    }
  };

  const handleDemoLogin = async (email, password) => {
    const success = await quickDemoLogin(email, password);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {isRegister ? 'Create Student Account' : 'Welcome Back'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {isRegister ? 'Join campus peer learning community' : 'Sign in to access matches & swap sessions'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Demo Quick Logins */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#818cf8', display: 'block', marginBottom: '10px' }}>
            🚀 Instant Demo Logins
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleDemoLogin('studenta@campus.edu', 'Password123!')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
            >
              <UserCheck size={14} color="#34d399" />
              Student A (Alex)
            </button>

            <button
              onClick={() => handleDemoLogin('studentb@campus.edu', 'Password123!')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
            >
              <UserCheck size={14} color="#22d3ee" />
              Student B (Bianca)
            </button>

            <button
              onClick={() => handleDemoLogin('admin@campus.edu', 'AdminPassword123!')}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '6px', justifyContent: 'center' }}
            >
              <ShieldCheck size={14} color="#fbbf24" />
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                required
                placeholder="Alex Mercer"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Campus Email</label>
            <input
              type="email"
              required
              placeholder="student@campus.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
            />
          </div>

          {isRegister && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Year of Study</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', justifyContent: 'center', padding: '12px' }}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
