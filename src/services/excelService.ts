import * as XLSX from 'xlsx';
import { 
  Employee, 
  Contract, 
  AttendanceRecord, 
  LeaveRequest, 
  LeaveQuota, 
  PayrollRecord 
} from '../types';

export interface ParseResult {
  fileType: string;
  count: number;
  data?: any;
  errors?: string[];
}

export function parseExcelFile(
  file: File, 
  fileName: string, 
  buffer: ArrayBuffer
): { type: string; success: boolean; data: any; message: string } {
  try {
    const workbook = XLSX.read(buffer, { type: 'array', cellFormula: true });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawData = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });

    // Business Rule 1: Header at row 4 (index 3), data rows 5 to 54 (index 4 to 53), ignore row 55 "TỔNG CỘNG"
    if (rawData.length < 4) {
      return { type: 'unknown', success: false, data: null, message: 'File không đủ 4 dòng cấu trúc chuẩn.' };
    }

    const header = rawData[3] as string[];
    // Filter out rows starting from index 4, ending before row labeled "TỔNG CỘNG"
    const dataRows = rawData.slice(4).filter(row => {
      if (!row || row.length === 0) return false;
      const firstCol = String(row[0] || '').trim().toUpperCase();
      const secondCol = String(row[1] || '').trim().toUpperCase();
      if (firstCol.includes('TỔNG CỘNG') || secondCol.includes('TỔNG CỘNG')) return false;
      return String(row[0]).trim() !== '';
    });

    const lowerName = fileName.toLowerCase();

    // 1. Ho so nhan vien (01_Ho_so_nhan_vien)
    if (lowerName.includes('ho_so') || lowerName.includes('nhan_vien') || header.includes('Số CCCD')) {
      const employees: Employee[] = dataRows.map(r => ({
        id: String(r[0] || '').trim(),
        name: String(r[1] || '').trim(),
        gender: String(r[2] || '').trim(),
        birthDate: String(r[3] || '').trim(),
        idCard: String(r[4] || '').trim(),
        hometown: String(r[5] || '').trim(),
        department: String(r[6] || '').trim(),
        position: String(r[7] || '').trim(),
        education: String(r[8] || '').trim(),
        startDate: String(r[9] || '').trim(),
        email: String(r[10] || '').trim(),
        phone: String(r[11] || '').trim(),
        bankAccount: String(r[12] || '').trim(),
        bankName: String(r[13] || '').trim(),
        insuranceCode: String(r[14] || '').trim(),
        dependents: Number(r[15]) || 0,
        status: String(r[16] || 'Đang làm việc').trim()
      }));
      return { type: 'employees', success: true, data: employees, message: `Đã nạp thành công ${employees.length} hồ sơ nhân sự (Chuẩn Dòng 4 - Dòng 54)` };
    }

    // 2. Hop dong lao dong (02_Hop_dong)
    if (lowerName.includes('hop_dong') || header.includes('Số hợp đồng')) {
      const contracts: Contract[] = dataRows.map(r => ({
        contractNumber: String(r[0] || '').trim(),
        employeeId: String(r[1] || '').trim(),
        name: String(r[2] || '').trim(),
        department: String(r[3] || '').trim(),
        position: String(r[4] || '').trim(),
        contractType: String(r[5] || '').trim(),
        signDate: String(r[6] || '').trim(),
        effectiveDate: String(r[7] || '').trim(),
        expiryDate: r[8] ? String(r[8]).trim() : '',
        insuranceSalary: Number(r[9]) || 0,
        workLocation: String(r[10] || 'Văn phòng Hà Nội').trim(),
        status: String(r[11] || 'Đang hiệu lực').trim()
      }));
      return { type: 'contracts', success: true, data: contracts, message: `Đã nạp thành công ${contracts.length} hợp đồng lao động` };
    }

    // 3. Cham cong (03_Cham_cong)
    if (lowerName.includes('cham_cong') || header.includes('Công chuẩn')) {
      // Extract month from file name, e.g. 2026_07
      const monthMatch = fileName.match(/2026_(\d{2})/);
      const monthStr = monthMatch ? `${monthMatch[1]}/2026` : '07/2026';

      const attendance: AttendanceRecord[] = dataRows.map(r => {
        const actualDays = Number(r[5]) || 0;
        const paidLeaveDays = Number(r[6]) || 0;
        return {
          employeeId: String(r[0] || '').trim(),
          name: String(r[1] || '').trim(),
          department: String(r[2] || '').trim(),
          position: String(r[3] || '').trim(),
          month: monthStr,
          standardDays: Number(r[4]) || 26,
          actualDays,
          paidLeaveDays,
          unpaidLeaveDays: Number(r[7]) || 0,
          sickLeaveDays: Number(r[8]) || 0,
          maternityLeaveDays: Number(r[9]) || 0,
          totalSalaryDays: actualDays + paidLeaveDays,
          otNormal: Number(r[11]) || 0,
          otSunday: Number(r[12]) || 0,
          lateTimes: Number(r[13]) || 0,
          notes: r[14] ? String(r[14]).trim() : ''
        };
      });
      return { type: 'attendance', success: true, data: { month: monthStr, records: attendance }, message: `Đã nạp thành công ${attendance.length} bản ghi chấm công kỳ ${monthStr}` };
    }

    // 4. Bang luong (05_Bang_luong)
    if (lowerName.includes('bang_luong') || header.includes('Mức lương HĐ') || header.includes('Lương thời gian')) {
      const monthMatch = fileName.match(/2026_(\d{2})/);
      const monthStr = monthMatch ? `${monthMatch[1]}/2026` : '07/2026';

      const payroll: PayrollRecord[] = dataRows.map(r => {
        const contractSalary = Number(r[4]) || 0;
        const workingDays = Number(r[5]) || 26;
        const basePay = Math.round(contractSalary / 26 * workingDays);
        const respAllowance = Number(r[7]) || 0;
        const lunchAllowance = Number(r[8]) || 0;
        const otPay = Number(r[9]) || 0;
        const performanceBonus = Number(r[10]) || 0;
        const totalIncome = basePay + respAllowance + lunchAllowance + otPay + performanceBonus;
        const insuranceDeduction = Number(r[12]) || 0;
        const pitTax = Number(r[13]) || 0;
        const netSalary = totalIncome - insuranceDeduction - pitTax;

        return {
          employeeId: String(r[0] || '').trim(),
          name: String(r[1] || '').trim(),
          department: String(r[2] || '').trim(),
          position: String(r[3] || '').trim(),
          month: monthStr,
          contractSalary,
          workingDays,
          basePay,
          respAllowance,
          lunchAllowance,
          otPay,
          performanceBonus,
          totalIncome,
          insuranceDeduction,
          pitTax,
          netSalary,
          notes: r[15] ? String(r[15]).trim() : ''
        };
      });
      return { type: 'payroll', success: true, data: { month: monthStr, records: payroll }, message: `Đã nạp thành công ${payroll.length} bản ghi bảng lương kỳ ${monthStr}` };
    }

    // 5. Nghi phep (04_Nghi_phep)
    if (lowerName.includes('nghi_phep') || header.includes('Mã đơn') || header.includes('Lý do xin nghỉ')) {
      const leaveRequests: LeaveRequest[] = dataRows.map(r => ({
        requestNumber: String(r[0] || '').trim(),
        employeeId: String(r[1] || '').trim(),
        name: String(r[2] || '').trim(),
        department: String(r[3] || '').trim(),
        leaveType: String(r[4] || '').trim(),
        startDate: String(r[5] || '').trim(),
        endDate: String(r[6] || '').trim(),
        days: Number(r[7]) || 0,
        reason: String(r[8] || '').trim(),
        approver: String(r[9] || '').trim(),
        status: String(r[10] || 'Chờ duyệt').trim()
      }));
      return { type: 'leaveRequests', success: true, data: leaveRequests, message: `Đã nạp ${leaveRequests.length} đơn xin nghỉ phép` };
    }

    return { type: 'generic', success: true, data: rawData, message: `Đã đọc thành công ${dataRows.length} dòng dữ liệu từ ${fileName}` };
  } catch (err: any) {
    return { type: 'error', success: false, data: null, message: `Lỗi đọc file: ${err.message || 'Không thể giải mã file Excel'}` };
  }
}

// Export data to Excel
export function exportToExcel(data: any[], fileName: string, sheetTitle = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}
