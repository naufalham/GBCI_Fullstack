'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { Message } from '@/types';

export default function ChatRoom() {
  const router = useRouter();
  const params = useParams();
  const receiverId = params.userId as string;
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    try {
      const data = await api.viewMessages(receiverId);
      setMessages(data.messages);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, [receiverId]);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    fetchMessages();
  }, [router, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
      // Mark as read
      socket.emit('markAsRead', { senderId: receiverId });
    };

    const handleTyping = (data: { userId: string }) => {
      if (data.userId === receiverId) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };

    const handleStopTyping = (data: { userId: string }) => {
      if (data.userId === receiverId) {
        setIsTyping(false);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageSent', handleNewMessage);
    socket.on('userTyping', handleTyping);
    socket.on('userStoppedTyping', handleStopTyping);

    // Mark existing messages as read
    socket.emit('markAsRead', { senderId: receiverId });

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageSent', handleNewMessage);
      socket.off('userTyping', handleTyping);
      socket.off('userStoppedTyping', handleStopTyping);
    };
  }, [socket, receiverId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const content = input.trim();
    setInput('');

    // Send via socket if connected, otherwise via REST API
    if (socket && connected) {
      socket.emit('sendMessage', { receiverId, content });
      socket.emit('stopTyping', { receiverId });
    } else {
      try {
        const msg = await api.sendMessage({ receiverId, content });
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (socket && connected) {
      socket.emit('typing', { receiverId });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-youapp-dark">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-white/5 shrink-0">
        <button onClick={() => router.push('/chat')} className="text-white mr-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-white font-semibold text-sm">Chat</h1>
          <p className="text-white/30 text-xs">
            {connected ? (isTyping ? 'Typing...' : 'Online') : 'Connecting...'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="text-white/30 text-center py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-white/30 text-center py-8">
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = msg.senderId !== receiverId;
            return (
              <div
                key={msg._id || i}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-youapp-blue-btn text-white rounded-br-sm'
                      : 'bg-white/10 text-white rounded-bl-sm'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-white/30'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="bg-youapp-blue-btn text-white p-3 rounded-xl disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
