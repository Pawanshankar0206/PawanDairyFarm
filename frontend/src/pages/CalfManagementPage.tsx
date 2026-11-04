import React, { useEffect, useState } from 'react';
import {
  Baby,
  Plus,
  Search,
  Filter,
  Scale,
  Milk,
  ChevronRight,
  Sparkles,
  HeartHandshake,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { Calf, Buffalo } from '../types';
import { CalfDetailPage } from './CalfDetailPage';
import { MotivationalBanner } from '../components/common/MotivationalBanner';

export const CalfManagementPage: React.FC<{ initialCalfId?: string | null; onNavigateToBuffalo?: (id: string) => void }> = ({
  initialCalfId,
  onNavigateToBuffalo
}) => {
  const [calves, setCalves] = useState<Calf[]>([]);
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [selectedCalfId, setSelectedCalfId] = useState<string | null>(initialCalfId || null);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('All');
  const [healthFilter, setHealthFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    photo_url: '',
    mother_buffalo_id: '',
    father_info: 'AI Sire Lineage',
    gender: 'Female' as 'Male' | 'Female',
    breed: 'Murrah',
    birth_date: new Date().toISOString().split('T')[0],
    birth_weight: 32.0,
    current_weight: 32.0,
    health_status: 'Healthy' as any,
    birth_condition: 'Normal' as any,
    feeding_method: 'Mother Milk / Colostrum',
    vaccination_status: 'Pending' as any,
    deworming_status: 'Due Soon' as any,
    notes: ''
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [calvesData, buffData] = await Promise.all([
        api.get<Calf[]>('/calves'),
        api.get<Buffalo[]>('/buffaloes')
      ]);
      setCalves(calvesData);
      setBuffaloes(buffData);
      if (buffData.length > 0 && !formData.mother_buffalo_id) {
        setFormData(prev => ({ ...prev, mother_buffalo_id: buffData[0].id }));
      }
    } catch (err) {
      console.error('Failed to load calves:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.post<Calf>('/calves', formData);
      setIsAddModalOpen(false);
      await loadData();
      setSelectedCalfId(created.id);
    } catch (err: any) {
      alert(`Registration error: ${err.message}`);
    }
  };

  if (selectedCalfId) {
    return (
      <CalfDetailPage
        calfId={selectedCalfId}
        onBack={() => setSelectedCalfId(null)}
        onNavigateToMother={onNavigateToBuffalo}
      />
    );
  }

  const filteredCalves = calves.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.mother_buffalo_id && c.mother_buffalo_id.toLowerCase().includes(search.toLowerCase()));
    const matchesGender = genderFilter === 'All' || c.gender === genderFilter;
    const matchesHealth = healthFilter === 'All' || c.health_status === healthFilter;
    return matchesSearch && matchesGender && matchesHealth;
  });

  return (
    <div className="space-y-6">
      {/* Context Motivational Message */}
      <MotivationalBanner category="calf" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <Baby className="w-5 h-5 text-gold-400" />
            <span>Calf Management Module</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dedicated pediatric monitoring from birth to maturity: periodic weight gain, colostrum/milk feeding, and deworming.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-slate-950 font-bold text-xs shadow-lg shadow-gold-950/60 border border-gold-400/40 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Calf</span>
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
            placeholder="Search by Calf ID, Name, or Mother ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-gold-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-gold-500"
          >
            <option value="All">Gender: All</option>
            <option value="Female">Female (Heifer)</option>
            <option value="Male">Male (Bull Calf)</option>
          </select>

          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-gold-500"
          >
            <option value="All">Health: All</option>
            <option value="Healthy">Healthy</option>
            <option value="Under Observation">Under Observation</option>
            <option value="Under Treatment">Under Treatment</option>
          </select>
        </div>
      </div>

      {/* Calves Directory Cards */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading calf nursery registry...</div>
      ) : filteredCalves.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 bg-slate-900/50 rounded-xl border border-slate-850">
          No calf records matched the selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCalves.map((c) => {
            const mother = buffaloes.find(b => b.id === c.mother_buffalo_id);
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCalfId(c.id)}
                className="rounded-xl bg-slate-900/90 border border-slate-800 hover:border-gold-500/60 p-4 shadow-xl hover:shadow-2xl hover:shadow-gold-950/30 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3">
                    <img
                      src={c.photo_url || "https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80"}
                      alt={c.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 group-hover:border-gold-400/50 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-bold text-gold-400 bg-gold-950/70 px-2 py-0.5 rounded border border-gold-500/30">
                          {c.id}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {c.gender}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight mt-1 truncate">{c.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {c.breed} • Born {c.birth_date}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-t border-b border-slate-800/80 my-2">
                    <div>
                      <span className="text-slate-500 block">Current Weight</span>
                      <span className="font-bold text-emerald-400 font-mono text-xs">{c.current_weight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Birth Weight</span>
                      <span className="font-medium text-slate-300 font-mono">{c.birth_weight} kg</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Mother Buffalo</span>
                      <span className="text-emerald-400 font-semibold font-mono">
                        {c.mother_buffalo_id || 'N/A'} {mother ? `(${mother.name})` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Deworming</span>
                      <span className="text-gold-400 font-medium">{c.deworming_status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 group-hover:text-gold-400 transition-colors">
                  <span className="text-[11px] truncate">{c.feeding_method}</span>
                  <div className="flex items-center gap-1 font-semibold text-gold-400 shrink-0">
                    <span>Growth Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REGISTER CALF MODAL (SECTION 3.A) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Baby className="w-5 h-5 text-gold-400" />
                <span>Register New Calf</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Calf Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Nandi"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mother Buffalo</label>
                  <select
                    value={formData.mother_buffalo_id}
                    onChange={(e) => setFormData({ ...formData, mother_buffalo_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500 font-mono"
                  >
                    <option value="">None / External Mother</option>
                    {buffaloes.map((b) => (
                      <option key={b.id} value={b.id}>{b.id} - {b.name} ({b.breed})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  >
                    <option value="Female">Female (Heifer Prospect)</option>
                    <option value="Male">Male (Bull Calf)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Breed</label>
                  <select
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  >
                    <option value="Murrah">Murrah</option>
                    <option value="Nili-Ravi">Nili-Ravi</option>
                    <option value="Jaffarabadi">Jaffarabadi</option>
                    <option value="Surti">Surti</option>
                    <option value="Mehsana">Mehsana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Birth Date</label>
                  <input
                    type="date"
                    required
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Birth Weight (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.birth_weight}
                    onChange={(e) => setFormData({ ...formData, birth_weight: Number(e.target.value), current_weight: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Feeding Method</label>
                  <select
                    value={formData.feeding_method}
                    onChange={(e) => setFormData({ ...formData, feeding_method: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  >
                    <option value="Mother Milk / Colostrum">Mother Milk / Colostrum</option>
                    <option value="Bottle Fed">Bottle Fed</option>
                    <option value="Weaned">Weaned</option>
                    <option value="Concentrate + Fodder">Concentrate + Fodder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Health Condition at Birth</label>
                  <select
                    value={formData.birth_condition}
                    onChange={(e) => setFormData({ ...formData, birth_condition: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Vigorous">Vigorous</option>
                    <option value="Weak">Weak</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Father / Semen Straw Information</label>
                  <input
                    type="text"
                    value={formData.father_info}
                    onChange={(e) => setFormData({ ...formData, father_info: e.target.value })}
                    placeholder="e.g. Murrah Sire Sultan (Straw STR-8120)"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Photo URL</label>
                  <input
                    type="text"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Notes</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Characteristics, navel disinfection note..."
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold shadow-lg"
                >
                  Register Calf & Initiate Growth Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
