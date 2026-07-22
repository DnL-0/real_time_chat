'use client';

// The signed-in experience: sidebar + chat window. Owns which peer is selected
// and passes it down. Shown by app/page.tsx once a user is logged in.
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { usePresence } from '@/lib/presence';
import type { Peer } from '@/lib/chat';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';

export default function ChatLayout() {
  const { user } = useAuth();
  const [peer, setPeer] = useState<Peer | null>(null);

  // Keep our own presence heartbeat alive while signed in.
  usePresence(user?.uid);

  // useAuth guarantees a user here (page.tsx only renders this when signed in).
  const me: Peer = {
    uid: user!.uid,
    displayName: user!.displayName || user!.email || 'Me',
  };

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <Sidebar me={me} activePeerId={peer?.uid ?? null} onSelectPeer={setPeer} />
      {peer ? (
        <ChatWindow me={me} peer={peer} />
      ) : (
        <section className="flex h-full flex-1 flex-col items-center justify-center gap-3 bg-gray-50 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-3xl">
            💬
          </div>
          <p className="text-lg font-semibold text-gray-800">Your messages</p>
          <p className="max-w-xs text-sm text-gray-400">
            Search for someone in the sidebar to start a conversation.
          </p>
        </section>
      )}
    </main>
  );
}
