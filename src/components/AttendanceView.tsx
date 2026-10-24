import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToExcel } from '../services/excelService';

export const AttendanceView: React.FC = () => {
  const { 
    currentMonthAttendance, 
    selectedMonth, 
    setSelectedMonth, 
    departments, 
    employees, 
    setSelectedEmployee360 
  } = useApp();

  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [filterHighOT, setFilterHighOT] = useState<boolean>(false);
  const [filterLate, setFilterLate] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter logic
  const filteredRecords = currentMonthAttendance.filter(r => {
    if (selectedDept !== 'ALL' && r.department !== selectedDept) return false;
    if (filterHighOT && (r.otNormal + r.otSunday) < 12) return false;
    if (filterLate && r.lateTimes === 0) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      if (!r.employeeId.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Summary Totals
  const totalActualDays = filteredRecords.reduce((s, r) => s + r.actualDays, 0);
  const totalPaidLeaveDays = filteredRecords.reduce((s, r) => s + r.paidLeaveDays, 0);
  const totalOtHours = filteredRecords.reduce((s, r) => s + r.otNormal + r.otSunday, 0);
  const totalLateTimes = filteredRecords.reduce((s, r) => s + r.lateTimes, 0);

  const handleExport = () => {
    exportToExcel(
      filteredRecords,
      `Bang_cham_cong_T${selectedMonth.replace('/', '_')}`,
      `ChamCong_T${selectedMonth.replace('/', '_')}`
    );
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
            Quản Lý Chấm Công & Làm Thêm Giờ (OT)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dữ liệu đối soát tự động từ máy chấm công • Nguồn: <span className="font-mono text-amber-600 font-semibold">03_Cham_cong_2026_{selectedMonth.split('/')[0]}.xlsx</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Month selector */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['07/2026', '08/2026', '09/2026', '10/2026'] as const).map(m => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(m);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedMonth === m
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                T{m.split('/')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Ngày Công Thực Tế</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {totalActualDays} <span className="text-xs text-slate-400 font-normal">ngày</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            TB: {(totalActualDays / (filteredRecords.length || 1)).toFixed(1)} ngày/người
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Ngày Nghỉ Phép (P)</div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {totalPaidLeaveDays} <span className="text-xs text-slate-400 font-normal">ngày</span>
          </div>
          <div className="text-[11px] text-blue-600 mt-1">Hưởng 100% lương</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Giờ Tăng Ca (OT)</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {totalOtHours} <span className="text-xs text-slate-400 font-normal">giờ</span>
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Gồm ngày thường & CN (200%)</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Đi Trễ / Về Sớm</div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {totalLateTimes} <span className="text-xs text-slate-400 font-normal">lần</span>
          </div>
          <div className="text-[11px] text-rose-600 mt-1">Cần nhắc nhở nội quy</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Mã NV, Họ tên..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Tất cả Phòng ban</option>
            {departments.map(d => (
              <option key={d.code} value={d.name}>{d.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setFilterHighOT(!filterHighOT);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              filterHighOT
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            🔥 OT cao (≥12h)
          </button>

          <button
            onClick={() => {
              setFilterLate(!filterLate);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
              filterLate
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            ⏰ Có đi trễ
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5 pl-5">Mã NV</th>
                <th className="p-3.5">Họ và Tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5 text-center">Công chuẩn</th>
                <th className="p-3.5 text-center">Công thực tế (X)</th>
                <th className="p-3.5 text-center">Phép (P)</th>
                <th className="p-3.5 text-center">Không lương (Ro)</th>
                <th className="p-3.5 text-center">Ốm (Om)</th>
                <th className="p-3.5 text-center">Tăng ca thường</th>
                <th className="p-3.5 text-center">Tăng ca CN (200%)</th>
                <th className="p-3.5 text-center">Đi trễ</th>
                <th className="p-3.5 text-right pr-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.map(r => {
                const totalOT = r.otNormal + r.otSunday;
                const isHighOT = totalOT >= 12;
                return (
                  <tr
                    key={r.employeeId}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isHighOT ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="p-3.5 pl-5 font-mono font-bold text-amber-600 dark:text-amber-400">
                      {r.employeeId}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {r.name}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {r.department}
                    </td>
                    <td className="p-3.5 text-center text-slate-400 font-mono">
                      {r.standardDays}
                    </td>
                    <td className="p-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {r.actualDays}
                    </td>
                    <td className="p-3.5 text-center text-blue-600 font-mono font-semibold">
                      {r.paidLeaveDays > 0 ? r.paidLeaveDays : '-'}
                    </td>
                    <td className="p-3.5 text-center text-rose-500 font-mono">
                      {r.unpaidLeaveDays > 0 ? r.unpaidLeaveDays : '-'}
                    </td>
                    <td className="p-3.5 text-center text-purple-600 font-mono">
                      {r.sickLeaveDays > 0 ? r.sickLeaveDays : '-'}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {r.otNormal > 0 ? (
                        <span className="font-semibold text-amber-700 dark:text-amber-400">{r.otNormal}h</span>
                      ) : '-'}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {r.otSunday > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">{r.otSunday}h</span>
                      ) : '-'}
                    </td>
                    <td className="p-3.5 text-center font-mono">
                      {r.lateTimes > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">{r.lateTimes}</span>
                      ) : '-'}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <button
                        onClick={() => {
                          const emp = employees.find(e => e.id === r.employeeId);
                          if (emp) setSelectedEmployee360(emp);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                        title="Xem Hồ sơ 360°"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị <strong>{filteredRecords.length}</strong> / {currentMonthAttendance.length} bản ghi
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
