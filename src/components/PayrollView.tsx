import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  FileText, 
  Mail, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND } from '../utils/formatters';
import { exportToExcel } from '../services/excelService';
import { exportPayslipToWord, openGmailPayslip } from '../services/exportService';

export const PayrollView: React.FC = () => {
  const { 
    currentMonthPayroll, 
    selectedMonth, 
    setSelectedMonth, 
    departments, 
    employees, 
    setSelectedPayslip,
    setSelectedEmployee360 
  } = useApp();

  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter
  const filteredRecords = currentMonthPayroll.filter(r => {
    if (selectedDept !== 'ALL' && r.department !== selectedDept) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      if (!r.employeeId.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Totals for filtered records
  const totalBasePay = filteredRecords.reduce((s, r) => s + r.basePay, 0);
  const totalResp = filteredRecords.reduce((s, r) => s + r.respAllowance, 0);
  const totalLunch = filteredRecords.reduce((s, r) => s + r.lunchAllowance, 0);
  const totalOT = filteredRecords.reduce((s, r) => s + r.otPay, 0);
  const totalBonus = filteredRecords.reduce((s, r) => s + r.performanceBonus, 0);
  const totalIncome = filteredRecords.reduce((s, r) => s + r.totalIncome, 0);
  const totalBHXH = filteredRecords.reduce((s, r) => s + r.insuranceDeduction, 0);
  const totalTax = filteredRecords.reduce((s, r) => s + r.pitTax, 0);
  const totalNet = filteredRecords.reduce((s, r) => s + r.netSalary, 0);

  const handleExport = () => {
    exportToExcel(
      filteredRecords,
      `Bang_luong_T${selectedMonth.replace('/', '_')}`,
      `Luong_T${selectedMonth.replace('/', '_')}`
    );
  };

  const handleOpenPayslip = (p: typeof filteredRecords[0]) => {
    const emp = employees.find(e => e.id === p.employeeId);
    if (emp) {
      setSelectedPayslip({ employee: emp, payroll: p });
    }
  };

  const handleWordExport = async (p: typeof filteredRecords[0]) => {
    const emp = employees.find(e => e.id === p.employeeId);
    if (emp) {
      await exportPayslipToWord(emp, p);
    }
  };

  const handleSendGmail = (p: typeof filteredRecords[0]) => {
    const emp = employees.find(e => e.id === p.employeeId);
    if (emp) {
      openGmailPayslip(emp, p);
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
            Bảng Lương Toàn Doanh Nghiệp & Thuế TNCN
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Hạch toán chi tiết thu nhập, tiền làm thêm OT, trích nộp BHXH (10.5%) và thuế TNCN • Nguồn: <span className="font-mono text-amber-600 font-semibold">05_Bang_luong_2026_{selectedMonth.split('/')[0]}.xlsx</span>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Month Selector */}
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

      {/* 4 Large Summary KPI Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Quỹ Thu Nhập</div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatVND(totalIncome)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gồm lương thời gian, phụ cấp, OT, thưởng
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Trích Nộp BHXH,YT,TN (10.5%)</div>
          <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
            {formatVND(totalBHXH)}
          </div>
          <div className="text-[11px] text-blue-600 mt-1">
            100% người lao động nộp đúng luật
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Thuế TNCN Tạm Khấu Trừ</div>
          <div className="text-xl sm:text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {formatVND(totalTax)}
          </div>
          <div className="text-[11px] text-purple-600 mt-1">
            Đã trừ giảm trừ bản thân & người phụ thuộc
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
            Tổng Lương Thực Lĩnh Chuyển Khoản
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
            {formatVND(totalNet)}
          </div>
          <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-1">
            Chiếm {((totalNet / (totalIncome || 1)) * 100).toFixed(1)}% quỹ lương
          </div>
        </div>
      </div>

      {/* Filter Bar */}
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

        <div className="flex items-center space-x-2">
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
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5 pl-5">Mã NV & Họ Tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5 text-right">Lương HĐ</th>
                <th className="p-3.5 text-center">Công</th>
                <th className="p-3.5 text-right">Lương TG</th>
                <th className="p-3.5 text-right">PC Trách nhiệm</th>
                <th className="p-3.5 text-right">Tiền OT</th>
                <th className="p-3.5 text-right">Thưởng</th>
                <th className="p-3.5 text-right font-extrabold text-amber-700 dark:text-amber-400">Tổng Thu Nhập</th>
                <th className="p-3.5 text-right text-rose-600">BHXH (10.5%)</th>
                <th className="p-3.5 text-right text-rose-600">Thuế TNCN</th>
                <th className="p-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">Thực Lĩnh</th>
                <th className="p-3.5 text-right pr-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.map(r => (
                <tr
                  key={r.employeeId}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-3.5 pl-5">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {r.name}
                    </div>
                    <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                      {r.employeeId} • {r.position}
                    </div>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {r.department}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-300">
                    {formatVND(r.contractSalary)}
                  </td>
                  <td className="p-3.5 text-center font-mono font-bold">
                    {r.workingDays}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatVND(r.basePay)}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatVND(r.respAllowance)}
                  </td>
                  <td className="p-3.5 text-right font-mono text-amber-700 dark:text-amber-400 font-semibold">
                    {r.otPay > 0 ? formatVND(r.otPay) : '-'}
                  </td>
                  <td className="p-3.5 text-right font-mono text-emerald-600">
                    {r.performanceBonus > 0 ? formatVND(r.performanceBonus) : '-'}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-white bg-amber-50/40 dark:bg-amber-950/20">
                    {formatVND(r.totalIncome)}
                  </td>
                  <td className="p-3.5 text-right font-mono text-rose-600 dark:text-rose-400">
                    -{formatVND(r.insuranceDeduction)}
                  </td>
                  <td className="p-3.5 text-right font-mono text-rose-600 dark:text-rose-400">
                    -{formatVND(r.pitTax)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30">
                    {formatVND(r.netSalary)}
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleOpenPayslip(r)}
                        className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold shadow-xs transition-colors"
                        title="Xem trước Phiếu lương"
                      >
                        Phiếu Lương
                      </button>
                      <button
                        onClick={() => handleWordExport(r)}
                        className="p-1 rounded-lg text-slate-500 hover:text-brand-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Tải Word (.docx)"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendGmail(r)}
                        className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Gửi Gmail"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Auto Total Row (matches user rule to calculate totals cleanly) */}
            <tfoot>
              <tr className="bg-slate-100 dark:bg-slate-800 font-extrabold text-slate-900 dark:text-white border-t-2 border-slate-300 dark:border-slate-700">
                <td className="p-3.5 pl-5" colSpan={2}>
                  TỔNG CỘNG ({filteredRecords.length} Nhân Sự)
                </td>
                <td className="p-3.5 text-right font-mono">-</td>
                <td className="p-3.5 text-center font-mono">-</td>
                <td className="p-3.5 text-right font-mono">{formatVND(totalBasePay)}</td>
                <td className="p-3.5 text-right font-mono">{formatVND(totalResp)}</td>
                <td className="p-3.5 text-right font-mono text-amber-700 dark:text-amber-400">{formatVND(totalOT)}</td>
                <td className="p-3.5 text-right font-mono text-emerald-600">{formatVND(totalBonus)}</td>
                <td className="p-3.5 text-right font-mono text-amber-800 dark:text-amber-300">{formatVND(totalIncome)}</td>
                <td className="p-3.5 text-right font-mono text-rose-600">-{formatVND(totalBHXH)}</td>
                <td className="p-3.5 text-right font-mono text-rose-600">-{formatVND(totalTax)}</td>
                <td className="p-3.5 text-right font-mono text-emerald-700 dark:text-emerald-300 text-sm">{formatVND(totalNet)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị <strong>{filteredRecords.length}</strong> / {currentMonthPayroll.length} nhân sự
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
