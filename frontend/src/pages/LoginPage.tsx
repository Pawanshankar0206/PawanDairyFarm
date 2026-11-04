import React, { useState } from 'react';
import { Milk, Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoRole = (userVal: string, passVal: string) => {
    setUsername(userVal);
    setPassword(passVal);
    setError(null);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-charcoal-950 overflow-hidden">
      {/* Background Ambience & Premium Farm Aesthetic */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2000&q=80"
          alt="Dairy Farm Pasture"
          className="w-full h-full object-cover opacity-20 filter contrast-125 saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/80 to-charcoal-900/90 backdrop-blur-[2px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Emblem */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-0.5 shadow-2xl shadow-emerald-950 border border-emerald-400/40 mb-3 group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Milk className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider font-display">
            DAIRY<span className="text-emerald-400">FLOW</span>
          </h1>
          <p className="text-xs text-gold-400/90 font-medium tracking-widest uppercase mt-0.5">
            Enterprise Dairy Farm Management System
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-gold-400 to-emerald-600" />

          {/* Motivational Quote on Login */}
          <div className="mb-6 pb-4 border-b border-slate-800/80 text-center">
            <p className="text-xs italic text-slate-300 font-light">
              "Great farms are built one consistent day at a time. Track your progress. Build your legacy."
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <div className="p-1 rounded-full bg-rose-900/60 text-rose-400 shrink-0">!</div>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or email@dairyflow.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Password reset link has been dispatched to administrator registry.')}
                className="text-gold-400 hover:text-gold-300 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] border border-emerald-400/30 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Headquarters</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Roles */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Demonstrations
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoRole('admin', 'admin123')}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors group"
              >
                <div className="font-semibold text-emerald-400 group-hover:text-emerald-300 flex items-center justify-between">
                  <span>Farm Owner</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-slate-400">admin / admin123</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('rajesh.mgr', 'manager123')}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                  <span>Farm Manager</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-slate-400">rajesh.mgr / mgr123</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('dr.srinivas', 'vet123')}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors group"
              >
                <div className="font-semibold text-gold-400 group-hover:text-gold-300 flex items-center justify-between">
                  <span>Veterinary Doctor</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-slate-400">dr.srinivas / vet123</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('venkat.acc', 'admin123')}
                className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors group"
              >
                <div className="font-semibold text-slate-200 group-hover:text-emerald-300 flex items-center justify-between">
                  <span>Accountant</span>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-slate-400">venkat.acc / admin123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Tenant Isolated • Role Enforced • End-to-End Encrypted</span>
        </div>
      </div>
    </div>
  );
};
