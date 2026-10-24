import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarDays, 
  Search, 
  Filter, 
  Download, 
  Check, 
  X, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateVN } from '../utils/formatters';
import { exportToExcel } from '../services/excelService';

export const LeaveView: React.FC = () => {
  const { 
    leaveRequests, 
    leaveQuotas, 
    departments, 
    employees, 
    approveLeaveRequest, 
    rejectLeaveRequest,
    setSelectedEmployee360 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'quotas'>('requests');
  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Requests Filter
  const filteredRequests = leaveRequests.filter(req => {
    if (selectedDept !== 'ALL' && req.department !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && req.status !== selectedStatus) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      if (!req.employeeId.toLowerCase().includes(q) &&
          !req.name.toLowerCase().includes(q) &&
          !req.requestNumber.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  // Quotas Filter
  const filteredQuotas = leaveQuotas.filter(q => {
    if (selectedDept !== 'ALL' && q.department !== selectedDept) return false;
    if (search.trim() !== '') {
      const s = search.toLowerCase();
      if (!q.employeeId.toLowerCase().includes(s) && !q.name.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const pendingCount = leaveRequests.filter(r => r.status === 'Chờ duyệt').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Đã duyệt').length;

  const handleExportRequests = () => {
    exportToExcel(filteredRequests, 'Theo_doi_don_nghi_2026', 'DonNghi');
  };

  const handleExportQuotas = () => {
    exportToExcel(filteredQuotas, 'Tong_hop_quy_phep_2026', 'QuyPhep');
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
            Quản Lý Nghỉ Phép & Quỹ Phép Năm 2026
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Theo dõi đơn xin nghỉ phép và kiểm soát hạn mức phép thâm niên • Nguồn: <span className="font-mono text-amber-600 font-semibold">04_Nghi_phep_2026.xlsx</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sub-tab switcher */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveSubTab('requests')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                activeSubTab === 'requests'
                  ? 'bg-brand-800 text-white shadow-xs dark:bg-amber-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>Đơn nghỉ phép</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveSubTab('quotas')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeSubTab === 'quotas'
                  ? 'bg-brand-800 text-white shadow-xs dark:bg-amber-600'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Quỹ phép năm (50 NS)
            </button>
          </div>

          <button
            onClick={activeSubTab === 'requests' ? handleExportRequests : handleExportQuotas}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: LEAVE REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm Mã đơn, Mã NV, Họ tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả Phòng ban</option>
                {departments.map(d => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả Trạng thái</option>
                <option value="Chờ duyệt">Chờ duyệt (Cần xử lý)</option>
                <option value="Đã duyệt">Đã duyệt</option>
                <option value="Từ chối">Từ chối</option>
              </select>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-3.5 pl-5">Mã đơn</th>
                    <th className="p-3.5">Mã NV & Họ Tên</th>
                    <th className="p-3.5">Phòng ban</th>
                    <th className="p-3.5">Loại nghỉ phép</th>
                    <th className="p-3.5">Thời gian nghỉ</th>
                    <th className="p-3.5 text-center">Số ngày</th>
                    <th className="p-3.5">Lý do xin nghỉ</th>
                    <th className="p-3.5">Người duyệt</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right pr-5">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequests.map(req => {
                    const isPending = req.status === 'Chờ duyệt';
                    return (
                      <tr
                        key={req.requestNumber}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                          isPending ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                        }`}
                      >
                        <td className="p-3.5 pl-5 font-mono font-bold text-slate-800 dark:text-slate-200">
                          {req.requestNumber}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {req.name}
                          </div>
                          <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                            {req.employeeId}
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {req.department}
                        </td>
                        <td className="p-3.5 text-slate-800 dark:text-slate-200 font-medium">
                          {req.leaveType}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {formatDateVN(req.startDate)} → {formatDateVN(req.endDate)}
                        </td>
                        <td className="p-3.5 text-center font-bold font-mono text-slate-900 dark:text-white">
                          {req.days}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={req.reason}>
                          {req.reason}
                        </td>
                        <td className="p-3.5 text-slate-500">
                          {req.approver}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            req.status === 'Đã duyệt'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : req.status === 'Chờ duyệt'
                              ? 'bg-amber-500 text-white animate-pulse'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right pr-5">
                          {isPending ? (
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => rejectLeaveRequest(req.requestNumber)}
                                title="Từ chối đơn"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => approveLeaveRequest(req.requestNumber)}
                                title="Phê duyệt ngay"
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Đã xong</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LEAVE QUOTAS */}
      {activeSubTab === 'quotas' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                    <th className="p-3.5 pl-5">Mã NV</th>
                    <th className="p-3.5">Họ và Tên</th>
                    <th className="p-3.5">Phòng ban</th>
                    <th className="p-3.5 text-center">Phép chuẩn</th>
                    <th className="p-3.5 text-center">Thâm niên</th>
                    <th className="p-3.5 text-center">Tổng quỹ 2026</th>
                    <th className="p-3.5 text-center">Đã sử dụng</th>
                    <th className="p-3.5 text-center">Còn lại</th>
                    <th className="p-3.5">Ghi chú</th>
                    <th className="p-3.5 text-right pr-5">Hồ sơ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredQuotas.map(q => (
                    <tr key={q.employeeId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-3.5 pl-5 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {q.employeeId}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {q.name}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {q.department}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-500">
                        {q.standardDays}
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-500">
                        +{q.seniorityDays}
                      </td>
                      <td className="p-3.5 text-center font-bold font-mono text-slate-900 dark:text-white">
                        {q.totalDays}
                      </td>
                      <td className="p-3.5 text-center font-bold font-mono text-amber-600 dark:text-amber-400">
                        {q.usedDays}
                      </td>
                      <td className="p-3.5 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {q.remainingDays}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {q.notes || '-'}
                      </td>
                      <td className="p-3.5 text-right pr-5">
                        <button
                          onClick={() => {
                            const emp = employees.find(e => e.id === q.employeeId);
                            if (emp) setSelectedEmployee360(emp);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
