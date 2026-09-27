import React, { useState } from 'react';
import { usePokerStore } from '../store/usePokerStore';
import { apiClient } from '../services/apiClient';
import {
  Coins,
  Lock,
  User,
  ArrowLeft,
  Server,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Play,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const auth = usePokerStore((state) => state.auth);
  const authViewMode = usePokerStore((state) => state.authViewMode);
  const setCurrentView = usePokerStore((state) => state.setCurrentView);
  const login = usePokerStore((state) => state.login);
  const register = usePokerStore((state) => state.register);
  const logout = usePokerStore((state) => state.logout);

  const [mode, setMode] = useState<'login' | 'register'>(authViewMode || 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverUrl, setServerUrl] = useState(apiClient.getBaseUrl());
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError('Please provide both username and password.');
      return;
    }

    if (cleanUsername.length < 3 || cleanUsername.length > 32) {
      setError('Username must be between 3 and 32 characters.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      if (showServerConfig && serverUrl.trim()) {
        apiClient.setBaseUrl(serverUrl.trim());
      }

      if (mode === 'login') {
        await login(cleanUsername, password);
      } else {
        await register(cleanUsername, password);
      }
      setCurrentView('home');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials or backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestPlay = () => {
    setCurrentView('home');
  };

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Bar */}
      <header className="p-4 sm:p-6 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-sm shadow">
            ♠
          </div>
          <span className="font-serif-poker font-black text-sm sm:text-base bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
            POKER PRO
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-slate-950/90 border border-slate-800/90 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl relative">
          {/* Card suits subtle watermarks */}
          <div className="absolute top-4 right-5 text-slate-800/40 text-xl font-serif select-none pointer-events-none">
            ♠ ♥ ♦ ♣
          </div>

          {/* If already authenticated */}
          {auth.isAuthenticated ? (
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/7.x/bottts/svg?seed=${auth.username}`}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full border-2 border-amber-400/60 bg-slate-900 shadow-xl"
                />
                <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-emerald-500 text-slate-950 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-100">{auth.username}</h2>
                <div className="flex items-center justify-center gap-1.5 mt-1 text-sm font-extrabold text-amber-400">
                  <Coins className="w-4 h-4" />
                  <span>${auth.chips.toLocaleString()} Chips in Wallet</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setCurrentView('home')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Enter Poker Lobby</span>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-600/40 text-slate-300 hover:text-rose-300 font-bold text-xs transition-colors"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">
                    {mode === 'login' ? 'Player Portal' : 'New Player Welcome'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                  {mode === 'login' ? 'Sign In to Poker' : 'Claim 10,000 Chips'}
                </h2>
                <p className="text-xs text-slate-400">
                  {mode === 'login'
                    ? 'Enter your credentials to access live tables and bankroll.'
                    : 'Create your account to start playing high-stakes Texas Hold’em.'}
                </p>
              </div>

              {/* Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
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
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Bonus banner for registration */}
              {mode === 'register' && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 animate-fade-in">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-amber-300">10,000 Starting Chips</div>
                    <div className="text-slate-400 text-[11px]">Instant welcome credit added to your account!</div>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/70 border border-rose-600/50 text-rose-200 text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Username</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. AceKingHero"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (register mode only) */}
                {mode === 'register' && (
                  <div className="flex flex-col gap-1.5 animate-fade-in">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Confirm Password</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-amber-400 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Server Endpoint Settings Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowServerConfig(!showServerConfig)}
                    className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    <Server className="w-3 h-3" />
                    <span>Server: {serverUrl} (click to edit)</span>
                  </button>

                  {showServerConfig && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 animate-fade-in">
                      <label className="text-[10px] font-semibold text-slate-400 mb-1 block">
                        Custom Backend Host
                      </label>
                      <input
                        type="text"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        placeholder="http://127.0.0.1:8080"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading
                    ? 'Connecting...'
                    : mode === 'login'
                    ? 'Sign In & Enter Tables'
                    : 'Create Account & Claim Chips'}
                </button>

                {/* Guest / Demo Option */}
                <div className="mt-1 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleGuestPlay}
                    className="text-xs text-slate-400 hover:text-amber-400 underline underline-offset-4 transition-colors"
                  >
                    Or continue as Guest (Instant Play)
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-600 z-10">
        <p>Poker Pro Online • Texas Hold'em Platform</p>
      </footer>
    </div>
  );
};
