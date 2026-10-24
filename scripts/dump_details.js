const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

function dumpFile(fileName, sheetName) {
  const wb = XLSX.readFile(fileName);
  const name = sheetName || wb.SheetNames[0];
  const ws = wb.Sheets[name];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  console.log(`=== ${fileName} [${name}] === (Total rows: ${data.length})`);
  for (let i = 0; i < Math.min(8, data.length); i++) {
    console.log(`Row ${i + 1}:`, JSON.stringify(data[i]));
  }
}

dumpFile('01_Ho_so_nhan_vien.xlsx');
dumpFile('02_Hop_dong.xlsx');
dumpFile('03_Cham_cong_2026_07.xlsx');
dumpFile('04_Nghi_phep_2026.xlsx', 'Theo_doi_don_nghi');
dumpFile('04_Nghi_phep_2026.xlsx', 'Quy_phep_nam');
dumpFile('05_Bang_luong_2026_07.xlsx');
