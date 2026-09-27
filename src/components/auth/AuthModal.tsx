import React, { useState } from 'react';
import { usePokerStore } from '../../store/usePokerStore';
import { apiClient } from '../../services/apiClient';
import { X, Lock, User, Coins, LogOut, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const isAuthOpen = usePokerStore((state) => state.isAuthOpen);
  const setIsAuthOpen = usePokerStore((state) => state.setIsAuthOpen);
  const auth = usePokerStore((state) => state.auth);
  const login = usePokerStore((state) => state.login);
  const register = usePokerStore((state) => state.register);
  const logout = usePokerStore((state) => state.logout);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState(apiClient.getBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError('Please fill in both username and password');
      return;
    }

    if (mode === 'register' && (username.length < 3 || username.length > 32)) {
      setError('Username must be between 3 and 32 characters');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      if (showServerConfig && serverUrl) {
        apiClient.setBaseUrl(serverUrl);
      }
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col gap-4">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg">
              {auth.isAuthenticated ? 'Player Profile' : mode === 'login' ? 'Sign In to Poker' : 'Create Account'}
            </h3>
            <p className="text-xs text-slate-400">
              {auth.isAuthenticated
                ? 'Your authenticated session and wallet balance'
                : 'Connect to Texas Hold’em backend'}
            </p>
          </div>
        </div>

        {/* If Already Logged In */}
        {auth.isAuthenticated ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${auth.username}`}
                  alt="avatar"
                  className="w-12 h-12 rounded-full border border-amber-400/40 bg-slate-800"
                />
                <div>
                  <div className="font-bold text-sm text-slate-100">{auth.username}</div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>${auth.chips.toLocaleString()} Chips</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-950/60 border border-emerald-600/40">
                <CheckCircle2 className="w-3 h-3" />
                <span>ONLINE</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-600/40 text-rose-300 font-semibold text-xs sm:text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`py-1.5 rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Username</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. poker_master"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* Server Settings Expandable */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowServerConfig(!showServerConfig)}
                className="flex items-center gap-1.5 text-[10px] text-slate-400 hover:text-slate-300"
              >
                <Server className="w-3 h-3 text-slate-500" />
                <span>Server Endpoint: {serverUrl} (click to change)</span>
              </button>

              {showServerConfig && (
                <div className="mt-1.5 p-2 rounded-lg bg-slate-900/90 border border-slate-800">
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="http://127.0.0.1:8080"
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-200"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Register & Claim 10,000 Chips'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
