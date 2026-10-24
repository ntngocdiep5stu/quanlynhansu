import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { ActionCenterView } from './components/ActionCenterView';
import { EmployeesView } from './components/EmployeesView';
import { ContractsView } from './components/ContractsView';
import { AttendanceView } from './components/AttendanceView';
import { LeaveView } from './components/LeaveView';
import { PayrollView } from './components/PayrollView';
import { UploadView } from './components/UploadView';
import { EmployeeDrawer360 } from './components/EmployeeDrawer360';
import { PayslipModal } from './components/PayslipModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { AIAssistantModal } from './components/AIAssistantModal';

export const AppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'action-center' && <ActionCenterView />}
            {activeTab === 'employees' && <EmployeesView />}
            {activeTab === 'contracts' && <ContractsView />}
            {activeTab === 'attendance' && <AttendanceView />}
            {activeTab === 'leave' && <LeaveView />}
            {activeTab === 'payroll' && <PayrollView />}
            {activeTab === 'upload' && <UploadView />}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Global Slide-overs & Modals */}
      <EmployeeDrawer360 />
      <PayslipModal />
      <ApiKeyModal />
      <AIAssistantModal />
    </div>
  );
};
