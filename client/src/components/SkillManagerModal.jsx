import React, { useState } from 'react';
import { X, Plus, Trash2, BookOpen, GraduationCap, Clock } from 'lucide-react';
import { userService, availabilityService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SkillManagerModal = ({ isOpen, onClose }) => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState('teach');
  const [teachName, setTeachName] = useState('');
  const [teachLevel, setTeachLevel] = useState('Intermediate');
  const [learnName, setLearnName] = useState('');
  const [learnLevel, setLearnLevel] = useState('Beginner');
  const [dayOfWeek, setDayOfWeek] = useState('Saturday');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('18:00');

  if (!isOpen || !user) return null;

  const handleAddTeachSkill = async (e) => {
    e.preventDefault();
    if (!teachName) return;
    try {
      await userService.addTeachSkill({ skillName: teachName, skillLevel: teachLevel });
      showToast(`Added '${teachName}' to skills you teach`, 'success');
      setTeachName('');
      await refreshProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add teach skill', 'error');
    }
  };

  const handleRemoveTeachSkill = async (skillId) => {
    try {
      await userService.removeTeachSkill(skillId);
      showToast('Teach skill removed', 'info');
      await refreshProfile();
    } catch (err) {
      showToast('Failed to remove skill', 'error');
    }
  };

  const handleAddLearnSkill = async (e) => {
    e.preventDefault();
    if (!learnName) return;
    try {
      await userService.addLearnSkill({ skillName: learnName, desiredLevel: learnLevel });
      showToast(`Added '${learnName}' to skills you want to learn`, 'success');
      setLearnName('');
      await refreshProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add learn skill', 'error');
    }
  };

  const handleRemoveLearnSkill = async (skillId) => {
    try {
      await userService.removeLearnSkill(skillId);
      showToast('Learn skill removed', 'info');
      await refreshProfile();
    } catch (err) {
      showToast('Failed to remove skill', 'error');
    }
  };

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      await availabilityService.createSlot({ dayOfWeek, startTime, endTime });
      showToast('Availability slot added successfully', 'success');
      await refreshProfile();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add slot', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>My Skills & Availability Editor</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage what you teach, learn, and your weekly schedule</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Sub Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <button
            onClick={() => setActiveSubTab('teach')}
            className={activeSubTab === 'teach' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <GraduationCap size={16} /> Skills I Teach
          </button>
          <button
            onClick={() => setActiveSubTab('learn')}
            className={activeSubTab === 'learn' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <BookOpen size={16} /> Skills I Want To Learn
          </button>
          <button
            onClick={() => setActiveSubTab('availability')}
            className={activeSubTab === 'availability' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 14px', fontSize: '0.85rem' }}
          >
            <Clock size={16} /> Availability Slots
          </button>
        </div>

        {/* Teach Tab */}
        {activeSubTab === 'teach' && (
          <div>
            <form onSubmit={handleAddTeachSkill} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                type="text"
                required
                placeholder="Skill name (e.g. Python, Figma, Java)"
                value={teachName}
                onChange={(e) => setTeachName(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              />
              <select
                value={teachLevel}
                onChange={(e) => setTeachLevel(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
                <Plus size={16} /> Add
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(user.skillsToTeach || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f172a', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.skill?.name || 'Skill'}</span>
                    <span className="badge badge-emerald" style={{ marginLeft: '8px' }}>{item.skillLevel}</span>
                  </div>
                  <button onClick={() => handleRemoveTeachSkill(item.skill?._id || item._id)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Learn Tab */}
        {activeSubTab === 'learn' && (
          <div>
            <form onSubmit={handleAddLearnSkill} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                type="text"
                required
                placeholder="Skill name (e.g. UI/UX, React, Excel)"
                value={learnName}
                onChange={(e) => setLearnName(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              />
              <select
                value={learnLevel}
                onChange={(e) => setLearnLevel(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
                <Plus size={16} /> Add
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(user.skillsToLearn || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0f172a', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.skill?.name || 'Skill'}</span>
                    <span className="badge badge-amber" style={{ marginLeft: '8px' }}>{item.desiredLevel}</span>
                  </div>
                  <button onClick={() => handleRemoveLearnSkill(item.skill?._id || item._id)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Availability Tab */}
        {activeSubTab === 'availability' && (
          <div>
            <form onSubmit={handleAddAvailability} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>

              <input
                type="text"
                placeholder="16:00"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{ width: '80px', padding: '8px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff', textAlign: 'center' }}
              />
              <span style={{ alignSelf: 'center' }}>-</span>
              <input
                type="text"
                placeholder="18:00"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{ width: '80px', padding: '8px', borderRadius: '8px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff', textAlign: 'center' }}
              />

              <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
                <Plus size={16} /> Add Slot
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillManagerModal;
