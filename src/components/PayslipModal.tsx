import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Printer, 
  FileDown, 
  Mail, 
  Copy, 
  CheckCircle, 
  Building2 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDateVN, numberToVietnameseWords } from '../utils/formatters';
import { 
  exportPayslipToWord, 
  openGmailPayslip, 
  copyReportToClipboard 
} from '../services/exportService';

export const PayslipModal: React.FC = () => {
  const { selectedPayslip, setSelectedPayslip } = useApp();
  const [copied, setCopied] = useState<boolean>(false);

  if (!selectedPayslip) return null;

  const { employee: emp, payroll: pay } = selectedPayslip;

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = async () => {
    await exportPayslipToWord(emp, pay);
  };

  const handleSendEmail = () => {
    openGmailPayslip(emp, pay);
  };

  const handleCopy = async () => {
    const summary = `PHIẾU LƯƠNG THÁNG ${pay.month} - ${emp.name} (${emp.id})
- Chức vụ: ${emp.position} | Phòng ban: ${emp.department}
- Ngày công: ${pay.workingDays}/26 ngày
- Lương thời gian: ${formatVND(pay.basePay)}
- Phụ cấp trách nhiệm: ${formatVND(pay.respAllowance)}
- Phụ cấp ăn trưa: ${formatVND(pay.lunchAllowance)}
- Tiền làm thêm (OT): ${formatVND(pay.otPay)}
- Thưởng hiệu quả: ${formatVND(pay.performanceBonus)}
=> TỔNG THU NHẬP: ${formatVND(pay.totalIncome)}
- Trừ BHXH 10.5%: -${formatVND(pay.insuranceDeduction)}
- Thuế TNCN: -${formatVND(pay.pitTax)}
=> THỰC LĨNH CHUYỂN KHOẢN: ${formatVND(pay.netSalary)}
(${numberToVietnameseWords(pay.netSalary)})
STK nhận: ${emp.bankAccount} - ${emp.bankName}`;
    const ok = await copyReportToClipboard(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Action Toolbar (no-print) */}
          <div className="no-print flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Xem Trước Phiếu Lương Cá Nhân A4/A5
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                Kỳ Tháng {pay.month}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 text-xs font-semibold shadow-xs"
                title="In hoặc Lưu PDF (Ctrl + P)"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline">In / Xuất PDF</span>
              </button>

              <button
                onClick={handleExportWord}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-brand-800 text-white hover:bg-brand-700 text-xs font-semibold shadow-xs"
                title="Xuất phiếu lương ra file Microsoft Word .docx"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Xuất Word (.docx)</span>
              </button>

              <button
                onClick={handleSendEmail}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                title="Gửi phiếu lương qua Gmail"
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">✉️ Gửi qua Gmail</span>
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold"
                title="Sao chép tóm tắt phiếu lương vào clipboard"
              >
                {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>

              <button
                onClick={() => setSelectedPayslip(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Payslip Body */}
          <div className="flex-1 overflow-y-auto p-8 bg-white text-slate-900 print:p-0">
            {/* Header */}
            <div className="text-center border-b border-slate-300 pb-4">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                CÔNG TY CỔ PHẦN CÔNG NGHỆ & SẢN XUẤT A
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Tầng 8, Tòa nhà Innovation, Cầu Giấy, Hà Nội | ĐT: (024) 3888 9999
              </div>
              <h2 className="text-xl font-extrabold text-[#0F291E] mt-3 uppercase tracking-wide">
                PHIẾU THANH TOÁN TIỀN LƯƠNG
              </h2>
              <div className="text-xs font-bold text-amber-700">
                Kỳ thanh toán: Tháng {pay.month} (Từ 01/{pay.month} đến cuối tháng)
              </div>
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs py-4 border-b border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Họ và tên:</span>{' '}
                <strong className="text-slate-900 text-sm">{emp.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Mã nhân viên:</span>{' '}
                <strong className="font-mono text-slate-900">{emp.id}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Phòng ban:</span>{' '}
                <span className="font-semibold">{emp.department}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Chức vụ:</span>{' '}
                <span className="font-semibold">{emp.position}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Tài khoản ngân hàng:</span>{' '}
                <span className="font-mono font-semibold">{emp.bankAccount} ({emp.bankName})</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Ngày công chuẩn / Thực tế:</span>{' '}
                <span className="font-semibold">26 / {pay.workingDays} ngày</span>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="mt-4 border border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="p-2.5 w-12 text-center border-r border-slate-300">STT</th>
                    <th className="p-2.5 border-r border-slate-300">Khoản mục thu nhập & Khấu trừ</th>
                    <th className="p-2.5 text-right w-40">Số tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200">1</td>
                    <td className="p-2 border-r border-slate-200">Mức lương cơ bản theo Hợp đồng lao động</td>
                    <td className="p-2 text-right font-medium">{formatVND(pay.contractSalary)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200">2</td>
                    <td className="p-2 border-r border-slate-200">Lương thời gian thực tế ({pay.workingDays} ngày công)</td>
                    <td className="p-2 text-right font-medium">{formatVND(pay.basePay)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200">3</td>
                    <td className="p-2 border-r border-slate-200">Phụ cấp trách nhiệm chức danh</td>
                    <td className="p-2 text-right font-medium">{formatVND(pay.respAllowance)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200">4</td>
                    <td className="p-2 border-r border-slate-200">Phụ cấp ăn trưa</td>
                    <td className="p-2 text-right font-medium">{formatVND(pay.lunchAllowance)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200">5</td>
                    <td className="p-2 border-r border-slate-200">Tiền làm thêm giờ (OT)</td>
                    <td className="p-2 text-right font-medium">{formatVND(pay.otPay)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200">6</td>
                    <td className="p-2 border-r border-slate-200">Thưởng hiệu quả / Thưởng hoàn thành KPI</td>
                    <td className="p-2 text-right font-medium">{formatVND(pay.performanceBonus)}</td>
                  </tr>
                  <tr className="bg-emerald-50 font-bold text-[#0F291E]">
                    <td className="p-2.5 text-center border-r border-slate-300">I</td>
                    <td className="p-2.5 border-r border-slate-300 uppercase">TỔNG THU NHẬP (A)</td>
                    <td className="p-2.5 text-right font-extrabold">{formatVND(pay.totalIncome)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200">7</td>
                    <td className="p-2 border-r border-slate-200">Trích BHXH, BHYT, BHTN người LĐ đóng (10.5%)</td>
                    <td className="p-2 text-right text-rose-600 font-medium">-{formatVND(pay.insuranceDeduction)}</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-center text-slate-500 border-r border-slate-200">8</td>
                    <td className="p-2 border-r border-slate-200">Thuế thu nhập cá nhân (TNCN) tạm khấu trừ</td>
                    <td className="p-2 text-right text-rose-600 font-medium">-{formatVND(pay.pitTax)}</td>
                  </tr>
                  <tr className="bg-emerald-100 font-bold text-emerald-900 border-t-2 border-emerald-600">
                    <td className="p-3 text-center border-r border-emerald-300">II</td>
                    <td className="p-3 border-r border-emerald-300 uppercase text-sm">THỰC LĨNH CHUYỂN KHOẢN (B = A - Khấu trừ)</td>
                    <td className="p-3 text-right text-base font-extrabold text-emerald-800">{formatVND(pay.netSalary)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* In Words */}
            <div className="mt-3 text-xs italic text-slate-700">
              <strong>Số tiền bằng chữ: </strong>{numberToVietnameseWords(pay.netSalary)}
            </div>

            {/* Signature Block */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs pt-4">
              <div>
                <div className="font-bold uppercase text-slate-800">Người lập biểu</div>
                <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                <div className="h-16"></div>
                <div className="font-semibold text-slate-700">Nguyễn Thu Hằng</div>
              </div>

              <div>
                <div className="font-bold uppercase text-slate-800">Trưởng phòng HCNS</div>
                <div className="text-[10px] text-slate-400 italic">(Ký, họ tên)</div>
                <div className="h-16"></div>
                <div className="font-semibold text-slate-700">Hà Quang Dũng</div>
              </div>

              <div>
                <div className="font-bold uppercase text-slate-800">Người lao động</div>
                <div className="text-[10px] text-slate-400 italic">(Ký nhận)</div>
                <div className="h-16"></div>
                <div className="font-semibold text-slate-700">{emp.name}</div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
