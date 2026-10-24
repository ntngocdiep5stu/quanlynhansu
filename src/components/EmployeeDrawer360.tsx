import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  FileText, 
  CreditCard, 
  CalendarDays, 
  Clock, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar, 
  Award, 
  Shield, 
  ExternalLink,
  Download,
  Send
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDateVN } from '../utils/formatters';
import { 
  exportPayslipToWord, 
  openGmailPayslip, 
  openGoogleCalendarReminder 
} from '../services/exportService';

export const EmployeeDrawer360: React.FC = () => {
  const { 
    selectedEmployee360, 
    setSelectedEmployee360, 
    contracts, 
    currentMonthPayroll, 
    currentMonthAttendance, 
    leaveQuotas, 
    leaveRequests,
    selectedMonth,
    setSelectedPayslip 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'contract' | 'payroll' | 'leave' | 'attendance'>('profile');

  if (!selectedEmployee360) return null;

  const emp = selectedEmployee360;
  const contract = contracts.find(c => c.employeeId === emp.id);
  const payRecord = currentMonthPayroll.find(p => p.employeeId === emp.id);
  const attRecord = currentMonthAttendance.find(a => a.employeeId === emp.id);
  const quota = leaveQuotas.find(q => q.employeeId === emp.id);
  const empLeaveRequests = leaveRequests.filter(l => l.employeeId === emp.id);

  const handleOpenPayslipModal = () => {
    if (payRecord) {
      setSelectedPayslip({ employee: emp, payroll: payRecord });
    }
  };

  const handleExportWord = async () => {
    if (payRecord) {
      await exportPayslipToWord(emp, payRecord);
    }
  };

  const handleSendGmail = () => {
    if (payRecord) {
      openGmailPayslip(emp, payRecord);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedEmployee360(null)}
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="w-screen max-w-2xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-brand-800 to-brand-900 text-white relative">
              <button
                onClick={() => setSelectedEmployee360(null)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center text-xl font-extrabold shadow-inner flex-shrink-0">
                  {emp.name.split(' ').slice(-1)[0][0]}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500 text-slate-950">
                      {emp.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      emp.status === 'Đang làm việc' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {emp.name}
                  </h2>
                  <p className="text-xs text-emerald-200">
                    {emp.position} • {emp.department}
                  </p>
                </div>
              </div>

              {/* Action shortcuts */}
              <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/10">
                {payRecord && (
                  <button
                    onClick={handleOpenPayslipModal}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xem Phiếu lương</span>
                  </button>
                )}
                {payRecord && (
                  <button
                    onClick={handleExportWord}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất Word (.docx)</span>
                  </button>
                )}
                {payRecord && (
                  <button
                    onClick={handleSendGmail}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>✉️ Gửi qua Gmail</span>
                  </button>
                )}
              </div>
            </div>

            {/* 5 Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-6 overflow-x-auto">
              {[
                { id: 'profile', label: 'Cá nhân', icon: User, source: '01_Ho_so_nhan_vien.xlsx' },
                { id: 'contract', label: 'Hợp đồng', icon: FileText, source: '02_Hop_dong.xlsx' },
                { id: 'payroll', label: 'Lương & Thuế', icon: CreditCard, source: '05_Bang_luong_2026.xlsx' },
                { id: 'leave', label: 'Nghỉ phép', icon: CalendarDays, source: '04_Nghi_phep_2026.xlsx' },
                { id: 'attendance', label: 'Chấm công', icon: Clock, source: '03_Cham_cong_2026.xlsx' },
              ].map(t => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center space-x-1.5 py-3 px-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 rounded-t-lg'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Reference Source Alert Badge */}
              <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <span>Nguồn tham chiếu dữ liệu:</span>
                <span className="font-mono font-bold text-brand-700 dark:text-amber-400">
                  {activeTab === 'profile' && '01_Ho_so_nhan_vien.xlsx (Dòng 4 -> 54)'}
                  {activeTab === 'contract' && '02_Hop_dong.xlsx (Sheet Hop_dong_lao_dong)'}
                  {activeTab === 'payroll' && `05_Bang_luong_2026_${selectedMonth.split('/')[0]}.xlsx`}
                  {activeTab === 'leave' && '04_Nghi_phep_2026.xlsx (Theo_doi_don_nghi)'}
                  {activeTab === 'attendance' && `03_Cham_cong_2026_${selectedMonth.split('/')[0]}.xlsx`}
                </span>
              </div>

              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Giới tính & Ngày sinh</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {emp.gender} • {formatDateVN(emp.birthDate)}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Số CCCD / Mã Định Danh</div>
                      <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-1">
                        {emp.idCard}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Quê quán</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                        {emp.hometown}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Trình độ học vấn</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                        {emp.education}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Ngày vào làm</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                        {formatDateVN(emp.startDate)}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase font-semibold">Người phụ thuộc (Thuế)</div>
                      <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                        {emp.dependents} người
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-500">Thông tin liên hệ & Ngân hàng</div>
                    <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>STK: <strong className="font-mono">{emp.bankAccount}</strong> ({emp.bankName})</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mã số BHXH: <strong className="font-mono">{emp.insuranceCode}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTRACT */}
              {activeTab === 'contract' && (
                <div className="space-y-4">
                  {contract ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-amber-800 dark:text-amber-300 font-bold uppercase">
                            Số Hợp đồng lao động
                          </div>
                          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                            {contract.contractNumber}
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          contract.status === 'Đang hiệu lực' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {contract.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          <div className="text-slate-400">Loại Hợp đồng</div>
                          <div className="font-bold text-slate-800 dark:text-white mt-1">{contract.contractType}</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          <div className="text-slate-400">Địa điểm làm việc</div>
                          <div className="font-bold text-slate-800 dark:text-white mt-1">{contract.workLocation}</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          <div className="text-slate-400">Ngày hiệu lực</div>
                          <div className="font-bold text-slate-800 dark:text-white mt-1">{formatDateVN(contract.effectiveDate)}</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          <div className="text-slate-400">Ngày hết hạn</div>
                          <div className="font-bold text-rose-600 dark:text-rose-400 mt-1">
                            {contract.expiryDate ? formatDateVN(contract.expiryDate) : 'Không xác định thời hạn'}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-500">Mức lương đóng BHXH</div>
                          <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                            {formatVND(contract.insuranceSalary)}
                          </div>
                        </div>
                        {contract.expiryDate && (
                          <button
                            onClick={() => openGoogleCalendarReminder(contract)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>📅 Tạo lịch nhắc Calendar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Chưa có thông tin hợp đồng cho nhân viên này.</p>
                  )}
                </div>
              )}

              {/* TAB 3: PAYROLL */}
              {activeTab === 'payroll' && (
                <div className="space-y-4">
                  {payRecord ? (
                    <div className="space-y-4">
                      {/* Big Net Pay Banner */}
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-brand-800 text-white shadow-md flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                            Thực Lĩnh Chuyển Khoản Tháng {selectedMonth}
                          </div>
                          <div className="text-2xl sm:text-3xl font-extrabold mt-1">
                            {formatVND(payRecord.netSalary)}
                          </div>
                          <div className="text-xs text-emerald-100 mt-1">
                            Ngày công: {payRecord.workingDays}/26 ngày
                          </div>
                        </div>
                        <button
                          onClick={handleOpenPayslipModal}
                          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md"
                        >
                          Xem Phiếu Lương A4/A5
                        </button>
                      </div>

                      {/* Itemized Table */}
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-left">
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr className="bg-slate-50 dark:bg-slate-800/40">
                              <td className="p-3 text-slate-600 dark:text-slate-400">Lương cơ bản theo Hợp đồng</td>
                              <td className="p-3 text-right font-semibold">{formatVND(payRecord.contractSalary)}</td>
                            </tr>
                            <tr>
                              <td className="p-3 text-slate-600 dark:text-slate-400">Lương thời gian thực tế ({payRecord.workingDays} công)</td>
                              <td className="p-3 text-right font-semibold">{formatVND(payRecord.basePay)}</td>
                            </tr>
                            <tr>
                              <td className="p-3 text-slate-600 dark:text-slate-400">Phụ cấp trách nhiệm</td>
                              <td className="p-3 text-right font-semibold">{formatVND(payRecord.respAllowance)}</td>
                            </tr>
                            <tr>
                              <td className="p-3 text-slate-600 dark:text-slate-400">Phụ cấp ăn trưa</td>
                              <td className="p-3 text-right font-semibold">{formatVND(payRecord.lunchAllowance)}</td>
                            </tr>
                            <tr>
                              <td className="p-3 text-slate-600 dark:text-slate-400">Tiền làm thêm giờ (OT)</td>
                              <td className="p-3 text-right font-semibold">{formatVND(payRecord.otPay)}</td>
                            </tr>
                            <tr>
                              <td className="p-3 text-slate-600 dark:text-slate-400">Thưởng hiệu quả</td>
                              <td className="p-3 text-right font-semibold">{formatVND(payRecord.performanceBonus)}</td>
                            </tr>
                            <tr className="bg-amber-50/50 dark:bg-amber-950/20 font-bold text-slate-900 dark:text-white">
                              <td className="p-3">TỔNG THU NHẬP (A)</td>
                              <td className="p-3 text-right text-amber-700 dark:text-amber-400">{formatVND(payRecord.totalIncome)}</td>
                            </tr>
                            <tr>
                              <td className="p-3 text-slate-600 dark:text-slate-400">Trích nộp BHXH, YT, TN (10.5%)</td>
                              <td className="p-3 text-right text-rose-600 dark:text-rose-400">-{formatVND(payRecord.insuranceDeduction)}</td>
                            </tr>
                            <tr>
                              <td className="p-3 text-slate-600 dark:text-slate-400">Thuế thu nhập cá nhân (TNCN)</td>
                              <td className="p-3 text-right text-rose-600 dark:text-rose-400">-{formatVND(payRecord.pitTax)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Chưa có bảng lương kỳ {selectedMonth}.</p>
                  )}
                </div>
              )}

              {/* TAB 4: LEAVE */}
              {activeTab === 'leave' && (
                <div className="space-y-4">
                  {/* Quota overview */}
                  {quota && (
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Tổng Quỹ Phép 2026</div>
                        <div className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">{quota.totalDays} ngày</div>
                        <div className="text-[10px] text-slate-400">Tiêu chuẩn: {quota.standardDays} + Thâm niên: {quota.seniorityDays}</div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Đã sử dụng</div>
                        <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">{quota.usedDays} ngày</div>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
                        <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">Còn lại</div>
                        <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{quota.remainingDays} ngày</div>
                      </div>
                    </div>
                  )}

                  {/* Requests list */}
                  <div>
                    <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">
                      Lịch sử đơn xin nghỉ phép ({empLeaveRequests.length})
                    </h4>
                    {empLeaveRequests.length > 0 ? (
                      <div className="space-y-2">
                        {empLeaveRequests.map(r => (
                          <div key={r.requestNumber} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">{r.requestNumber} • {r.leaveType}</div>
                              <div className="text-slate-500 mt-0.5">Từ {formatDateVN(r.startDate)} đến {formatDateVN(r.endDate)} ({r.days} ngày)</div>
                              <div className="text-slate-400 italic mt-0.5">"{r.reason}"</div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Đã duyệt' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Chưa phát sinh đơn nghỉ phép nào trong năm 2026.</p>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: ATTENDANCE */}
              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  {attRecord ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Công chuẩn</div>
                          <div className="text-base font-extrabold mt-0.5">{attRecord.standardDays}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Công thực tế (X)</div>
                          <div className="text-base font-extrabold text-emerald-600 mt-0.5">{attRecord.actualDays}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Nghỉ phép (P)</div>
                          <div className="text-base font-extrabold text-amber-600 mt-0.5">{attRecord.paidLeaveDays}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                          <div className="text-[10px] uppercase font-bold text-slate-400">Đi trễ / Về sớm</div>
                          <div className="text-base font-extrabold text-rose-600 mt-0.5">{attRecord.lateTimes} lần</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                        <div className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase">
                          Tổng hợp giờ làm thêm (OT) Tháng {selectedMonth}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span>Tăng ca ngày thường: <strong className="text-slate-900 dark:text-white">{attRecord.otNormal} giờ</strong></span>
                          <span>Tăng ca Chủ nhật (200%): <strong className="text-rose-600 dark:text-rose-400">{attRecord.otSunday} giờ</strong></span>
                          <span>Tổng OT: <strong className="font-bold text-amber-700 dark:text-amber-400">{attRecord.otNormal + attRecord.otSunday} giờ</strong></span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Chưa có dữ liệu chấm công kỳ {selectedMonth}.</p>
                  )}
                </div>
              )}

            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
