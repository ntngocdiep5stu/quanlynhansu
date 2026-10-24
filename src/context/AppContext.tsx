import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import sampleData from '../data/sampleData.json';
import { 
  Employee, 
  Contract, 
  LeaveRequest, 
  LeaveQuota, 
  AttendanceRecord, 
  PayrollRecord, 
  Department, 
  ActiveTab, 
  ActionItem,
  FilterState 
} from '../types';

interface AppContextType {
  // Navigation & Theme
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;

  // Filters
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;

  // Main Datasets
  departments: Department[];
  employees: Employee[];
  contracts: Contract[];
  leaveRequests: LeaveRequest[];
  leaveQuotas: LeaveQuota[];
  attendance: { [month: string]: AttendanceRecord[] };
  payroll: { [month: string]: PayrollRecord[] };

  // Current Month Slices
  currentMonthAttendance: AttendanceRecord[];
  currentMonthPayroll: PayrollRecord[];

  // Action Center Items (Red, Yellow, Green)
  actionItems: ActionItem[];
  approveLeaveRequest: (reqNumber: string) => void;
  rejectLeaveRequest: (reqNumber: string) => void;
  resolveActionItem: (id: string) => void;

  // 360 Drawer & Payslip Modal
  selectedEmployee360: Employee | null;
  setSelectedEmployee360: (emp: Employee | null) => void;
  selectedPayslip: { employee: Employee; payroll: PayrollRecord } | null;
  setSelectedPayslip: (data: { employee: Employee; payroll: PayrollRecord } | null) => void;

  // Modals
  isApiKeyModalOpen: boolean;
  setIsApiKeyModalOpen: (open: boolean) => void;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;

  // Actions
  loadSampleData: () => void;
  updateDataFromUpload: (type: string, data: any) => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('hrm_dark_mode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('hrm_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('hrm_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('09/2026');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Datasets loaded from sampleData
  const [departments, setDepartments] = useState<Department[]>(sampleData.departments as Department[]);
  const [employees, setEmployees] = useState<Employee[]>(sampleData.employees as Employee[]);
  const [contracts, setContracts] = useState<Contract[]>(sampleData.contracts as Contract[]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(sampleData.leaveRequests as LeaveRequest[]);
  const [leaveQuotas, setLeaveQuotas] = useState<LeaveQuota[]>(sampleData.leaveQuotas as LeaveQuota[]);
  const [attendance, setAttendance] = useState<{ [month: string]: AttendanceRecord[] }>(sampleData.attendance as any);
  const [payroll, setPayroll] = useState<{ [month: string]: PayrollRecord[] }>(sampleData.payroll as any);

  // Action items resolution map
  const [resolvedActionIds, setResolvedActionIds] = useState<{ [id: string]: boolean }>({});

  // 360 Drawer & Payslip Modal
  const [selectedEmployee360, setSelectedEmployee360] = useState<Employee | null>(null);
  const [selectedPayslip, setSelectedPayslip] = useState<{ employee: Employee; payroll: PayrollRecord } | null>(null);

  // Modals
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);

  // Current Month Data
  const currentMonthAttendance = useMemo(() => {
    return attendance[selectedMonth] || attendance['09/2026'] || [];
  }, [attendance, selectedMonth]);

  const currentMonthPayroll = useMemo(() => {
    return payroll[selectedMonth] || payroll['09/2026'] || [];
  }, [payroll, selectedMonth]);

  // Business Rule 2: Red - Yellow - Green Action Center classification
  const actionItems: ActionItem[] = useMemo(() => {
    const items: ActionItem[] = [];

    // --- RED (Khẩn cấp) ---
    // 1. Expiring contracts within 30 days (TP0021, TP0035)
    contracts.forEach(c => {
      if (c.status === 'Sắp hết hạn' || (c.expiryDate && (c.expiryDate.startsWith('2026-10-01') || c.expiryDate.startsWith('2026-10-15')))) {
        const emp = employees.find(e => e.id === c.employeeId);
        items.push({
          id: `contract-exp-${c.employeeId}`,
          category: 'red',
          title: `HĐLĐ sắp hết hạn trong 30 ngày: ${c.name} (${c.employeeId})`,
          description: `Hợp đồng số ${c.contractNumber} (${c.contractType}) sẽ hết hạn vào ${c.expiryDate}. Cần lập tờ trình thẩm định tái ký hoặc chuẩn bị thủ tục theo quy định.`,
          employeeId: c.employeeId,
          employeeName: c.name,
          department: c.department,
          relatedDoc: c.contractNumber,
          dueDate: c.expiryDate,
          actionType: 'contract_renewal',
          status: resolvedActionIds[`contract-exp-${c.employeeId}`] ? 'resolved' : 'pending'
        });
      }
    });

    // 2. Probation ending 2-month review (TP0008, TP0049)
    contracts.forEach(c => {
      if (c.contractType.includes('Thử việc') && c.expiryDate === '2026-09-30') {
        items.push({
          id: `probation-eval-${c.employeeId}`,
          category: 'red',
          title: `Hoàn tất 02 tháng thử việc - Đánh giá ký HĐ chính thức: ${c.name} (${c.employeeId})`,
          description: `Nhân sự kết thúc giai đoạn thử việc vào 30/09/2026. Trưởng phòng HCNS cần xuất Tờ trình đánh giá và hoàn tất thủ tục ký kết HĐLĐ chính thức.`,
          employeeId: c.employeeId,
          employeeName: c.name,
          department: c.department,
          relatedDoc: c.contractNumber,
          dueDate: '2026-09-30',
          actionType: 'probation_eval',
          status: resolvedActionIds[`probation-eval-${c.employeeId}`] ? 'resolved' : 'pending'
        });
      }
    });

    // --- YELLOW (Chờ xử lý) ---
    // 3. Pending leave requests (NP-2026-0515, NP-2026-0518, NP-2026-0520)
    leaveRequests.forEach(req => {
      if (req.status === 'Chờ duyệt') {
        items.push({
          id: `leave-pending-${req.requestNumber}`,
          category: 'yellow',
          title: `Đơn xin nghỉ phép chờ phê duyệt: ${req.name} (${req.requestNumber})`,
          description: `Đăng ký nghỉ ${req.leaveType} ${req.days} ngày (từ ${req.startDate} đến ${req.endDate}). Lý do: "${req.reason}".`,
          employeeId: req.employeeId,
          employeeName: req.name,
          department: req.department,
          relatedDoc: req.requestNumber,
          dueDate: req.startDate,
          actionType: 'leave_approval',
          status: resolvedActionIds[`leave-pending-${req.requestNumber}`] ? 'approved' : 'pending'
        });
      }
    });

    // 4. Currently in probation (TP0023 - Nguyễn Mạnh An)
    contracts.forEach(c => {
      if (c.contractType.includes('Thử việc') && c.expiryDate === '2026-10-15') {
        items.push({
          id: `probation-active-${c.employeeId}`,
          category: 'yellow',
          title: `Nhân sự đang trong thời gian thử việc: ${c.name} (${c.employeeId})`,
          description: `Đang trong tháng thử việc thứ 2 tại ${c.department}. Hết hạn hợp đồng thử việc: ${c.expiryDate}. Cần theo dõi tiến độ đào tạo và chỉ tiêu công việc.`,
          employeeId: c.employeeId,
          employeeName: c.name,
          department: c.department,
          relatedDoc: c.contractNumber,
          dueDate: c.expiryDate,
          actionType: 'active_probation',
          status: resolvedActionIds[`probation-active-${c.employeeId}`] ? 'resolved' : 'pending'
        });
      }
    });

    // --- GREEN (Ổn định) ---
    items.push({
      id: 'stable-attendance-q3',
      category: 'green',
      title: 'Đối soát chấm công & quỹ lương Quý 3/2026 đồng bộ',
      description: 'Toàn bộ 50 hồ sơ nhân sự, dữ liệu công chuẩn 26 ngày và trích nộp BHXH 10.5% đã được kiểm toán tự động, không phát sinh sai lệch.',
      actionType: 'stable',
      status: 'resolved'
    });

    items.push({
      id: 'stable-insurance-tax',
      category: 'green',
      title: 'Hồ sơ trích nộp BHXH & Giảm trừ gia cảnh thuế TNCN hợp lệ',
      description: '100% nhân viên ký HĐLĐ đã được cấp mã số BHXH và đăng ký giảm trừ người phụ thuộc theo quy định.',
      actionType: 'stable',
      status: 'resolved'
    });

    return items;
  }, [contracts, leaveRequests, employees, resolvedActionIds]);

  // Actions
  const approveLeaveRequest = (reqNumber: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.requestNumber === reqNumber) {
        return { ...req, status: 'Đã duyệt' };
      }
      return req;
    }));
    setResolvedActionIds(prev => ({ ...prev, [`leave-pending-${reqNumber}`]: true }));
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
  };

  const rejectLeaveRequest = (reqNumber: string) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.requestNumber === reqNumber) {
        return { ...req, status: 'Từ chối' };
      }
      return req;
    }));
    setResolvedActionIds(prev => ({ ...prev, [`leave-pending-${reqNumber}`]: true }));
  };

  const resolveActionItem = (id: string) => {
    setResolvedActionIds(prev => ({ ...prev, [id]: true }));
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Prominent "⚡ Nạp dữ liệu thử nghiệm"
  const loadSampleData = () => {
    setDepartments(sampleData.departments as Department[]);
    setEmployees(sampleData.employees as Employee[]);
    setContracts(sampleData.contracts as Contract[]);
    setLeaveRequests(sampleData.leaveRequests as LeaveRequest[]);
    setLeaveQuotas(sampleData.leaveQuotas as LeaveQuota[]);
    setAttendance(sampleData.attendance as any);
    setPayroll(sampleData.payroll as any);
    setResolvedActionIds({});
    setSelectedMonth('09/2026');

    // Confetti celebration
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#0F291E', '#D97706', '#10B981', '#3B82F6']
    });
  };

  const refreshData = () => {
    loadSampleData();
  };

  const updateDataFromUpload = (type: string, data: any) => {
    if (type === 'employees') {
      setEmployees(data);
    } else if (type === 'contracts') {
      setContracts(data);
    } else if (type === 'attendance') {
      setAttendance(prev => ({ ...prev, [data.month]: data.records }));
      setSelectedMonth(data.month);
    } else if (type === 'payroll') {
      setPayroll(prev => ({ ...prev, [data.month]: data.records }));
      setSelectedMonth(data.month);
    } else if (type === 'leaveRequests') {
      setLeaveRequests(data);
    }
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        darkMode,
        setDarkMode,
        toggleDarkMode,

        selectedMonth,
        setSelectedMonth,
        selectedDepartment,
        setSelectedDepartment,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,

        departments,
        employees,
        contracts,
        leaveRequests,
        leaveQuotas,
        attendance,
        payroll,

        currentMonthAttendance,
        currentMonthPayroll,

        actionItems,
        approveLeaveRequest,
        rejectLeaveRequest,
        resolveActionItem,

        selectedEmployee360,
        setSelectedEmployee360,
        selectedPayslip,
        setSelectedPayslip,

        isApiKeyModalOpen,
        setIsApiKeyModalOpen,
        isAIAssistantOpen,
        setIsAIAssistantOpen,

        loadSampleData,
        updateDataFromUpload,
        refreshData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
