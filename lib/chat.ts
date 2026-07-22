// Firestore data layer for messaging.
//
// Shape in Firestore:
//   users/{uid}                         -> profile (created at signup)
//   conversations/{conversationId}      -> { participants, participantNames, lastMessage, updatedAt }
//   conversations/{conversationId}/messages/{messageId} -> { text, senderId, senderName, createdAt }
//
// conversationId is built from the two user ids sorted + joined, so the same
// pair of people always map to the same conversation regardless of who opens it.
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type UserProfile = {
  uid: string;
  username: string;
  email: string;
  lastActive?: Timestamp | null; // heartbeat timestamp, used for presence
};

// The minimum we need to know about the person on the other side of a chat.
export type Peer = {
  uid: string;
  displayName: string;
};

export type Message = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Timestamp | null; // null for a split second while the server sets it
};

export type Conversation = {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  updatedAt: Timestamp | null;
};

/** Deterministic id for the conversation between two users. */
export function conversationId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

/**
 * Look up a single user by their exact username (case-insensitive). Returns null
 * if nobody has claimed it. This is the only way to discover someone — we never
 * download the whole user directory, so people can't browse/enumerate each other.
 */
export async function findUserByUsername(username: string): Promise<UserProfile | null> {
  const key = username.trim().toLowerCase();
  if (!key) return null;
  const mapping = await getDoc(doc(db, 'usernames', key));
  if (!mapping.exists()) return null;
  const uid = mapping.data().uid as string;
  const profile = await getDoc(doc(db, 'users', uid));
  return profile.exists() ? (profile.data() as UserProfile) : null;
}

/** Live list of the current user's conversations, newest activity first. */
export function subscribeConversations(
  uid: string,
  callback: (conversations: Conversation[]) => void,
) {
  const q = query(collection(db, 'conversations'), where('participants', 'array-contains', uid));
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversation);
    // Sort client-side so we don't need a composite Firestore index.
    list.sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0));
    callback(list);
  });
}

/** Live message thread for a conversation, oldest first. */
export function subscribeMessages(convoId: string, callback: (messages: Message[]) => void) {
  const q = query(
    collection(db, 'conversations', convoId, 'messages'),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Message));
  });
}

/**
 * Send a message. Upserts the conversation doc (so it shows in both users'
 * lists with a preview) and appends to its messages subcollection.
 */
export async function sendMessage(sender: Peer, recipient: Peer, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const convoId = conversationId(sender.uid, recipient.uid);
  const convoRef = doc(db, 'conversations', convoId);

  await setDoc(
    convoRef,
    {
      participants: [sender.uid, recipient.uid],
      participantNames: {
        [sender.uid]: sender.displayName,
        [recipient.uid]: recipient.displayName,
      },
      lastMessage: trimmed,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await addDoc(collection(convoRef, 'messages'), {
    text: trimmed,
    senderId: sender.uid,
    senderName: sender.displayName,
    createdAt: serverTimestamp(),
  });
}
