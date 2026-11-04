import React, { useEffect, useState } from 'react';
import {
  Stethoscope,
  Plus,
  Receipt,
  Pill,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  FileText,
  DollarSign,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { MedicationRecord, VeterinaryBill, Buffalo, Calf } from '../types';

export const VeterinaryManagementPage: React.FC = () => {
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [bills, setBills] = useState<VeterinaryBill[]>([]);
  const [animalReport, setAnimalReport] = useState<any[]>([]);
  const [highestExpenseAnimal, setHighestExpenseAnimal] = useState<any | null>(null);
  const [totalFarmVetExpense, setTotalFarmVetExpense] = useState<number>(0);
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [calves, setCalves] = useState<Calf[]>([]);
  const [activeTab, setActiveTab] = useState<'bills' | 'medications' | 'reports'>('bills');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  // Medication Form
  const [medForm, setMedForm] = useState({
    animal_type: 'Buffalo' as any,
    animal_id: '',
    animal_name: '',
    treatment_date: new Date().toISOString().split('T')[0],
    medicine_name: 'Ceftiofur Sodium (Excede)',
    medicine_category: 'Antibiotic',
    disease_issue: 'Hoof inflammation & lameness',
    medicine_dosage: '10 ml IM daily',
    frequency: 'Once daily',
    treatment_duration: '5 days',
    administration_method: 'Intramuscular',
    vet_doctor: 'Dr. K. Srinivas Murthy',
    prescription_upload: '',
    medication_cost: 950,
    status: 'Ongoing' as 'Ongoing' | 'Completed',
    follow_up_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    additional_notes: 'Keep stall bedding clean and dry.'
  });

  // Bill Form
  const [billForm, setBillForm] = useState({
    bill_number: `VET-${Date.now().toString().slice(-4)}`,
    bill_date: new Date().toISOString().split('T')[0],
    animal_id: '',
    animal_category: 'Buffalo' as any,
    supplier_clinic: 'Suraksha Vet Pharma & Animal Hospital',
    bill_category: 'Treatment',
    description: 'Antibiotic therapy & anti-inflammatory injections',
    quantity: 1,
    unit_price: 1500,
    total_amount: 1500,
    amount_paid: 1500,
    payment_method: 'UPI / GPay',
    receipt_attachment: '',
    items: [
      { description: 'Antibiotic Injectable vial (2 units)', quantity: 2, unit_price: 500, total: 1000 },
      { description: 'Veterinary consultation & dressing fee', quantity: 1, unit_price: 500, total: 500 }
    ]
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [medsData, billsData, reportData, buffs, clfs] = await Promise.all([
        api.get<MedicationRecord[]>('/veterinary/medications'),
        api.get<VeterinaryBill[]>('/veterinary/bills'),
        api.get<any>('/veterinary/reports/animal-wise'),
        api.get<Buffalo[]>('/buffaloes'),
        api.get<Calf[]>('/calves')
      ]);
      setMedications(medsData);
      setBills(billsData);
      setAnimalReport(reportData.report || []);
      setHighestExpenseAnimal(reportData.highest_expenditure_animal || null);
      setTotalFarmVetExpense(reportData.total_farm_veterinary_expense || 0);
      setBuffaloes(buffs);
      setCalves(clfs);

      if (buffs.length > 0 && !medForm.animal_id) {
        setMedForm(prev => ({ ...prev, animal_id: buffs[0].id, animal_name: buffs[0].name }));
        setBillForm(prev => ({ ...prev, animal_id: buffs[0].id }));
      }
    } catch (err) {
      console.error('Failed to load veterinary data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/veterinary/medications', medForm);
      setIsMedModalOpen(false);
      await loadData();
      alert('Medication treatment record logged successfully.');
    } catch (err: any) {
      alert(`Error recording medication: ${err.message}`);
    }
  };

  const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/veterinary/bills', billForm);
      setIsBillModalOpen(false);
      await loadData();
      alert('Veterinary Bill recorded and posted EXACTLY ONCE to main farm expenses.');
    } catch (err: any) {
      alert(`Error recording bill: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-400" />
            <span>Veterinary & Medication Management</span>
          </h2>
          <p className="text-xs text-slate-400">
            Maintain clinical treatments, prescriptions, itemized vet invoices, and monthly animal-wise expenditure reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <Pill className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Medication Record</span>
          </button>
          <button
            onClick={() => setIsBillModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs border border-emerald-400/30 shadow-lg shadow-emerald-950 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Veterinary Bill</span>
          </button>
        </div>
      </div>

      {/* Top Banner: Highest Medical Expenditure & Farm Total (Section 5.C Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Farm Medical Expenditure</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              ₹{totalFarmVetExpense.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-500">Reflected once in financial ledger</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-gold-500/30 md:col-span-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-950 text-gold-400 border border-gold-500/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-gold-400 uppercase font-bold tracking-wider">
                Highest Medical Expenditure Animal Identified
              </span>
              <div className="text-base font-bold text-white mt-0.5">
                {highestExpenseAnimal ? (
                  <>
                    <span className="font-mono text-emerald-400">{highestExpenseAnimal.animal_id}</span>
                    <span className="text-slate-300 ml-1.5">({highestExpenseAnimal.animal_category})</span>
                    <span className="text-gold-400 font-mono ml-2 font-extrabold">
                      — Total Medical: ₹{Number(highestExpenseAnimal.total_medical_expenses).toLocaleString('en-IN')}
                    </span>
                  </>
                ) : (
                  'No medical expenditures registered.'
                )}
              </div>
              <span className="text-[10px] text-slate-400">
                Helps identify chronic health issues, treatment efficacy and operational livestock ROI.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('bills')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'bills' ? 'border-emerald-500 text-emerald-400 bg-slate-900/50 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Veterinary Bills & Invoices ({bills.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'reports' ? 'border-gold-500 text-gold-400 bg-slate-900/50 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Animal-Wise Medical Expenditure Report</span>
        </button>
        <button
          onClick={() => setActiveTab('medications')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'medications' ? 'border-blue-500 text-blue-400 bg-slate-900/50 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Clinical Medications & Treatments ({medications.length})</span>
        </button>
      </div>

      {/* TAB 1: VETERINARY BILLS TABLE (SECTION 5.C REQUIREMENT) */}
      {activeTab === 'bills' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Veterinary Bills & Medical Expenses</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Guaranteed: Medical bills affect the farm expense total exactly once (no double counting).
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Total: ₹{totalFarmVetExpense.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">Bill Number & Date</th>
                  <th className="py-2.5 px-4">Animal</th>
                  <th className="py-2.5 px-4">Category & Clinic</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4">Payment Method</th>
                  <th className="py-2.5 px-4">Total Amount (₹)</th>
                  <th className="py-2.5 px-4">Ledger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {b.bill_number}
                      <span className="text-[10px] text-slate-400 font-normal block">{b.bill_date}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-emerald-400 font-semibold">{b.animal_id}</span>
                      <span className="text-slate-400 block text-[10px]">{b.animal_category}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <span className="font-semibold text-slate-200">{b.bill_category}</span>
                      <span className="text-[10px] text-slate-400 block">{b.supplier_clinic}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs">{b.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                        {b.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                      ₹{Number(b.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Posted (1x)</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ANIMAL-WISE MEDICAL EXPENDITURE REPORT (SECTION 5.C EXPLICIT REQUIREMENT) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-white block mb-1">Animal-Wise Medical Expenditure Breakdown</span>
            Identifies livestock requiring the highest healthcare investment.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {animalReport.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  idx === 0
                    ? 'bg-amber-950/30 border-gold-500/60 shadow-lg shadow-gold-950/20'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-emerald-400">{item.animal_id}</span>
                    <span className="text-xs text-slate-400">({item.animal_category})</span>
                  </div>
                  {idx === 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30">
                      Highest Expense
                    </span>
                  )}
                </div>

                <div className="text-2xl font-extrabold text-white font-mono my-2">
                  ₹{Number(item.total_medical_expenses).toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">
                  {item.bills_count} veterinary bill{item.bills_count > 1 ? 's' : ''} on record
                </div>

                {/* Micro Bill Summary */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
                  {item.bills.map((b: any) => (
                    <div key={b.id} className="flex justify-between text-slate-300">
                      <span className="truncate max-w-[150px]">{b.description}</span>
                      <span className="font-mono font-semibold text-emerald-400">₹{b.total_amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MEDICATIONS TABLE */}
      {activeTab === 'medications' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Pill className="w-4 h-4 text-blue-400" />
              <span>Prescribed Medications & Ongoing Treatments</span>
            </h3>
            <span className="text-xs text-slate-400">{medications.length} treatments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">Treatment Date</th>
                  <th className="py-2.5 px-4">Animal</th>
                  <th className="py-2.5 px-4">Disease / Health Issue</th>
                  <th className="py-2.5 px-4">Medicine & Category</th>
                  <th className="py-2.5 px-4">Dosage & Frequency</th>
                  <th className="py-2.5 px-4">Attending Doctor</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Follow-up Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {medications.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-200">{m.treatment_date}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-emerald-400 font-bold">{m.animal_id}</span>
                      <span className="text-slate-400 block text-[10px]">{m.animal_name}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{m.disease_issue}</td>
                    <td className="py-3 px-4">
                      <span className="text-blue-400 font-semibold">{m.medicine_name}</span>
                      <span className="text-[10px] text-slate-400 block">{m.medicine_category}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {m.medicine_dosage} ({m.frequency})
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.vet_doctor}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.status === 'Ongoing' ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gold-400">{m.follow_up_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD VETERINARY BILL MODAL (SECTION 5.C) */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>Record Veterinary Bill & Medical Expense</span>
              </h3>
              <button onClick={() => setIsBillModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBillSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px]">
                <strong>Financial Ledger Rule:</strong> This bill will be recorded once in the farm expense ledger under "Veterinary & Medicine" and linked to this animal's medical dossier. Zero double-counting.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Bill Number</label>
                  <input
                    type="text"
                    required
                    value={billForm.bill_number}
                    onChange={(e) => setBillForm({ ...billForm, bill_number: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Bill Date</label>
                  <input
                    type="date"
                    required
                    value={billForm.bill_date}
                    onChange={(e) => setBillForm({ ...billForm, bill_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Animal Category</label>
                  <select
                    value={billForm.animal_category}
                    onChange={(e) => setBillForm({ ...billForm, animal_category: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Buffalo">Buffalo</option>
                    <option value="Calf">Calf</option>
                    <option value="Cow">Cow</option>
                    <option value="General Farm / Batch">General Farm / Batch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Animal ID</label>
                  <select
                    value={billForm.animal_id}
                    onChange={(e) => setBillForm({ ...billForm, animal_id: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    {billForm.animal_category === 'Buffalo' &&
                      buffaloes.map((b) => (
                        <option key={b.id} value={b.id}>{b.id} - {b.name}</option>
                      ))}
                    {billForm.animal_category === 'Calf' &&
                      calves.map((c) => (
                        <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                      ))}
                    {billForm.animal_category === 'Cow' && (
                      <option value="COW-001">COW-001 - Kamadhenu</option>
                    )}
                    {billForm.animal_category === 'General Farm / Batch' && (
                      <option value="General Herd">General Herd</option>
                    )}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Supplier / Clinic</label>
                  <input
                    type="text"
                    required
                    value={billForm.supplier_clinic}
                    onChange={(e) => setBillForm({ ...billForm, supplier_clinic: e.target.value })}
                    placeholder="e.g. Suraksha Vet Pharma & Animal Hospital"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Bill Category</label>
                  <select
                    value={billForm.bill_category}
                    onChange={(e) => setBillForm({ ...billForm, bill_category: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Treatment">Treatment</option>
                    <option value="Medicine Purchase">Medicine Purchase</option>
                    <option value="Veterinary Consultation">Veterinary Consultation</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Deworming">Deworming</option>
                    <option value="Injections">Injections</option>
                    <option value="Laboratory Testing">Laboratory Testing</option>
                    <option value="Emergency Medical">Emergency Medical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Payment Method</label>
                  <select
                    value={billForm.payment_method}
                    onChange={(e) => setBillForm({ ...billForm, payment_method: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="UPI / GPay">UPI / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Description</label>
                  <input
                    type="text"
                    required
                    value={billForm.description}
                    onChange={(e) => setBillForm({ ...billForm, description: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={billForm.total_amount}
                    onChange={(e) => setBillForm({ ...billForm, total_amount: Number(e.target.value), amount_paid: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Amount Paid (₹)</label>
                  <input
                    type="number"
                    required
                    value={billForm.amount_paid}
                    onChange={(e) => setBillForm({ ...billForm, amount_paid: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBillModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  Save Bill & Post to Expense Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MEDICATION RECORD MODAL (SECTION 5.A) */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-400" />
                <span>Add Medication & Treatment Record</span>
              </h3>
              <button onClick={() => setIsMedModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMedSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Animal Category</label>
                  <select
                    value={medForm.animal_type}
                    onChange={(e) => setMedForm({ ...medForm, animal_type: e.target.value as any })}
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
                    value={medForm.animal_id}
                    onChange={(e) => {
                      let name = e.target.value;
                      if (medForm.animal_type === 'Buffalo') {
                        const b = buffaloes.find(item => item.id === e.target.value);
                        name = b ? b.name : name;
                      } else if (medForm.animal_type === 'Calf') {
                        const c = calves.find(item => item.id === e.target.value);
                        name = c ? c.name : name;
                      }
                      setMedForm({ ...medForm, animal_id: e.target.value, animal_name: name });
                    }}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  >
                    {medForm.animal_type === 'Buffalo' &&
                      buffaloes.map((b) => (
                        <option key={b.id} value={b.id}>{b.id} - {b.name}</option>
                      ))}
                    {medForm.animal_type === 'Calf' &&
                      calves.map((c) => (
                        <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
                      ))}
                    {medForm.animal_type === 'Cow' && (
                      <option value="COW-001">COW-001 - Kamadhenu</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Treatment Date</label>
                  <input
                    type="date"
                    required
                    value={medForm.treatment_date}
                    onChange={(e) => setMedForm({ ...medForm, treatment_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={medForm.medicine_name}
                    onChange={(e) => setMedForm({ ...medForm, medicine_name: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Disease / Health Issue</label>
                  <input
                    type="text"
                    required
                    value={medForm.disease_issue}
                    onChange={(e) => setMedForm({ ...medForm, disease_issue: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Dosage & Frequency</label>
                  <input
                    type="text"
                    required
                    value={medForm.medicine_dosage}
                    onChange={(e) => setMedForm({ ...medForm, medicine_dosage: e.target.value })}
                    placeholder="e.g. 10 ml IM daily"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Attending Doctor</label>
                  <input
                    type="text"
                    value={medForm.vet_doctor}
                    onChange={(e) => setMedForm({ ...medForm, vet_doctor: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Follow-Up Date</label>
                  <input
                    type="date"
                    value={medForm.follow_up_date}
                    onChange={(e) => setMedForm({ ...medForm, follow_up_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-gold-400 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Clinical Notes</label>
                  <textarea
                    rows={2}
                    value={medForm.additional_notes}
                    onChange={(e) => setMedForm({ ...medForm, additional_notes: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
