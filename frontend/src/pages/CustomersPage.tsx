import React, { useEffect, useState } from 'react';
import { Users, Plus, Phone, MapPin, Milk, DollarSign, X } from 'lucide-react';
import { api } from '../services/api';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    milk_type_preferred: 'Buffalo Milk',
    daily_morning_qty: 2.0,
    daily_evening_qty: 1.5,
    price_per_litre: 85,
    balance_due: 0,
    status: 'Active'
  });

  const loadCustomers = async () => {
    try {
      const data = await api.get<any[]>('/customers');
      setCustomers(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', form);
      setIsAddOpen(false);
      setForm({
        name: '',
        phone: '',
        address: '',
        milk_type_preferred: 'Buffalo Milk',
        daily_morning_qty: 2.0,
        daily_evening_qty: 1.5,
        price_per_litre: 85,
        balance_due: 0,
        status: 'Active'
      });
      await loadCustomers();
      alert('New customer profile added.');
    } catch (err: any) {
      alert(`Error adding customer: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Customer Management & Milk Subscriptions</span>
          </h2>
          <p className="text-xs text-slate-400">
            Retail clients, sweet shops, bulk milk quotas, monthly billing statements, and outstanding balances.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((c) => (
          <div key={c.id} className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  {c.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{c.name}</h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                {c.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="font-mono text-slate-300">{c.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{c.address}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-850 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 block">Morning Quota</span>
                <span className="font-bold text-white font-mono">{c.daily_morning_qty} L</span>
              </div>
              <div>
                <span className="text-slate-500 block">Evening Quota</span>
                <span className="font-bold text-white font-mono">{c.daily_evening_qty} L</span>
              </div>
              <div>
                <span className="text-slate-500 block">Negotiated Rate</span>
                <span className="font-bold text-emerald-400 font-mono">₹{c.price_per_litre}/L</span>
              </div>
              <div>
                <span className="text-slate-500 block">Outstanding</span>
                <span className={`font-bold font-mono ${c.balance_due > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  ₹{c.balance_due.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display">Register New Customer</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Customer / Enterprise Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Venkata Ramanayya"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+919440112233"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Milk Type Preferred</label>
                  <select
                    value={form.milk_type_preferred}
                    onChange={(e) => setForm({ ...form, milk_type_preferred: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Buffalo Milk">Buffalo Milk</option>
                    <option value="High-Fat Buffalo Milk">High-Fat Buffalo Milk</option>
                    <option value="Cow A2 Milk">Cow A2 Milk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Address / Delivery Drop Location</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, Landmark, City..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Morning (L)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.daily_morning_qty}
                    onChange={(e) => setForm({ ...form, daily_morning_qty: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Evening (L)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.daily_evening_qty}
                    onChange={(e) => setForm({ ...form, daily_evening_qty: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Price/L (₹)</label>
                  <input
                    type="number"
                    value={form.price_per_litre}
                    onChange={(e) => setForm({ ...form, price_per_litre: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
