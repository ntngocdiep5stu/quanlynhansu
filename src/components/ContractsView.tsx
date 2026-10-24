import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Calendar, 
  Download, 
  AlertTriangle, 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDateVN } from '../utils/formatters';
import { openGoogleCalendarReminder } from '../services/exportService';
import { exportToExcel } from '../services/excelService';

export const ContractsView: React.FC = () => {
  const { 
    contracts, 
    departments, 
    employees, 
    setSelectedEmployee360 
  } = useApp();

  const [search, setSearch] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter logic
  const filteredContracts = contracts.filter(c => {
    if (selectedDept !== 'ALL' && c.department !== selectedDept) return false;
    if (selectedType !== 'ALL' && !c.contractType.includes(selectedType)) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      if (!c.employeeId.toLowerCase().includes(q) &&
          !c.name.toLowerCase().includes(q) &&
          !c.contractNumber.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const totalPages = Math.ceil(filteredContracts.length / pageSize) || 1;
  const paginatedContracts = filteredContracts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Metrics
  const indefiniteCount = contracts.filter(c => c.contractType.includes('không xác định')).length;
  const definiteCount = contracts.filter(c => c.contractType.includes('xác định')).length;
  const probationCount = contracts.filter(c => c.contractType.includes('Thử việc')).length;
  const expiringCount = contracts.filter(c => c.status === 'Sắp hết hạn').length;

  const handleExport = () => {
    exportToExcel(filteredContracts, `Danh_sach_hop_dong_${new Date().toISOString().split('T')[0]}`, 'HopDong');
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
            Quản Lý Hợp Đồng Lao Động
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Theo dõi thời hạn và cảnh báo tái ký HĐLĐ tự động • Nguồn: <span className="font-mono text-amber-600 font-semibold">02_Hop_dong.xlsx</span>
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Excel (.xlsx)</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">HĐ Không Thời Hạn</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{indefiniteCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Gắn bó lâu dài</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">HĐ Có Thời Hạn</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{definiteCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">1 - 3 năm</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">HĐ Thử Việc</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{probationCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Thời hạn 02 tháng</div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-xs">
          <div className="text-[11px] font-bold text-rose-600 uppercase flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Sắp Hết Hạn (&lt;30 ngày)
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{expiringCount}</div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">Cần lập tờ trình tái ký</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Mã NV, Họ tên, Số HĐ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
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

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="Sắp hết hạn">Sắp hết hạn (Khẩn cấp)</option>
            <option value="Đang hiệu lực">Đang hiệu lực</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5 pl-5">Số HĐ</th>
                <th className="p-3.5">Mã NV & Họ Tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5">Loại Hợp đồng</th>
                <th className="p-3.5">Ngày ký & Hiệu lực</th>
                <th className="p-3.5">Ngày hết hạn</th>
                <th className="p-3.5">Lương đóng BH</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 text-right pr-5">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedContracts.map(c => {
                const isExpiring = c.status === 'Sắp hết hạn' || (c.expiryDate && (c.expiryDate.startsWith('2026-10-01') || c.expiryDate.startsWith('2026-10-15')));
                return (
                  <tr
                    key={c.contractNumber}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      isExpiring ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="p-3.5 pl-5 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {c.contractNumber}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.name}
                      </div>
                      <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                        {c.employeeId}
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {c.department}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {c.contractType}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {formatDateVN(c.effectiveDate)}
                    </td>
                    <td className="p-3.5">
                      {c.expiryDate ? (
                        <span className={`font-semibold ${isExpiring ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                          {formatDateVN(c.expiryDate)}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Không thời hạn</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {formatVND(c.insuranceSalary)}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isExpiring
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <div className="flex items-center justify-end space-x-1.5">
                        {c.expiryDate && (
                          <button
                            onClick={() => openGoogleCalendarReminder(c)}
                            title="📅 Tạo lịch nhắc tái ký trên Google Calendar"
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const emp = employees.find(e => e.id === c.employeeId);
                            if (emp) setSelectedEmployee360(emp);
                          }}
                          title="Mở Hồ sơ 360°"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
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
            Hiển thị <strong>{filteredContracts.length}</strong> / {contracts.length} hợp đồng
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
