// Turn a display name into up to two uppercase initials for avatar circles.
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Human-friendly "last seen" text from a millisecond timestamp (RTDB presence).
export function lastSeenLabel(ms: number | null | undefined): string {
  if (!ms) return 'offline';

  const d = new Date(ms);
  const sameDay = d.toDateString() === new Date().toDateString();
  const when = sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `last seen ${when}`;
}
