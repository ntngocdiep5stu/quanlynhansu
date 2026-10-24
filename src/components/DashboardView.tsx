import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  Bot, 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  ArrowUpRight,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ComposedChart, 
  Line 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { CountUpNumber } from './common/CountUpNumber';
import { formatVND, formatNumber } from '../utils/formatters';
import { 
  analyzePayrollWithGemini, 
  getStoredApiKey, 
  getStoredModel 
} from '../services/geminiService';
import { copyReportToClipboard } from '../services/exportService';
import { AIAnalysisResult } from '../types';

const COLORS = ['#0F291E', '#D97706', '#2563EB', '#10B981', '#8B5CF6', '#EC4899'];

export const DashboardView: React.FC = () => {
  const { 
    departments, 
    employees, 
    currentMonthPayroll, 
    currentMonthAttendance, 
    payroll, 
    selectedMonth, 
    setSelectedMonth,
    actionItems, 
    setActiveTab, 
    setSelectedEmployee360 
  } = useApp();

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  // Calculate Key Metrics
  const totalEmployees = employees.length;
  const totalQuota = departments.reduce((sum, d) => sum + d.targetHeadcount, 0);

  const totalPayrollIncome = currentMonthPayroll.reduce((sum, p) => sum + p.totalIncome, 0);
  const totalNetSalary = currentMonthPayroll.reduce((sum, p) => sum + p.netSalary, 0);

  const pendingUrgentActions = actionItems.filter(i => i.category === 'red' && i.status === 'pending');
  const pendingYellowActions = actionItems.filter(i => i.category === 'yellow' && i.status === 'pending');
  const totalActionCount = pendingUrgentActions.length + pendingYellowActions.length;

  const totalOTHours = currentMonthAttendance.reduce((sum, a) => sum + a.otNormal + a.otSunday, 0);
  const averageWorkingDays = (
    currentMonthAttendance.reduce((sum, a) => sum + a.actualDays, 0) / (totalEmployees || 1)
  ).toFixed(1);

  // Chart 1: Actual vs Quota per Department (Horizontal Bar Chart)
  const deptStaffingData = departments.map(d => {
    const actualCount = employees.filter(e => e.department === d.name).length;
    return {
      department: d.name.replace('Phòng ', '').replace('& Marketing', '& Mkt'),
      fullName: d.name,
      'Thực tế': actualCount,
      'Định biên': d.targetHeadcount,
    };
  });

  // Chart 2: Monthly trend of Total Income & Net Pay across T07, T08, T09, T10
  const monthlyTrendData = (['07/2026', '08/2026', '09/2026', '10/2026'] as const).map(m => {
    const records = payroll[m] || [];
    const income = records.reduce((sum, r) => sum + r.totalIncome, 0);
    const net = records.reduce((sum, r) => sum + r.netSalary, 0);
    return {
      month: `Tháng ${m.split('/')[0]}`,
      rawMonth: m,
      'Tổng thu nhập': income,
      'Thực lĩnh': net,
    };
  });

  // Chart 3: Donut chart of Payroll Fund by Department for selected month
  const deptPayrollData = departments.map(d => {
    const deptRecords = currentMonthPayroll.filter(p => p.department === d.name);
    const deptIncome = deptRecords.reduce((sum, r) => sum + r.totalIncome, 0);
    return {
      name: d.name,
      shortName: d.name.replace('Phòng ', '').replace('& Marketing', '& Mkt'),
      value: deptIncome,
    };
  }).filter(d => d.value > 0);

  // Run AI analysis
  const handleRunAiAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const res = await analyzePayrollWithGemini(selectedMonth, currentMonthPayroll, currentMonthAttendance);
      setAiAnalysis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Initial AI analysis on mount or month change
  useEffect(() => {
    handleRunAiAnalysis();
  }, [selectedMonth, currentMonthPayroll]);

  const handleCopyAiReport = async () => {
    if (!aiAnalysis) return;
    const text = `=== BÁO CÁO THAM MƯU QUỸ LƯƠNG & NHÂN SỰ KỲ ${selectedMonth} ===
Mô hình phân tích: ${aiAnalysis.sourceModel} (${aiAnalysis.analyzedAt})

I. NHẬN XÉT BIẾN ĐỘNG TRỌNG TÂM:
${aiAnalysis.overviewObservations.map((o, idx) => `${idx + 1}. ${o}`).join('\n')}

II. DANH SÁCH NHÂN SỰ TĂNG CA CAO BẤT THƯỜNG:
${aiAnalysis.abnormalOvertimeEmployees.map(e => `- ${e.employeeId} | ${e.name} (${e.department}): ${e.hours}h OT | Lý do: ${e.reason}`).join('\n')}

III. ĐỀ XUẤT HÀNH ĐỘNG CHO TRƯỞNG PHÒNG HCNS:
${aiAnalysis.actionRecommendations.map(r => `[${r.priority.toUpperCase()}] ${r.target}: ${r.action} -> Mục tiêu: ${r.expectedImpact}`).join('\n')}
`;
    const success = await copyReportToClipboard(text);
    if (success) {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Banner / Month Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bảng Điều Hành Nhân Sự & Tiền Lương
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Dữ liệu thống kê tổng hợp toàn công ty • Kỳ tính lương hiện tại: <strong className="text-amber-600 dark:text-amber-400">Tháng {selectedMonth}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Chọn kỳ tháng:</span>
          {(['07/2026', '08/2026', '09/2026', '10/2026'] as const).map(m => (
            <button
              key={m}
              onClick={() => setSelectedMonth(m)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedMonth === m
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              T{m.split('/')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Bento Grid 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Tổng nhân sự */}
        <div className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-amber-500/50 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tổng Quy Mô Nhân Sự
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              <CountUpNumber value={totalEmployees} />
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              / {totalQuota} Định biên (100%)
            </span>
          </div>
          <div className="mt-3 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            <span>47 Chính thức • 3 Thử việc</span>
          </div>
        </div>

        {/* KPI 2: Tổng Quỹ Lương */}
        <div className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-amber-500/50 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tổng Quỹ Thu Nhập
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              <CountUpNumber value={totalPayrollIncome} isCurrency />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Thực lĩnh: <strong className="text-emerald-600 dark:text-emerald-400">{formatVND(totalNetSalary)}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+4.2% MoM</span>
          </div>
        </div>

        {/* KPI 3: Việc Khẩn Cấp */}
        <div 
          onClick={() => setActiveTab('action-center')}
          className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-rose-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              Việc Cần Xử Lý Gấp
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              <CountUpNumber value={pendingUrgentActions.length} />
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              hạng mục đỏ ({pendingYellowActions.length} vàng)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
            <span>2 HĐ sắp hết hạn • 2 hết thử việc</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 4: Giờ làm thêm OT */}
        <div className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-amber-500/50 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tổng Giờ Làm Thêm (OT)
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              <CountUpNumber value={totalOTHours} suffix=" h" />
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              toàn công ty
            </span>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400">
            <span>Công TB: <strong className="text-slate-800 dark:text-slate-200">{averageWorkingDays}/26 ngày</strong></span>
            <span className="ml-auto text-blue-600 dark:text-blue-400 font-semibold">Tập trung Xưởng SX</span>
          </div>
        </div>

      </div>

      {/* 2. AI Smart Insight Box */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-300/70 dark:border-amber-500/30 bg-gradient-to-br from-amber-50/70 via-white to-emerald-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-[#0F291E]/40 p-5 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/60 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  AI Phân Tích Quỹ Lương & Tham Mưu Nhân Sự
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
                  Gemini 3 Flash
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nguồn: {aiAnalysis?.sourceModel || 'Hệ thống Đánh giá Tự động'} • Cập nhật lúc {aiAnalysis?.analyzedAt || 'vừa xong'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyAiReport}
              disabled={!aiAnalysis}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all shadow-xs"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span>{copiedNotification ? '✓ Đã sao chép' : 'Sao chép báo cáo'}</span>
            </button>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAiLoading}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>{isAiLoading ? 'Đang phân tích...' : 'Phân tích lại'}</span>
            </button>
          </div>
        </div>

        {/* AI Analysis Content with Skeleton Shimmer when loading */}
        {isAiLoading ? (
          <div className="py-8 space-y-4 shimmer-effect">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-full"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-5/6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4">
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          </div>
        ) : aiAnalysis ? (
          <div className="mt-4 space-y-5">
            {/* 3 Key Observations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                1. Ba Nhận Xét Biến Động Quỹ Lương Trọng Tâm
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiAnalysis.overviewObservations.map((obs, idx) => (
                  <div key={idx} className="bg-white/90 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-xs text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-[11px]">
                        {idx + 1}
                      </span>
                      <span>Điểm đáng chú ý #{idx + 1}</span>
                    </div>
                    {obs}
                  </div>
                ))}
              </div>
            </div>

            {/* Abnormal Overtime Employees & Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {/* Abnormal OT */}
              <div className="bg-white/80 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2.5 flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  2. Cảnh Báo Nhân Sự Tăng Ca Cao Bất Thường (≥ 14h)
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {aiAnalysis.abnormalOvertimeEmployees.map((emp, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        const target = employees.find(e => e.id === emp.employeeId);
                        if (target) setSelectedEmployee360(target);
                      }}
                      className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 text-xs hover:bg-rose-100/60 cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {emp.employeeId} - {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                          {emp.reason}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                          {emp.hours} giờ OT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendations for HR Manager */}
              <div className="bg-white/80 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2.5 flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  3. Đề Xuất Hành Động Cho Trưởng Phòng HCNS
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {aiAnalysis.actionRecommendations.map((rec, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {rec.target}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          rec.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-snug">
                        {rec.action}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 italic">
                        Mục tiêu: {rec.expectedImpact}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        ) : null}
      </div>

      {/* 3. Three Dynamic Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Actual vs Quota per Department (Horizontal Bar Chart) */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Thực Tế vs Định Biên 6 Phòng Ban
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tỷ lệ lấp đầy nhân sự theo kế hoạch
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              50 / 50 NS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={deptStaffingData}
                margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
              >
                <XAxis type="number" domain={[0, 20]} tick={{ fontSize: 11 }} />
                <YAxis 
                  dataKey="department" 
                  type="category" 
                  tick={{ fontSize: 10 }} 
                  width={90}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} nhân sự`, name]}
                  contentStyle={{ backgroundColor: '#0F291E', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Thực tế" fill="#0F291E" radius={[0, 4, 4, 0]} />
                <Bar dataKey="Định biên" fill="#D97706" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Composed Bar & Line Chart: Total Income & Net Pay across Months */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Biến Động Quỹ Lương Qua Các Tháng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tổng thu nhập & Thực lĩnh (T07 - T10/2026)
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={monthlyTrendData}
                margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [formatVND(Number(val)), name]}
                  contentStyle={{ backgroundColor: '#0F291E', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Tổng thu nhập" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="Thực lĩnh" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Donut Chart of Payroll Fund by Department */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cơ Cấu Quỹ Lương 6 Phòng Ban
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tỷ trọng phân bổ chi phí lương Tháng {selectedMonth}
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
              100%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptPayrollData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {deptPayrollData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [formatVND(Number(val)), name]}
                  contentStyle={{ backgroundColor: '#0F291E', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Urgent Action Center Preview Quick Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cảnh Báo Việc Cần Xử Lý Nhanh (Đỏ - Vàng)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200">
              {pendingUrgentActions.length} Việc khẩn cấp
            </span>
          </div>

          <button
            onClick={() => setActiveTab('action-center')}
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center space-x-1"
          >
            <span>Xem toàn bộ việc cần xử lý</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          {pendingUrgentActions.slice(0, 4).map(item => (
            <div 
              key={item.id}
              className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-start justify-between gap-3"
            >
              <div>
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white uppercase mb-1">
                  Màu Đỏ: Khẩn cấp
                </span>
                <div className="font-bold text-xs text-slate-900 dark:text-white">
                  {item.title}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('action-center')}
                className="flex-shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Xử lý
              </button>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
};
