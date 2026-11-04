import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { BuffaloManagementPage } from './pages/BuffaloManagementPage';
import { BreedingManagementPage } from './pages/BreedingManagementPage';
import { CalfManagementPage } from './pages/CalfManagementPage';
import { DewormingManagementPage } from './pages/DewormingManagementPage';
import { VeterinaryManagementPage } from './pages/VeterinaryManagementPage';
import { HealthCalendarPage } from './pages/HealthCalendarPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { CustomersPage } from './pages/CustomersPage';
import { FinancialAnalyticsPage } from './pages/FinancialAnalyticsPage';
import { CattlePage } from './pages/CattlePage';
import { SMSManagementPage } from './pages/SMSManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { api } from './services/api';
import { HealthAlert } from './types';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const loadAlerts = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.get<HealthAlert[]>('/dashboard/alerts');
      setAlerts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAlerts();
    }
  }, [isAuthenticated, currentTab]);

  const handleNavigate = (tab: string, entityId?: string) => {
    setSelectedEntityId(entityId || null);
    setCurrentTab(tab);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'register_buffalo') {
      setCurrentTab('buffaloes');
    } else if (action === 'record_deworming') {
      setCurrentTab('deworming');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading DairyFlow OS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const urgentCount = alerts.filter(a => a.status === 'Overdue' || a.status === 'Due Today').length;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setSelectedEntityId(null);
          setCurrentTab(tab);
        }}
        urgentAlertCount={urgentCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setSelectedEntityId(null);
            setCurrentTab(tab);
          }}
          alerts={alerts}
          onOpenQuickAction={handleQuickAction}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {currentTab === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
          {currentTab === 'buffaloes' && (
            <BuffaloManagementPage initialBuffaloId={selectedEntityId} />
          )}
          {currentTab === 'breeding' && (
            <BreedingManagementPage onNavigateToBuffalo={(id) => handleNavigate('buffaloes', id)} />
          )}
          {currentTab === 'calves' && (
            <CalfManagementPage
              initialCalfId={selectedEntityId}
              onNavigateToBuffalo={(id) => handleNavigate('buffaloes', id)}
            />
          )}
          {currentTab === 'deworming' && (
            <DewormingManagementPage onNavigateToSMS={() => setCurrentTab('sms')} />
          )}
          {currentTab === 'veterinary' && <VeterinaryManagementPage />}
          {currentTab === 'calendar' && (
            <HealthCalendarPage onNavigateToEntity={handleNavigate} />
          )}
          {currentTab === 'deliveries' && <DeliveriesPage />}
          {currentTab === 'customers' && <CustomersPage />}
          {currentTab === 'finance' && <FinancialAnalyticsPage />}
          {currentTab === 'cattle' && <CattlePage />}
          {currentTab === 'sms' && <SMSManagementPage />}
          {currentTab === 'users' && <UserManagementPage />}
        </main>
      </div>
    </div>
  );
};
