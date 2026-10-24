import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  FileCheck, 
  Check, 
  X, 
  FileText, 
  ArrowRight,
  Filter,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActionItem, ActionCategory } from '../types';
import { 
  openGoogleCalendarReminder, 
  exportProbationEvaluationToWord 
} from '../services/exportService';

export const ActionCenterView: React.FC = () => {
  const { 
    actionItems, 
    approveLeaveRequest, 
    rejectLeaveRequest, 
    resolveActionItem,
    employees,
    contracts,
    setSelectedEmployee360 
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | ActionCategory>('ALL');

  const filteredItems = actionItems.filter(item => {
    if (activeCategoryFilter === 'ALL') return true;
    return item.category === activeCategoryFilter;
  });

  const redCount = actionItems.filter(i => i.category === 'red' && i.status === 'pending').length;
  const yellowCount = actionItems.filter(i => i.category === 'yellow' && i.status === 'pending').length;
  const greenCount = actionItems.filter(i => i.category === 'green').length;

  const handleCreateCalendar = (item: ActionItem) => {
    if (!item.employeeId) return;
    const contract = contracts.find(c => c.employeeId === item.employeeId);
    if (contract) {
      openGoogleCalendarReminder(contract);
    }
  };

  const handleExportProbationMemo = async (item: ActionItem) => {
    if (!item.employeeId) return;
    const emp = employees.find(e => e.id === item.employeeId);
    const contract = contracts.find(c => c.employeeId === item.employeeId);
    if (emp) {
      await exportProbationEvaluationToWord(emp, contract);
      resolveActionItem(item.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trung Tâm Việc Cần Xử Lý (Action Center)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Tự động đối soát và phân cấp rủi ro nhân sự theo 3 cấp độ: Khẩn cấp (Đỏ) - Chờ duyệt (Vàng) - Ổn định (Xanh)
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveCategoryFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeCategoryFilter === 'ALL'
                ? 'bg-brand-800 text-white shadow-xs dark:bg-amber-600'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Tất cả ({actionItems.length})
          </button>
          <button
            onClick={() => setActiveCategoryFilter('red')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
              activeCategoryFilter === 'red'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <span>Đỏ: Khẩn cấp</span>
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
              {redCount}
            </span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('yellow')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
              activeCategoryFilter === 'yellow'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <span>Vàng: Chờ duyệt</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
              {yellowCount}
            </span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('green')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1 ${
              activeCategoryFilter === 'green'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span>Xanh: Ổn định</span>
          </button>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const isResolved = item.status === 'resolved' || item.status === 'approved';

          // Category styling
          let cardBorder = 'border-slate-200 dark:border-slate-800';
          let badgeBg = 'bg-slate-100 text-slate-700';
          let badgeLabel = 'Thông thường';

          if (item.category === 'red') {
            cardBorder = isResolved 
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20' 
              : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/30 dark:bg-rose-950/20';
            badgeBg = 'bg-rose-600 text-white';
            badgeLabel = 'Khẩn cấp (Trong 30 ngày)';
          } else if (item.category === 'yellow') {
            cardBorder = isResolved 
              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20' 
              : 'border-amber-300 dark:border-amber-800/80 bg-amber-50/30 dark:bg-amber-950/20';
            badgeBg = 'bg-amber-500 text-white';
            badgeLabel = 'Chờ xử lý / Đang theo dõi';
          } else {
            cardBorder = 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10';
            badgeBg = 'bg-emerald-600 text-white';
            badgeLabel = 'Ổn định';
          }

          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border ${cardBorder} shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${badgeBg}`}>
                    {badgeLabel}
                  </span>
                  {item.employeeId && (
                    <button
                      onClick={() => {
                        const target = employees.find(e => e.id === item.employeeId);
                        if (target) setSelectedEmployee360(target);
                      }}
                      className="text-xs font-semibold text-brand-700 dark:text-amber-400 hover:underline"
                    >
                      Hồ sơ 360° {item.employeeId}
                    </button>
                  )}
                  {item.department && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      • {item.department}
                    </span>
                  )}
                  {item.dueDate && (
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Hạn: {item.dueDate}
                    </span>
                  )}
                </div>

                <h3 className={`text-sm sm:text-base font-bold ${
                  isResolved ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                }`}>
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                {isResolved ? (
                  <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã xử lý xong</span>
                  </span>
                ) : (
                  <>
                    {/* If Contract Renewal */}
                    {item.actionType === 'contract_renewal' && (
                      <>
                        <button
                          onClick={() => handleCreateCalendar(item)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 text-xs font-semibold transition-colors"
                          title="Tạo lịch nhắc hẹn trên Google Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>📅 Tạo lịch nhắc Calendar</span>
                        </button>
                        <button
                          onClick={() => resolveActionItem(item.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Tiến hành tái ký</span>
                        </button>
                      </>
                    )}

                    {/* If Probation Evaluation */}
                    {item.actionType === 'probation_eval' && (
                      <>
                        <button
                          onClick={() => handleExportProbationMemo(item)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 text-xs font-semibold transition-colors"
                          title="Tải tờ trình định dạng .docx chuẩn Ban Giám đốc"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Xuất Tờ trình Word (.docx)</span>
                        </button>
                        <button
                          onClick={() => resolveActionItem(item.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Duyệt ký chính thức</span>
                        </button>
                      </>
                    )}

                    {/* If Leave Approval */}
                    {item.actionType === 'leave_approval' && item.relatedDoc && (
                      <>
                        <button
                          onClick={() => rejectLeaveRequest(item.relatedDoc!)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Từ chối</span>
                        </button>
                        <button
                          onClick={() => approveLeaveRequest(item.relatedDoc!)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Phê duyệt ngay</span>
                        </button>
                      </>
                    )}

                    {/* If Active Probation */}
                    {item.actionType === 'active_probation' && (
                      <button
                        onClick={() => resolveActionItem(item.id)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã ghi nhận</span>
                      </button>
                    )}

                    {/* Stable */}
                    {item.actionType === 'stable' && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Hợp chuẩn
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
