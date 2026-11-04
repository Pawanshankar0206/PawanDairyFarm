import React, { useEffect, useState } from 'react';
import { Milk, Plus, Calendar, DollarSign, X } from 'lucide-react';
import { api } from '../services/api';

export const DeliveriesPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    delivery_date: new Date().toISOString().split('T')[0],
    shift: 'Morning',
    customer_id: '',
    customer_name: '',
    milk_type: 'Buffalo Milk',
    quantity_litres: 5.0,
    fat_percentage: 7.5,
    snf_percentage: 9.2,
    rate_per_litre: 85,
    total_amount: 425
  });

  const loadData = async () => {
    try {
      const [delData, custList] = await Promise.all([
        api.get<any[]>('/deliveries'),
        api.get<any[]>('/customers')
      ]);
      setDeliveries(delData);
      setCustomers(custList);
      if (custList.length > 0 && !form.customer_id) {
        setForm(prev => ({
          ...prev,
          customer_id: custList[0].id,
          customer_name: custList[0].name,
          rate_per_litre: custList[0].price_per_litre || 85,
          total_amount: 5 * (custList[0].price_per_litre || 85)
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQtyChange = (qty: number, rate: number) => {
    setForm(prev => ({
      ...prev,
      quantity_litres: qty,
      rate_per_litre: rate,
      total_amount: Math.round(qty * rate * 100) / 100
    }));
  };

  const handleCustomerChange = (custId: string) => {
    const c = customers.find(item => item.id === custId);
    const rate = c ? (c.price_per_litre || 85) : form.rate_per_litre;
    setForm(prev => ({
      ...prev,
      customer_id: custId,
      customer_name: c ? c.name : prev.customer_name,
      rate_per_litre: rate,
      total_amount: Math.round(prev.quantity_litres * rate * 100) / 100
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/deliveries', form);
      setIsAddOpen(false);
      await loadData();
      alert('Milk delivery recorded and billed.');
    } catch (err: any) {
      alert(`Error saving delivery: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <Milk className="w-5 h-5 text-emerald-400" />
            <span>Milk Collection, Deliveries & Billing</span>
          </h2>
          <p className="text-xs text-slate-400">
            Morning and evening milking collection, fat/SNF analysis, customer delivery logs, and billing ledger.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Record Milk Delivery</span>
        </button>
      </div>

      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <h3 className="text-sm font-bold text-white">Daily Delivery Log</h3>
          <span className="text-xs text-slate-400">{deliveries.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-2.5 px-4">Date & Shift</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Milk Type</th>
                <th className="py-2.5 px-4">Volume (L)</th>
                <th className="py-2.5 px-4">Fat / SNF %</th>
                <th className="py-2.5 px-4">Rate (₹/L)</th>
                <th className="py-2.5 px-4">Total Amount (₹)</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                    {d.delivery_date}
                    <span className="text-[10px] text-slate-400 block font-sans">{d.shift} Shift</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-100">{d.customer_name}</span>
                    <span className="text-[10px] text-slate-500 font-mono block">{d.customer_id}</span>
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-medium">{d.milk_type}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white text-sm">{d.quantity_litres} L</td>
                  <td className="py-3 px-4 font-mono text-slate-300">{d.fat_percentage}% / {d.snf_percentage}%</td>
                  <td className="py-3 px-4 font-mono text-slate-300">₹{d.rate_per_litre}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">₹{d.total_amount}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      {d.payment_status || 'Billed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display">Record Milk Delivery & Sale</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={form.delivery_date}
                    onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Shift</label>
                  <select
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Morning">Morning Shift (05:30 AM)</option>
                    <option value="Evening">Evening Shift (05:00 PM)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Customer</label>
                  <select
                    value={form.customer_id}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.milk_type_preferred})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Volume (Litres)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={form.quantity_litres}
                    onChange={(e) => handleQtyChange(Number(e.target.value), form.rate_per_litre)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Rate per Litre (₹)</label>
                  <input
                    type="number"
                    value={form.rate_per_litre}
                    onChange={(e) => handleQtyChange(form.quantity_litres, Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Fat %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.fat_percentage}
                    onChange={(e) => setForm({ ...form, fat_percentage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">SNF %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.snf_percentage}
                    onChange={(e) => setForm({ ...form, snf_percentage: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Billed Amount:</span>
                <span className="text-base font-extrabold text-emerald-400 font-mono">₹{form.total_amount}</span>
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
                  Save Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
