import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  Heart,
  Baby,
  Plus,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { Buffalo, InseminationRecord, PregnancyRecord, CalvingRecord } from '../types';

export const BreedingManagementPage: React.FC<{ onNavigateToBuffalo?: (id: string) => void }> = ({ onNavigateToBuffalo }) => {
  const [inseminations, setInseminations] = useState<InseminationRecord[]>([]);
  const [pregnancies, setPregnancies] = useState<PregnancyRecord[]>([]);
  const [calvings, setCalvings] = useState<CalvingRecord[]>([]);
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [activeTab, setActiveTab] = useState<'pregnancies' | 'inseminations' | 'calvings'>('pregnancies');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPregnancyModalOpen, setIsPregnancyModalOpen] = useState(false);
  const [isCalvingModalOpen, setIsCalvingModalOpen] = useState(false);

  // Form States
  const [aiForm, setAIForm] = useState({
    buffalo_id: '',
    insemination_date: new Date().toISOString().split('T')[0],
    insemination_time: '07:30 AM',
    semen_date: '',
    semen_batch_details: '',
    semen_straw_id: '',
    bull_breed: 'Murrah Proven Sire',
    technician_name: 'Dr. K. Srinivas Murthy',
    veterinary_center: 'Government Veterinary Hospital',
    insemination_cost: 650,
    remarks: ''
  });

  const [pregForm, setPregForm] = useState({
    buffalo_id: '',
    insemination_id: '',
    pregnancy_confirmation_date: new Date().toISOString().split('T')[0],
    pregnancy_test_result: 'Positive' as 'Positive' | 'Negative' | 'Inconclusive',
    veterinary_examination: 'Per-rectal palpation confirmed uterine horn asymmetry and amniotic vesicle.',
    pregnancy_stage: 'First Trimester (1-3 Mo)',
    gestation_days_setting: 310,
    expected_calving_date: '',
    pregnancy_complications: 'None observed',
    vet_recommendations: 'Transition to dry-cow ration and supplemental minerals.'
  });

  const [calvingForm, setCalvingForm] = useState({
    buffalo_id: '',
    actual_delivery_date: new Date().toISOString().split('T')[0],
    delivery_type: 'Normal delivery' as any,
    calf_born: true,
    calf_gender: 'Female' as any,
    calf_name: '',
    birth_weight: 33.5,
    health_condition: 'Healthy, vigorous suckling reflex.',
    veterinary_assistance: 'Routine Farm Attendant',
    delivery_expenses: 500,
    notes: 'Placenta discharged naturally within 2.5 hours.'
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [aiData, pregData, buffData, calvData] = await Promise.all([
        api.get<InseminationRecord[]>('/breeding/inseminations'),
        api.get<PregnancyRecord[]>('/breeding/pregnancies'),
        api.get<Buffalo[]>('/buffaloes'),
        api.get<CalvingRecord[]>('/calves') // we can get calvings or calves
      ]);
      setInseminations(aiData);
      setPregnancies(pregData);
      setBuffaloes(buffData);
      if (buffData.length > 0 && !aiForm.buffalo_id) {
        setAIForm(prev => ({ ...prev, buffalo_id: buffData[0].id }));
        setPregForm(prev => ({ ...prev, buffalo_id: buffData[0].id }));
        setCalvingForm(prev => ({ ...prev, buffalo_id: buffData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load breeding data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto calculate expected delivery when confirmation date changes in pregForm
  useEffect(() => {
    if (pregForm.pregnancy_confirmation_date && pregForm.pregnancy_test_result === 'Positive') {
      const base = new Date(pregForm.pregnancy_confirmation_date);
      // If linked to an AI record, calculate from AI date
      const ai = inseminations.find(i => i.buffalo_id === pregForm.buffalo_id);
      const aiDate = ai ? new Date(ai.insemination_date) : base;
      const target = new Date(aiDate.getTime() + (Number(pregForm.gestation_days_setting || 310) * 24 * 60 * 60 * 1000));
      setPregForm(prev => ({ ...prev, expected_calving_date: target.toISOString().split('T')[0] }));
    }
  }, [pregForm.pregnancy_confirmation_date, pregForm.buffalo_id, pregForm.gestation_days_setting, pregForm.pregnancy_test_result]);

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/breeding/inseminations', aiForm);
      setIsAIModalOpen(false);
      await loadData();
      alert('Semen Insemination recorded successfully into permanent history.');
    } catch (err: any) {
      alert(`Error recording AI: ${err.message}`);
    }
  };

  const handlePregnancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/breeding/pregnancies', pregForm);
      setIsPregnancyModalOpen(false);
      await loadData();
      alert('Pregnancy monitoring record saved successfully.');
    } catch (err: any) {
      alert(`Error saving pregnancy: ${err.message}`);
    }
  };

  const handleCalvingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/breeding/calvings', calvingForm);
      setIsCalvingModalOpen(false);
      await loadData();
      alert(`Calving recorded successfully! Newborn calf ${res.calf?.id || ''} created and linked to mother ${calvingForm.buffalo_id}.`);
    } catch (err: any) {
      alert(`Error recording calving: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            <span>Breeding & Pregnancy Monitoring</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dedicated tracking of semen straw inventory, AI logs, pregnancy examinations, and calving deliveries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAIModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gold-300 font-semibold text-xs border border-gold-500/30 shadow-md transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Record Semen / AI</span>
          </button>
          <button
            onClick={() => setIsPregnancyModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pink-900/60 hover:bg-pink-800/80 text-pink-200 font-semibold text-xs border border-pink-500/40 shadow-md transition-all"
          >
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>Confirm Pregnancy</span>
          </button>
          <button
            onClick={() => setIsCalvingModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-400/30 shadow-lg shadow-emerald-950 transition-all"
          >
            <Baby className="w-3.5 h-3.5" />
            <span>Record Calving / Delivery</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pregnancies')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'pregnancies' ? 'border-pink-500 text-pink-400 bg-slate-900/50 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Active Pregnancies & Delivery Timelines ({pregnancies.filter(p => p.is_active).length})</span>
        </button>
        <button
          onClick={() => setActiveTab('inseminations')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'inseminations' ? 'border-gold-500 text-gold-400 bg-slate-900/50 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Artificial Insemination (AI) History ({inseminations.length})</span>
        </button>
      </div>

      {/* TAB 1: PREGNANCY MONITORING & TIMELINES */}
      {activeTab === 'pregnancies' && (
        <div className="space-y-4">
          {pregnancies.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-850">
              No pregnancy records confirmed. Use "Confirm Pregnancy" to record examination results.
            </div>
          ) : (
            pregnancies.map((p) => {
              const mother = buffaloes.find(b => b.id === p.buffalo_id);
              return (
                <div key={p.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pink-950/60 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-emerald-400 font-bold text-sm">{p.buffalo_id}</span>
                          <span className="text-white font-semibold text-sm">({mother?.name || 'Buffalo'})</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                            {p.pregnancy_stage}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Confirmed on {p.pregnancy_confirmation_date} via {p.veterinary_examination}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Configured Gestation</span>
                      <span className="text-xs font-mono text-gold-400 font-bold">{p.gestation_days_setting} Days</span>
                    </div>
                  </div>

                  {/* VISUAL PREGNANCY TIMELINE (SECTION 2.C REQUIREMENT) */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                      <span>Visual Pregnancy Stage Progression</span>
                      <span className="text-pink-400">
                        Target Calving: <strong>{p.expected_calving_date || 'Estimate Pending'}</strong>
                      </span>
                    </div>

                    {/* Stage Steps */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                      <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        <span className="block font-bold">1. Insemination</span>
                        <span className="text-[9px] text-slate-400">Completed</span>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                        <span className="block font-bold">2. Rectal Exam</span>
                        <span className="text-[9px] text-slate-400">Viability (+)</span>
                      </div>
                      <div className="p-2 rounded-lg bg-pink-950/60 border border-pink-500/40 text-pink-300">
                        <span className="block font-bold">3. Confirmation</span>
                        <span className="text-[9px] text-slate-400">{p.pregnancy_confirmation_date}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300">
                        <span className="block font-bold">4. Monitoring</span>
                        <span className="text-[9px] text-slate-400">Nutritional transition</span>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 col-span-2 sm:col-span-1">
                        <span className="block font-bold">5. Calving Window</span>
                        <span className="text-[9px] text-gold-300 font-mono font-bold">{p.expected_calving_date}</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 via-pink-500 to-amber-400 h-full w-[80%] rounded-full" />
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-850">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Veterinarian Guidance</span>
                      <p className="text-slate-200 mt-0.5">{p.vet_recommendations || 'Maintain high calcium dry-period ration.'}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-850">
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Complications / Observation</span>
                      <p className="text-slate-200 mt-0.5">{p.pregnancy_complications || 'None reported.'}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: INSEMINATIONS */}
      {activeTab === 'inseminations' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Artificial Insemination Permanent Registry</span>
            </h3>
            <span className="text-xs text-slate-400">Every record is permanently preserved</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">Buffalo ID</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Bull Lineage / Breed</th>
                  <th className="py-2.5 px-4">Straw ID & Batch</th>
                  <th className="py-2.5 px-4">Technician</th>
                  <th className="py-2.5 px-4">Cost</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inseminations.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">{ins.buffalo_id}</td>
                    <td className="py-3 px-4 text-slate-200 font-mono">
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. RECORD INSEMINATION MODAL (SECTION 2.A REQUIREMENT) */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gold-400" />
                <span>Record Artificial Insemination (AI)</span>
              </h3>
              <button onClick={() => setIsAIModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAISubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Select Buffalo</label>
                  <select
                    value={aiForm.buffalo_id}
                    onChange={(e) => setAIForm({ ...aiForm, buffalo_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {buffaloes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.id} - {b.name} ({b.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Insemination Date & Time</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={aiForm.insemination_date}
                      onChange={(e) => setAIForm({ ...aiForm, insemination_date: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={aiForm.insemination_time}
                      onChange={(e) => setAIForm({ ...aiForm, insemination_time: e.target.value })}
                      placeholder="07:30 AM"
                      className="w-24 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Semen Straw ID</label>
                  <input
                    type="text"
                    value={aiForm.semen_straw_id}
                    onChange={(e) => setAIForm({ ...aiForm, semen_straw_id: e.target.value })}
                    placeholder="e.g. STR-99120"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Semen Batch Details</label>
                  <input
                    type="text"
                    value={aiForm.semen_batch_details}
                    onChange={(e) => setAIForm({ ...aiForm, semen_batch_details: e.target.value })}
                    placeholder="e.g. BAIF-NDRI-MUR-7022"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Bull Breed / Sire Information</label>
                  <input
                    type="text"
                    value={aiForm.bull_breed}
                    onChange={(e) => setAIForm({ ...aiForm, bull_breed: e.target.value })}
                    placeholder="e.g. Murrah Elite Sire"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Technician Name</label>
                  <input
                    type="text"
                    value={aiForm.technician_name}
                    onChange={(e) => setAIForm({ ...aiForm, technician_name: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Insemination Cost (₹)</label>
                  <input
                    type="number"
                    value={aiForm.insemination_cost}
                    onChange={(e) => setAIForm({ ...aiForm, insemination_cost: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Veterinary Center</label>
                  <input
                    type="text"
                    value={aiForm.veterinary_center}
                    onChange={(e) => setAIForm({ ...aiForm, veterinary_center: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Clinical Remarks & Estrus Observations</label>
                  <textarea
                    rows={2}
                    value={aiForm.remarks}
                    onChange={(e) => setAIForm({ ...aiForm, remarks: e.target.value })}
                    placeholder="Clear discharge, uterine horn tone, animal temperament..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold shadow-lg"
                >
                  Save Insemination Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. CONFIRM PREGNANCY MODAL (SECTION 2.B REQUIREMENT) */}
      {isPregnancyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <span>Confirm Buffalo Pregnancy</span>
              </h3>
              <button onClick={() => setIsPregnancyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePregnancySubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Buffalo</label>
                  <select
                    value={pregForm.buffalo_id}
                    onChange={(e) => setPregForm({ ...pregForm, buffalo_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {buffaloes.map((b) => (
                      <option key={b.id} value={b.id}>{b.id} - {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Test Result</label>
                  <select
                    value={pregForm.pregnancy_test_result}
                    onChange={(e) => setPregForm({ ...pregForm, pregnancy_test_result: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-bold text-emerald-400"
                  >
                    <option value="Positive">Positive (Confirmed Pregnant)</option>
                    <option value="Negative">Negative (Not Pregnant)</option>
                    <option value="Inconclusive">Inconclusive (Re-check Needed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Confirmation Date</label>
                  <input
                    type="date"
                    value={pregForm.pregnancy_confirmation_date}
                    onChange={(e) => setPregForm({ ...pregForm, pregnancy_confirmation_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Configurable Gestation (Days)</label>
                  <input
                    type="number"
                    value={pregForm.gestation_days_setting}
                    onChange={(e) => setPregForm({ ...pregForm, gestation_days_setting: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Standard buffalo gestation: 310 days</span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Estimated Calving Date (Calculated & Editable)</label>
                  <input
                    type="date"
                    value={pregForm.expected_calving_date}
                    onChange={(e) => setPregForm({ ...pregForm, expected_calving_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-pink-400 font-bold focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Veterinary Examination Notes</label>
                  <input
                    type="text"
                    value={pregForm.veterinary_examination}
                    onChange={(e) => setPregForm({ ...pregForm, veterinary_examination: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Veterinarian Nutritional & Pen Recommendations</label>
                  <textarea
                    rows={2}
                    value={pregForm.vet_recommendations}
                    onChange={(e) => setPregForm({ ...pregForm, vet_recommendations: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPregnancyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold shadow-lg"
                >
                  Confirm & Update Buffalo Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RECORD CALVING / DELIVERY MODAL (SECTION 2.D REQUIREMENT) */}
      {isCalvingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Baby className="w-5 h-5 text-emerald-400" />
                <span>Record Buffalo Delivery & Newborn Calf</span>
              </h3>
              <button onClick={() => setIsCalvingModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCalvingSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] mb-2">
                <strong>Automation Notice:</strong> Saving this delivery will automatically update the mother's lactation and calving history, clear the active pregnancy, create the newborn calf profile with maternal link, and schedule the calf's first deworming.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mother Buffalo</label>
                  <select
                    value={calvingForm.buffalo_id}
                    onChange={(e) => setCalvingForm({ ...calvingForm, buffalo_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {buffaloes.map((b) => (
                      <option key={b.id} value={b.id}>{b.id} - {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Actual Delivery Date</label>
                  <input
                    type="date"
                    value={calvingForm.actual_delivery_date}
                    onChange={(e) => setCalvingForm({ ...calvingForm, actual_delivery_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Delivery Type</label>
                  <select
                    value={calvingForm.delivery_type}
                    onChange={(e) => setCalvingForm({ ...calvingForm, delivery_type: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Normal delivery">Normal delivery</option>
                    <option value="Assisted delivery">Assisted delivery</option>
                    <option value="Complicated delivery">Complicated delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Calf Gender</label>
                  <select
                    value={calvingForm.calf_gender}
                    onChange={(e) => setCalvingForm({ ...calvingForm, calf_gender: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Female">Female (Heifer Prospect)</option>
                    <option value="Male">Male (Bull Calf)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Calf Name / Identification</label>
                  <input
                    type="text"
                    value={calvingForm.calf_name}
                    onChange={(e) => setCalvingForm({ ...calvingForm, calf_name: e.target.value })}
                    placeholder="e.g. Champa or Baby Lakshmi"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Birth Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={calvingForm.birth_weight}
                    onChange={(e) => setCalvingForm({ ...calvingForm, birth_weight: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Veterinary Assistance</label>
                  <input
                    type="text"
                    value={calvingForm.veterinary_assistance}
                    onChange={(e) => setCalvingForm({ ...calvingForm, veterinary_assistance: e.target.value })}
                    placeholder="Dr. K. Srinivas Murthy"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Delivery Expenses (₹)</label>
                  <input
                    type="number"
                    value={calvingForm.delivery_expenses}
                    onChange={(e) => setCalvingForm({ ...calvingForm, delivery_expenses: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Notes & Post-Calving Observations</label>
                  <textarea
                    rows={2}
                    value={calvingForm.notes}
                    onChange={(e) => setCalvingForm({ ...calvingForm, notes: e.target.value })}
                    placeholder="Colostrum feeding time, placenta status..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCalvingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  Record Delivery & Generate Calf Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
