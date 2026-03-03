'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchUserId, setSearchUserId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    api.getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const startChat = () => {
    if (searchUserId.trim()) {
      router.push(`/chat/${searchUserId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-youapp-dark">
      {/* Header */}
      <div className="flex items-center px-4 py-4 border-b border-white/5">
        <button onClick={() => router.push('/profile')} className="text-white mr-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-white font-semibold text-lg flex-1">Messages</h1>
      </div>

      {/* Search / New Chat */}
      <div className="px-4 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            placeholder="Enter User ID to chat"
            className="flex-1 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && startChat()}
          />
          <button onClick={startChat} className="btn-primary px-4 text-sm">
            Chat
          </button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="px-4">
        {loading ? (
          <div className="text-white/30 text-center py-8">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="text-white/30 text-center py-8">
            No conversations yet. Start chatting!
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => {
                  const otherUser = conv.participants?.find(
                    (p: string) => p !== 'currentUserId'
                  );
                  if (otherUser) router.push(`/chat/${otherUser}`);
                }}
                className="w-full card flex items-center gap-3 hover:bg-white/5 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-youapp-gradient flex items-center justify-center text-white font-bold">
                  U
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white text-sm font-medium">
                    User
                  </p>
                  <p className="text-white/30 text-xs truncate">
                    {conv.lastMessage?.content || 'No messages'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-youapp-blue-btn text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
