'use client';

// The left pane. When the search box is empty it shows your existing
// conversations (newest first). When you type, it switches to searching the
// user directory so you can start a new chat. Selecting either one tells the
// parent which peer to open.
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  subscribeConversations,
  subscribeUsers,
  type Conversation,
  type Peer,
  type UserProfile,
} from '@/lib/chat';
import { initials } from '@/lib/format';

export default function Sidebar({
  me,
  activePeerId,
  onSelectPeer,
}: {
  me: Peer;
  activePeerId: string | null;
  onSelectPeer: (peer: Peer) => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => subscribeConversations(me.uid, setConversations), [me.uid]);
  useEffect(() => subscribeUsers(setUsers), []);

  const searching = search.trim().length > 0;
  const matches = users
    .filter((u) => u.uid !== me.uid)
    .filter((u) => u.displayName.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Current user + logout */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-sm font-semibold text-white">
          {initials(me.displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-gray-900">{me.displayName}</p>
          <p className="text-xs text-gray-400">You</p>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
        >
          Log out
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people to chat…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {searching ? (
          matches.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-400">No people found.</p>
          ) : (
            matches.map((u) => (
              <Row
                key={u.uid}
                title={u.displayName}
                subtitle={u.email}
                active={u.uid === activePeerId}
                onClick={() => {
                  onSelectPeer({ uid: u.uid, displayName: u.displayName });
                  setSearch('');
                }}
              />
            ))
          )
        ) : conversations.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">
            No chats yet. Search for someone to start.
          </p>
        ) : (
          conversations.map((c) => {
            const otherId = c.participants.find((p) => p !== me.uid) ?? '';
            const otherName = c.participantNames?.[otherId] ?? 'Unknown';
            return (
              <Row
                key={c.id}
                title={otherName}
                subtitle={c.lastMessage}
                active={otherId === activePeerId}
                onClick={() => onSelectPeer({ uid: otherId, displayName: otherName })}
              />
            );
          })
        )}
      </div>
    </aside>
  );
}

function Row({
  title,
  subtitle,
  active,
  onClick,
}: {
  title: string;
  subtitle?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${
        active ? 'bg-indigo-50' : ''
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 text-sm font-semibold text-white">
        {initials(title)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">{title}</p>
        {subtitle && <p className="truncate text-xs text-gray-400">{subtitle}</p>}
      </div>
    </button>
  );
}
