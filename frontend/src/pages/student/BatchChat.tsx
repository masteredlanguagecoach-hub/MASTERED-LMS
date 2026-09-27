import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { chatApi } from '../../api/client';
import { ChatMessage, Announcement } from '../../types';
import StatusBadge from '../../components/ui/StatusBadge';
import {
  MessageSquare,
  Bell,
  Send,
  User,
  Paperclip,
  CheckCheck,
  Megaphone,
  Clock
} from 'lucide-react';

interface ChatResponse {
  messages: ChatMessage[];
  total: number;
}

export default function BatchChat() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'chat' | 'announcements'>('chat');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chatData, refetch: refetchChat } = useApi<ChatResponse>(() =>
    chatApi.getMessages()
  );

  const { data: announcementsData } = useApi<Announcement[]>(() =>
    chatApi.getAnnouncements()
  );

  const messages = chatData?.messages || [];
  const announcements = announcementsData || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      await chatApi.sendMessage('BAT000001', messageText.trim());
      setMessageText('');
      refetchChat();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header and Tab switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gray-900)' }}>
            Batch Communication Hub
          </h2>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.9rem' }}>
            FSWD - Batch 2026 A • Real-time discussions & official faculty announcements.
          </p>
        </div>

        <div style={{ display: 'flex', background: 'var(--gray-200)', borderRadius: 'var(--radius-md)', padding: 3 }}>
          <button
            onClick={() => setActiveTab('chat')}
            className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : ''}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <MessageSquare size={16} />
            <span>Batch Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`btn btn-sm ${activeTab === 'announcements' ? 'btn-primary' : ''}`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            <Megaphone size={16} />
            <span>Announcements ({announcements.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="card chat-container" style={{ padding: 0 }}>
          {/* Chat header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Active Batch Discussion</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              Messages saved to Google Sheets
            </span>
          </div>

          {/* Messages list */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                No messages in this batch channel yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === user?.userId || msg.senderName.includes(user?.fullName || '');

                return (
                  <div key={msg.messageId} className={`chat-message ${isOwn ? 'own' : ''}`}>
                    <div className="chat-bubble">
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: 4, color: isOwn ? 'rgba(255,255,255,0.9)' : 'var(--primary)' }}>
                        {msg.senderName} • {msg.senderRole}
                      </div>
                      <div style={{ lineHeight: 1.4 }}>{msg.messageText}</div>
                      <div style={{ fontSize: '0.65rem', textAlign: 'right', marginTop: 4, color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--gray-400)' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input form */}
          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your message to batch members..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !messageText.trim()}
              className="btn btn-primary"
              style={{ borderRadius: 'var(--radius-full)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <span>Send</span>
              <Send size={16} />
            </button>
          </form>
        </div>
      ) : (
        /* Announcements view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {announcements.length === 0 ? (
            <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--gray-500)' }}>
              No active announcements published for this batch.
            </div>
          ) : (
            announcements.map((ann) => (
              <div key={ann.announcementId} className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span className={`badge ${ann.priority === 'HIGH' ? 'badge-danger' : 'badge-primary'}`}>
                    {ann.priority} PRIORITY
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    <Clock size={14} />
                    <span>{new Date(ann.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
                  {ann.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {ann.content}
                </p>

                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--gray-100)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                  Published by: <strong>{ann.publishedBy}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
