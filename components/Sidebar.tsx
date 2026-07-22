'use client';

// The left pane. Empty search box -> your existing conversations. Type an exact
// username and hit Enter -> we look up that one person (you can't browse or
// enumerate other users). Selecting a result or a conversation opens the chat.
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  findUserByUsername,
  subscribeConversations,
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
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(''); // the last username actually searched
  const [result, setResult] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => subscribeConversations(me.uid, setConversations), [me.uid]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const term = search.trim();
    if (!term) {
      setSubmitted('');
      return;
    }
    setSearching(true);
    setSubmitted(term);
    setResult(await findUserByUsername(term));
    setSearching(false);
  }

  function openPeer(peer: Peer) {
    onSelectPeer(peer);
    setSearch('');
    setSubmitted('');
    setResult(null);
  }

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
      <form onSubmit={handleSearch} className="p-3">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!e.target.value.trim()) {
              setSubmitted('');
              setResult(null);
            }
          }}
          placeholder="Enter a username…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </form>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {submitted ? (
          <>
            <p className="px-4 pt-1 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Search result
            </p>
            {searching ? (
              <p className="px-4 py-4 text-sm text-gray-400">Searching…</p>
            ) : !result ? (
              <p className="px-4 py-4 text-sm text-gray-400">
                No user named &ldquo;{submitted}&rdquo;.
              </p>
            ) : result.uid === me.uid ? (
              <p className="px-4 py-4 text-sm text-gray-400">That&apos;s you 🙂</p>
            ) : (
              <Row
                title={result.username}
                subtitle={`@${result.username.toLowerCase()}`}
                active={result.uid === activePeerId}
                onClick={() => openPeer({ uid: result.uid, displayName: result.username })}
              />
            )}
          </>
        ) : conversations.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-gray-400">
            No chats yet. Enter a username above to start one.
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
                onClick={() => openPeer({ uid: otherId, displayName: otherName })}
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
