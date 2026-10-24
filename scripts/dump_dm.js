const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = process.cwd();

function readSheet(filePath, sheetName) {
  const wb = XLSX.readFile(filePath);
  const name = sheetName || wb.SheetNames[0];
  const ws = wb.Sheets[name];
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
}

// 00_Danh_muc_he_thong
const dmFile = path.join(dir, '00_Danh_muc_he_thong.xlsx');
const dmWb = XLSX.readFile(dmFile);
console.log('DM Sheets:', dmWb.SheetNames);
for (const s of dmWb.SheetNames) {
  const data = XLSX.utils.sheet_to_json(dmWb.Sheets[s], { header: 1, defval: '' });
  console.log('--- ' + s + ' ---');
  console.log(data.slice(0, 7));
}
