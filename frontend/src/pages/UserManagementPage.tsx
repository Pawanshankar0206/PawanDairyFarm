import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Plus,
  ShieldCheck,
  Key,
  Lock,
  RotateCcw,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  X,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserRole, AuditLog } from '../types';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Create Form State
  const [createForm, setCreateForm] = useState({
    full_name: '',
    username: '',
    email: '',
    mobile_number: '',
    password: 'password123',
    role: 'Farm Manager' as UserRole
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userList, logs] = await Promise.all([
        api.get<User[]>('/users'),
        api.get<AuditLog[]>('/audit-logs')
      ]);
      setUsers(userList);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        full_name: '',
        username: '',
        email: '',
        mobile_number: '',
        password: 'password123',
        role: 'Farm Manager'
      });
      await loadData();
      alert('New user account created successfully with role permissions enforced.');
    } catch (err: any) {
      alert(`Error creating user: ${err.message}`);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/users/${user.id}`, { ...user, status: newStatus });
      await loadData();
    } catch (err: any) {
      alert(`Error updating user status: ${err.message}`);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !newPassword) return;
    try {
      await api.post(`/users/${selectedUserForReset.id}/reset-password`, { new_password: newPassword });
      setIsResetModalOpen(false);
      setSelectedUserForReset(null);
      setNewPassword('');
      alert('Password reset successfully.');
    } catch (err: any) {
      alert(`Error resetting password: ${err.message}`);
    }
  };

  const rolesList: UserRole[] = [
    'Owner / Super Admin',
    'Farm Manager',
    'Accountant',
    'Veterinary Staff',
    'Farm Worker',
    'Read-only Viewer'
  ];

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight font-display flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <span>Farm Staff & Role-Based Access Control (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-400">
            Admin console: Create accounts, assign granular role permissions, toggle active state, and review audit trail.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-xs shadow-lg shadow-emerald-950/60 border border-emerald-400/30 transition-all transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Create New User Account</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Total Registered Users</div>
          <div className="text-2xl font-bold text-white mt-1 tracking-tight">{totalUsers}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Enterprise accounts</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Active Authorized Users</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 tracking-tight">{activeUsers}</div>
          <p className="text-[10px] text-emerald-400/80 mt-0.5">Permitted access</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Inactive Accounts</div>
          <div className="text-2xl font-bold text-rose-400 mt-1 tracking-tight">{inactiveUsers}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Suspended access</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-semibold">Configured Roles</div>
          <div className="text-2xl font-bold text-gold-400 mt-1 tracking-tight">6 Roles</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Backend security enforced</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users' ? 'border-emerald-500 text-emerald-400 bg-slate-900/50 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>User Directory & Permission Controls ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'audit' ? 'border-gold-500 text-gold-400 bg-slate-900/50 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>System Security Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">User Details</th>
                  <th className="py-2.5 px-4">Assigned Role</th>
                  <th className="py-2.5 px-4">Contact Info</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Last Login</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  let roleColor = 'text-slate-300 bg-slate-800 border-slate-700';
                  if (u.role === 'Owner / Super Admin') roleColor = 'text-gold-300 bg-gold-950/60 border-gold-500/40';
                  else if (u.role === 'Farm Manager') roleColor = 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40';
                  else if (u.role === 'Veterinary Staff') roleColor = 'text-blue-300 bg-blue-950/60 border-blue-500/40';
                  else if (u.role === 'Accountant') roleColor = 'text-purple-300 bg-purple-950/60 border-purple-500/40';

                  const isOwner = u.role === 'Owner / Super Admin';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100">{u.full_name}</div>
                        <span className="font-mono text-[11px] text-slate-400">@{u.username}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleColor}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                        <div>{u.email}</div>
                        <div className="text-slate-500">{u.mobile_number || 'No phone'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                          {u.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{u.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never logged in'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUserForReset(u);
                            setIsResetModalOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-gold-300 text-[10px] font-semibold border border-slate-700 transition-colors"
                          title="Reset Password"
                        >
                          Reset Pass
                        </button>
                        {!isOwner && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                              u.status === 'Active'
                                ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-800/40'
                                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800/40'
                            }`}
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AUDIT LOGS (SECTION 7.E REQUIREMENT) */}
      {activeTab === 'audit' && (
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-gold-400" />
              <span>Security & Operational Change Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-400">{auditLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Initiator / User</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Module</th>
                  <th className="py-2.5 px-4">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">@{log.username}</span>
                      <span className="text-[10px] text-slate-500 block">{log.user_id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-gold-400 font-semibold">{log.action}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{log.module}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL (SECTION 7.C) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Create Authorized Farm User Account</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  placeholder="e.g. Ramesh Varma"
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Username</label>
                  <input
                    type="text"
                    required
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="ramesh.mgr"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Temporary Password</label>
                  <input
                    type="text"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email Address</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="ramesh@dairyflow.com"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mobile Number</label>
                  <input
                    type="text"
                    value={createForm.mobile_number}
                    onChange={(e) => setCreateForm({ ...createForm, mobile_number: e.target.value })}
                    placeholder="+919876543210"
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Role & Permissions Level</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  {rolesList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Enforces backend permission gates for all API actions.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg"
                >
                  Save & Activate User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2">
              Reset Password for {selectedUserForReset.full_name}
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">@{selectedUserForReset.username}</p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new temporary password..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetModalOpen(false);
                    setSelectedUserForReset(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-600 hover:bg-gold-500 text-slate-950 font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
