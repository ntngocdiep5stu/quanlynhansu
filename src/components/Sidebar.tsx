import React from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Users, 
  FileText, 
  Clock, 
  CalendarDays, 
  CreditCard, 
  UploadCloud, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

interface SidebarItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, actionItems } = useApp();

  // Count pending red and yellow action items
  const redCount = actionItems.filter(i => i.category === 'red' && i.status === 'pending').length;
  const yellowCount = actionItems.filter(i => i.category === 'yellow' && i.status === 'pending').length;
  const totalPendingActionCount = redCount + yellowCount;

  const menuItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Bảng điều hành',
      icon: LayoutDashboard,
    },
    {
      id: 'action-center',
      label: 'Việc cần xử lý',
      icon: AlertCircle,
      badge: totalPendingActionCount > 0 ? totalPendingActionCount : undefined,
      badgeColor: redCount > 0 ? 'bg-rose-500' : 'bg-amber-500'
    },
    {
      id: 'employees',
      label: 'Hồ sơ 360° & Nhân viên',
      icon: Users,
    },
    {
      id: 'contracts',
      label: 'Hợp đồng lao động',
      icon: FileText,
    },
    {
      id: 'attendance',
      label: 'Chấm công & Tăng ca',
      icon: Clock,
    },
    {
      id: 'leave',
      label: 'Nghỉ phép & Quỹ phép',
      icon: CalendarDays,
      badge: yellowCount > 0 ? yellowCount : undefined,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'payroll',
      label: 'Bảng lương & Thuế TNCN',
      icon: CreditCard,
    },
    {
      id: 'upload',
      label: 'Nhập thêm dữ liệu',
      icon: UploadCloud,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0F291E] text-slate-200 border-r border-[#1B4332] flex flex-col justify-between hidden md:flex transition-all">
      <div>
        {/* Workspace Brand Badge */}
        <div className="p-5 border-b border-[#1B4332]/60">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-900 text-sm shadow-md">
              A
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                Doanh nghiệp
              </div>
              <div className="font-bold text-white text-sm">
                CÔNG TY CỔ PHẦN A
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-3">
          <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Phân hệ Quản trị
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-[#16382B] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-brand-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-[#1B4332]/60 bg-[#0A1D15]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium">Hệ thống Bảo mật</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            v2.6 Live
          </span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          50 Nhân sự | Quý 3-4/2026
        </p>
      </div>
    </aside>
  );
};
