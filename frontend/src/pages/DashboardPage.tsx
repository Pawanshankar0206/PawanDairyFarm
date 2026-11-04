import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Heart,
  Baby,
  Pill,
  Syringe,
  Activity,
  Milk,
  DollarSign,
  Calendar,
  ChevronRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, HealthAlert } from '../types';
import { MotivationalBanner } from '../components/common/MotivationalBanner';

interface DashboardPageProps {
  onNavigate: (tab: string, entityId?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, alertsData] = await Promise.all([
          api.get<DashboardStats>('/dashboard/stats'),
          api.get<HealthAlert[]>('/dashboard/alerts')
        ]);
        setStats(statsData);
        setAlerts(alertsData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">Synthesizing Farm Operations & Livestock Vitals...</p>
        </div>
      </div>
    );
  }

  const { animal_stats: a, financial_stats: f } = stats;

  return (
    <div className="space-y-6">
      {/* Rotating Motivational Banner (Section 9 Requirement) */}
      <MotivationalBanner category="all" />

      {/* Primary Livestock KPIs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-display flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span>Livestock Herd Inventory & Breeding Vitals</span>
          </h2>
          <span className="text-xs text-slate-400">Total Animals: {a.total_buffaloes + a.total_cows + a.total_calves}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Buffaloes */}
          <div
            onClick={() => onNavigate('buffaloes')}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-emerald-950"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Total Buffaloes</span>
              <ShieldAlert className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{a.total_buffaloes}</div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>{a.total_lactating_buffaloes} lactating</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Total Calves */}
          <div
            onClick={() => onNavigate('calves')}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-emerald-950"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Total Calves</span>
              <Baby className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{a.total_calves}</div>
            <div className="text-[10px] text-gold-400 mt-1 flex items-center gap-1">
              <span>Pediatric tracking</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Total Cows */}
          <div
            onClick={() => onNavigate('cattle')}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-emerald-950"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Adult Cows</span>
              <Milk className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{a.total_cows}</div>
            <div className="text-[10px] text-blue-400 mt-1 flex items-center gap-1">
              <span>Indigenous herd</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Pregnant Buffaloes */}
          <div
            onClick={() => onNavigate('breeding')}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-emerald-950"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Pregnant Buffaloes</span>
              <Heart className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">{a.total_pregnant_buffaloes}</div>
            <div className="text-[10px] text-pink-400 mt-1 flex items-center gap-1">
              <span>Confirmed pregnant</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Active Milking Animals */}
          <div
            onClick={() => onNavigate('deliveries')}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-emerald-950"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Milking Animals</span>
              <Milk className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">{a.total_active_milking_animals}</div>
            <div className="text-[10px] text-slate-400 mt-1">
              {a.total_daily_milk_litres} L/day production
            </div>
          </div>

          {/* Expected Deliveries This Month */}
          <div
            onClick={() => onNavigate('breeding')}
            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 cursor-pointer transition-all duration-200 group hover:shadow-lg hover:shadow-pink-950"
          >
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-xs font-semibold">Calvings Due</span>
              <Calendar className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-purple-400 tracking-tight">{a.expected_deliveries_this_month}</div>
            <div className="text-[10px] text-purple-400 mt-1 flex items-center gap-1">
              <span>This calendar month</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Health & Urgent Veterinary Monitoring KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Deworming Due Today */}
        <div
          onClick={() => onNavigate('deworming')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            a.deworming_due_today > 0
              ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-950/40'
              : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold">Deworming Due Today</span>
            <Pill className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">{a.deworming_due_today}</div>
          <p className="text-[10px] text-slate-400 mt-1">Scheduled for immediate dosage</p>
        </div>

        {/* Deworming Overdue */}
        <div
          onClick={() => onNavigate('deworming')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            a.deworming_overdue > 0
              ? 'bg-rose-950/50 border-rose-500/80 shadow-lg shadow-rose-950/50 animate-pulse'
              : 'bg-slate-900/90 border-slate-800 hover:border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold">Deworming Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">{a.deworming_overdue}</div>
          <p className="text-[10px] text-rose-300/80 mt-1">Requires immediate intervention</p>
        </div>

        {/* Upcoming Vaccinations */}
        <div
          onClick={() => onNavigate('calendar')}
          className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold">Upcoming Vaccines</span>
            <Syringe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 tracking-tight">{a.upcoming_vaccinations}</div>
          <p className="text-[10px] text-slate-400 mt-1">FMD / HSBQ schedule active</p>
        </div>

        {/* Under Treatment */}
        <div
          onClick={() => onNavigate('veterinary')}
          className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold">Under Treatment</span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 tracking-tight">{a.animals_under_treatment}</div>
          <p className="text-[10px] text-slate-400 mt-1">Under clinical management</p>
        </div>
      </div>

      {/* ANIMAL HEALTH & BREEDING ALERTS PANEL (SECTION 10 EXPLICIT REQUIREMENT) */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Animal Health & Breeding Alerts</h3>
              <p className="text-[11px] text-slate-400">Click any scheduled alert to access animal clinical records</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
          >
            <span>Full Health Calendar</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/30">
                <th className="py-2.5 px-4">Animal</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Activity</th>
                <th className="py-2.5 px-4">Due Date</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-50" />
                    All animal health and breeding activities are up to date.
                  </td>
                </tr>
              ) : (
                alerts.map((alert, index) => {
                  let badgeBg = 'bg-slate-800 text-slate-300 border-slate-700';
                  if (alert.status === 'Overdue') badgeBg = 'bg-rose-950/80 text-rose-300 border-rose-600/50';
                  else if (alert.status === 'Due Today') badgeBg = 'bg-amber-950/80 text-amber-300 border-amber-600/50';
                  else if (alert.status === 'Due Soon') badgeBg = 'bg-yellow-950/60 text-yellow-300 border-yellow-600/40';
                  else if (alert.status === 'Upcoming') badgeBg = 'bg-blue-950/60 text-blue-300 border-blue-600/40';

                  const isBuffalo = alert.animal_type === 'Buffalo';

                  return (
                    <tr
                      key={index}
                      onClick={() => onNavigate(isBuffalo ? 'buffaloes' : 'calves', alert.animal_id)}
                      className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                        <span className="font-mono text-emerald-400">{alert.animal_id}</span>
                        <span className="text-slate-400">({alert.animal_name})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {alert.animal_type}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {alert.activity}
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {new Date(alert.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs font-semibold text-gold-400 hover:text-gold-300">
                          Open Profile →
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Core Financial & Production Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Production Snapshot */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Milk className="w-4 h-4 text-emerald-400" />
              <span>Daily Milk Collection</span>
            </div>
            <button onClick={() => onNavigate('deliveries')} className="text-xs text-emerald-400 hover:underline">
              View Deliveries
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-850">
              <span className="text-xs text-slate-300">Buffalo Herd Production</span>
              <span className="text-sm font-bold text-white">{a.buffalo_daily_milk_litres.toFixed(1)} L</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-850">
              <span className="text-xs text-slate-300">Cow Herd Production</span>
              <span className="text-sm font-bold text-white">{a.cow_daily_milk_litres.toFixed(1)} L</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/40 border border-emerald-600/30">
              <span className="text-xs font-semibold text-emerald-300">Total Farm Milk (Today)</span>
              <span className="text-base font-extrabold text-emerald-400">{a.total_daily_milk_litres.toFixed(1)} L</span>
            </div>
          </div>
        </div>

        {/* Financial Snapshot */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <DollarSign className="w-4 h-4 text-gold-400" />
              <span>Financial Overview & Medical Expense Ratio</span>
            </div>
            <button onClick={() => onNavigate('finance')} className="text-xs text-gold-400 hover:underline">
              Financial Reports →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">₹{f.total_revenue.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Milk & Byproduct sales</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Expenses</div>
              <div className="text-lg font-bold text-rose-400 mt-1">₹{f.total_expenses.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Feed, wages & veterinary</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-850">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Net Farm Profit</div>
              <div className="text-lg font-bold text-gold-400 mt-1">₹{f.net_profit.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Positive cash generation</div>
            </div>

            <div
              onClick={() => onNavigate('veterinary')}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-gold-500/40 cursor-pointer transition-colors"
            >
              <div className="text-[10px] text-gold-400 uppercase font-semibold">Total Medical Bills</div>
              <div className="text-lg font-bold text-slate-100 mt-1">₹{f.total_medical_expenses.toLocaleString('en-IN')}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Linked exactly once to expense</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
