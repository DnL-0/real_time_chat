'use client';

// The signed-out experience: one card that toggles between "Log in" and
// "Sign up". On sign up we create the Firebase auth account, set the display
// name, and save a small profile doc to Firestore so others can find the user
// later (Step 3). Firebase persists the session, so onAuthStateChanged in
// AuthContext will flip the whole app over to the chat view automatically.
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { signUp } from '@/lib/auth';

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered — try logging in instead.';
    case 'auth/invalid-email':
      return "That doesn't look like a valid email address.";
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignup = mode === 'signup';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isSignup) {
        await signUp(username, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      // On success, AuthContext takes over and renders the chat view.
    } catch (err) {
      if (err instanceof FirebaseError) setError(friendlyError(err.code));
      else if (err instanceof Error) setError(err.message);
      else setError('Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup');
    setError('');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-2xl">
            💬
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ripple</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. jane_doe"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                autoComplete="username"
              />
              <p className="mt-1 text-xs text-gray-400">
                Unique. 3–20 letters, numbers, or underscores. Others find you by this.
              </p>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 py-2.5 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-60"
          >
            {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={switchMode}
            className="font-semibold text-indigo-600 hover:underline"
          >
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </main>
  );
}
