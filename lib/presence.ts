'use client';

// Keeps the signed-in user's `lastActive` timestamp fresh so others can see an
// "online" / "last seen" status. We heartbeat every 30s (and whenever the tab
// becomes visible again). If the tab closes, the heartbeat simply stops and
// others will see the user go stale after ~90s — no unreliable unload handler
// needed, and it stays entirely within Firestore.
import { useEffect } from 'react';
import { touchPresence } from './chat';

const HEARTBEAT_MS = 30_000;

export function usePresence(uid: string | undefined) {
  useEffect(() => {
    if (!uid) return;

    touchPresence(uid);
    const interval = setInterval(() => touchPresence(uid), HEARTBEAT_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') touchPresence(uid);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [uid]);
}
