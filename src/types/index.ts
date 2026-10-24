export interface Department {
  code: string;
  name: string;
  description: string;
  targetHeadcount: number;
  leaderTitle: string;
}

export interface Employee {
  id: string; // TP0001
  name: string;
  gender: string;
  birthDate: string;
  idCard: string;
  hometown: string;
  department: string;
  position: string;
  education: string;
  startDate: string;
  email: string;
  phone: string;
  bankAccount: string;
  bankName: string;
  insuranceCode: string;
  dependents: number;
  status: string; // 'Đang làm việc', 'Thử việc', 'Đã nghỉ việc'
}

export interface Contract {
  contractNumber: string;
  employeeId: string;
  name: string;
  department: string;
  position: string;
  contractType: string;
  signDate: string;
  effectiveDate: string;
  expiryDate: string;
  insuranceSalary: number;
  workLocation: string;
  status: string; // 'Đang hiệu lực', 'Sắp hết hạn', 'Đã hết hạn'
}

export interface LeaveRequest {
  requestNumber: string;
  employeeId: string;
  name: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  approver: string;
  status: string; // 'Đã duyệt', 'Chờ duyệt', 'Từ chối'
}

export interface LeaveQuota {
  employeeId: string;
  name: string;
  department: string;
  standardDays: number;
  seniorityDays: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  notes: string;
}

export interface AttendanceRecord {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  month: string; // '07/2026'
  standardDays: number;
  actualDays: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  sickLeaveDays: number;
  maternityLeaveDays: number;
  totalSalaryDays: number;
  otNormal: number;
  otSunday: number;
  lateTimes: number;
  notes: string;
}

export interface PayrollRecord {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  month: string; // '07/2026'
  contractSalary: number;
  workingDays: number;
  basePay: number;
  respAllowance: number;
  lunchAllowance: number;
  otPay: number;
  performanceBonus: number;
  totalIncome: number;
  insuranceDeduction: number; // 10.5%
  pitTax: number;
  netSalary: number;
  notes: string;
}

export type ActionCategory = 'red' | 'yellow' | 'green';

export interface ActionItem {
  id: string;
  category: ActionCategory;
  title: string;
  description: string;
  employeeId?: string;
  employeeName?: string;
  department?: string;
  relatedDoc?: string;
  dueDate?: string;
  actionType: 'contract_renewal' | 'probation_eval' | 'leave_approval' | 'active_probation' | 'stable';
  status: 'pending' | 'resolved' | 'approved' | 'rejected';
}

export interface FilterState {
  department: string;
  month: string;
  status: string;
  search: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'action-center'
  | 'employees'
  | 'contracts'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'upload';

export interface AIAnalysisResult {
  overviewObservations: string[];
  abnormalOvertimeEmployees: {
    employeeId: string;
    name: string;
    department: string;
    hours: number;
    otPay: number;
    reason: string;
  }[];
  actionRecommendations: {
    priority: 'high' | 'medium' | 'low';
    target: string;
    action: string;
    expectedImpact: string;
  }[];
  sourceModel: string;
  analyzedAt: string;
}
