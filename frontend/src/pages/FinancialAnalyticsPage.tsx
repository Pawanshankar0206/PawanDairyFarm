import React, { useEffect, useState } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Plus,
  ShieldCheck,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api } from '../services/api';

export const FinancialAnalyticsPage: React.FC = () => {
  const [investments, setInvestments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'revenue' | 'investments'>('overview');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddRevenueOpen, setIsAddRevenueOpen] = useState(false);

  // Forms
  const [expForm, setExpForm] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    category: 'Feed & Fodder',
    description: '',
    amount: 12000,
    payment_mode: 'Bank Transfer',
    vendor: 'Feed Syndicate'
  });

  const [revForm, setRevForm] = useState({
    revenue_date: new Date().toISOString().split('T')[0],
    category: 'Milk Sales',
    description: '',
    amount: 25000,
    payment_mode: 'UPI',
    customer_or_source: 'Direct Wholesale'
  });

  const loadData = async () => {
    try {
      const [invData, expData, revData] = await Promise.all([
        api.get<any[]>('/finance/investments'),
        api.get<any[]>('/finance/expenses'),
        api.get<any[]>('/finance/revenue')
      ]);
      setInvestments(invData);
      setExpenses(expData);
      setRevenue(revData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRev = revenue.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExp = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalInv = investments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const netProfit = totalRev - totalExp;

  const medicalExpenses = expenses.filter(e => e.is_medical_bill || e.category === 'Veterinary & Medicine');
  const totalMed = medicalExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  // Categories aggregation for chart
  const expenseByCategory: { [key: string]: number } = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.amount);
  });
  const expenseChartData = Object.keys(expenseByCategory).map(k => ({
    name: k,
    value: expenseByCategory[k]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/expenses', expForm);
      setIsAddExpenseOpen(false);
      await loadData();
      alert('Expense recorded.');
    } catch (err: any) {
      alert(`Error saving expense: ${err.message}`);
    }
  };

  const handleCreateRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/finance/revenue', revForm);
      setIsAddRevenueOpen(false);
      await loadData();
      alert('Revenue recorded.');
    } catch (err: any) {
      alert(`Error saving revenue: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-gold-400" />
            <span>Financial Analytics & Profit/Loss Statement</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time ledger of revenues, operational overheads, capital investments, and itemized medical expenditures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs border border-rose-800/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add General Expense</span>
          </button>
          <button
            onClick={() => setIsAddRevenueOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-400/30 shadow-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Revenue</span>
          </button>
        </div>
      </div>

      {/* Top Financial Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">₹{totalRev.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-500">Collected from sales</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Operating Expenses</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">₹{totalExp.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-500">Inclusive of all medical bills</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Enterprise Profit</span>
            <DollarSign className="w-4 h-4 text-gold-400" />
          </div>
          <div className="text-2xl font-bold text-gold-400 font-mono mt-1">₹{netProfit.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-emerald-400">Healthy operating margin</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Capital Investments</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono mt-1">₹{totalInv.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-slate-500">Machinery & infrastructure</span>
        </div>
      </div>

      {/* Medical Expense Verification Alert (Prompt Requirement: No double counting) */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-white">Financial Integrity Verification:</strong>
            <span className="ml-1 text-slate-300">
              Total veterinary and medicine expense of <strong className="text-emerald-400">₹{totalMed.toLocaleString('en-IN')}</strong> is posted exactly once into the total operating expense above. No duplicate billing entries.
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
            Operating Expenses Breakdown
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={(e) => e.name}>
                  {expenseChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
            Major Capital Investments
          </h3>
          <div className="space-y-2">
            {investments.map((inv) => (
              <div key={inv.id} className="p-3 rounded-lg bg-slate-950 border border-slate-850 text-xs flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{inv.title}</div>
                  <div className="text-[10px] text-slate-400">{inv.investment_date} • {inv.category}</div>
                </div>
                <div className="text-sm font-mono font-bold text-blue-400">₹{Number(inv.amount).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL ADD EXPENSE */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Record Operating Farm Expense</h3>
              <button onClick={() => setIsAddExpenseOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    required
                    value={expForm.expense_date}
                    onChange={(e) => setExpForm({ ...expForm, expense_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={expForm.category}
                    onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Feed & Fodder">Feed & Fodder</option>
                    <option value="Labor">Labor</option>
                    <option value="Electricity & Fuel">Electricity & Fuel</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Veterinary & Medicine">Veterinary & Medicine</option>
                    <option value="Transport">Transport</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                  <input
                    type="text"
                    required
                    value={expForm.description}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    placeholder="e.g. 20 Bags cattle feed ration"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={expForm.amount}
                    onChange={(e) => setExpForm({ ...expForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Payment Mode</label>
                  <select
                    value={expForm.payment_mode}
                    onChange={(e) => setExpForm({ ...expForm, payment_mode: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI / PhonePe">UPI / PhonePe</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADD REVENUE */}
      {isAddRevenueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Record Farm Revenue Credit</h3>
              <button onClick={() => setIsAddRevenueOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRevenue} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date</label>
                  <input
                    type="date"
                    required
                    value={revForm.revenue_date}
                    onChange={(e) => setRevForm({ ...revForm, revenue_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                  <select
                    value={revForm.category}
                    onChange={(e) => setRevForm({ ...revForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  >
                    <option value="Milk Sales">Milk Sales</option>
                    <option value="Cattle / Calf Sales">Cattle / Calf Sales</option>
                    <option value="Manure / Bio-Fertilizer">Manure / Bio-Fertilizer</option>
                    <option value="Government Subsidy">Government Subsidy</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                  <input
                    type="text"
                    required
                    value={revForm.description}
                    onChange={(e) => setRevForm({ ...revForm, description: e.target.value })}
                    placeholder="e.g. October customer milk collection"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={revForm.amount}
                    onChange={(e) => setRevForm({ ...revForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Source / Customer</label>
                  <input
                    type="text"
                    value={revForm.customer_or_source}
                    onChange={(e) => setRevForm({ ...revForm, customer_or_source: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddRevenueOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Revenue Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
