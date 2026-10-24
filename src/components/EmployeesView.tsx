import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  UserPlus,
  Mail,
  Phone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDateVN } from '../utils/formatters';
import { exportToExcel } from '../services/excelService';
import { Employee } from '../types';

export const EmployeesView: React.FC = () => {
  const { 
    employees, 
    departments, 
    selectedDepartment, 
    setSelectedDepartment,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    setSelectedEmployee360 
  } = useApp();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    // Dept filter
    if (selectedDepartment !== 'ALL' && emp.department !== selectedDepartment) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'ALL' && emp.status !== statusFilter) {
      return false;
    }
    // Search query: ID, Name, Citizen ID (CCCD)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchId = emp.id.toLowerCase().includes(q);
      const matchName = emp.name.toLowerCase().includes(q);
      const matchCCCD = emp.idCard.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchCCCD && !matchEmail) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    exportToExcel(filteredEmployees, `Danh_sach_nhan_vien_${new Date().toISOString().split('T')[0]}`, 'NhanVien');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Danh Sách Nhân Sự & Hồ Sơ 360°
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Quản trị {employees.length} hồ sơ nhân sự chuẩn • Bấm vào dòng bất kỳ để mở Slide-over Drawer 360°
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

      {/* Multi-dimensional Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Mã NV, Họ tên, Số CCCD, Email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">Tất cả Phòng ban (6 bộ phận)</option>
            {departments.map(d => (
              <option key={d.code} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="Đang làm việc">Chính thức (Đang làm việc)</option>
            <option value="Thử việc">Đang thử việc</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-3.5 pl-5">Mã NV</th>
                <th className="p-3.5">Họ và Tên</th>
                <th className="p-3.5">Phòng ban</th>
                <th className="p-3.5">Chức danh / Vị trí</th>
                <th className="p-3.5">Số CCCD</th>
                <th className="p-3.5">Ngày vào làm</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 text-right pr-5">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedEmployees.map(emp => (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedEmployee360(emp)}
                  className="hover:bg-amber-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="p-3.5 pl-5 font-mono font-bold text-amber-600 dark:text-amber-400">
                    {emp.id}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      {emp.name.split(' ').slice(-1)[0][0]}
                    </div>
                    <span>{emp.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {emp.department}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                    {emp.position}
                  </td>
                  <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                    {emp.idCard}
                  </td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">
                    {formatDateVN(emp.startDate)}
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.status === 'Đang làm việc'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee360(emp);
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 text-xs font-semibold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Hồ sơ 360°</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Count */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            Hiển thị <strong className="text-slate-900 dark:text-white">{filteredEmployees.length}</strong> nhân sự
            {filteredEmployees.length !== employees.length && ` (Lọc từ ${employees.length} hồ sơ gốc)`}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
