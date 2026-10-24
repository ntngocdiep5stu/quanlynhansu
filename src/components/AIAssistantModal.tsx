import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  User, 
  CornerDownLeft,
  Volume2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askGeminiHRQuestion } from '../services/geminiService';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AIAssistantModal: React.FC = () => {
  const { 
    isAIAssistantOpen, 
    setIsAIAssistantOpen,
    employees,
    contracts,
    leaveRequests,
    selectedMonth 
  } = useApp();

  const [input, setInput] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Xin chào Ban Giám đốc và Phòng HCNS Công ty A! Tôi là Trợ lý AI Cố vấn Nhân sự & Tiền lương (Gemini 3 Flash). Bạn có thể hỏi tôi bất kỳ điều gì về 50 nhân sự, hợp đồng sắp hết hạn, chấm công tăng ca hay phân bổ quỹ lương.`,
      time: '08:00'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Setup Web Speech API for voice recording
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói Web Speech API hoặc chưa cấp quyền Mic. Bạn có thể gõ văn bản trực tiếp.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSend = async (questionText?: string) => {
    const query = (questionText || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const expiringContracts = contracts
      .filter(c => c.status === 'Sắp hết hạn')
      .map(c => `${c.employeeId} - ${c.name} (${c.expiryDate})`);

    const pendingLeaves = leaveRequests
      .filter(l => l.status === 'Chờ duyệt')
      .map(l => `${l.requestNumber}: ${l.name}`);

    const contextData = {
      totalEmployees: employees.length,
      expiringContracts,
      pendingLeaves,
      selectedMonth
    };

    const aiReplyText = await askGeminiHRQuestion(query, contextData);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiReplyText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  if (!isAIAssistantOpen) return null;

  const quickQuestions = [
    'Phân tích biến động lương tháng 9 so với tháng 8',
    'Ai có nguy cơ rủi ro hết hạn hợp đồng lao động?',
    'Đề xuất giải pháp giảm chi phí OT cho Xưởng Sản xuất',
    'Hướng dẫn thủ tục ký HĐ chính thức cho TP0008 và TP0049'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[82vh]"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-800 to-brand-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-bold">
                    Trợ Lý AI Nhân Sự & Tiền Lương
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                    Gemini 3 Flash
                  </span>
                </div>
                <p className="text-xs text-emerald-200">
                  Hỏi đáp nghiệp vụ Nhân sự, Tiền lương và Luật Lao động
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAIAssistantOpen(false)}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-semibold uppercase flex-shrink-0 pl-1">Gợi ý:</span>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-slate-700 dark:text-slate-300 whitespace-nowrap shadow-xs hover:text-amber-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-brand-800 text-amber-400 font-bold'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <div className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-amber-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-800 text-amber-400 flex items-center justify-center text-xs flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  <span>Trợ lý AI đang suy nghĩ và tổng hợp số liệu...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice status feedback */}
          {isRecording && (
            <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-300 text-xs flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                <strong>Đang lắng nghe giọng nói của bạn...</strong> (Hãy nói câu hỏi bằng tiếng Việt)
              </span>
              <button
                onClick={toggleRecording}
                className="text-[11px] underline font-bold"
              >
                Dừng thu
              </button>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2">
            <button
              onClick={toggleRecording}
              className={`p-2.5 rounded-xl border transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title={isRecording ? 'Dừng thu âm' : 'Hỏi bằng giọng nói (Speech-to-Text)'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-600" />}
            </button>

            <input
              type="text"
              placeholder="Nhập câu hỏi cho Trợ lý AI (ví dụ: Báo cáo biến động lương T09)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
