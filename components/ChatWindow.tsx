'use client';

// The right-hand pane: a live message thread with the selected person, plus a
// composer. Subscribes to Firestore so new messages (from either side) appear
// instantly, and auto-scrolls to the newest one.
import { useEffect, useRef, useState } from 'react';
import { subscribeMessages, sendMessage, type Message, type Peer } from '@/lib/chat';
import { subscribePresence, type Presence } from '@/lib/presence';
import { initials, lastSeenLabel } from '@/lib/format';

export default function ChatWindow({ me, peer }: { me: Peer; peer: Peer }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [presence, setPresence] = useState<Presence | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Re-subscribe whenever the selected peer changes.
  useEffect(() => {
    setMessages([]);
    const convoId = [me.uid, peer.uid].sort().join('_');
    const unsub = subscribeMessages(convoId, setMessages);
    return unsub;
  }, [me.uid, peer.uid]);

  // Watch the peer's realtime presence (updates instantly via onDisconnect).
  useEffect(() => {
    setPresence(null);
    return subscribePresence(peer.uid, setPresence);
  }, [peer.uid]);

  const online = presence?.state === 'online';

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const toSend = text;
    if (!toSend.trim() || sending) return;
    setText('');
    setSending(true);
    try {
      await sendMessage(me, peer, toSend);
    } catch {
      setText(toSend); // restore on failure so nothing is lost
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="flex h-full flex-1 flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-3">
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-sm font-semibold text-white">
            {initials(peer.displayName)}
          </div>
          {online && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{peer.displayName}</p>
          <p className={`text-xs ${online ? 'text-green-600' : 'text-gray-400'}`}>
            {online ? 'online' : lastSeenLabel(presence?.lastChanged)}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">
            No messages yet — say hello 👋
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me.uid;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                    mine
                      ? 'rounded-br-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white'
                      : 'rounded-bl-sm bg-white text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-right text-[10px] ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                    {m.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-gray-200 bg-white px-4 py-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${peer.displayName}…`}
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 px-5 py-2 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </section>
  );
}
