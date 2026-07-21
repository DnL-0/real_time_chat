'use client';

// Placeholder for the signed-in experience. For Step 2 it just confirms you're
// logged in and lets you log out. Step 3 replaces this with the real chat UI.
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';

export default function ChatHome() {
  const { user } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-3xl">
        👋
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.displayName || 'friend'}!
        </h1>
        <p className="mt-1 text-gray-500">
          You&apos;re signed in as {user?.email}. Messaging arrives in Step 3.
        </p>
      </div>
      <button
        onClick={() => signOut(auth)}
        className="rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white transition hover:bg-gray-700"
      >
        Log out
      </button>
    </main>
  );
}
