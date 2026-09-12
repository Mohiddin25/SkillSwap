import React, { useState, useEffect } from 'react';
import { X, Send, MessageSquare, Trash2, AlertTriangle } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    setShowDeleteConfirm(false);
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

  const handleDeleteConversation = async () => {
    if (!activeConv) return;
    try {
      await chatService.deleteConversation(activeConv._id);
      showToast('Chat conversation deleted', 'success');
      const updatedList = conversations.filter((c) => c._id !== activeConv._id);
      setConversations(updatedList);
      if (updatedList.length > 0) {
        selectConversation(updatedList[0]);
      } else {
        setActiveConv(null);
        setMessages([]);
      }
      setShowDeleteConfirm(false);
    } catch (err) {
      showToast('Failed to delete conversation', 'error');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!activeConv) return;
    try {
      await chatService.deleteMessage(activeConv._id, messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      showToast('Message deleted', 'success');
    } catch (err) {
      showToast('Failed to delete message', 'error');
    }
  };

  if (!isOpen) return null;

  const currentPartner = activeConv
    ? activeConv.participants.find((p) => (p._id || p) !== user._id) || activeConv.participants[0]
    : null;

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
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e293b', position: 'relative' }}>
            {activeConv ? (
              <>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Chat with {currentPartner?.name || 'Peer'}</span>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    title="Delete Chat"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.78rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={14} /> Delete Chat
                  </button>
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
                          position: 'relative'
                        }}
                        className="group"
                      >
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: '14px',
                            background: isMine ? 'var(--primary-gradient)' : '#0f172a',
                            color: '#fff',
                            fontSize: '0.88rem',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <span>{msg.text}</span>
                          {isMine && (
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              title="Delete message"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'rgba(255, 255, 255, 0.7)',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'inline-flex'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
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

            {/* Confirmation Overlay Modal */}
            {showDeleteConfirm && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.92)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                padding: '20px',
                zIndex: 10
              }}>
                <div style={{
                  background: '#1e293b',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '24px',
                  maxWidth: '360px',
                  width: '100%',
                  textAlign: 'center',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                }}>
                  <AlertTriangle size={36} color="#f87171" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>Delete Chat History?</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    This will delete all messages in this conversation. This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--border-color)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteConversation}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: '#ef4444',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      Yes, Delete Chat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

