const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:5173';

async function runTest() {
  console.log('🚀 Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  console.log(`🌐 Navigating to ${APP_URL}...`);
  await page.goto(APP_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForSelector('#root', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  const title = await page.title();
  console.log('✅ Page loaded! Title:', title);

  // 1. Click "⚡ Nạp dữ liệu thử nghiệm"
  console.log('⚡ Clicking "Nạp dữ liệu thử nghiệm" button...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.innerText.includes('Nạp dữ liệu thử nghiệm') || btn.innerText.includes('Mẫu'));
    if (b) {
      b.click();
      console.log('Clicked button successfully');
    }
  });

  // Wait 1.5 second for countup & chart animations
  await new Promise(r => setTimeout(r, 1500));

  // Check 1: KPIs & 3 Charts
  console.log('🔍 Checking KPI numbers & Recharts on Dashboard...');
  const kpis = await page.evaluate(() => {
    const textContent = document.body.innerText;
    const hasStaffCount = textContent.includes('50') && textContent.includes('Định biên');
    const hasTotalPayroll = textContent.includes('Quỹ Thu Nhập') || textContent.includes('Thực lĩnh');
    const hasUrgentActions = textContent.includes('Cần Xử Lý Gấp') || textContent.includes('Việc Khẩn Cấp');
    const hasOT = textContent.includes('Tổng Giờ Làm Thêm') || textContent.includes('OT');

    // Check SVG charts
    const svgCharts = document.querySelectorAll('.recharts-responsive-container svg');
    return {
      hasStaffCount,
      hasTotalPayroll,
      hasUrgentActions,
      hasOT,
      svgChartCount: svgCharts.length
    };
  });
  console.log('📊 KPI & Charts status:', kpis);

  // Take screenshot of Dashboard
  fs.mkdirSync(path.join(__dirname, '..', 'test_screenshots'), { recursive: true });
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '01_dashboard.png') });
  console.log('📸 Saved 01_dashboard.png');

  // Check 2: Switch to "Hồ sơ 360° & Nhân viên" and click TP0001
  console.log('👥 Switching to "Hồ sơ 360° & Nhân viên" tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button, nav button'));
    const staffBtn = buttons.find(b => b.innerText.includes('Nhân viên') || b.innerText.includes('Hồ sơ 360°'));
    if (staffBtn) staffBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('👤 Clicking employee TP0001 - Phạm Thái Hùng...');
  const clickedTP0001 = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    const tpRow = rows.find(r => r.innerText.includes('TP0001') || r.innerText.includes('Phạm Thái Hùng'));
    if (tpRow) {
      tpRow.click();
      return true;
    }
    return false;
  });
  console.log('✅ TP0001 clicked:', clickedTP0001);
  await new Promise(r => setTimeout(r, 1000));

  // Check Drawer 360° content
  const drawerInfo = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasDrawer = text.includes('01_Ho_so_nhan_vien.xlsx') || text.includes('TP0001');
    const hasTabs = text.includes('Cá nhân') && text.includes('Hợp đồng') && text.includes('Lương & Thuế');
    return { hasDrawer, hasTabs };
  });
  console.log('📁 Drawer 360° Status:', drawerInfo);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '02_drawer_360.png') });
  console.log('📸 Saved 02_drawer_360.png');

  // Click "Xem Phiếu lương" inside Drawer
  console.log('💵 Clicking "Xem Phiếu lương"...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const pBtn = btns.find(b => b.innerText.includes('Xem Phiếu lương') || b.innerText.includes('Xem Phiếu Lương'));
    if (pBtn) pBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Check Payslip Modal
  const payslipInfo = await page.evaluate(() => {
    const text = document.body.innerText;
    const hasPayslipModal = text.includes('PHIẾU THANH TOÁN TIỀN LƯƠNG') || text.includes('Xem Trước Phiếu Lương');
    const hasWords = text.includes('đồng chẵn') || text.includes('Số tiền bằng chữ');
    const hasWordExportBtn = text.includes('Xuất Word (.docx)');
    const hasPrintBtn = text.includes('In / Xuất PDF');
    const hasGmailBtn = text.includes('Gửi qua Gmail');
    return { hasPayslipModal, hasWords, hasWordExportBtn, hasPrintBtn, hasGmailBtn };
  });
  console.log('🧾 Payslip Modal Status:', payslipInfo);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '03_payslip_modal.png') });
  console.log('📸 Saved 03_payslip_modal.png');

  // Close payslip modal
  await page.evaluate(() => {
    const closeBtns = Array.from(document.querySelectorAll('button'));
    const x = closeBtns.find(b => b.innerHTML.includes('lucide-x') || b.className.includes('p-1.5'));
    if (x) x.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Close drawer
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    const backdrops = document.querySelectorAll('.fixed.inset-0');
    if (backdrops.length > 0) backdrops[0].click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Check 3: Switch to "Việc cần xử lý" (Action Center)
  console.log('🚨 Switching to "Việc cần xử lý" tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button, nav button'));
    const actionBtn = buttons.find(b => b.innerText.includes('Việc cần xử lý') || b.innerText.includes('Cần xử lý'));
    if (actionBtn) actionBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const actionCenterInfo = await page.evaluate(() => {
    const text = document.body.innerText;
    // Red warnings
    const hasContractExpTP0021 = text.includes('TP0021') || text.includes('Đinh Tuấn Anh');
    const hasContractExpTP0035 = text.includes('TP0035') || text.includes('Đặng Minh Thịnh');
    const hasProbationTP0008 = text.includes('TP0008') || text.includes('Hoàng Thu Thảo');
    const hasProbationTP0049 = text.includes('TP0049') || text.includes('Hoàng Văn Nam');
    
    // Yellow warnings
    const hasLeaveNP0515 = text.includes('NP-2026-0515') || text.includes('Phan Thanh Hoa');
    const hasLeaveNP0518 = text.includes('NP-2026-0518') || text.includes('Nguyễn Công Tuấn');
    const hasLeaveNP0520 = text.includes('NP-2026-0520') || text.includes('Nguyễn Văn Minh');
    const hasProbationTP0023 = text.includes('TP0023') || text.includes('Nguyễn Mạnh An');

    // Badges count
    const redBadges = document.querySelectorAll('.bg-rose-600').length;
    const yellowBadges = document.querySelectorAll('.bg-amber-500').length;
    const greenBadges = document.querySelectorAll('.bg-emerald-600').length;

    return {
      hasContractExpTP0021,
      hasContractExpTP0035,
      hasProbationTP0008,
      hasProbationTP0049,
      hasLeaveNP0515,
      hasLeaveNP0518,
      hasLeaveNP0520,
      hasProbationTP0023,
      redBadges,
      yellowBadges,
      greenBadges
    };
  });

  console.log('🛡️ Action Center Alerts Status:', actionCenterInfo);
  await page.screenshot({ path: path.join(__dirname, '..', 'test_screenshots', '04_action_center.png') });
  console.log('📸 Saved 04_action_center.png');

  console.log('\n================ TEST SUMMARY ================');
  console.log('Console Errors:', consoleErrors.length > 0 ? consoleErrors : 'NONE (0 errors)');
  console.log('KPIs Displayed:', kpis.hasStaffCount && kpis.hasTotalPayroll);
  console.log('Recharts Rendered:', kpis.svgChartCount >= 3 ? `${kpis.svgChartCount} SVG charts rendered` : 'Failed');
  console.log('Drawer 360° & Payslip:', drawerInfo.hasDrawer && payslipInfo.hasPayslipModal);
  console.log('Action Center Red & Yellow Alerts:', actionCenterInfo.hasProbationTP0008 && actionCenterInfo.hasLeaveNP0515);
  console.log('==============================================\n');

  await browser.close();
}

runTest().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
