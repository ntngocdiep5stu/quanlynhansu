const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = process.cwd();

// 1. Departments & Positions
const dmWb = XLSX.readFile(path.join(dir, '00_Danh_muc_he_thong.xlsx'));
const phongBanRows = XLSX.utils.sheet_to_json(dmWb.Sheets['Phong_ban'], { header: 1 });
const chucVuRows = XLSX.utils.sheet_to_json(dmWb.Sheets['Chuc_vu'], { header: 1 });
const loaiNghiRows = XLSX.utils.sheet_to_json(dmWb.Sheets['Loai_nghi_phep'], { header: 1 });
const quyDinhRows = XLSX.utils.sheet_to_json(dmWb.Sheets['Quy_dinh_chung'], { header: 1 });

const departments = [];
for (let r = 3; r < phongBanRows.length; r++) {
  const row = phongBanRows[r];
  if (row && row[0]) {
    departments.push({
      code: row[0],
      name: row[1],
      description: row[2],
      targetHeadcount: Number(row[3]) || 0,
      leaderTitle: row[4]
    });
  }
}

// 2. Employees (01_Ho_so_nhan_vien)
const hsWb = XLSX.readFile(path.join(dir, '01_Ho_so_nhan_vien.xlsx'));
const hsRows = XLSX.utils.sheet_to_json(hsWb.Sheets['Ho_so_nhan_vien'], { header: 1 });
const employees = [];
for (let r = 4; r < 54; r++) {
  const row = hsRows[r];
  if (!row || !row[0]) continue;
  employees.push({
    id: String(row[0]).trim(),
    name: String(row[1]).trim(),
    gender: String(row[2]).trim(),
    birthDate: String(row[3]).trim(),
    idCard: String(row[4]).trim(),
    hometown: String(row[5]).trim(),
    department: String(row[6]).trim(),
    position: String(row[7]).trim(),
    education: String(row[8]).trim(),
    startDate: String(row[9]).trim(),
    email: String(row[10]).trim(),
    phone: String(row[11]).trim(),
    bankAccount: String(row[12]).trim(),
    bankName: String(row[13]).trim(),
    insuranceCode: String(row[14]).trim(),
    dependents: Number(row[15]) || 0,
    status: String(row[16]).trim()
  });
}

// 3. Contracts (02_Hop_dong)
const hdWb = XLSX.readFile(path.join(dir, '02_Hop_dong.xlsx'));
const hdRows = XLSX.utils.sheet_to_json(hdWb.Sheets['Hop_dong_lao_dong'], { header: 1 });
const contracts = [];
for (let r = 4; r < 54; r++) {
  const row = hdRows[r];
  if (!row || !row[0]) continue;
  contracts.push({
    contractNumber: String(row[0]).trim(),
    employeeId: String(row[1]).trim(),
    name: String(row[2]).trim(),
    department: String(row[3]).trim(),
    position: String(row[4]).trim(),
    contractType: String(row[5]).trim(),
    signDate: String(row[6]).trim(),
    effectiveDate: String(row[7]).trim(),
    expiryDate: row[8] ? String(row[8]).trim() : '',
    insuranceSalary: Number(row[9]) || 0,
    workLocation: String(row[10]).trim(),
    status: String(row[11]).trim()
  });
}

// 4. Leave requests & leave quota (04_Nghi_phep_2026)
const npWb = XLSX.readFile(path.join(dir, '04_Nghi_phep_2026.xlsx'));
const npRequestsRows = XLSX.utils.sheet_to_json(npWb.Sheets['Theo_doi_don_nghi'], { header: 1 });
const leaveRequests = [];
for (let r = 4; r < npRequestsRows.length; r++) {
  const row = npRequestsRows[r];
  if (!row || !row[0]) continue;
  leaveRequests.push({
    requestNumber: String(row[0]).trim(),
    employeeId: String(row[1]).trim(),
    name: String(row[2]).trim(),
    department: String(row[3]).trim(),
    leaveType: String(row[4]).trim(),
    startDate: String(row[5]).trim(),
    endDate: String(row[6]).trim(),
    days: Number(row[7]) || 0,
    reason: String(row[8]).trim(),
    approver: String(row[9]).trim(),
    status: String(row[10]).trim()
  });
}

const npQuotaRows = XLSX.utils.sheet_to_json(npWb.Sheets['Quy_phep_nam'], { header: 1 });
const leaveQuotas = [];
for (let r = 3; r < 53; r++) {
  const row = npQuotaRows[r];
  if (!row || !row[0]) continue;
  const standardDays = Number(row[3]) || 12;
  const seniorityDays = Number(row[4]) || 0;
  const totalDays = standardDays + seniorityDays;
  const usedDays = Number(row[6]) || 0;
  const remainingDays = totalDays - usedDays;
  leaveQuotas.push({
    employeeId: String(row[0]).trim(),
    name: String(row[1]).trim(),
    department: String(row[2]).trim(),
    standardDays,
    seniorityDays,
    totalDays,
    usedDays,
    remainingDays,
    notes: row[8] ? String(row[8]).trim() : ''
  });
}

// 5. Attendance (03_Cham_cong_2026_07, 08, 09)
const attendance = {};
const months = ['07', '08', '09'];

for (const m of months) {
  const ccWb = XLSX.readFile(path.join(dir, `03_Cham_cong_2026_${m}.xlsx`));
  const sheetName = `Cham_cong_T${m}_2026`;
  const ccRows = XLSX.utils.sheet_to_json(ccWb.Sheets[sheetName], { header: 1 });
  const list = [];
  for (let r = 4; r < 54; r++) {
    const row = ccRows[r];
    if (!row || !row[0]) continue;
    const standardDays = Number(row[4]) || 26;
    const actualDays = Number(row[5]) || 0;
    const paidLeaveDays = Number(row[6]) || 0;
    const unpaidLeaveDays = Number(row[7]) || 0;
    const sickLeaveDays = Number(row[8]) || 0;
    const maternityLeaveDays = Number(row[9]) || 0;
    const totalSalaryDays = actualDays + paidLeaveDays;
    const otNormal = Number(row[11]) || 0;
    const otSunday = Number(row[12]) || 0;
    const lateTimes = Number(row[13]) || 0;
    const notes = row[14] ? String(row[14]).trim() : '';

    list.push({
      employeeId: String(row[0]).trim(),
      name: String(row[1]).trim(),
      department: String(row[2]).trim(),
      position: String(row[3]).trim(),
      month: `${m}/2026`,
      standardDays,
      actualDays,
      paidLeaveDays,
      unpaidLeaveDays,
      sickLeaveDays,
      maternityLeaveDays,
      totalSalaryDays,
      otNormal,
      otSunday,
      lateTimes,
      notes
    });
  }
  attendance[`${m}/2026`] = list;
}

// Generate Month 10 Attendance (Projection / Actual for Oct 2026)
attendance['10/2026'] = attendance['09/2026'].map(item => ({
  ...item,
  month: '10/2026',
  lateTimes: Math.max(0, item.lateTimes - 1),
  notes: item.employeeId === 'TP0008' ? 'Đã hoàn thành thử việc' : item.notes
}));

// 6. Payroll (05_Bang_luong_2026_07, 08, 09)
const payroll = {};
for (const m of months) {
  const blWb = XLSX.readFile(path.join(dir, `05_Bang_luong_2026_${m}.xlsx`));
  const sheetName = `Bang_luong_T${m}_2026`;
  const blRows = XLSX.utils.sheet_to_json(blWb.Sheets[sheetName], { header: 1 });
  const list = [];
  for (let r = 4; r < 54; r++) {
    const row = blRows[r];
    if (!row || !row[0]) continue;
    const contractSalary = Number(row[4]) || 0;
    const workingDays = Number(row[5]) || 26;
    const basePay = Math.round(contractSalary / 26 * workingDays);
    const respAllowance = Number(row[7]) || 0;
    const lunchAllowance = Number(row[8]) || 0;
    const otPay = Number(row[9]) || 0;
    const performanceBonus = Number(row[10]) || 0;
    const totalIncome = basePay + respAllowance + lunchAllowance + otPay + performanceBonus;
    const insuranceDeduction = Number(row[12]) || 0; // 10.5%
    const pitTax = Number(row[13]) || 0;
    const netSalary = totalIncome - insuranceDeduction - pitTax;
    const notes = row[15] ? String(row[15]).trim() : '';

    list.push({
      employeeId: String(row[0]).trim(),
      name: String(row[1]).trim(),
      department: String(row[2]).trim(),
      position: String(row[3]).trim(),
      month: `${m}/2026`,
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
      notes
    });
  }
  payroll[`${m}/2026`] = list;
}

// Generate Month 10 Payroll
payroll['10/2026'] = payroll['09/2026'].map(item => {
  // Let's adjust slightly for month 10
  const bonusAdj = item.employeeId === 'TP0008' || item.employeeId === 'TP0049' ? 2000000 : item.performanceBonus;
  const totalIncome = item.basePay + item.respAllowance + item.lunchAllowance + item.otPay + bonusAdj;
  const netSalary = totalIncome - item.insuranceDeduction - item.pitTax;
  return {
    ...item,
    month: '10/2026',
    performanceBonus: bonusAdj,
    totalIncome,
    netSalary,
    notes: item.employeeId === 'TP0008' ? 'Chuyển lương chính thức' : item.notes
  };
});

const sampleData = {
  departments,
  employees,
  contracts,
  leaveRequests,
  leaveQuotas,
  attendance,
  payroll
};

fs.mkdirSync(path.join(dir, 'src', 'data'), { recursive: true });
fs.writeFileSync(
  path.join(dir, 'src', 'data', 'sampleData.json'),
  JSON.stringify(sampleData, null, 2),
  'utf-8'
);

console.log('Sample data extracted successfully! Employees:', employees.length, 'Contracts:', contracts.length);
