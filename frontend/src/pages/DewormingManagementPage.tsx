import React, { useEffect, useState } from 'react';
import {
  Pill,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Filter,
  Search,
  X,
  MessageSquare,
  ShieldAlert,
  Baby,
  Beef,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { DewormingRecord, DewormingSchedule, Buffalo, Calf } from '../types';

export const DewormingManagementPage: React.FC<{ onNavigateToSMS?: () => void }> = ({ onNavigateToSMS }) => {
  const [records, setRecords] = useState<DewormingRecord[]>([]);
  const [schedules, setSchedules] = useState<DewormingSchedule[]>([]);
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [calves, setCalves] = useState<Calf[]>([]);
  const [animalFilter, setAnimalFilter] = useState<'All' | 'Buffalo' | 'Calf' | 'Cow'>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'calendar' | 'records'>('calendar');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedScheduleToComplete, setSelectedScheduleToComplete] = useState<DewormingSchedule | null>(null);

  // Record Form State
  const [recordForm, setRecordForm] = useState({
    animal_type: 'Buffalo' as 'Buffalo' | 'Calf' | 'Cow',
    animal_id: '',
    animal_name: '',
    deworming_date: new Date().toISOString().split('T')[0],
    medicine_name: 'Fenbendazole (Fentas Plus 3g)',
    medicine_type: 'Bolus / Tablet',
    dosage: '1 Bolus (as prescribed)',
    administration_method: 'Oral',
    vet_doctor: 'Dr. K. Srinivas Murthy',
    medicine_cost: 180,
    next_recommended_date: '',
    prescription_attachment: '',
    remarks: '',
    schedule_id: ''
  });

  // Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    animal_type: 'Buffalo' as 'Buffalo' | 'Calf' | 'Cow',
    animal_id: '',
    animal_name: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    medicine_recommended: 'Albendazole suspension',
    dosage_recommended: '60 ml (as prescribed by veterinarian)'
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recs, scheds, buffs, clfs] = await Promise.all([
        api.get<DewormingRecord[]>('/deworming/records'),
        api.get<DewormingSchedule[]>('/deworming/schedules'),
        api.get<Buffalo[]>('/buffaloes'),
        api.get<Calf[]>('/calves')
      ]);
      setRecords(recs);
      setSchedules(scheds);
      setBuffaloes(buffs);
      setCalves(clfs);

      if (buffs.length > 0 && !recordForm.animal_id) {
        setRecordForm(prev => ({
          ...prev,
          animal_id: buffs[0].id,
          animal_name: buffs[0].name
        }));
        setScheduleForm(prev => ({
          ...prev,
          animal_id: buffs[0].id,
          animal_name: buffs[0].name
        }));
      }
    } catch (err) {
      console.error('Failed to load deworming data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAnimalSelectInForm = (type: 'Buffalo' | 'Calf' | 'Cow', id: string) => {
    let name = '';
    if (type === 'Buffalo') {
      const b = buffaloes.find(item => item.id === id);
      name = b ? b.name : id;
    } else if (type === 'Calf') {
      const c = calves.find(item => item.id === id);
      name = c ? c.name : id;
    } else {
      name = id;
    }
    setRecordForm(prev => ({ ...prev, animal_type: type, animal_id: id, animal_name: name }));
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deworming/records', recordForm);
      setIsRecordModalOpen(false);
      setSelectedScheduleToComplete(null);
      await loadData();
      alert(`Deworming recorded for ${recordForm.animal_type} ${recordForm.animal_id}. Next schedule automatically generated.`);
    } catch (err: any) {
      alert(`Error recording deworming: ${err.message}`);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deworming/schedules', scheduleForm);
      setIsScheduleModalOpen(false);
      await loadData();
      alert('New deworming appointment scheduled.');
    } catch (err: any) {
      alert(`Error creating schedule: ${err.message}`);
    }
  };

  const handleTriggerManualSMSCheck = async () => {
    try {
      const res: any = await api.post('/sms/trigger-check');
      alert(`Automated Scheduler Executed! Checked ${res.result?.checked} schedules, dispatched ${res.result?.sent} automated SMS alerts.`);
      await loadData();
    } catch (err: any) {
      alert(`Error triggering scheduler: ${err.message}`);
    }
  };

  const openCompleteModal = (item: DewormingSchedule) => {
    setSelectedScheduleToComplete(item);
    setRecordForm({
      animal_type: item.animal_type,
      animal_id: item.animal_id,
      animal_name: item.animal_name,
      deworming_date: new Date().toISOString().split('T')[0],
      medicine_name: item.medicine_recommended || 'Prescribed Dewormer',
      medicine_type: 'Liquid / Drench',
      dosage: item.dosage_recommended || 'Standard Dose',
      administration_method: 'Oral',
      vet_doctor: 'Dr. K. Srinivas Murthy',
      medicine_cost: 180,
      next_recommended_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prescription_attachment: '',
      remarks: 'Administered as scheduled.',
      schedule_id: item.id
    });
    setIsRecordModalOpen(true);
  };

  // KPI Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const dueTodayCount = schedules.filter(s => s.status === 'Due Today' || (s.scheduled_date === todayStr && s.status !== 'Completed')).length;
  const overdueCount = schedules.filter(s => s.status === 'Overdue' || (new Date(s.scheduled_date) < new Date(todayStr) && s.status !== 'Completed')).length;
  const dueSoonCount = schedules.filter(s => s.status === 'Due Soon').length;
  const completedCount = schedules.filter(s => s.status === 'Completed').length;

  const filteredSchedules = schedules.filter(s => {
    const matchType = animalFilter === 'All' || s.animal_type === animalFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchType && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <Pill className="w-5 h-5 text-emerald-400" />
            <span>Deworming Management System</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dedicated health protection for Buffaloes, Calves, and Cows with automated multi-interval SMS alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTriggerManualSMSCheck}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gold-300 font-semibold text-xs border border-gold-500/30 transition-all shadow-md"
            title="Runs the background SMS scheduler check immediately"
          >
            <Send className="w-3.5 h-3.5 text-gold-400" />
            <span>Trigger Scheduler Check</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>Schedule Deworming</span>
          </button>

          <button
            onClick={() => {
              setSelectedScheduleToComplete(null);
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-400/30 shadow-lg shadow-emerald-950 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Treatment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Overdue (Red) */}
        <div className={`p-3.5 rounded-xl border ${overdueCount > 0 ? 'bg-rose-950/50 border-rose-500/70 shadow-lg shadow-rose-950/40' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold">Overdue Deworming</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">{overdueCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Requires immediate clinical dosing</p>
        </div>

        {/* Due Today (Crimson/Yellow) */}
        <div className={`p-3.5 rounded-xl border ${dueTodayCount > 0 ? 'bg-amber-950/50 border-amber-500/70 shadow-lg shadow-amber-950/40' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold">Due Today</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">{dueTodayCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Scheduled for today's morning routine</p>
        </div>

        {/* Due Soon (Yellow) */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold">Due This Week</span>
            <Calendar className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-yellow-400 tracking-tight">{dueSoonCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Next 7 days reminder window</p>
        </div>

        {/* Completed (Green) */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-300 mb-1">
            <span className="text-xs font-semibold">Completed Deworming</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">{completedCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Safely administered & logged</p>
        </div>
      </div>

      {/* SMS Alert Demonstration Strip (Section 4.C Requirement) */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-gold-400 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Automated Deworming SMS Dispatch System
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-mono">
              "DAIRYFLOW ALERT: Deworming is due in 3 days for Buffalo BFL-001. Scheduled Date: 07 Nov 2026. Medicine: As prescribed by veterinarian. Please arrange the treatment."
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToSMS}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gold-300 text-xs font-semibold border border-gold-500/30 shrink-0 transition-colors"
        >
          SMS Settings & Logs →
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Animal Type Filter (Section 4.B Requirement) */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['All', 'Buffalo', 'Calf', 'Cow'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAnimalFilter(type)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                animalFilter === type
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'All' ? 'All Animals' : `${type}s`}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Schedules</option>
            <option value="Overdue">Overdue (Red)</option>
            <option value="Due Today">Due Today</option>
            <option value="Due Soon">Due Soon (Yellow)</option>
            <option value="Scheduled">Future Scheduled</option>
            <option value="Completed">Completed (Green)</option>
          </select>

          <div className="flex rounded-lg bg-slate-950 border border-slate-800 p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md font-semibold ${viewMode === 'calendar' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Calendar Schedule
            </button>
            <button
              onClick={() => setViewMode('records')}
              className={`px-3 py-1 rounded-md font-semibold ${viewMode === 'records' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
            >
              Completed Records ({records.length})
            </button>
          </div>
        </div>
      </div>

      {/* SCHEDULES FEED (COLOR INDICATORS: GREEN, YELLOW, RED, GREY) */}
      {viewMode === 'calendar' ? (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">Farm-Wide Deworming Calendar</h3>
            </div>
            {/* Color Legend (Section 4.B Requirement) */}
            <div className="hidden sm:flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completed
              </span>
              <span className="flex items-center gap-1 text-yellow-400">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Due Soon
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Overdue
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Scheduled
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">Scheduled Date</th>
                  <th className="py-2.5 px-4">Animal Category</th>
                  <th className="py-2.5 px-4">Animal ID & Name</th>
                  <th className="py-2.5 px-4">Prescribed Medicine</th>
                  <th className="py-2.5 px-4">Prescribed Dosage</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No deworming schedules matching the active filter.
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((s) => {
                    let statusPill = 'bg-slate-800 text-slate-300 border-slate-700'; // Grey
                    if (s.status === 'Completed') statusPill = 'bg-emerald-950 text-emerald-300 border-emerald-500/50'; // Green
                    else if (s.status === 'Overdue') statusPill = 'bg-rose-950 text-rose-300 border-rose-500/50 animate-pulse'; // Red
                    else if (s.status === 'Due Today') statusPill = 'bg-amber-950 text-amber-300 border-amber-500/50'; // Yellow/Orange
                    else if (s.status === 'Due Soon') statusPill = 'bg-yellow-950 text-yellow-300 border-yellow-500/50'; // Yellow

                    return (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                          {s.scheduled_date}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-medium">
                          {s.animal_type}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-emerald-400">{s.animal_id}</span>
                          <span className="text-slate-300 ml-1.5">({s.animal_name})</span>
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {s.medicine_recommended}
                        </td>
                        <td className="py-3 px-4 text-slate-400 italic">
                          {s.dosage_recommended}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusPill}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {s.status !== 'Completed' ? (
                            <button
                              onClick={() => openCompleteModal(s)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shadow transition-colors"
                            >
                              Record Treatment
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-400 font-medium flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Administered</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* COMPLETED DEWORMING RECORDS */
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed Deworming Administered Registry</span>
            </h3>
            <span className="text-xs text-slate-400">{records.length} treatments on record</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">Date Administered</th>
                  <th className="py-2.5 px-4">Animal</th>
                  <th className="py-2.5 px-4">Medicine & Form</th>
                  <th className="py-2.5 px-4">Prescribed Dosage</th>
                  <th className="py-2.5 px-4">Administered By</th>
                  <th className="py-2.5 px-4">Cost (₹)</th>
                  <th className="py-2.5 px-4">Next Due Date</th>
                  <th className="py-2.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">{r.deworming_date}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-emerald-400">{r.animal_id}</span>
                      <span className="text-slate-400 ml-1">({r.animal_name})</span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {r.medicine_name} <span className="text-[10px] text-slate-400 block">{r.medicine_type}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{r.dosage}</td>
                    <td className="py-3 px-4 text-slate-300">{r.vet_doctor}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">₹{r.medicine_cost}</td>
                    <td className="py-3 px-4 font-mono text-gold-400 font-bold">{r.next_recommended_date || '—'}</td>
                    <td className="py-3 px-4 text-slate-400 italic max-w-xs">{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD DEWORMING MODAL (SECTION 4.A REQUIREMENT) */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-400" />
                <span>Record Administered Deworming Treatment</span>
              </h3>
              <button onClick={() => setIsRecordModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                <span className="text-gold-400 font-semibold block mb-0.5">Veterinarian Prescribed Dosage Policy:</span>
                Dosage and medicine are never automatically decided by the system. Enter the veterinarian's verified prescription.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Animal Category</label>
                  <select
                    value={recordForm.animal_type}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      const firstId = type === 'Buffalo' ? (buffaloes[0]?.id || '') : (calves[0]?.id || '');
                      handleAnimalSelectInForm(type, firstId);
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Buffalo">Buffalo</option>
                    <option value="Calf">Calf</option>
                    <option value="Cow">Cow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Animal ID & Name</label>
                  <select
                    value={recordForm.animal_id}
                    onChange={(e) => handleAnimalSelectInForm(recordForm.animal_type, e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {recordForm.animal_type === 'Buffalo' &&
                      buffaloes.map((b) => (
                        <option key={b.id} value={b.id}>{b.id} - {b.name}</option>
                      ))}
                    {recordForm.animal_type === 'Calf' &&
                      calves.map((c) => (
                        <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                      ))}
                    {recordForm.animal_type === 'Cow' && (
                      <option value="COW-001">COW-001 - Kamadhenu</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Treatment Date</label>
                  <input
                    type="date"
                    required
                    value={recordForm.deworming_date}
                    onChange={(e) => setRecordForm({ ...recordForm, deworming_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={recordForm.medicine_name}
                    onChange={(e) => setRecordForm({ ...recordForm, medicine_name: e.target.value })}
                    placeholder="e.g. Fenbendazole (Fentas Plus 3g)"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Medicine Type</label>
                  <select
                    value={recordForm.medicine_type}
                    onChange={(e) => setRecordForm({ ...recordForm, medicine_type: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Liquid / Drench">Liquid / Drench</option>
                    <option value="Bolus / Tablet">Bolus / Tablet</option>
                    <option value="Injectable">Injectable (e.g. Ivermectin)</option>
                    <option value="Paste">Paste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Prescribed Dosage</label>
                  <input
                    type="text"
                    required
                    value={recordForm.dosage}
                    onChange={(e) => setRecordForm({ ...recordForm, dosage: e.target.value })}
                    placeholder="e.g. 1 Bolus (3000 mg) or 60 ml"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Administration Method</label>
                  <select
                    value={recordForm.administration_method}
                    onChange={(e) => setRecordForm({ ...recordForm, administration_method: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Subcutaneous">Subcutaneous</option>
                    <option value="Intramuscular">Intramuscular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Doctor / Person Administering</label>
                  <input
                    type="text"
                    value={recordForm.vet_doctor}
                    onChange={(e) => setRecordForm({ ...recordForm, vet_doctor: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Medicine Cost (₹)</label>
                  <input
                    type="number"
                    value={recordForm.medicine_cost}
                    onChange={(e) => setRecordForm({ ...recordForm, medicine_cost: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Next Recommended Date (Auto-Schedules)</label>
                  <input
                    type="date"
                    value={recordForm.next_recommended_date}
                    onChange={(e) => setRecordForm({ ...recordForm, next_recommended_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-gold-400 font-semibold focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Prescription / Remarks</label>
                  <textarea
                    rows={2}
                    value={recordForm.remarks}
                    onChange={(e) => setRecordForm({ ...recordForm, remarks: e.target.value })}
                    placeholder="Safe for pregnant cattle, given on empty stomach..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  Record Treatment & Update Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW DEWORMING APPOINTMENT SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Schedule Next Deworming Appointment</span>
              </h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Animal Category</label>
                  <select
                    value={scheduleForm.animal_type}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      const firstId = type === 'Buffalo' ? (buffaloes[0]?.id || '') : (calves[0]?.id || '');
                      setScheduleForm(prev => ({ ...prev, animal_type: type, animal_id: firstId }));
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Buffalo">Buffalo</option>
                    <option value="Calf">Calf</option>
                    <option value="Cow">Cow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Animal ID</label>
                  <select
                    value={scheduleForm.animal_id}
                    onChange={(e) => {
                      let name = e.target.value;
                      if (scheduleForm.animal_type === 'Buffalo') {
                        const b = buffaloes.find(item => item.id === e.target.value);
                        name = b ? b.name : name;
                      } else if (scheduleForm.animal_type === 'Calf') {
                        const c = calves.find(item => item.id === e.target.value);
                        name = c ? c.name : name;
                      }
                      setScheduleForm(prev => ({ ...prev, animal_id: e.target.value, animal_name: name }));
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {scheduleForm.animal_type === 'Buffalo' &&
                      buffaloes.map((b) => (
                        <option key={b.id} value={b.id}>{b.id} - {b.name}</option>
                      ))}
                    {scheduleForm.animal_type === 'Calf' &&
                      calves.map((c) => (
                        <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                      ))}
                    {scheduleForm.animal_type === 'Cow' && (
                      <option value="COW-001">COW-001 - Kamadhenu</option>
                    )}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.scheduled_date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 font-bold text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Recommended Medicine</label>
                  <input
                    type="text"
                    value={scheduleForm.medicine_recommended}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, medicine_recommended: e.target.value })}
                    placeholder="e.g. Albendazole or Fenbendazole"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Recommended Dosage</label>
                  <input
                    type="text"
                    value={scheduleForm.dosage_recommended}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, dosage_recommended: e.target.value })}
                    placeholder="As prescribed by veterinarian"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg"
                >
                  Save Schedule & Activate SMS Alerts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
