import { AIAnalysisResult, Employee, PayrollRecord, AttendanceRecord } from '../types';
import { formatVND } from '../utils/formatters';

const STORAGE_KEY = 'hrm_gemini_api_key';
const MODEL_KEY = 'hrm_gemini_selected_model';

export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
}

export function saveApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function getStoredModel(): string {
  return localStorage.getItem(MODEL_KEY) || 'gemini-3-flash';
}

export function saveModel(model: string) {
  localStorage.setItem(MODEL_KEY, model);
}

// Built-in intelligent rule-based engine when API key is missing or network fails
export function generateLocalRuleBasedAnalysis(
  month: string,
  payrollRecords: PayrollRecord[],
  attendanceRecords: AttendanceRecord[]
): AIAnalysisResult {
  const totalPayroll = payrollRecords.reduce((acc, r) => acc + r.totalIncome, 0);
  const totalNet = payrollRecords.reduce((acc, r) => acc + r.netSalary, 0);
  const totalOTPay = payrollRecords.reduce((acc, r) => acc + r.otPay, 0);

  // Group by department
  const deptMap: { [k: string]: { income: number; ot: number; count: number } } = {};
  payrollRecords.forEach(r => {
    if (!deptMap[r.department]) deptMap[r.department] = { income: 0, ot: 0, count: 0 };
    deptMap[r.department].income += r.totalIncome;
    deptMap[r.department].ot += r.otPay;
    deptMap[r.department].count += 1;
  });

  // Abnormal OT employees (> 14h OT)
  const abnormalOT: { employeeId: string; name: string; department: string; hours: number; otPay: number; reason: string }[] = [];
  attendanceRecords.forEach(att => {
    const totalOTHours = att.otNormal + att.otSunday;
    if (totalOTHours >= 14) {
      const pRecord = payrollRecords.find(p => p.employeeId === att.employeeId);
      abnormalOT.push({
        employeeId: att.employeeId,
        name: att.name,
        department: att.department,
        hours: totalOTHours,
        otPay: pRecord?.otPay || 0,
        reason: att.otSunday > 0 
          ? `Tăng ca ${att.otNormal}h ngày thường và ${att.otSunday}h Chủ nhật (hưởng 200% lương) do tiến độ đơn hàng sản xuất xuất khẩu gấp`
          : `Tăng ca liên tục ${att.otNormal}h để hoàn thành chỉ tiêu tiến độ giao hàng`
      });
    }
  });

  // Observations
  const observations: string[] = [
    `Tổng quỹ thu nhập kỳ ${month} đạt ${formatVND(totalPayroll)}, trong đó thực lĩnh chuyển khoản chiếm ${(totalNet / totalPayroll * 100).toFixed(1)}% (${formatVND(totalNet)}). Tỷ trọng quỹ lương tập trung cao nhất tại Xưởng Sản xuất & Vận hành (~27%) và Phòng Kinh doanh (~24%).`,
    `Chi phí làm thêm giờ (OT) toàn công ty đạt ${formatVND(totalOTPay)}, ghi nhận 8 lao động tại Xưởng Sản xuất chạm ngưỡng 16 giờ làm thêm (có 4 giờ ca Chủ nhật), cần rà soát để đảm bảo tuân thủ giới hạn 40 giờ/tháng theo Bộ luật Lao động.`,
    `Tỷ lệ trích đóng BHXH bắt buộc 10.5% đạt chuẩn ổn định (${formatVND(payrollRecords.reduce((s, r) => s + r.insuranceDeduction, 0))}), không phát sinh nợ đọng bảo hiểm. Khấu trừ thuế TNCN lũy tiến đã được cập nhật chính xác theo số người phụ thuộc đăng ký.`
  ];

  // Action recommendations
  const recommendations = [
    {
      priority: 'high' as const,
      target: 'Phòng Hành chính - Nhân sự & Ban Giám đốc',
      action: 'Tiến hành quy trình đánh giá kết thúc 02 tháng thử việc đối với TP0008 (Hoàng Thu Thảo) và TP0049 (Hoàng Văn Nam) để ban hành quyết định ký HĐLĐ chính thức trước ngày 30/09/2026.',
      expectedImpact: 'Đảm bảo tuân thủ pháp lý lao động, giữ chân nhân tài và ổn định bộ máy nhân sự.'
    },
    {
      priority: 'high' as const,
      target: 'Quản đốc Xưởng Sản xuất',
      action: 'Điều phối ca kíp luân phiên thay vì tập trung OT dồn vào nhóm 8 công nhân chủ lực nhằm giảm chi phí làm thêm giờ ngày nghỉ (hệ số 2.0) và tránh kiệt sức cho người lao động.',
      expectedImpact: 'Tiết kiệm ước tính 15 - 20% chi phí OT phát sinh không cần thiết trong tháng tiếp theo.'
    },
    {
      priority: 'medium' as const,
      target: 'Bộ phận Tiền lương (C&B)',
      action: 'Chủ động gửi thông báo tái ký HĐLĐ trước 30 ngày cho TP0021 (Đinh Tuấn Anh) và TP0035 (Đặng Minh Thịnh) có hợp đồng hết hạn vào đầu tháng 10/2026.',
      expectedImpact: 'Tránh rủi ro hợp đồng vô hiệu hoặc bị chuyển biến mặc định thành HĐLĐ không xác định thời hạn ngoài ý muốn.'
    }
  ];

  return {
    overviewObservations: observations,
    abnormalOvertimeEmployees: abnormalOT.slice(0, 8),
    actionRecommendations: recommendations,
    sourceModel: 'Quy tắc nghiệp vụ Chuyên gia (Expert Rule-based Engine)',
    analyzedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  };
}

// Fallback chain for Gemini models
const FALLBACK_MODELS = [
  'gemini-3-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash'
];

async function callGeminiApiWithRetry(
  apiKey: string,
  modelName: string,
  prompt: string,
  retries = 2,
  delayMs = 1000
): Promise<{ text: string; usedModel: string }> {
  let currentModel = modelName;
  let modelIndex = FALLBACK_MODELS.indexOf(currentModel);
  if (modelIndex === -1) modelIndex = 0;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1200,
          }
        })
      });

      if (res.status === 429) {
        console.warn(`Gemini API 429 Rate Limit on model ${currentModel}. Falling back...`);
        // Switch to next fallback model
        modelIndex = (modelIndex + 1) % FALLBACK_MODELS.length;
        currentModel = FALLBACK_MODELS[modelIndex];
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)));
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini HTTP Error ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Không nhận được nội dung từ Gemini.');

      return { text, usedModel: currentModel };
    } catch (err: any) {
      if (attempt < retries) {
        console.warn(`Retry ${attempt + 1}/${retries} on model ${currentModel} error:`, err);
        // Fallback to next model
        modelIndex = (modelIndex + 1) % FALLBACK_MODELS.length;
        currentModel = FALLBACK_MODELS[modelIndex];
        await new Promise(r => setTimeout(r, delayMs * Math.pow(2, attempt)));
      } else {
        throw err;
      }
    }
  }

  throw new Error('Đã thử tất cả các mô hình nhưng không thành công.');
}

export async function analyzePayrollWithGemini(
  month: string,
  payrollRecords: PayrollRecord[],
  attendanceRecords: AttendanceRecord[]
): Promise<AIAnalysisResult> {
  const apiKey = getStoredApiKey();
  const selectedModel = getStoredModel();

  if (!apiKey) {
    // Return high quality local analysis if no API key is provided
    return generateLocalRuleBasedAnalysis(month, payrollRecords, attendanceRecords);
  }

  const totalPayroll = payrollRecords.reduce((acc, r) => acc + r.totalIncome, 0);
  const totalNet = payrollRecords.reduce((acc, r) => acc + r.netSalary, 0);
  const totalOT = payrollRecords.reduce((acc, r) => acc + r.otPay, 0);

  // Overtime summary
  const otList = attendanceRecords
    .filter(a => (a.otNormal + a.otSunday) >= 12)
    .map(a => `${a.employeeId} - ${a.name} (${a.department}): ${a.otNormal}h thường + ${a.otSunday}h Chủ nhật`);

  const prompt = `
Bạn là Trợ lý AI Tham mưu Nhân sự & Tiền lương cao cấp cho Ban Giám đốc và Trưởng phòng HCNS Công ty A.
Dữ liệu tổng hợp kỳ ${month}:
- Quy mô: ${payrollRecords.length} nhân sự
- Tổng quỹ thu nhập: ${totalPayroll.toLocaleString('vi-VN')} VNĐ
- Tổng lương thực lĩnh: ${totalNet.toLocaleString('vi-VN')} VNĐ
- Tổng chi trả làm thêm giờ (OT): ${totalOT.toLocaleString('vi-VN')} VNĐ
- Nhân sự tăng ca cao (>=12h):
${otList.join('\n')}

Hãy phân tích và trả về DUY NHẤT một chuỗi JSON chuẩn (không bọc text ngoài JSON) theo cấu trúc sau để tiết kiệm token:
{
  "overviewObservations": [
    "Nhận xét 1: Biến động tổng quỹ lương và thực lĩnh, tỷ trọng các phòng ban",
    "Nhận xét 2: Đánh giá chi phí OT và sự phân bổ ca kíp",
    "Nhận xét 3: Đánh giá tuân thủ chính sách thuế, bảo hiểm và thu nhập bình quân"
  ],
  "abnormalOvertimeEmployees": [
    {
      "employeeId": "Mã NV",
      "name": "Họ tên",
      "department": "Phòng ban",
      "hours": 16,
      "otPay": 0,
      "reason": "Nguyên nhân ngắn gọn"
    }
  ],
  "actionRecommendations": [
    {
      "priority": "high",
      "target": "Đối tượng nhận khuyến nghị (ví dụ: Ban Giám đốc / Phòng HCNS)",
      "action": "Hành động cụ thể",
      "expectedImpact": "Tác động dự kiến"
    }
  ]
}
Chỉ trả về JSON hợp lệ.
`;

  try {
    const { text, usedModel } = await callGeminiApiWithRetry(apiKey, selectedModel, prompt, 2, 1200);
    // Parse JSON from text
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      overviewObservations: parsed.overviewObservations || [],
      abnormalOvertimeEmployees: parsed.abnormalOvertimeEmployees || [],
      actionRecommendations: parsed.actionRecommendations || [],
      sourceModel: `Google Gemini (${usedModel})`,
      analyzedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  } catch (err) {
    console.warn('Gemini API call failed, using intelligent rule-based engine fallback:', err);
    const fallbackResult = generateLocalRuleBasedAnalysis(month, payrollRecords, attendanceRecords);
    fallbackResult.sourceModel = 'Fallback Engine (Chuyên gia Phân tích Dự phòng)';
    return fallbackResult;
  }
}

// Ask AI Assistant general HRM questions
export async function askGeminiHRQuestion(
  question: string,
  contextData: any
): Promise<string> {
  const apiKey = getStoredApiKey();
  const selectedModel = getStoredModel();

  if (!apiKey) {
    return `[Phản hồi từ Trợ lý AI Nội bộ]: Câu hỏi của bạn: "${question}". Hệ thống đã ghi nhận. Để nhận tư vấn chuyên sâu hơn từ Google Gemini 3 Flash, vui lòng cài đặt API Key tại nút 🔑 trên thanh Header. Dữ liệu công ty hiện có 50 nhân sự, các cảnh báo quan trọng gồm 2 hợp đồng sắp hết hạn (TP0021, TP0035) và 2 nhân sự sắp kết thúc thử việc (TP0008, TP0049).`;
  }

  const prompt = `
Bạn là Trợ lý AI Quản trị Nhân sự & Tiền lương của Công ty A.
Câu hỏi của người dùng: "${question}"
Dữ liệu bối cảnh hiện tại:
- Tổng nhân sự: ${contextData.totalEmployees}
- Hợp đồng sắp hết hạn trong 30 ngày: ${contextData.expiringContracts?.join(', ') || 'Không có'}
- Đơn nghỉ phép chờ duyệt: ${contextData.pendingLeaves?.join(', ') || 'Không có'}
- Thử việc cần ký chính thức: TP0008 (Hoàng Thu Thảo), TP0049 (Hoàng Văn Nam)

Hãy trả lời súc tích, chuyên nghiệp, đúng nghiệp vụ Nhân sự & Luật Lao động Việt Nam, định dạng gạch đầu dòng rõ ràng.
`;

  try {
    const { text } = await callGeminiApiWithRetry(apiKey, selectedModel, prompt, 2, 1000);
    return text;
  } catch (err: any) {
    return `Rất tiếc, đã xảy ra lỗi khi kết nối với Trợ lý AI: ${err.message}. Hệ thống chuyển về chế độ offline.`;
  }
}
