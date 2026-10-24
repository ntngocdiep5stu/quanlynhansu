import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle, 
  HeadingLevel 
} from 'docx';
import { saveAs } from 'file-saver';
import { Employee, Contract, PayrollRecord } from '../types';
import { formatVND, formatDateVN, numberToVietnameseWords } from '../utils/formatters';

// 1. Export Payslip to Word (.docx)
export async function exportPayslipToWord(
  employee: Employee, 
  payroll: PayrollRecord
) {
  const tableBorderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  };

  const tableBorderLight = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  };

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // Company Header
        new Paragraph({
          children: [
            new TextRun({ text: "CÔNG TY CỔ PHẦN CÔNG NGHỆ & SẢN XUẤT A", bold: true, size: 24, color: "0F291E" }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Địa chỉ: Tầng 8, Tòa nhà Innovation, Cầu Giấy, Hà Nội | Hotline: (024) 3888 9999", size: 18, color: "666666" }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }),

        // Title
        new Paragraph({
          children: [
            new TextRun({ text: `PHIẾU LƯƠNG CÁ NHÂN - KỲ THÁNG ${payroll.month}`, bold: true, size: 30, color: "D97706" }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, italics: true, size: 18, color: "888888" }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }),

        // Employee Info Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorderNone,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Họ và tên: ", bold: true }), new TextRun(employee.name)] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Mã nhân viên: ", bold: true }), new TextRun(employee.id)] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Phòng ban: ", bold: true }), new TextRun(employee.department)] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Chức vụ: ", bold: true }), new TextRun(employee.position)] })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Số tài khoản: ", bold: true }), new TextRun(`${employee.bankAccount} (${employee.bankName})`)] })],
                }),
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: "Ngày công thực tế: ", bold: true }), new TextRun(`${payroll.workingDays}/26 ngày`)] })],
                }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: "" }),

        // Salary Breakdown Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorderLight,
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "STT", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Khoản mục thu nhập & khấu trừ", bold: true })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Số tiền (VNĐ)", bold: true })], alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "1" })] }),
                new TableCell({ children: [new Paragraph({ text: "Mức lương cơ bản theo Hợp đồng" })] }),
                new TableCell({ children: [new Paragraph({ text: formatVND(payroll.contractSalary), alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "2" })] }),
                new TableCell({ children: [new Paragraph({ text: "Lương thời gian thực tế" })] }),
                new TableCell({ children: [new Paragraph({ text: formatVND(payroll.basePay), alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "3" })] }),
                new TableCell({ children: [new Paragraph({ text: "Phụ cấp trách nhiệm" })] }),
                new TableCell({ children: [new Paragraph({ text: formatVND(payroll.respAllowance), alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "4" })] }),
                new TableCell({ children: [new Paragraph({ text: "Phụ cấp ăn trưa" })] }),
                new TableCell({ children: [new Paragraph({ text: formatVND(payroll.lunchAllowance), alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "5" })] }),
                new TableCell({ children: [new Paragraph({ text: "Tiền làm thêm giờ (OT)" })] }),
                new TableCell({ children: [new Paragraph({ text: formatVND(payroll.otPay), alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "6" })] }),
                new TableCell({ children: [new Paragraph({ text: "Thưởng hiệu quả / Thưởng nóng" })] }),
                new TableCell({ children: [new Paragraph({ text: formatVND(payroll.performanceBonus), alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "" })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TỔNG THU NHẬP (A)", bold: true, color: "0F291E" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatVND(payroll.totalIncome), bold: true, color: "0F291E" })], alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "7" })] }),
                new TableCell({ children: [new Paragraph({ text: "Trích nộp BHXH, BHYT, BHTN (10.5%)" })] }),
                new TableCell({ children: [new Paragraph({ text: `-${formatVND(payroll.insuranceDeduction)}`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "8" })] }),
                new TableCell({ children: [new Paragraph({ text: "Thuế thu nhập cá nhân (TNCN)" })] }),
                new TableCell({ children: [new Paragraph({ text: `-${formatVND(payroll.pitTax)}`, alignment: AlignmentType.RIGHT })] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "" })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "THỰC LĨNH CHUYỂN KHOẢN (B = A - Trừ)", bold: true, size: 22, color: "15803d" })] })] }),
                new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: formatVND(payroll.netSalary), bold: true, size: 22, color: "15803d" })], alignment: AlignmentType.RIGHT })] }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: "" }),

        // Amount in words
        new Paragraph({
          children: [
            new TextRun({ text: "Số tiền viết bằng chữ: ", bold: true }),
            new TextRun({ text: numberToVietnameseWords(payroll.netSalary), italics: true }),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "" }),

        // Signature section
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: tableBorderNone,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "NGƯỜI LẬP BIỂU", bold: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "(Ký, họ tên)", italics: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "\n\n\n\n" }),
                    new Paragraph({ children: [new TextRun({ text: "Nguyễn Thu Hằng", bold: true })], alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "TRƯỞNG PHÒNG HCNS", bold: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italics: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "\n\n\n\n" }),
                    new Paragraph({ children: [new TextRun({ text: "Hà Quang Dũng", bold: true })], alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "NGƯỜI LAO ĐỘNG", bold: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ children: [new TextRun({ text: "(Ký xác nhận)", italics: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "\n\n\n\n" }),
                    new Paragraph({ children: [new TextRun({ text: employee.name, bold: true })], alignment: AlignmentType.CENTER }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Phieu_luong_${employee.id}_${employee.name.replace(/\s+/g, '_')}_T${payroll.month.replace('/', '_')}.docx`);
}

// 2. Export Probation Evaluation memo ("Tờ trình đánh giá hết thử việc")
export async function exportProbationEvaluationToWord(
  employee: Employee, 
  contract: Contract | undefined
) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: "CÔNG TY CỔ PHẦN CÔNG NGHỆ & SẢN XUẤT A", bold: true, size: 22 }),
          ],
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Số: ...../TTr-HCNS", size: 18 }),
          ],
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc", bold: true, size: 20 }),
          ],
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "TỜ TRÌNH ĐÁNH GIÁ KẾT QUẢ THỬ VIỆC", bold: true, size: 28, color: "0F291E" }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "V/v: Đề xuất ký kết Hợp đồng lao động chính thức", italics: true, size: 20 }),
          ],
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "Kính gửi: ", bold: true }),
            new TextRun("BAN GIÁM ĐỐC CÔNG TY CỔ PHẦN CÔNG NGHỆ & SẢN XUẤT A"),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun("Căn cứ Bộ luật Lao động số 45/2019/QH14;\n"),
            new TextRun("Căn cứ Hợp đồng thử việc số "),
            new TextRun({ text: contract?.contractNumber || `HĐTV-${employee.id}`, bold: true }),
            new TextRun(` ký ngày ${formatDateVN(contract?.signDate || employee.startDate)};\n`),
            new TextRun(`Căn cứ vào kết quả đánh giá năng lực trong 02 tháng thử việc của nhân sự `),
            new TextRun({ text: employee.name, bold: true }),
            new TextRun(`, Phòng Hành chính - Nhân sự xin kính trình Ban Giám đốc các nội dung sau:`),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "I. THÔNG TIN NHÂN SỰ", bold: true }),
          ],
        }),
        new Paragraph({ text: `• Họ và tên: ${employee.name}` }),
        new Paragraph({ text: `• Mã nhân viên: ${employee.id}` }),
        new Paragraph({ text: `• Phòng ban công tác: ${employee.department}` }),
        new Paragraph({ text: `• Vị trí chức danh: ${employee.position}` }),
        new Paragraph({ text: `• Thời gian thử việc: Từ ${formatDateVN(contract?.effectiveDate || employee.startDate)} đến ${formatDateVN(contract?.expiryDate || '2026-09-30')}` }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "II. KẾT QUẢ ĐÁNH GIÁ 02 THÁNG THỬ VIỆC", bold: true }),
          ],
        }),
        new Paragraph({ text: "1. Về chuyên môn nghiệp vụ: Hoàn thành 100% chỉ tiêu KPI được giao, nắm bắt nhanh quy trình làm việc." }),
        new Paragraph({ text: "2. Về kỷ luật và tác phong: Chấp hành nghiêm chỉnh nội quy lao động, văn hóa công ty, đi làm đúng giờ, tinh thần trách nhiệm cao." }),
        new Paragraph({ text: "3. Tương tác đội ngũ: Phối hợp hiệu quả với đồng nghiệp và các phòng ban liên quan." }),
        new Paragraph({ text: "" }),
        new Paragraph({
          children: [
            new TextRun({ text: "III. KIẾN NGHỊ VÀ ĐỀ XUẤT", bold: true }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun("Phòng Hành chính - Nhân sự kính đề nghị Ban Giám đốc phê duyệt:\n"),
            new TextRun({ text: `1. Ký Hợp đồng lao động xác định thời hạn 12 tháng với ông/bà ${employee.name}.\n`, bold: true }),
            new TextRun(`2. Thời hạn hợp đồng mới: Từ ngày ${formatDateVN(contract?.expiryDate ? new Date(new Date(contract.expiryDate).getTime() + 86400000).toISOString().split('T')[0] : '2026-10-01')} đến ngày 30/09/2027.\n`),
            new TextRun(`3. Mức lương chính thức: Hưởng 100% lương theo bậc chức danh vị trí (${formatVND(contract?.insuranceSalary || 12000000)}/tháng) và đầy đủ các chế độ BHXH, phúc lợi công ty.`),
          ],
        }),
        new Paragraph({ text: "" }),
        new Paragraph({ text: "Kính trình Ban Giám đốc xem xét và quyết định./." }),
        new Paragraph({ text: "\n\n" }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "Ý KIẾN PHÊ DUYỆT BAN GIÁM ĐỐC", bold: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "\n\n\n\n" }),
                    new Paragraph({ children: [new TextRun({ text: "Phạm Thái Hùng - Tổng Giám đốc", bold: true })], alignment: AlignmentType.CENTER }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({ children: [new TextRun({ text: "TRƯỞNG PHÒNG HCNS", bold: true })], alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "\n\n\n\n" }),
                    new Paragraph({ children: [new TextRun({ text: "Hà Quang Dũng", bold: true })], alignment: AlignmentType.CENTER }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `To_trinh_danh_gia_thu_viec_${employee.id}_${employee.name.replace(/\s+/g, '_')}.docx`);
}

// 3. Google Calendar link generator for Contract Expiry
export function openGoogleCalendarReminder(contract: Contract) {
  const title = encodeURIComponent(`[HR Công ty A] Tái ký HĐLĐ nhân sự ${contract.employeeId} - ${contract.name}`);
  const details = encodeURIComponent(
    `Nhân sự: ${contract.name} (${contract.employeeId})\n` +
    `Phòng ban: ${contract.department}\n` +
    `Chức vụ: ${contract.position}\n` +
    `Hợp đồng hiện tại: ${contract.contractNumber} (${contract.contractType})\n` +
    `Ngày hết hạn: ${formatDateVN(contract.expiryDate)}\n\n` +
    `Hành động: Phòng HCNS thực hiện quy trình đánh giá tái ký hoặc thanh lý HĐLĐ trước 15 ngày.`
  );

  let dateParam = '';
  if (contract.expiryDate) {
    const raw = contract.expiryDate.replace(/-/g, '');
    dateParam = `&dates=${raw}T090000Z/${raw}T100000Z`;
  }

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}${dateParam}`;
  window.open(url, '_blank');
}

// 4. Gmail compose link generator with prefilled draft
export function openGmailPayslip(employee: Employee, payroll: PayrollRecord) {
  const subject = encodeURIComponent(`[Công ty A] Phiếu thanh toán tiền lương Tháng ${payroll.month} - ${employee.name}`);
  const body = encodeURIComponent(
    `Kính gửi Anh/Chị ${employee.name} (${employee.id}),\n\n` +
    `Phòng Hành chính - Nhân sự xin gửi tới Anh/Chị chi tiết phiếu lương kỳ Tháng ${payroll.month}:\n\n` +
    `- Phòng ban: ${employee.department}\n` +
    `- Chức vụ: ${employee.position}\n` +
    `- Ngày công tính lương: ${payroll.workingDays}/26 ngày\n` +
    `- Mức lương HĐ: ${formatVND(payroll.contractSalary)}\n` +
    `- Lương thời gian: ${formatVND(payroll.basePay)}\n` +
    `- Phụ cấp trách nhiệm: ${formatVND(payroll.respAllowance)}\n` +
    `- Phụ cấp ăn trưa: ${formatVND(payroll.lunchAllowance)}\n` +
    `- Tiền làm thêm giờ (OT): ${formatVND(payroll.otPay)}\n` +
    `- Thưởng hiệu quả: ${formatVND(payroll.performanceBonus)}\n` +
    `---------------------------------------\n` +
    `TỔNG THU NHẬP: ${formatVND(payroll.totalIncome)}\n` +
    `- Trích BHXH, BHYT, BHTN (10.5%): -${formatVND(payroll.insuranceDeduction)}\n` +
    `- Thuế TNCN: -${formatVND(payroll.pitTax)}\n` +
    `---------------------------------------\n` +
    `THỰC LĨNH CHUYỂN KHOẢN: ${formatVND(payroll.netSalary)}\n` +
    `(Bằng chữ: ${numberToVietnameseWords(payroll.netSalary)})\n\n` +
    `Số tài khoản nhận: ${employee.bankAccount} - ${employee.bankName}\n\n` +
    `Mọi thắc mắc về bảng lương, Anh/Chị vui lòng phản hồi lại email này trong vòng 03 ngày làm việc.\n\n` +
    `Trân trọng,\n` +
    `Phòng Hành chính - Nhân sự Công ty A`
  );

  const recipient = employee.email || `${employee.id.toLowerCase()}@congtya.vn`;
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${subject}&body=${body}`;
  window.open(url, '_blank');
}

// 5. Copy text report to clipboard
export async function copyReportToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}
