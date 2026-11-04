import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Send,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  Settings,
  ShieldCheck,
  Smartphone,
  Server,
  Lock,
  Key,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { SMSNotificationSettings, SMSNotificationLog } from '../types';

export const SMSManagementPage: React.FC = () => {
  const [settings, setSettings] = useState<SMSNotificationSettings | null>(null);
  const [logs, setLogs] = useState<SMSNotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sets, logList] = await Promise.all([
        api.get<SMSNotificationSettings>('/sms/settings'),
        api.get<SMSNotificationLog[]>('/sms/logs')
      ]);
      setSettings(sets);
      setLogs(logList);
      setTestNumber(sets.registered_mobile || '+919876543210');
    } catch (err) {
      console.error('Failed to load SMS settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await api.post('/sms/settings', settings);
      alert('SMS Notification Gateway configuration saved securely.');
      await loadData();
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestSMS = async () => {
    setIsTesting(true);
    try {
      const res: any = await api.post('/sms/test', { phone: testNumber });
      if (res.success) {
        alert(`Test SMS Dispatched Successfully!\nProvider Sid: ${res.log?.provider_message_id}`);
      } else {
        alert(`SMS Gateway Notice:\n${res.log?.error_message || 'Check gateway configuration credentials.'}`);
      }
      await loadData();
    } catch (err: any) {
      alert(`Test SMS Request Failed: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRetry = async (logId: string) => {
    try {
      const res: any = await api.post(`/sms/retry/${logId}`);
      if (res.success) {
        alert('SMS Retried and Delivered successfully.');
      } else {
        alert(`Retry status: ${res.log?.error_message}`);
      }
      await loadData();
    } catch (err: any) {
      alert(`Retry failed: ${err.message}`);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading SMS notification gateway configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <span>SMS Notifications & Automated Alert Gateway</span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure mobile alerts, multi-tier deworming intervals, provider API credentials, and monitor delivery status.
          </p>
        </div>

        <button
          onClick={handleSendTestSMS}
          disabled={isTesting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold text-xs shadow-lg shadow-gold-950/60 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{isTesting ? 'Dispatching Test...' : 'Send Test SMS'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Alert Configuration & Target Numbers</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.sms_enabled}
                  onChange={(e) => setSettings({ ...settings, sms_enabled: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Enable Automated SMS Alerts</span>
              </label>
            </div>

            {/* Mobile Number & Verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Registered Admin Mobile Number</label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={settings.registered_mobile}
                    onChange={(e) => setSettings({ ...settings, registered_mobile: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">Verification Status</label>
                <div className="flex items-center gap-2 pt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${settings.is_verified ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-400 border border-amber-500/40'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{settings.is_verified ? 'Verified & Active' : 'Pending Verification'}</span>
                  </span>
                  {!settings.is_verified && (
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, is_verified: true })}
                      className="text-xs text-gold-400 hover:underline"
                    >
                      Verify Now
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Configurable Reminder Intervals (Section 4.C Explicit Requirement) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 space-y-3">
              <span className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Configurable Automated Reminder Timings
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.intervals?.before_7_days}
                    onChange={(e) => setSettings({
                      ...settings,
                      intervals: { ...settings.intervals, before_7_days: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                  />
                  <span>7 days before scheduled date</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.intervals?.before_3_days}
                    onChange={(e) => setSettings({
                      ...settings,
                      intervals: { ...settings.intervals, before_3_days: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                  />
                  <span>3 days before scheduled date</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.intervals?.before_1_day}
                    onChange={(e) => setSettings({
                      ...settings,
                      intervals: { ...settings.intervals, before_1_day: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                  />
                  <span>1 day before scheduled date</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800">
                  <input
                    type="checkbox"
                    checked={settings.intervals?.on_due_date}
                    onChange={(e) => setSettings({
                      ...settings,
                      intervals: { ...settings.intervals, on_due_date: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                  />
                  <span>On the actual scheduled date</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-2 rounded bg-slate-900 border border-slate-800 col-span-1 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={settings.intervals?.daily_overdue}
                    onChange={(e) => setSettings({
                      ...settings,
                      intervals: { ...settings.intervals, daily_overdue: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-800 text-rose-500"
                  />
                  <span className="text-rose-300 font-semibold">Daily overdue reminders when treatments are past due</span>
                </label>
              </div>
            </div>

            {/* Animal Category Triggers */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 space-y-2">
              <span className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Animal Categories Triggering SMS Alerts
              </span>
              <div className="flex flex-wrap gap-4 text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.animal_categories?.buffalo}
                    onChange={(e) => setSettings({
                      ...settings,
                      animal_categories: { ...settings.animal_categories, buffalo: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-500"
                  />
                  <span>Buffalo Herd</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.animal_categories?.calf}
                    onChange={(e) => setSettings({
                      ...settings,
                      animal_categories: { ...settings.animal_categories, calf: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-800 text-gold-500"
                  />
                  <span>Calf Nursery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.animal_categories?.cow}
                    onChange={(e) => setSettings({
                      ...settings,
                      animal_categories: { ...settings.animal_categories, cow: e.target.checked }
                    })}
                    className="rounded bg-slate-950 border-slate-800 text-blue-500"
                  />
                  <span>Adult Cows</span>
                </label>
              </div>
            </div>

            {/* Gateway Provider Selection (Section 4.D Requirement) */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-850 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                  <Server className="w-4 h-4 text-gold-400" />
                  <span>SMS Gateway Integration Provider</span>
                </div>
                <span className="text-[10px] text-slate-500">Stored securely on backend</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                {[
                  { id: 'msg91', label: 'MSG91 (India / Fast DLT)' },
                  { id: 'twilio', label: 'Twilio Cloud SMS' },
                  { id: 'webhook', label: 'Custom HTTP Webhook' },
                  { id: 'simulator', label: 'Simulation / Offline' }
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, provider: prov.id as any })}
                    className={`p-2 rounded-lg border text-left text-xs font-semibold transition-colors ${
                      settings.provider === prov.id
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {prov.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Credentials depending on provider */}
              {settings.provider === 'msg91' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">MSG91 AuthKey (API Key)</label>
                    <input
                      type="password"
                      value={settings.api_key || ''}
                      onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                      placeholder="Enter live MSG91 auth key..."
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Approved Sender ID (Header)</label>
                    <input
                      type="text"
                      value={settings.sender_id || 'DFLOW'}
                      onChange={(e) => setSettings({ ...settings, sender_id: e.target.value })}
                      placeholder="DFLOW"
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {settings.provider === 'twilio' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Twilio Account SID</label>
                    <input
                      type="text"
                      value={settings.twilio_account_sid || ''}
                      onChange={(e) => setSettings({ ...settings, twilio_account_sid: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Twilio Auth Token</label>
                    <input
                      type="password"
                      value={settings.auth_token || ''}
                      onChange={(e) => setSettings({ ...settings, auth_token: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {settings.provider === 'webhook' && (
                <div className="pt-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Gateway Webhook Endpoint URL</label>
                  <input
                    type="text"
                    value={settings.api_key || ''}
                    onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                    placeholder="https://api.gateway.com/send"
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving Configuration...' : 'Save & Enforce SMS Gateway Settings'}
            </button>
          </form>
        </div>

        {/* Right Column: Architectural Highlights & Verified Real Gateway Note */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-gold-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Reliable Backend Daemon</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Deworming reminders execute independently on a Node.js cron scheduler. The system evaluates dates and triggers notifications automatically even when your computer or browser is closed.
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strict Deduplication</span>
              </div>
              <p className="text-slate-400">
                Prevents duplicate messages for the same animal, event, and interval on the same date.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-850 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-rose-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Zero Fake Sending</span>
              </div>
              <p className="text-slate-400">
                If the provider credentials are blank or invalid, the dispatch records a failed status with the exact API error instead of falsely claiming delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SMS NOTIFICATION HISTORY LOG (SECTION 4.D REQUIREMENT) */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">SMS Notification Delivery Registry & Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400">{logs.length} dispatch logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                <th className="py-2.5 px-4">Dispatched At</th>
                <th className="py-2.5 px-4">Recipient</th>
                <th className="py-2.5 px-4">Animal & Event</th>
                <th className="py-2.5 px-4">Message Text</th>
                <th className="py-2.5 px-4">Provider & ID</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No SMS notifications dispatched yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  let statusBadge = 'bg-slate-800 text-slate-300';
                  if (log.status === 'Delivered') statusBadge = 'bg-emerald-950 text-emerald-300 border border-emerald-500/40';
                  else if (log.status === 'Failed') statusBadge = 'bg-rose-950 text-rose-300 border border-rose-500/40';
                  else if (log.status === 'Simulated') statusBadge = 'bg-blue-950 text-blue-300 border border-blue-500/40';

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                        {new Date(log.sent_at).toLocaleTimeString()}
                        <span className="text-[10px] text-slate-500 block">
                          {new Date(log.sent_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {log.recipient_phone}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-emerald-400 font-semibold">{log.animal_id}</span>
                        <span className="text-slate-400 block text-[10px]">{log.event_type} ({log.reminder_interval})</span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-sm italic">
                        "{log.message_text}"
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-slate-300 font-semibold">{log.provider.toUpperCase()}</span>
                        <span className="text-[10px] text-slate-500 block">{log.provider_message_id || '—'}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}`}>
                          {log.status}
                        </span>
                        {log.error_message && (
                          <span className="text-[9px] text-rose-400 block mt-0.5 max-w-[150px] truncate" title={log.error_message}>
                            {log.error_message}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {log.status === 'Failed' && (
                          <button
                            onClick={() => handleRetry(log.id)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-gold-400 hover:text-gold-300 text-[10px] font-semibold border border-slate-700 inline-flex items-center gap-1"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
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
    </div>
  );
};
