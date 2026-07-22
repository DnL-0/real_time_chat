'use client';

// Realtime presence via Firebase Realtime Database.
//
// The trick is onDisconnect(): we tell Firebase's servers up front "if this
// client drops, mark them offline". That fires within seconds of a tab closing,
// a network drop, or even a crash — no reliance on browser unload events — so
// online/offline is effectively instant, both ways. Presence lives in RTDB at
// status/{uid}; messages/profiles stay in Firestore.
import { useEffect } from 'react';
import { onDisconnect, onValue, ref, serverTimestamp, set } from 'firebase/database';
import { rtdb } from './firebase';

export type Presence = {
  state: 'online' | 'offline';
  lastChanged: number | null;
};

/** Keep the signed-in user's presence node live while mounted. */
export function usePresence(uid: string | undefined) {
  useEffect(() => {
    if (!uid || !rtdb) return;

    const connectedRef = ref(rtdb, '.info/connected');
    const statusRef = ref(rtdb, `status/${uid}`);

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === false) return; // not connected; nothing to arm yet

      // Register the offline write with the server FIRST, then go online.
      onDisconnect(statusRef)
        .set({ state: 'offline', lastChanged: serverTimestamp() })
        .then(() => set(statusRef, { state: 'online', lastChanged: serverTimestamp() }));
    });

    return () => {
      unsubscribe();
      // Best-effort immediate offline on logout / unmount.
      set(statusRef, { state: 'offline', lastChanged: serverTimestamp() });
    };
  }, [uid]);
}

/** Live subscription to another user's presence. Returns an unsubscribe fn. */
export function subscribePresence(uid: string, callback: (presence: Presence | null) => void) {
  if (!rtdb) {
    callback(null);
    return () => {};
  }
  const statusRef = ref(rtdb, `status/${uid}`);
  return onValue(statusRef, (snap) => callback(snap.val() as Presence | null));
}
