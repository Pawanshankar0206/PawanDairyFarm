import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Heart,
  Milk,
  Pill,
  Syringe,
  Stethoscope,
  Receipt,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Baby,
  Edit,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { Buffalo } from '../types';

interface BuffaloDetailPageProps {
  buffaloId: string;
  onBack: () => void;
  onAction?: (action: string, buffalo: Buffalo) => void;
}

export const BuffaloDetailPage: React.FC<BuffaloDetailPageProps> = ({ buffaloId, onBack, onAction }) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'breeding' | 'health' | 'production' | 'timeline'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [profData, timeData] = await Promise.all([
          api.get<any>(`/buffaloes/${buffaloId}`),
          api.get<any[]>(`/buffaloes/${buffaloId}/timeline`)
        ]);
        setProfile(profData);
        setTimeline(timeData);
      } catch (err) {
        console.error('Failed to load buffalo profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [buffaloId]);

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading comprehensive buffalo dossier for {buffaloId}...</p>
        </div>
      </div>
    );
  }

  const { breeding_history, health_history, calves_born, production_history } = profile;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Buffalo Herd</span>
        </button>

        <div className="flex items-center gap-2">
          {onAction && (
            <>
              <button
                onClick={() => onAction('record_ai', profile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gold-300 text-xs font-semibold border border-gold-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Record Insemination</span>
              </button>
              <button
                onClick={() => onAction('record_deworming', profile)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold border border-emerald-400/30 transition-all"
              >
                <Pill className="w-3.5 h-3.5" />
                <span>Administer Deworming</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="relative">
            <img
              src={profile.photo_url || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"}
              alt={profile.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-emerald-500/60 text-emerald-400">
              {profile.status}
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-white font-display">{profile.name}</h2>
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                {profile.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Tag: {profile.tag_number || 'N/A'}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Breed: <span className="text-gold-400 font-semibold">{profile.breed}</span> • Age: <span className="text-slate-200">{profile.age_years} Years</span> • Lactation: <span className="text-emerald-400 font-semibold">#{profile.lactation_number}</span> • Current Milk: <span className="text-white font-bold">{profile.current_milk_production} L/day</span>
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
                Breeding: <strong className="text-gold-400">{profile.breeding_status}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
                Pregnancy: <strong className={profile.pregnancy_status === 'Confirmed Pregnant' ? 'text-pink-400' : 'text-slate-400'}>{profile.pregnancy_status}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
                Health: <strong className={profile.current_health_status === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}>{profile.current_health_status}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Basic Profile & Vitals', icon: ShieldCheck },
          { id: 'breeding', label: 'Breeding & Pregnancy', icon: Heart },
          { id: 'health', label: 'Health, Deworming & Bills', icon: Stethoscope },
          { id: 'production', label: 'Milk Production', icon: Milk },
          { id: 'timeline', label: 'Chronological History Timeline', icon: Clock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900/50 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-slate-800 pb-2">
              Purchase & Origin Dossier
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Purchase Date</span>
                <span className="text-slate-200 font-semibold">{profile.purchase_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Purchase Price</span>
                <span className="text-emerald-400 font-bold font-mono">
                  ₹{Number(profile.purchase_price || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Supplier / Origin Lineage</span>
                <span className="text-slate-200 font-medium">{profile.supplier_details || 'Verified Dairy Syndicate'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">General Notes</span>
                <p className="text-slate-300 italic text-xs mt-0.5">{profile.notes || 'No special notes recorded.'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display border-b border-slate-800 pb-2">
              Calving & Offspring Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Last Calving Date</span>
                <span className="text-slate-200 font-semibold">{profile.last_calving_date || 'None on record'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lactation Number</span>
                <span className="text-emerald-400 font-bold">Lactation #{profile.lactation_number}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Calves Born to Mother</span>
                <div className="mt-2 space-y-1.5">
                  {calves_born.length === 0 ? (
                    <span className="text-slate-500 italic">No calves registered for this mother yet.</span>
                  ) : (
                    calves_born.map((c: any) => (
                      <div key={c.id} className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Baby className="w-3.5 h-3.5 text-gold-400" />
                          <span className="font-mono text-emerald-400 font-semibold">{c.id}</span>
                          <span className="text-slate-200">({c.name})</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Born {c.birth_date} • {c.gender} • {c.current_weight} kg
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BREEDING & PREGNANCY */}
      {activeTab === 'breeding' && (
        <div className="space-y-6">
          {/* Pregnancy Progress Card */}
          {breeding_history.current_active_pregnancy ? (
            <div className="p-5 rounded-xl bg-gradient-to-r from-pink-950/40 via-slate-900 to-purple-950/40 border border-pink-500/40 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
                  <Heart className="w-5 h-5 text-pink-500 animate-pulse" />
                  <span>Active Pregnancy Confirmed</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  {breeding_history.current_active_pregnancy.pregnancy_stage}
                </span>
              </div>

              {/* Visual Pregnancy Stage Indicator */}
              <div className="my-4">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                  <span>AI Date</span>
                  <span>Exam Confirmed</span>
                  <span>Gestation Window (310 Days)</span>
                  <span className="text-pink-400 font-bold">Expected Calving: {breeding_history.current_active_pregnancy.expected_calving_date}</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                  <div className="bg-gradient-to-r from-emerald-500 via-gold-400 to-pink-500 h-full rounded-full w-[85%]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-3 pt-3 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block">Confirmation Date</span>
                  <span className="text-slate-200 font-semibold">{breeding_history.current_active_pregnancy.pregnancy_confirmation_date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Examination</span>
                  <span className="text-slate-200">{breeding_history.current_active_pregnancy.veterinary_examination}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Veterinary Recommendation</span>
                  <span className="text-gold-300 font-medium">{breeding_history.current_active_pregnancy.vet_recommendations || 'Normal prenatal diet'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs flex items-center gap-3">
              <Heart className="w-5 h-5 text-slate-600" />
              <span>No active confirmed pregnancy at present. Current breeding status: <strong className="text-slate-200">{profile.breeding_status}</strong>.</span>
            </div>
          )}

          {/* Insemination History Table */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span>Artificial Insemination (AI) History</span>
              </h3>
              <span className="text-xs text-slate-400">Total Attempts: {breeding_history.inseminations.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Bull Lineage / Breed</th>
                    <th className="py-2.5 px-4">Straw ID & Batch</th>
                    <th className="py-2.5 px-4">Technician / Clinic</th>
                    <th className="py-2.5 px-4">Cost</th>
                    <th className="py-2.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {breeding_history.inseminations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">No insemination records on file.</td>
                    </tr>
                  ) : (
                    breeding_history.inseminations.map((ins: any) => (
                      <tr key={ins.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                          {ins.insemination_date} <span className="text-[10px] text-slate-400 block">{ins.insemination_time}</span>
                        </td>
                        <td className="py-3 px-4 text-gold-400 font-medium">{ins.bull_breed}</td>
                        <td className="py-3 px-4 font-mono text-slate-300">
                          {ins.semen_straw_id || 'N/A'} <span className="text-[10px] text-slate-400 block">{ins.semen_batch_details}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{ins.technician_name}</td>
                        <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">₹{ins.insemination_cost}</td>
                        <td className="py-3 px-4 text-slate-400 italic max-w-xs">{ins.remarks || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH, DEWORMING & BILLS */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Medical Expenses Callout */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Cumulative Buffalo Medical Expenses</div>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  ₹{Number(health_history.total_medical_expenses || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span>{health_history.veterinary_bills.length} itemized medical vouchers</span>
            </div>
          </div>

          {/* Deworming Records */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                <span>Deworming History & Prescriptions</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    <th className="py-2.5 px-4">Date Administered</th>
                    <th className="py-2.5 px-4">Medicine & Form</th>
                    <th className="py-2.5 px-4">Prescribed Dosage</th>
                    <th className="py-2.5 px-4">Administered By</th>
                    <th className="py-2.5 px-4">Next Due Date</th>
                    <th className="py-2.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {health_history.dewormings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500">No deworming records logged yet.</td>
                    </tr>
                  ) : (
                    health_history.dewormings.map((d: any) => (
                      <tr key={d.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-200">{d.deworming_date}</td>
                        <td className="py-3 px-4 text-emerald-400 font-medium">
                          {d.medicine_name} <span className="text-[10px] text-slate-400 block">{d.medicine_type}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-200">{d.dosage}</td>
                        <td className="py-3 px-4 text-slate-300">{d.vet_doctor}</td>
                        <td className="py-3 px-4 font-mono text-gold-400 font-semibold">{d.next_recommended_date}</td>
                        <td className="py-3 px-4 text-slate-400 italic">{d.remarks || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Medications & Veterinary Bills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Medications */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-400" />
                <span>Clinical Treatments</span>
              </h3>
              <div className="space-y-2">
                {health_history.medications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No medical treatments recorded.</p>
                ) : (
                  health_history.medications.map((m: any) => (
                    <div key={m.id} className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-slate-200">{m.disease_issue}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${m.status === 'Ongoing' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'bg-emerald-950 text-emerald-300'}`}>
                          {m.status}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        Medicine: <strong className="text-emerald-400">{m.medicine_name}</strong> ({m.medicine_dosage})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {m.treatment_date} • Dr. {m.vet_doctor} • Cost: ₹{m.medication_cost}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Itemized Bills */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-gold-400" />
                <span>Veterinary Bills & Receipts</span>
              </h3>
              <div className="space-y-2">
                {health_history.veterinary_bills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No medical bills associated.</p>
                ) : (
                  health_history.veterinary_bills.map((b: any) => (
                    <div key={b.id} className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-200 font-mono">{b.bill_number}</div>
                        <div className="text-[11px] text-slate-400">{b.description}</div>
                        <div className="text-[10px] text-slate-500">{b.bill_date} • {b.supplier_clinic}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400 font-mono">₹{b.total_amount}</div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{b.payment_method}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTION */}
      {activeTab === 'production' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Morning Milk Yield</span>
              <span className="text-2xl font-bold text-white tracking-tight">{production_history.morning_milk} L</span>
              <span className="text-[10px] text-slate-500 block mt-1">Recorded 05:30 AM shift</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-xs text-slate-400 block">Evening Milk Yield</span>
              <span className="text-2xl font-bold text-white tracking-tight">{production_history.evening_milk} L</span>
              <span className="text-[10px] text-slate-500 block mt-1">Recorded 05:00 PM shift</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-xs text-emerald-300 block font-semibold">Total Daily Milk</span>
              <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">{production_history.daily_total} L</span>
              <span className="text-[10px] text-slate-400 block mt-1">~{production_history.monthly_estimated} L/month projection</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORGANIZED CHRONOLOGICAL TIMELINE (SECTION 1.B REQUIREMENT) */}
      {activeTab === 'timeline' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
          <div className="mb-6 pb-2 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Complete Historical Chronological Dossier</span>
            </h3>
            <span className="text-xs text-slate-400">{timeline.length} lifetime events recorded</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {timeline.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No timeline entries found.</p>
            ) : (
              timeline.map((event, idx) => {
                let badgeClass = 'bg-slate-800 text-slate-300';
                if (event.type === 'Insemination') badgeClass = 'bg-purple-950 text-purple-300 border border-purple-500/40';
                else if (event.type === 'Pregnancy') badgeClass = 'bg-pink-950 text-pink-300 border border-pink-500/40';
                else if (event.type === 'Calving') badgeClass = 'bg-emerald-950 text-emerald-300 border border-emerald-500/40';
                else if (event.type === 'Deworming') badgeClass = 'bg-amber-950 text-amber-300 border border-amber-500/40';
                else if (event.type === 'Medication') badgeClass = 'bg-blue-950 text-blue-300 border border-blue-500/40';

                return (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-slate-950 border-2 border-emerald-500 group-hover:scale-125 transition-transform" />
                    <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 hover:border-slate-700 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-sm text-slate-200">{event.title}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeClass}`}>
                            {event.badge}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">{event.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">{event.description}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
