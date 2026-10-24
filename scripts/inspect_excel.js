const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xlsx'));

console.log('Found files:', files);

const summary = {};

for (const file of files) {
  const filePath = path.join(dir, file);
  const workbook = XLSX.readFile(filePath);
  summary[file] = {
    sheets: workbook.SheetNames,
    sheetDetails: {}
  };

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // Convert to 2D array
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    summary[file].sheetDetails[sheetName] = {
      totalRows: data.length,
      sampleRows: data.slice(0, 10), // first 10 rows
      row4: data[3] || [], // 0-indexed row 3 is 4th row
      row5: data[4] || [],
      lastRows: data.slice(-5)
    };
  }
}

fs.writeFileSync(path.join(dir, 'scripts_output_summary.json'), JSON.stringify(summary, null, 2), 'utf-8');
console.log('Inspection complete. Summary saved to scripts_output_summary.json');
