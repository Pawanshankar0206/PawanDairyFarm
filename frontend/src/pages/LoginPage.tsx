import React, { useState } from 'react';
import {
  Milk,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Phone,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Sign In form state
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up form state
  const [fullName, setFullName] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('Farm Manager');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Feedback & Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Switch between tabs cleanly
  const switchTab = (tab: 'signin' | 'signup') => {
    setActiveTab(tab);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle Login submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up submission
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreedToTerms) {
      setError('You must accept the farm operational & safety terms.');
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        full_name: fullName,
        username: signupUsername,
        email: signupEmail,
        mobile_number: signupMobile,
        password: signupPassword,
        role: signupRole
      });
      setSuccessMessage('Account created successfully! Welcome to DairyFlow.');
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please check information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoRole = (userVal: string, passVal: string) => {
    setUsername(userVal);
    setPassword(passVal);
    setError(null);
    setActiveTab('signin');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-slate-950 overflow-y-auto">
      {/* Background Ambience & Premium Farm Aesthetic */}
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=2000&q=80"
          alt="Dairy Farm Pasture"
          className="w-full h-full object-cover opacity-20 filter contrast-125 saturate-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/90 backdrop-blur-[2px]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Glassmorphic Auth Card */}
      <div className="relative z-10 w-full max-w-lg my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-0.5 shadow-2xl shadow-emerald-950 border border-emerald-400/40 mb-3 group hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
              <Milk className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider font-display">
            DAIRY<span className="text-emerald-400">FLOW</span>
          </h1>
          <p className="text-xs text-amber-400/95 font-medium tracking-widest uppercase mt-0.5">
            Enterprise Dairy Farm & Livestock Management
          </p>
        </div>

        {/* Card Body with Dual-Mode Tabs */}
        <div className="bg-slate-900/85 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-600" />

          {/* Tab Switcher (Sign In / Sign Up) */}
          <div className="flex p-1 mb-6 rounded-xl bg-slate-950/80 border border-slate-800/90">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'signin'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-950/60 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-950/60 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account (Sign Up)</span>
            </button>
          </div>

          {/* Motivational Quote */}
          <div className="mb-5 pb-3 border-b border-slate-800/80 text-center">
            <p className="text-xs italic text-slate-300 font-light">
              {activeTab === 'signin'
                ? '"Great farms are built one consistent day at a time. Track your progress. Build your legacy."'
                : '"Join our dairy operational network. Monitor herds, track breeding, and maximize milk quality."'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
              <div className="p-1 rounded-full bg-rose-900/60 text-rose-400 shrink-0 font-bold">!</div>
              <div className="pt-0.5">{error}</div>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="pt-0.5">{successMessage}</div>
            </div>
          )}

          {/* TAB 1: SIGN IN FORM */}
          {activeTab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Username or Registered Email
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
                  onClick={() => alert('Password reset link dispatched to administrator.')}
                  className="text-amber-400 hover:text-amber-300 hover:underline"
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

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => switchTab('signup')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  Create Account (Sign Up)
                </button>
              </div>

              {/* Quick-Fill Demo Roles */}
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
                  Quick Role Demonstrations (1-Click Fill)
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
                    <div className="text-[10px] text-slate-400">rajesh.mgr / manager123</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDemoRole('dr.srinivas', 'vet123')}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors group"
                  >
                    <div className="font-semibold text-amber-400 group-hover:text-amber-300 flex items-center justify-between">
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
            </form>
          )}

          {/* TAB 2: SIGN UP / REGISTRATION FORM */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Pawan Shankar"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                      placeholder="e.g. pawandairy"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="pawan@dairyflow.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Mobile Number (SMS Alerts)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={signupMobile}
                      onChange={(e) => setSignupMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Select Farm Role *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  >
                    <option value="Farm Manager">Farm Manager (Operations & Livestock)</option>
                    <option value="Veterinary Staff">Veterinary Staff (Health & Breeding)</option>
                    <option value="Accountant">Accountant (Billing & Expenses)</option>
                    <option value="Farm Worker">Farm Worker (Milking & Feeding)</option>
                    <option value="Owner / Super Admin">Owner / Super Admin (Full Control)</option>
                    <option value="Read-only Viewer">Read-only Viewer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Password (Min 6 chars) *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:ring-1 transition-colors ${
                        signupConfirmPassword && signupPassword !== signupConfirmPassword
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-800 focus:border-emerald-500 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                  />
                  <span>
                    I confirm this account will be used in compliance with DairyFlow Livestock Health & Operational Standards.
                  </span>
                </label>
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
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Sign In</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already registered on DairyFlow? </span>
                <button
                  type="button"
                  onClick={() => switchTab('signin')}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
                >
                  Sign In to your account
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security Badge */}
        <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Tenant Isolated • Role Enforced • 256-Bit Encrypted Data</span>
        </div>
      </div>
    </div>
  );
};
