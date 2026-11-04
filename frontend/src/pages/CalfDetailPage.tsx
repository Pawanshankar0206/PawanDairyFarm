import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Baby,
  TrendingUp,
  Milk,
  Pill,
  Syringe,
  Plus,
  Scale,
  Calendar,
  X,
  Stethoscope,
  HeartHandshake
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { api } from '../services/api';

interface CalfDetailPageProps {
  calfId: string;
  onBack: () => void;
  onNavigateToMother?: (motherId: string) => void;
}

export const CalfDetailPage: React.FC<CalfDetailPageProps> = ({ calfId, onBack, onNavigateToMother }) => {
  const [profile, setProfile] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'growth' | 'feeding' | 'health' | 'overview'>('growth');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isFeedingModalOpen, setIsFeedingModalOpen] = useState(false);

  // Form States
  const [weightForm, setWeightForm] = useState({
    measurement_date: new Date().toISOString().split('T')[0],
    current_weight: 45.0,
    height: 75,
    health_observations: 'Vigorous activity, bright eyes.',
    feeding_observations: 'Consumes morning milk ration eagerly.',
    notes: 'Routine monthly milestone entry.'
  });

  const [feedingForm, setFeedingForm] = useState({
    feeding_date: new Date().toISOString().split('T')[0],
    feeding_time: '06:30 AM',
    feed_type: 'Mother Milk',
    quantity_litres_or_kg: 2.0,
    unit: 'L',
    notes: 'Morning ration from mother buffalo.'
  });

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<any>(`/calves/${calfId}`);
      setProfile(data);
      if (data.current_weight) {
        setWeightForm(prev => ({ ...prev, current_weight: data.current_weight }));
      }
    } catch (err) {
      console.error('Failed to load calf profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [calfId]);

  const handleRecordWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/calves/${calfId}/growth`, weightForm);
      setIsWeightModalOpen(false);
      await loadProfile();
      alert('Calf weight measurement saved! Weight gain calculated automatically.');
    } catch (err: any) {
      alert(`Error saving weight: ${err.message}`);
    }
  };

  const handleRecordFeeding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/calves/${calfId}/feeding`, feedingForm);
      setIsFeedingModalOpen(false);
      await loadProfile();
      alert('Feeding record added successfully.');
    } catch (err: any) {
      alert(`Error recording feeding: ${err.message}`);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading pediatric record for Calf {calfId}...</p>
        </div>
      </div>
    );
  }

  const { growth_history, feeding_history, mother_details, deworming_history, vaccinations, medications } = profile;

  // Format growth data for Recharts
  const chartData = (growth_history || []).map((g: any) => ({
    date: g.measurement_date,
    weight: g.current_weight,
    gain: g.weight_gain_since_last || 0
  }));

  return (
    <div className="space-y-6">
      {/* Back and Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Calf Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFeedingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <Milk className="w-3.5 h-3.5 text-blue-400" />
            <span>Record Feeding</span>
          </button>
          <button
            onClick={() => setIsWeightModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold border border-emerald-400/30 transition-all shadow-md shadow-emerald-950"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Record Periodic Weight</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="relative">
            <img
              src={profile.photo_url || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"}
              alt={profile.name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-gold-500/40 shadow-xl"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950 border border-gold-500/60 text-gold-400">
              {profile.gender} Calf
            </span>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-extrabold text-white font-display">{profile.name}</h2>
              <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-gold-950/80 text-gold-300 border border-gold-500/40">
                {profile.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Breed: {profile.breed}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Birth: <span className="text-slate-200 font-semibold">{profile.birth_date}</span> • Birth Weight: <span className="text-slate-200 font-semibold">{profile.birth_weight} kg</span> • Current Weight: <span className="text-emerald-400 font-bold">{profile.current_weight} kg</span> • Total Gain: <span className="text-gold-400 font-bold">+{profile.total_weight_gain} kg</span>
            </p>

            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              {mother_details && (
                <button
                  onClick={() => onNavigateToMother && onNavigateToMother(mother_details.id)}
                  className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/80 flex items-center gap-1.5 transition-colors"
                >
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Mother: <strong>{mother_details.id} ({mother_details.name})</strong></span>
                </button>
              )}
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
                Feeding: <strong className="text-blue-300">{profile.feeding_method}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300">
                Deworming: <strong className="text-emerald-400">{profile.deworming_status}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
        {[
          { id: 'growth', label: 'Weight Growth Curves & Metrics', icon: TrendingUp },
          { id: 'feeding', label: 'Pediatric Feeding Log', icon: Milk },
          { id: 'health', label: 'Health, Deworming & Vaccines', icon: Stethoscope },
          { id: 'overview', label: 'Birth Origin & Pedigree', icon: Baby }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 font-semibold transition-colors ${
                isActive
                  ? 'border-gold-500 text-gold-400 bg-slate-900/50 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GROWTH MONITORING (SECTION 3.C REQUIREMENT) */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          {/* Interactive Weight Growth Chart */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gold-400" />
                  <span>Calf Weight Growth Curve (kg over Time)</span>
                </h3>
                <p className="text-[11px] text-slate-400">Interactive milestone tracking from birth to current stage</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Recorded Weight (kg)
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No weight measurements recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} unit=" kg" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                      labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="weight" name="Current Weight" stroke="#10b981" strokeWidth={3} dot={{ fill: '#fbbf24', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Growth Log Table */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Scale className="w-4 h-4 text-gold-400" />
                <span>Periodic Weight Measurements & Gain Calculations</span>
              </h3>
              <span className="text-xs text-slate-400">{growth_history.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Weight (kg)</th>
                    <th className="py-2.5 px-4">Gain Since Last (kg)</th>
                    <th className="py-2.5 px-4">Height (cm)</th>
                    <th className="py-2.5 px-4">Health Observations</th>
                    <th className="py-2.5 px-4">Feeding Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {growth_history.map((g: any) => (
                    <tr key={g.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">{g.measurement_date}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold text-sm">{g.current_weight} kg</td>
                      <td className="py-3 px-4 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${g.weight_gain_since_last > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'}`}>
                          {g.weight_gain_since_last > 0 ? `+${g.weight_gain_since_last} kg` : 'Baseline'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 font-mono">{g.height ? `${g.height} cm` : '—'}</td>
                      <td className="py-3 px-4 text-slate-300">{g.health_observations || '—'}</td>
                      <td className="py-3 px-4 text-slate-400 italic">{g.feeding_observations || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FEEDING MONITORING (SECTION 3.D REQUIREMENT) */}
      {activeTab === 'feeding' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Milk className="w-4 h-4 text-blue-400" />
                <span>Calf Feeding Management & Rations</span>
              </h3>
              <p className="text-[11px] text-slate-400">Mother's milk, colostrum, concentrate feed, green fodder & supplements</p>
            </div>
            <button
              onClick={() => setIsFeedingModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Feed</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Feed Type</th>
                  <th className="py-2.5 px-4">Quantity</th>
                  <th className="py-2.5 px-4">Clinical Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {feeding_history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">No feeding events logged.</td>
                  </tr>
                ) : (
                  feeding_history.map((f: any) => (
                    <tr key={f.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-200">
                        {f.feeding_date} <span className="text-[10px] text-slate-400 block">{f.feeding_time}</span>
                      </td>
                      <td className="py-3 px-4 text-blue-300 font-semibold">{f.feed_type}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                        {f.quantity_litres_or_kg} {f.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-300 italic">{f.notes || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HEALTH, DEWORMING & VACCINATIONS */}
      {activeTab === 'health' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Deworming */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-400" />
                <span>Pediatric Deworming Records</span>
              </h3>
              <div className="space-y-2">
                {deworming_history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No deworming recorded yet.</p>
                ) : (
                  deworming_history.map((d: any) => (
                    <div key={d.id} className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs">
                      <div className="flex items-center justify-between font-semibold text-emerald-400">
                        <span>{d.medicine_name}</span>
                        <span className="font-mono text-slate-400 text-[10px]">{d.deworming_date}</span>
                      </div>
                      <div className="text-slate-300 mt-1">Dosage: {d.dosage} ({d.administration_method})</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">Vet: {d.vet_doctor} • Next: {d.next_recommended_date}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Vaccinations & Meds */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Syringe className="w-4 h-4 text-blue-400" />
                <span>Vaccinations & Medical Treatments</span>
              </h3>
              <div className="space-y-2">
                {vaccinations.length === 0 && medications.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No treatments recorded. Calf in prime health.</p>
                ) : (
                  <>
                    {vaccinations.map((v: any) => (
                      <div key={v.id} className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs">
                        <div className="flex items-center justify-between font-semibold text-blue-400">
                          <span>{v.vaccine_name}</span>
                          <span className="font-mono text-slate-400 text-[10px]">{v.vaccination_date}</span>
                        </div>
                        <div className="text-slate-300 mt-1">Batch: {v.batch_no || 'N/A'} • Vet: {v.doctor_name}</div>
                      </div>
                    ))}
                    {medications.map((m: any) => (
                      <div key={m.id} className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs">
                        <div className="flex items-center justify-between font-semibold text-amber-400">
                          <span>{m.medicine_name}</span>
                          <span className="font-mono text-slate-400 text-[10px]">{m.treatment_date}</span>
                        </div>
                        <div className="text-slate-300 mt-1">{m.disease_issue} ({m.medicine_dosage})</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BIRTH ORIGIN & PEDIGREE */}
      {activeTab === 'overview' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white font-display border-b border-slate-800 pb-2">
            Pedigree & Birth Specifications
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Mother Buffalo ID</span>
              <span className="font-mono text-emerald-400 font-bold">{profile.mother_buffalo_id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Father Lineage / Semen</span>
              <span className="text-slate-200 font-semibold">{profile.father_info || 'AI Sire'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Birth Condition</span>
              <span className="text-emerald-400 font-semibold">{profile.birth_condition}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Health Status</span>
              <span className="text-slate-200 font-semibold">{profile.health_status}</span>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <span className="text-slate-500 block">Additional Notes</span>
              <p className="text-slate-300 italic mt-0.5">{profile.notes || 'No special notes.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* RECORD WEIGHT MODAL (SECTION 3.C) */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <span>Record Periodic Calf Weight</span>
              </h3>
              <button onClick={() => setIsWeightModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordWeight} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Measurement Date</label>
                  <input
                    type="date"
                    required
                    value={weightForm.measurement_date}
                    onChange={(e) => setWeightForm({ ...weightForm, measurement_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weightForm.current_weight}
                    onChange={(e) => setWeightForm({ ...weightForm, current_weight: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Height (cm, optional)</label>
                  <input
                    type="number"
                    value={weightForm.height}
                    onChange={(e) => setWeightForm({ ...weightForm, height: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Health Observations</label>
                  <input
                    type="text"
                    value={weightForm.health_observations}
                    onChange={(e) => setWeightForm({ ...weightForm, health_observations: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Feeding & Appetite Observations</label>
                  <input
                    type="text"
                    value={weightForm.feeding_observations}
                    onChange={(e) => setWeightForm({ ...weightForm, feeding_observations: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsWeightModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  Save Weight & Auto Calculate Gain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD FEEDING MODAL (SECTION 3.D) */}
      {isFeedingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Milk className="w-5 h-5 text-blue-400" />
                <span>Log Pediatric Feed</span>
              </h3>
              <button onClick={() => setIsFeedingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordFeeding} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Feeding Date</label>
                  <input
                    type="date"
                    required
                    value={feedingForm.feeding_date}
                    onChange={(e) => setFeedingForm({ ...feedingForm, feeding_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Feeding Time</label>
                  <input
                    type="text"
                    value={feedingForm.feeding_time}
                    onChange={(e) => setFeedingForm({ ...feedingForm, feeding_time: e.target.value })}
                    placeholder="06:30 AM"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Feed Type</label>
                  <select
                    value={feedingForm.feed_type}
                    onChange={(e) => setFeedingForm({ ...feedingForm, feed_type: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Mother Milk">Mother Milk</option>
                    <option value="Colostrum">Colostrum</option>
                    <option value="Concentrate feed">Concentrate feed (Calf Starter)</option>
                    <option value="Green fodder">Green fodder (Tender Napier / Lucerne)</option>
                    <option value="Supplements / Mineral Mix">Supplements / Mineral Mix</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Quantity & Unit</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={feedingForm.quantity_litres_or_kg}
                      onChange={(e) => setFeedingForm({ ...feedingForm, quantity_litres_or_kg: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <select
                      value={feedingForm.unit}
                      onChange={(e) => setFeedingForm({ ...feedingForm, unit: e.target.value })}
                      className="w-20 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="L">Litres</option>
                      <option value="kg">kg</option>
                      <option value="g">grams</option>
                    </select>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Notes</label>
                  <input
                    type="text"
                    value={feedingForm.notes}
                    onChange={(e) => setFeedingForm({ ...feedingForm, notes: e.target.value })}
                    placeholder="Suckling vigor, digestion observation..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFeedingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg"
                >
                  Save Feed Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
