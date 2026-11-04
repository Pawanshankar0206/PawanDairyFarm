import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  GitBranch,
  Baby,
  Pill,
  Stethoscope,
  Calendar,
  Milk,
  Users,
  PieChart,
  Beef,
  MessageSquare,
  UserCheck,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  urgentAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, urgentAlertCount = 0 }) => {
  const { user, logout, canManageUsers } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'buffaloes', label: 'Buffalo Management', icon: ShieldAlert, badge: 'Core' },
    { id: 'breeding', label: 'Breeding & Pregnancy', icon: GitBranch, badge: null },
    { id: 'calves', label: 'Calf Management', icon: Baby, badge: 'New' },
    { id: 'deworming', label: 'Deworming & Health', icon: Pill, badge: urgentAlertCount > 0 ? `${urgentAlertCount}` : null, badgeColor: 'bg-rose-500' },
    { id: 'veterinary', label: 'Veterinary & Billing', icon: Stethoscope, badge: null },
    { id: 'calendar', label: 'Farm Health Calendar', icon: Calendar, badge: null },
    { id: 'deliveries', label: 'Milk Billing & Sales', icon: Milk, badge: null },
    { id: 'customers', label: 'Customer Directory', icon: Users, badge: null },
    { id: 'finance', label: 'Financial Analytics', icon: PieChart, badge: null },
    { id: 'cattle', label: 'Cattle (Cows)', icon: Beef, badge: null },
    { id: 'sms', label: 'SMS Notifications', icon: MessageSquare, badge: 'Active' },
    ...(canManageUsers ? [{ id: 'users', label: 'User Management', icon: UserCheck, badge: 'Admin' }] : [])
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
            <Milk className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-white font-display">DAIRYFLOW</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 border border-gold-500/30">PRO</span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-tight">Enterprise Dairy Management</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 custom-scrollbar">
        <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Farm Headquarters
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-900/80 to-emerald-800/60 text-emerald-200 border border-emerald-500/40 shadow-sm shadow-emerald-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-gold-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      item.badgeColor
                        ? `${item.badgeColor} text-white animate-pulse`
                        : isActive
                        ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-gold-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-900/80 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-gold-400 shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name || 'Admin User'}</p>
              <p className="text-[10px] text-emerald-400/90 font-medium truncate">{user?.role || 'Administrator'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
