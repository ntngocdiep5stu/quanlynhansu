import React from 'react';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Users, 
  CreditCard, 
  UploadCloud, 
  CalendarDays 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, actionItems } = useApp();

  const redCount = actionItems.filter(i => i.category === 'red' && i.status === 'pending').length;

  const items: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'action-center', label: 'Cần xử lý', icon: AlertCircle, badge: redCount > 0 ? redCount : undefined },
    { id: 'employees', label: 'Nhân sự', icon: Users },
    { id: 'payroll', label: 'Lương', icon: CreditCard },
    { id: 'leave', label: 'Phép', icon: CalendarDays },
    { id: 'upload', label: 'Nạp file', icon: UploadCloud },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex justify-around">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center py-1 px-2 relative rounded-lg ${
              isActive ? 'text-amber-600 dark:text-amber-400 font-semibold' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-2 bg-rose-500 text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
