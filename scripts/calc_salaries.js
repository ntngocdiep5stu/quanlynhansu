const fs = require('fs');
const XLSX = require('xlsx');

function analyzeMonthSalary(month) {
  const wb = XLSX.readFile(`05_Bang_luong_2026_${month}.xlsx`);
  const ws = wb.Sheets[`Bang_luong_T${month}_2026`];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
  let totalLuongHD = 0;
  let totalLuongThoiGian = 0;
  let totalPhuCapTN = 0;
  let totalPhuCapAnTrua = 0;
  let totalOT = 0;
  let totalThuong = 0;
  let totalThuNhap = 0;
  let totalBHXH = 0;
  let totalThue = 0;
  let totalThucLinh = 0;
  let empCount = 0;

  const deptMap = {};

  for (let r = 4; r < 54; r++) {
    const row = data[r];
    if (!row || !row[0]) continue;
    empCount++;
    const [
      maNV, hoTen, phongBan, chucDanh,
      luongHD, ngayCong, luongTG_f,
      phuCapTN, phuCapAnTrua, ot, thuong,
      tongTN_f, bhxh, thue, thucLinh_f, ghiChu
    ] = row;

    const luongTG = Math.round((Number(luongHD) || 0) / 26 * (Number(ngayCong) || 0));
    const pTN = Number(phuCapTN) || 0;
    const pAT = Number(phuCapAnTrua) || 0;
    const otVal = Number(ot) || 0;
    const thVal = Number(thuong) || 0;
    const tongTN = luongTG + pTN + pAT + otVal + thVal;
    const bhxhVal = Number(bhxh) || 0;
    const thueVal = Number(thue) || 0;
    const thucLinh = tongTN - bhxhVal - thueVal;

    totalLuongHD += Number(luongHD) || 0;
    totalLuongThoiGian += luongTG;
    totalPhuCapTN += pTN;
    totalPhuCapAnTrua += pAT;
    totalOT += otVal;
    totalThuong += thVal;
    totalThuNhap += tongTN;
    totalBHXH += bhxhVal;
    totalThue += thueVal;
    totalThucLinh += thucLinh;

    if (!deptMap[phongBan]) {
      deptMap[phongBan] = { count: 0, tongThuNhap: 0, thucLinh: 0, ot: 0 };
    }
    deptMap[phongBan].count++;
    deptMap[phongBan].tongThuNhap += tongTN;
    deptMap[phongBan].thucLinh += thucLinh;
    deptMap[phongBan].ot += otVal;
  }

  console.log(`=== Tháng ${month}/2026 ===`);
  console.log({
    empCount,
    totalThuNhap,
    totalBHXH,
    totalThue,
    totalThucLinh,
    totalOT
  });
  console.log('Dept Breakdown:', deptMap);
}

analyzeMonthSalary('07');
analyzeMonthSalary('08');
analyzeMonthSalary('09');
