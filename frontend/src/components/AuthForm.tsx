import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

type Mode = 'login' | 'signup';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthForm = () => {
  const { login, signup, isLoading, authError } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
    setLocalError(null);
  };

  const validate = () => {
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return false;
    }
    setLocalError(null);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    const payload = { email: email.trim().toLowerCase(), password };
    try {
      if (mode === 'login') {
        await login(payload);
      } else {
        await signup(payload);
      }
    } catch {
      // error is handled via context state
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-slate-900/60 p-8 shadow-lg backdrop-blur">
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
          Modelia
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          AI Fashion Studio
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {mode === 'login'
            ? 'Welcome back! Sign in to continue creating looks.'
            : 'Create an account to start generating fashion imagery.'}
        </p>
      </header>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-200" htmlFor="email">
          Email address
          <input
            id="email"
            type="email"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-200" htmlFor="password">
          Password
          <input
            id="password"
            type="password"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/40"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={8}
          />
        </label>

        {(localError || authError) && (
          <p role="alert" className="text-sm text-rose-400">
            {localError ?? authError}
          </p>
        )}

        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:bg-slate-600"
          disabled={isLoading}
        >
          {isLoading ? 'Processing…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {mode === 'login' ? "New to Modelia?" : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={toggleMode}
          className="font-semibold text-brand-400 hover:text-brand-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          {mode === 'login' ? 'Create an account' : 'Log in'}
        </button>
      </p>
    </div>
  );
};

