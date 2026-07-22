'use client';

// Routes between the three states of the app based on Firebase auth:
//   loading   -> a spinner while we check for a saved session
//   no user   -> the login / signup screen
//   signed in -> the chat home
import { useAuth } from '@/lib/AuthContext';
import AuthScreen from '@/components/AuthScreen';
import ChatLayout from '@/components/ChatLayout';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-500" />
      </main>
    );
  }

  return user ? <ChatLayout /> : <AuthScreen />;
}
