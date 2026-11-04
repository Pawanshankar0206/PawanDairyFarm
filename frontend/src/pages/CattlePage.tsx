import React, { useEffect, useState } from 'react';
import { Beef, Plus, Milk, Heart, CheckCircle2, X } from 'lucide-react';
import { api } from '../services/api';

export const CattlePage: React.FC = () => {
  const [cows, setCows] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    tag_number: '',
    breed: 'Gir (Indigenous Pure)',
    age_years: 4,
    current_health_status: 'Healthy',
    current_milk_production: 12.0,
    lactation_number: 2,
    status: 'Lactating',
    notes: 'A2 indigenous milk lineage.'
  });

  const loadCows = async () => {
    try {
      const data = await api.get<any[]>('/cattle');
      setCows(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCows();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cattle', form);
      setIsAddOpen(false);
      await loadCows();
      alert('Cow added to cattle registry.');
    } catch (err: any) {
      alert(`Error adding cow: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <Beef className="w-5 h-5 text-blue-400" />
            <span>Adult Cattle Herd (Cows)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Indigenous Indian cows: Gir, Sahiwal, Tharparkar and Red Sindhi dairy stock.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg border border-blue-400/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cow</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cows.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-500/30">
                  {c.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{c.name}</h3>
                <p className="text-[11px] text-slate-400">{c.breed} • Tag: {c.tag_number}</p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                {c.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Daily Milk Yield</span>
                <span className="font-bold text-emerald-400 font-mono">{c.current_milk_production} L/day</span>
              </div>
              <div>
                <span className="text-slate-500 block">Lactation</span>
                <span className="font-bold text-white">#{c.lactation_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Health Vitals</span>
                <span className="font-medium text-emerald-400">{c.current_health_status}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Age</span>
                <span className="font-medium text-slate-300">{c.age_years} Years</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 italic">{c.notes}</p>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display">Add Adult Cow Record</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Kamadhenu"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tag Number</label>
                  <input
                    type="text"
                    value={form.tag_number}
                    onChange={(e) => setForm({ ...form, tag_number: e.target.value })}
                    placeholder="AP-DF-C03"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Breed</label>
                  <select
                    value={form.breed}
                    onChange={(e) => setForm({ ...form, breed: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Gir (Indigenous Pure)">Gir (Indigenous Pure)</option>
                    <option value="Sahiwal">Sahiwal</option>
                    <option value="Tharparkar">Tharparkar</option>
                    <option value="Red Sindhi">Red Sindhi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Daily Production (L)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.current_milk_production}
                    onChange={(e) => setForm({ ...form, current_milk_production: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Save Cow Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
