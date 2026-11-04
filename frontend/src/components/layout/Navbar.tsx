import React from 'react';
import { Bell, ShieldCheck, Plus, Sparkles, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HealthAlert } from '../../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  alerts: HealthAlert[];
  onOpenQuickAction?: (action: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, alerts, onOpenQuickAction }) => {
  const { user } = useAuth();
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const getTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Executive Dairy Operations Dashboard';
      case 'buffaloes': return 'Buffalo Herd & Lifecycle Management';
      case 'breeding': return 'Buffalo Breeding, Insemination & Pregnancy Tracking';
      case 'calves': return 'Calf Growth, Feeding & Pediatric Monitoring';
      case 'deworming': return 'Farm Deworming Management & Automated SMS Schedule';
      case 'veterinary': return 'Veterinary Clinical Records & Medical Billing';
      case 'calendar': return 'Farm Health & Breeding Master Calendar';
      case 'deliveries': return 'Daily Milk Collection, Deliveries & Billing';
      case 'customers': return 'Customer Directory & Subscription Quotas';
      case 'finance': return 'Financial Analytics, Investments & P&L Statement';
      case 'cattle': return 'Adult Cattle Herd (Cows)';
      case 'sms': return 'SMS Gateway Settings & Delivery Logs';
      case 'users': return 'Farm Staff & Role-Based Access Control';
      default: return 'DairyFlow Management System';
    }
  };

  const overdueCount = alerts.filter(a => a.status === 'Overdue' || a.status === 'Due Today').length;

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* View Title */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-bold text-white tracking-tight font-display">{getTitle()}</h1>
          <p className="text-[11px] text-slate-400">East Godavari Division • DairyFlow Elite Agro System</p>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3.5">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{todayFormatted}</span>
        </div>

        {/* Health Alert Pill */}
        <button
          onClick={() => setCurrentTab('deworming')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            overdueCount > 0
              ? 'bg-rose-950/50 text-rose-300 border-rose-600/40 hover:bg-rose-900/50'
              : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/30 hover:bg-emerald-900/40'
          }`}
          title="Health & Breeding Schedule"
        >
          <Bell className={`w-3.5 h-3.5 ${overdueCount > 0 ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />
          <span>{overdueCount > 0 ? `${overdueCount} Alerts Due` : 'Health Status Normal'}</span>
        </button>

        {/* Quick Actions Dropdown / Shortcut */}
        {onOpenQuickAction && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenQuickAction('register_buffalo')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all border border-emerald-400/40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Buffalo</span>
            </button>
            <button
              onClick={() => onOpenQuickAction('record_deworming')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gold-300 text-xs font-semibold transition-all border border-gold-500/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>Record Deworming</span>
            </button>
          </div>
        )}

        {/* SMS status shortcut */}
        <button
          onClick={() => setCurrentTab('sms')}
          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
          title="SMS Alert Gateway"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
