import React from 'react';
import { 
  Building2, 
  Sparkles, 
  Key, 
  Sun, 
  Moon, 
  Calendar, 
  Bot, 
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getStoredApiKey } from '../services/geminiService';

export const Header: React.FC = () => {
  const { 
    darkMode, 
    toggleDarkMode, 
    selectedMonth, 
    setSelectedMonth, 
    loadSampleData,
    searchQuery,
    setSearchQuery,
    setIsApiKeyModalOpen,
    setIsAIAssistantOpen,
    refreshData
  } = useApp();

  const apiKey = getStoredApiKey();
  const hasKey = !!apiKey;

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Branding & Role */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-800 to-brand-700 flex items-center justify-center text-amber-400 shadow-md shadow-brand-900/10 flex-shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate tracking-tight">
                  HỆ THỐNG ĐIỀU HÀNH NHÂN SỰ & TIỀN LƯƠNG
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200 border border-brand-200 dark:border-brand-700">
                  CÔNG TY A
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Smart HRM & Payroll Dashboard dành cho Ban Giám đốc & Phòng HCNS
              </p>
            </div>
          </div>

          {/* Center: Search & Month Selector */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Global Quick Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm Mã NV, Tên, CCCD..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Month Filter Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-1.5" />
              {(['07/2026', '08/2026', '09/2026', '10/2026'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    selectedMonth === m
                      ? 'bg-brand-800 text-white shadow-sm dark:bg-amber-600'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            {/* Pulsing Sample Data Button */}
            <button
              onClick={loadSampleData}
              title="Nạp ngay bộ dữ liệu mẫu 50 nhân sự Công ty A"
              className="pulse-breathe inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-spin text-amber-200" style={{ animationDuration: '6s' }} />
              <span className="hidden sm:inline">⚡ Nạp dữ liệu thử nghiệm</span>
              <span className="sm:hidden">⚡ Mẫu</span>
            </button>

            {/* AI Assistant Quick Trigger */}
            <button
              onClick={() => setIsAIAssistantOpen(true)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-all"
              title="Mở Trợ lý AI Nhân sự & Hỏi đáp bằng giọng nói"
            >
              <Bot className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="hidden md:inline">Trợ lý AI</span>
            </button>

            {/* API Key Modal Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
              title="Cài đặt mã khóa Gemini API"
            >
              <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Cài đặt API Key</span>
              {/* Connection status indicator */}
              <span className="flex h-2 w-2 relative">
                {hasKey ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" title="API Key đã sẵn sàng"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" title="Chế độ Offline/Nội bộ"></span>
                )}
              </span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? "Chuyển sang chế độ Sáng" : "Chuyển sang chế độ Tối"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
