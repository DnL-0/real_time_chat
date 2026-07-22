// Turn a display name into up to two uppercase initials for avatar circles.
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Derive presence from a heartbeat timestamp. Considered "online" if active in
// the last 90s; otherwise reports when they were last seen.
export function presenceFromLastActive(
  lastActive: { toMillis: () => number } | null | undefined,
): { online: boolean; label: string } {
  if (!lastActive) return { online: false, label: 'offline' };

  const ms = lastActive.toMillis();
  if (Date.now() - ms < 90_000) return { online: true, label: 'online' };

  const d = new Date(ms);
  const sameDay = d.toDateString() === new Date().toDateString();
  const when = sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return { online: false, label: `last seen ${when}` };
}
