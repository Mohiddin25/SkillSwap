import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { chatService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ChatModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadConversations();
    }
  }, [isOpen, user]);

  const loadConversations = async () => {
    try {
      const res = await chatService.getConversations();
      const list = res.data?.data || [];
      setConversations(list);
      if (list.length > 0 && !activeConv) {
        selectConversation(list[0]);
      }
    } catch (err) {
      // ignore
    }
  };

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const res = await chatService.getMessages(conv._id);
      setMessages(res.data?.data || []);
    } catch (err) {
      showToast('Failed to load messages', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;
    try {
      const res = await chatService.sendMessage(activeConv._id, { text });
      setMessages((prev) => [...prev, res.data.data]);
      setText('');
    } catch (err) {
      showToast('Failed to send message', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '800px', height: '560px', padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', height: '100%' }}>
          {/* Conversation List */}
          <div style={{ background: '#0f172a', borderRight: '1px solid var(--border-color)', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Matches Chat</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conversations.length === 0 ? (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '20px' }}>
                  No active match conversations yet. Accept a swap request to start chatting!
                </p>
              ) : (
                conversations.map((conv) => {
                  const partner = conv.participants.find((p) => p._id !== user._id) || conv.participants[0];
                  const isSelected = activeConv?._id === conv._id;
                  return (
                    <div
                      key={conv._id}
                      onClick={() => selectConversation(conv)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: isSelected ? 'var(--primary-gradient)' : 'rgba(30, 41, 59, 0.6)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{partner?.name || 'Peer'}</div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.lastMessage?.text || 'Click to start chatting'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e293b' }}>
            {activeConv ? (
              <>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700 }}>
                  Chat Thread
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {messages.map((msg) => {
                    const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                    return (
                      <div
                        key={msg._id}
                        style={{
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          padding: '10px 14px',
                          borderRadius: '14px',
                          background: isMine ? 'var(--primary-gradient)' : '#0f172a',
                          color: '#fff',
                          fontSize: '0.88rem',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                        }}
                      >
                        {msg.text}
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendMessage} style={{ padding: '14px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: '#0f172a', border: '1px solid var(--border-color)', color: '#fff' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '10px 16px' }}>
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
