import { useState } from 'react';
import { LogIn, LogOut, Mail, Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface AdminLoginProps {
  user: User | null;
  isAdmin: boolean;
  onSignIn: (email: string) => Promise<{ error: string | null }>;
  onSignOut: () => Promise<void>;
}

export function AdminLogin({ user, isAdmin, onSignIn, onSignOut }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await onSignIn(email);

    if (error) {
      setMessage(error);
    } else {
      setMessage('Check your email for the login link!');
      setEmail('');
    }

    setLoading(false);
  };

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isAdmin ? 'Admin' : user.email}
        </span>
        <button
          onClick={onSignOut}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <LogIn className="w-4 h-4" />
        Admin Login
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Admin email"
          required
          className="pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-rust w-48"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-3 py-1.5 text-sm bg-rust text-white rounded-lg hover:bg-rust-dark disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Link'}
      </button>
      <button
        type="button"
        onClick={() => {
          setShowForm(false);
          setMessage('');
        }}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
      {message && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{message}</span>
      )}
    </form>
  );
}
