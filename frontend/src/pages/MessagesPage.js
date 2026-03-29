import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    api.get('/messages/conversations')
      .then((res) => {
        setConversations(res.data.data.conversations);
        if (userId && res.data.data.conversations.length > 0) {
          const conv = res.data.data.conversations.find((c) => c.participants.some((p) => p._id === userId));
          if (conv) openConversation(conv);
        }
      })
      .catch(() => toast.error('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, [userId]); // eslint-disable-line

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv) => {
    setActiveConv(conv);
    try {
      const res = await api.get(`/messages/conversations/${conv._id}`);
      setMessages(res.data.data.messages);
    } catch { toast.error('Failed to load messages'); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;
    setSending(true);
    const text = messageText.trim();
    setMessageText('');
    try {
      const res = await api.post(`/messages/conversations/${activeConv._id}`, { content: text });
      setMessages((prev) => [...prev, res.data.data.message]);
    } catch { toast.error('Failed to send message'); setMessageText(text); }
    finally { setSending(false); }
  };

  const getOtherParticipant = (conv) => conv.participants?.find((p) => p._id !== user?._id);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-white border-t border-gray-100">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Accept a mentorship request to start messaging</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isActive = activeConv?._id === conv._id;
              return (
                <button key={conv._id} onClick={() => openConversation(conv)} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${isActive ? 'bg-purple-50' : ''}`}>
                  <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=c844ed&color=fff&size=40`} alt={other?.name} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isActive ? 'text-purple-700' : 'text-gray-900'}`}>{other?.name}</p>
                    {conv.lastMessage && <p className="text-xs text-gray-400 truncate">{conv.lastMessage.content}</p>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeConv ? (
        <div className="flex-1 flex flex-col">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
            {(() => { const other = getOtherParticipant(activeConv); return (
              <>
                <img src={other?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(other?.name || 'U')}&background=c844ed&color=fff&size=40`} alt={other?.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{other?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{other?.role}</p>
                </div>
              </>
            ); })()}
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {messages.map((msg) => {
              const isMe = msg.sender?._id === user?._id;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {!isMe && <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'U')}&background=c844ed&color=fff&size=32`} alt="" className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end" />}
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMe ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'}`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="px-5 py-3 border-t border-gray-100 flex gap-3">
            <input value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message..." className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <button type="submit" disabled={sending || !messageText.trim()} className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 transition-colors flex-shrink-0">
              <PaperAirplaneIcon className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-3">💬</p>
            <p className="text-gray-500">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
