import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  getStoredApiKey, 
  saveApiKey, 
  getStoredModel, 
  saveModel 
} from '../services/geminiService';

export const ApiKeyModal: React.FC = () => {
  const { isApiKeyModalOpen, setIsApiKeyModalOpen } = useApp();

  const [inputKey, setInputKey] = useState<string>(() => getStoredApiKey());
  const [selectedModel, setSelectedModel] = useState<string>(() => getStoredModel());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isApiKeyModalOpen) return null;

  const handleSave = () => {
    saveApiKey(inputKey);
    saveModel(selectedModel);
    setTestResult({ success: true, message: 'Đã lưu API Key và Cấu hình mô hình thành công!' });
    setTimeout(() => {
      setIsApiKeyModalOpen(false);
      setTestResult(null);
    }, 1200);
  };

  const handleTestConnection = async () => {
    if (!inputKey.trim()) {
      setTestResult({ success: false, message: 'Vui lòng nhập API Key trước khi kiểm tra.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${inputKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Trả lời đúng 1 chữ: OK' }] }],
          generationConfig: { maxOutputTokens: 10 }
        })
      });

      if (res.ok) {
        setTestResult({
          success: true,
          message: `Kết nối thành công tới mô hình ${selectedModel}! Gemini API sẵn sàng.`
        });
      } else {
        const errorText = await res.text();
        setTestResult({
          success: false,
          message: `Lỗi kết nối (${res.status}): ${errorText.slice(0, 150)}...`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Lỗi mạng hoặc CORS: ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    saveApiKey('');
    setInputKey('');
    setTestResult({ success: true, message: 'Đã xóa API Key. Hệ thống chuyển về Chế độ Phân tích Chuyên gia Nội bộ.' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Cài Đặt Gemini API Key
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Google AI Studio • Lưu trữ an toàn trong localStorage
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsApiKeyModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/60 text-xs text-brand-900 dark:text-brand-200 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Bảo mật tuyệt đối:</strong> Khóa API chỉ được lưu tại trình duyệt cục bộ của bạn, không gửi về bất kỳ máy chủ trung gian nào. Tuyệt đối không hardcode key vào mã nguồn.
            </div>
          </div>

          {/* Input API Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Google Gemini API Key (Bắt đầu bằng AIzaSy...)
            </label>
            <input
              type="password"
              placeholder="Dán mã khóa AIzaSy... tại đây"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex justify-between items-center pt-1 text-[11px] text-slate-500">
              <span>Chưa có khóa?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center space-x-1"
              >
                <span>Lấy mã miễn phí tại Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Mô hình AI Ưu Tiên (Hỗ trợ Fallback tự động khi 429)
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="gemini-3-flash">gemini-3-flash (Khuyến nghị - Mặc định)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Tốc độ cao, tiết kiệm token)</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash (Ổn định dự phòng)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (Nâng cao)</option>
            </select>
          </div>

          {/* Feedback Test Result */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-start space-x-2 ${
              testResult.success
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <div>{testResult.message}</div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClear}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors"
            >
              Xóa Key / Chế độ Offline
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
              >
                {testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-colors"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
