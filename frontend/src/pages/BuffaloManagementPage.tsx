import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Milk,
  Heart,
  ChevronRight,
  Pill,
  Sparkles,
  Calendar,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { Buffalo, BuffaloStatus } from '../types';
import { BuffaloDetailPage } from './BuffaloDetailPage';
import { MotivationalBanner } from '../components/common/MotivationalBanner';

export const BuffaloManagementPage: React.FC<{ initialBuffaloId?: string | null }> = ({ initialBuffaloId }) => {
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [selectedBuffaloId, setSelectedBuffaloId] = useState<string | null>(initialBuffaloId || null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [breedFilter, setBreedFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    tag_number: '',
    photo_url: '',
    breed: 'Murrah',
    age_years: 4,
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: 130000,
    supplier_details: '',
    current_health_status: 'Healthy',
    current_milk_production: 15.0,
    morning_milk: 8.0,
    evening_milk: 7.0,
    lactation_number: 2,
    breeding_status: 'Open',
    pregnancy_status: 'Not Pregnant',
    last_calving_date: '',
    previous_medical_history: '',
    notes: '',
    status: 'Active' as BuffaloStatus
  });

  const loadBuffaloes = async () => {
    setIsLoading(true);
    try {
      const data = await api.get<Buffalo[]>('/buffaloes');
      setBuffaloes(data);
    } catch (err) {
      console.error('Failed to load buffaloes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBuffaloes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<Buffalo>('/buffaloes', formData);
      setIsAddModalOpen(false);
      await loadBuffaloes();
      setSelectedBuffaloId(created.id);
    } catch (err: any) {
      alert(`Registration error: ${err.message}`);
    }
  };

  if (selectedBuffaloId) {
    return (
      <BuffaloDetailPage
        buffaloId={selectedBuffaloId}
        onBack={() => setSelectedBuffaloId(null)}
      />
    );
  }

  const breeds = ['All', 'Murrah', 'Nili-Ravi', 'Jaffarabadi', 'Surti', 'Mehsana', 'Banni', 'Bhadawari'];
  const statuses = ['All', 'Active', 'Pregnant', 'Lactating', 'Dry period', 'Not pregnant', 'Under treatment', 'Retired'];

  const filteredBuffaloes = buffaloes.filter((b) => {
    const matchesSearch =
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.tag_number && b.tag_number.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesBreed = breedFilter === 'All' || b.breed === breedFilter;
    return matchesSearch && matchesStatus && matchesBreed;
  });

  return (
    <div className="space-y-6">
      {/* Context-Specific Motivational Message */}
      <MotivationalBanner category="buffalo" />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            <span>Buffalo Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Complete lifecycle monitoring: health, breeding, AI, pregnancy, lactation and medical records.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Buffalo</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Buffalo ID, Name, or Tag..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={breedFilter}
            onChange={(e) => setBreedFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            {breeds.map((br) => (
              <option key={br} value={br}>Breed: {br}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>Status: {st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Buffalo Directory Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading buffalo herd...</div>
      ) : filteredBuffaloes.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-slate-850">
          No buffalo records matched your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBuffaloes.map((b) => {
            let statusBadge = 'bg-slate-800 text-slate-300 border-slate-700';
            if (b.status === 'Pregnant') statusBadge = 'bg-pink-950/80 text-pink-300 border-pink-500/40';
            else if (b.status === 'Lactating') statusBadge = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
            else if (b.status === 'Under treatment') statusBadge = 'bg-rose-950/80 text-rose-300 border-rose-500/40';
            else if (b.status === 'Dry period') statusBadge = 'bg-amber-950/80 text-amber-300 border-amber-500/40';

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBuffaloId(b.id)}
                className="rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 p-4 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/40 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={b.photo_url || "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80"}
                      alt={b.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 group-hover:border-emerald-400/50 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-500/30">
                          {b.id}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                          {b.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight mt-1 truncate">{b.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {b.breed} • Age {b.age_years}y • Lactation #{b.lactation_number}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-t border-b border-slate-800/80 my-2">
                    <div>
                      <span className="text-slate-500 block">Daily Milk</span>
                      <span className="font-semibold text-white">{b.current_milk_production} L/day</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Pregnancy</span>
                      <span className={b.pregnancy_status === 'Confirmed Pregnant' ? 'text-pink-400 font-semibold' : 'text-slate-300'}>
                        {b.pregnancy_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Health Vitals</span>
                      <span className={b.current_health_status === 'Healthy' ? 'text-emerald-400' : 'text-amber-400'}>
                        {b.current_health_status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Breeding</span>
                      <span className="text-gold-400 font-medium">{b.breeding_status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 group-hover:text-emerald-400 transition-colors">
                  <span className="text-[11px]">Tag: {b.tag_number || 'N/A'}</span>
                  <div className="flex items-center gap-1 font-semibold text-emerald-400">
                    <span>View Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REGISTER BUFFALO MODAL (SECTION 1.A REQUIREMENT) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <span>Register Buffalo into DairyFlow Herd</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Buffalo Name / Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Lakshmi"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Ear Tag Number</label>
                  <input
                    type="text"
                    value={formData.tag_number}
                    onChange={(e) => setFormData({ ...formData, tag_number: e.target.value })}
                    placeholder="e.g. AP-DF-0106"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Breed</label>
                  <select
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Murrah">Murrah</option>
                    <option value="Nili-Ravi">Nili-Ravi</option>
                    <option value="Jaffarabadi">Jaffarabadi</option>
                    <option value="Surti">Surti</option>
                    <option value="Mehsana">Mehsana</option>
                    <option value="Banni">Banni</option>
                    <option value="Bhadawari">Bhadawari</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Estimated Age (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.age_years}
                    onChange={(e) => setFormData({ ...formData, age_years: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Supplier Details</label>
                  <input
                    type="text"
                    value={formData.supplier_details}
                    onChange={(e) => setFormData({ ...formData, supplier_details: e.target.value })}
                    placeholder="e.g. Haryana Purebred Murrah Syndicate, Rohtak"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Current Health Status</label>
                  <select
                    value={formData.current_health_status}
                    onChange={(e) => setFormData({ ...formData, current_health_status: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Healthy">Healthy</option>
                    <option value="Minor Issue">Minor Issue</option>
                    <option value="Under Treatment">Under Treatment</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Lifecycle Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Pregnant">Pregnant</option>
                    <option value="Lactating">Lactating</option>
                    <option value="Dry period">Dry period</option>
                    <option value="Not pregnant">Not pregnant</option>
                    <option value="Under treatment">Under treatment</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Daily Milk Production (L)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.current_milk_production}
                    onChange={(e) => setFormData({ ...formData, current_milk_production: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Lactation Number</label>
                  <input
                    type="number"
                    value={formData.lactation_number}
                    onChange={(e) => setFormData({ ...formData, lactation_number: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Photo URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Notes / Physical Characteristics</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Physical markings, horns conformation, docility..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950"
                >
                  Save & Register Buffalo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
