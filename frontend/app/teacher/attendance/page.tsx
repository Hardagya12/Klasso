"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../providers";
import { apiData } from "../../../lib/api";

// ═══════════════════════════════════════════════
//  INLINE SVG DOODLES
// ═══════════════════════════════════════════════

const CheckmarkDoodle = ({ size = 36, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 26 L18 38 L42 12" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 24 L18 36 L42 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
  </svg>
);

const SquiggleSVG = ({ width = 160, color = "#F5A623" }: { width?: number; color?: string }) => (
  <svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none">
    <path
      d={`M4 6 C${width * 0.1} 2, ${width * 0.2} 10, ${width * 0.3} 6 S${width * 0.5} 2, ${width * 0.6} 6 S${width * 0.8} 10, ${width - 4} 6`}
      stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"
    />
  </svg>
);

const CalendarDoodle = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <rect x="7" y="13" width="3" height="3" rx="0.5" fill="#F5A623"/>
    <rect x="13" y="13" width="3" height="3" rx="0.5" fill="#4A90D9"/>
  </svg>
);

const PencilDoodle = ({ size = 20, color = "#2C2A24" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20H21"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="#F5A623" fillOpacity="0.3"/>
  </svg>
);

const MicDoodle = ({ size = 20, isListening = false, color = "#2C2A24" }: { size?: number; isListening?: boolean; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={isListening ? "#E8534A" : color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isListening ? "animate-pulse" : ""}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const SparkleDoodle = ({ size = 20, color = "#4A90D9" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" fill={color} opacity="0.2"/>
  </svg>
);

const XDoodle = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="#E8534A" strokeWidth="3" strokeLinecap="round">
    <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
  </svg>
);

const ClockMiniDoodle = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round">
    <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
  </svg>
);

const CheckMiniDoodle = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="#5BAD6F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8 L6 11 L13 4"/>
  </svg>
);

const DownArrowDoodle = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const GridTabDoodle = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);

const QRTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/>
  </svg>
);

const ExportIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const NotebookSpiralDoodle = ({ height = 600 }: { height?: number }) => (
  <svg width="24" height={height} viewBox={`0 0 24 ${height}`} fill="none">
    <line x1="12" y1="0" x2="12" y2={height} stroke="#E8E4D9" strokeWidth="2"/>
    {Array.from({ length: Math.floor(height / 28) }).map((_, i) => (
      <ellipse key={i} cx="12" cy={14 + i * 28} rx="8" ry="5"
        stroke="#4A90D9" strokeWidth="2" strokeOpacity="0.35" fill="none"/>
    ))}
  </svg>
);

const ClipboardDoodle = ({ size = 120, opacity = 0.12 }: { size?: number; opacity?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 130" fill="none" opacity={opacity}>
    <rect x="10" y="15" width="80" height="110" rx="4" fill="#2C2A24" stroke="#2C2A24" strokeWidth="2"/>
    <rect x="35" y="8" width="30" height="16" rx="4" fill="#2C2A24" stroke="#2C2A24" strokeWidth="2"/>
    <line x1="22" y1="40" x2="78" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <line x1="22" y1="55" x2="78" y2="55" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="68" x2="60" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="81" x2="70" y2="81" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const StarburstDoodle = ({ size = 40, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M20 2L22.5 15L35 10L27 20L38 22.5L27 25L35 35L22.5 28L20 40L17.5 28L5 35L13 25L2 22.5L13 20L5 10L17.5 15Z"
      fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8"/>
  </svg>
);

const RulerDoodle = ({ width = 220 }: { width?: number }) => (
  <svg width={width} height="24" viewBox={`0 0 ${width} 24`} fill="none">
    <rect x="2" y="6" width={width - 4} height="12" rx="2" fill="#4A90D9" fillOpacity="0.15" stroke="#2C2A24" strokeWidth="2"/>
    {Array.from({ length: Math.floor((width - 20) / 12) }).map((_, i) => (
      <line key={i} x1={16 + i * 12} y1="6" x2={16 + i * 12} y2={i % 2 === 0 ? "12" : "15"} stroke="#2C2A24" strokeWidth="1.5"/>
    ))}
  </svg>
);

// ═══════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════

type StudentRecord = {
  student_id: string;
  roll_no: string;
  name: string;
  avatar_url?: string | null;
  status: string;
  remark?: string | null;
};

type ClassInfo = {
  id: string;
  name: string;
  section: string;
};

type AttendanceData = {
  date: string;
  class_id: string;
  session: unknown;
  summary: { present: number; absent: number; late: number; excused: number; unmarked: number; total: number };
  records: StudentRecord[];
};

// ═══════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════

const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase();

const avatarColor = (id: string) => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return ["#FFD6E0","#D6EAF8","#D5F5E3","#FEF9E7","#F9EBEA","#E8DAEF"][hash % 6];
};

const statusToShort = (s: string): "P" | "A" | "L" => {
  if (s === "absent") return "A";
  if (s === "late") return "L";
  return "P";
};

const shortToLong = (s: "P" | "A" | "L"): string => {
  if (s === "A") return "absent";
  if (s === "L") return "late";
  return "present";
};

// ═══════════════════════════════════════════════
//  QUICK MARK TAB (Dynamic)
// ═══════════════════════════════════════════════

function QuickMark({ classId, students, statusMap, setStatusMap, saving, onSave, reloadData }: {
  classId: string;
  students: StudentRecord[];
  statusMap: Record<string, "P" | "A" | "L">;
  setStatusMap: React.Dispatch<React.SetStateAction<Record<string, "P" | "A" | "L">>>;
  saving: boolean;
  onSave: () => void;
  reloadData: () => void;
}) {
  const counts = {
    P: Object.values(statusMap).filter(v => v === "P").length,
    A: Object.values(statusMap).filter(v => v === "A").length,
    L: Object.values(statusMap).filter(v => v === "L").length,
  };

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [textCommand, setTextCommand] = useState("");

  const handleVoiceCommand = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setTranscript("Voice not supported — type your command below instead.");
      setTimeout(() => setTranscript(""), 4000);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("🎤 Listening… speak now");
      setAiSummary("");
    };

    recognition.onresult = async (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setTextCommand(result);
      processAiCommand(result);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'no-speech') {
        setTranscript("No speech detected — try again or type your command below.");
      } else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setTranscript("Microphone access denied. Please allow mic access or type your command.");
      } else {
        setTranscript("Voice failed — you can type your command instead.");
      }
      setTimeout(() => setTranscript(""), 5000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textCommand.trim() || aiProcessing) return;
    setTranscript(textCommand);
    processAiCommand(textCommand.trim());
    setTextCommand("");
  };

  const processAiCommand = async (command: string) => {
    setAiProcessing(true);
    setTranscript(`Processing: "${command}"...`);
    try {
      const data = await apiData<{
        session_id: string;
        records: { student_id: string; name: string; roll_no: string; status: string }[];
        ai_summary: string;
        summary: { present: number; absent: number; late: number; total: number };
      }>("/api/attendance/voice-ai", {
        method: "POST",
        body: JSON.stringify({ class_id: classId, command }),
      });

      // Update the status map from AI response
      const newMap: Record<string, "P" | "A" | "L"> = {};
      for (const rec of data.records) {
        newMap[rec.student_id] = rec.status as "P" | "A" | "L";
      }
      setStatusMap(newMap);
      setAiSummary(data.ai_summary);
      setTranscript(`✓ ${data.ai_summary}`);

      // Reload data from server since it's already saved
      setTimeout(() => {
        reloadData();
      }, 500);

      setTimeout(() => setTranscript(""), 6000);
    } catch (e: any) {
      console.error(e);
      setTranscript(e.message || "Error processing voice command.");
      setTimeout(() => setTranscript(""), 4000);
    } finally {
      setAiProcessing(false);
    }
  };

  const borderFor = (s: "P" | "A" | "L") =>
    s === "P" ? "border-l-[5px] border-l-[#5BAD6F]"
    : s === "A" ? "border-l-[5px] border-l-[#E8534A]"
    : "border-l-[5px] border-l-[#F5A623]";

  return (
    <div className="relative">
      {/* Class selector */}
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="relative inline-flex items-center gap-3 border-2 border-[#2C2A24] rounded-[10px] px-5 py-2.5 bg-[#FFFFFF] shadow-[3px_3px_0px_#2C2A24] hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              <PencilDoodle size={16}/>
              <span className="font-heading font-bold text-[#2C2A24]">Class 8-A · Mathematics · Period 3</span>
              <DownArrowDoodle size={16}/>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStatusMap(Object.fromEntries(students.map(s => [s.student_id, "P"])) as any)}
              className="text-xs font-heading font-bold px-3 py-1.5 rounded-lg border-2 border-[#5BAD6F] bg-[#D5F5E3] hover:bg-[#5BAD6F] hover:text-white transition-colors">
              ✓ All Present
            </button>
            <button onClick={() => setStatusMap(Object.fromEntries(students.map(s => [s.student_id, "A"])) as any)}
              className="text-xs font-heading font-bold px-3 py-1.5 rounded-lg border-2 border-[#E8534A] bg-[#FDEDEC] hover:bg-[#E8534A] hover:text-white transition-colors">
              ✗ All Absent
            </button>
          </div>
        </div>

        {/* AI Voice + Text Command Bar */}
        <div className={`mt-2 flex flex-col gap-0 bg-white border-2 border-[#2C2A24] rounded-[16px] shadow-[4px_4px_0px_rgba(44,42,36,0.1)] transition-all overflow-hidden ${isListening || aiProcessing ? 'ring-2 ring-[#4A90D9] ring-offset-2' : ''}`}>
          {/* Top row: mic + status */}
          <div className="flex items-center gap-4 p-2 pr-4">
            <button 
              onClick={handleVoiceCommand}
              disabled={isListening || aiProcessing}
              title="Click to speak a voice command"
              className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[10px] border-2 border-[#2C2A24] transition-all ${isListening ? 'bg-[#FDEDEC] shadow-none translate-x-[2px] translate-y-[2px]' : aiProcessing ? 'bg-[#FDFBF5] cursor-not-allowed' : 'bg-[#D6EAF8] hover:bg-[#4A90D9] shadow-[2px_2px_0px_#2C2A24] hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[1px] hover:translate-y-[1px]'}`}
            >
              {aiProcessing ? <SparkleDoodle size={24} color="#4A90D9" /> : <MicDoodle size={24} isListening={isListening} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-bold text-[#2C2A24] truncate flex items-center gap-2">
                {aiProcessing ? "AI is thinking..." : isListening ? "Listening..." : "Ask AI to mark attendance"}
                {(aiProcessing || isListening) && <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#4A90D9] rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                  <span className="w-1.5 h-1.5 bg-[#4A90D9] rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                  <span className="w-1.5 h-1.5 bg-[#4A90D9] rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                </span>}
              </p>
              <p className={`font-body text-sm truncate ${transcript && !transcript.includes("Ask AI") ? 'text-[#4A90D9] font-medium' : 'text-[#7A7670]'}`}>
                {transcript || 'Speak or type: "Mark all present except Aarav and Divya"'}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 opacity-50">
              <SparkleDoodle size={16}/>
              <span className="text-xs font-accent font-bold uppercase tracking-wider text-[#7A7670]">Powered by Gemini</span>
            </div>
          </div>

          {/* Bottom row: text input */}
          <form onSubmit={handleTextSubmit} className="flex items-center gap-2 px-3 pb-2.5 pt-0">
            <div className="flex-1 relative">
              <input
                type="text"
                value={textCommand}
                onChange={(e) => setTextCommand(e.target.value)}
                disabled={aiProcessing || isListening}
                placeholder='Type command: "Mark all present except Aarav" …'
                className="w-full px-4 py-2.5 bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-[10px] font-body text-sm text-[#2C2A24] placeholder:text-[#B5B0A8] focus:outline-none focus:border-[#4A90D9] focus:ring-1 focus:ring-[#4A90D9] transition-all disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={!textCommand.trim() || aiProcessing || isListening}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4A90D9] border-2 border-[#2C2A24] rounded-[10px] font-heading font-bold text-white text-sm shadow-[2px_2px_0px_#2C2A24] hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[2px_2px_0px_#2C2A24] disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              <SparkleDoodle size={16} color="#fff"/>
              Send
            </button>
          </form>
        </div>

        {/* AI Summary Banner */}
        {aiSummary && (
          <div className="flex items-center gap-3 bg-[#D6EAF8] border-2 border-[#4A90D9] rounded-[12px] px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
            <SparkleDoodle size={20} color="#4A90D9"/>
            <p className="font-body text-sm text-[#2C2A24] font-medium">{aiSummary}</p>
            <button onClick={() => setAiSummary("")} className="ml-auto text-[#7A7670] hover:text-[#2C2A24]">✕</button>
          </div>
        )}
      </div>

      {/* Student grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-32">
        {students.map(s => {
          const st = statusMap[s.student_id] || "P";
          return (
            <div key={s.student_id}
              className={`bg-[#FFFFFF] rounded-[14px] border-2 border-[#E8E4D9] p-4 shadow-[3px_3px_0px_#E8E4D9] relative transition-all duration-200 ${borderFor(st)}`}>
              <div className="absolute top-2 right-2">
                {st === "P" && <CheckMiniDoodle size={16}/>}
                {st === "A" && <XDoodle size={14}/>}
                {st === "L" && <ClockMiniDoodle size={14}/>}
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-extrabold text-sm border-2 border-[#2C2A24] mb-2"
                style={{ backgroundColor: avatarColor(s.student_id) }}>
                {initials(s.name)}
              </div>
              <p className="font-body font-semibold text-[#2C2A24] text-sm leading-tight truncate">{s.name}</p>
              <p className="font-accent font-bold text-xs text-[#7A7670] mb-3">#{s.roll_no}</p>

              <div className="flex gap-1.5">
                {(["P","A","L"] as const).map(opt => {
                  const cfg = {
                    P: { label:"P", bg:"#5BAD6F", light:"#D5F5E3", border:"#5BAD6F" },
                    A: { label:"A", bg:"#E8534A", light:"#FDEDEC", border:"#E8534A" },
                    L: { label:"L", bg:"#F5A623", light:"#FEF9E7", border:"#F5A623" },
                  }[opt];
                  const active = st === opt;
                  return (
                    <button key={opt}
                      onClick={() => setStatusMap(prev => ({ ...prev, [s.student_id]: opt }))}
                      className="flex-1 py-1 rounded-[6px] border-2 text-xs font-heading font-extrabold transition-all"
                      style={{
                        backgroundColor: active ? cfg.bg : cfg.light,
                        borderColor: cfg.border,
                        color: active ? "#fff" : cfg.bg,
                        transform: active ? "scale(1.08)" : "scale(1)",
                        boxShadow: active ? `1px 1px 0px #2C2A24` : "none",
                      }}>
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-[240px] right-0 z-50 bg-[#FDFBF5] border-t-2 border-[#E8E4D9] px-8 py-4 flex items-center justify-between shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-body text-[#7A7670]">Today&apos;s Summary:</span>
          <span className="px-3 py-1 rounded-full bg-[#D5F5E3] border-2 border-[#5BAD6F] text-[#5BAD6F] font-heading font-bold text-sm">{counts.P} Present</span>
          <span className="px-3 py-1 rounded-full bg-[#FDEDEC] border-2 border-[#E8534A] text-[#E8534A] font-heading font-bold text-sm">{counts.A} Absent</span>
          <span className="px-3 py-1 rounded-full bg-[#FEF9E7] border-2 border-[#F5A623] text-[#F5A623] font-heading font-bold text-sm">{counts.L} Late</span>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#F5A623] border-2 border-[#2C2A24] rounded-[12px] px-7 py-3 font-heading font-extrabold shadow-[4px_4px_0px_#2C2A24] hover:shadow-[2px_2px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all disabled:opacity-50">
          <PencilDoodle size={18} color="#2C2A24"/>
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MONTHLY VIEW TAB (Dynamic)
// ═══════════════════════════════════════════════

function MonthlyView({ classId, students }: { classId: string; students: StudentRecord[] }) {
  const [monthData, setMonthData] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

  useEffect(() => {
    const loadMonthlyData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const data: Record<string, Record<string, string>> = {};
        
        // Fetch last 30 days of attendance
        for (let d = 30; d >= 1; d--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (30 - d));
          if (date.getDay() === 0 || date.getDay() === 6) continue;
          const dateStr = date.toISOString().split('T')[0];
          
          try {
            const dayData = await apiData<AttendanceData>(`/api/attendance?class_id=${classId}&date=${dateStr}`);
            for (const rec of dayData.records) {
              if (!data[rec.student_id]) data[rec.student_id] = {};
              data[rec.student_id][String(d)] = rec.status;
            }
          } catch { /* skip days with no data */ }
        }
        setMonthData(data);
      } catch (e) {
        console.error("Failed to load monthly data:", e);
      }
      setLoading(false);
    };
    if (classId) loadMonthlyData();
  }, [classId]);

  const dotColor: Record<string, string> = {
    present: "#5BAD6F",
    absent:  "#E8534A",
    late:    "#F5A623",
    unmarked: "#E8E4D9",
  };

  const studentPct = (sid: string) => {
    const days = monthData[sid] || {};
    const dayValues = Object.values(days);
    const total = dayValues.filter(s => s !== 'unmarked').length;
    const present = dayValues.filter(s => s === 'present' || s === 'late').length;
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#F5A623] border-t-transparent rounded-full animate-spin"/>
          <p className="font-heading font-bold text-[#7A7670]">Loading monthly data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <RulerDoodle width={320}/>
        <span className="font-accent text-[#7A7670] font-bold shrink-0">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      <div className="flex gap-4 mb-4 flex-wrap">
        {(["present","absent","late","unmarked"] as const).map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-[#2C2A24]" style={{ backgroundColor: dotColor[s]}}/>
            <span className="text-xs font-heading font-bold capitalize text-[#7A7670]">{s}</span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[16px] border-2 border-[#E8E4D9] shadow-[3px_3px_0px_#E8E4D9]">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#FDFBF5] border-b-2 border-[#E8E4D9]">
              <th className="text-left px-4 py-3 font-heading font-bold text-[#7A7670] text-sm min-w-[160px] rounded-tl-[14px] sticky left-0 bg-[#FDFBF5] z-10">Student</th>
              {DAYS.map(d => (
                <th key={d} className="px-1.5 py-3 font-accent font-bold text-[#7A7670] text-sm min-w-[28px] text-center">{d}</th>
              ))}
              <th className="px-3 py-3 font-heading font-bold text-[#7A7670] text-sm min-w-[80px] text-center rounded-tr-[14px] sticky right-0 bg-[#FDFBF5] z-10">%</th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 10).map((s, si) => {
              const pct = studentPct(s.student_id);
              return (
                <tr key={s.student_id} className={`border-b border-[#E8E4D9] ${si % 2 === 0 ? "bg-white" : "bg-[#FDFBF5]"}`}>
                  <td className={`px-4 py-2.5 sticky left-0 z-10 ${si % 2 === 0 ? "bg-white" : "bg-[#FDFBF5]"}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs border border-[#2C2A24] shrink-0"
                        style={{ backgroundColor: avatarColor(s.student_id) }}>
                        {initials(s.name)}
                      </div>
                      <span className="font-body text-sm text-[#2C2A24] font-medium">{s.name}</span>
                    </div>
                  </td>
                  {DAYS.map(d => {
                    const st = monthData[s.student_id]?.[String(d)] || 'unmarked';
                    return (
                      <td key={d} className="px-1.5 py-2.5 text-center">
                        <div className="w-4 h-4 rounded-full mx-auto border border-white"
                          style={{ backgroundColor: dotColor[st] || dotColor.unmarked, boxShadow: "0 0 0 1px rgba(0,0,0,0.08)"}}
                          title={`${s.name} — Day ${d}: ${st}`}
                        />
                      </td>
                    );
                  })}
                  <td className={`px-3 py-2.5 sticky right-0 z-10 ${si % 2 === 0 ? "bg-white" : "bg-[#FDFBF5]"}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-heading font-extrabold text-sm ${pct >= 75 ? "text-[#5BAD6F]" : "text-[#E8534A]"}`}>{pct}%</span>
                      <div className="w-12 h-1.5 bg-[#E8E4D9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 75 ? "#5BAD6F" : "#E8534A"}}/>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════

type Tab = "quick" | "qr" | "monthly";

export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("quick");
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, "P" | "A" | "L">>({});
  const [classId, setClassId] = useState<string>("");
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  // Load classes the teacher has
  useEffect(() => {
    const loadClasses = async () => {
      try {
        // The classes endpoint returns paginated data
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/classes?limit=100`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("klasso_token")}`,
            },
          }
        );
        const json = await res.json();
        const cls: ClassInfo[] = json.data || [];
        setClasses(cls);
        if (cls.length > 0) {
          // Prefer class 8-A if it exists  
          const c8a = cls.find((c: ClassInfo) => c.name === '8' && c.section === 'A');
          setClassId(c8a?.id || cls[0].id);
        }
      } catch (e) {
        console.error("Failed to load classes", e);
      }
    };
    if (!authLoading && user) loadClasses();
  }, [authLoading, user]);

  // Load attendance data for selected class
  const loadAttendance = useCallback(async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const data = await apiData<AttendanceData>(`/api/attendance?class_id=${classId}&date=${today}`);
      setStudents(data.records || []);
      const map: Record<string, "P" | "A" | "L"> = {};
      for (const rec of (data.records || [])) {
        map[rec.student_id] = statusToShort(rec.status);
      }
      setStatusMap(map);
    } catch (e) {
      console.error("Failed to load attendance", e);
    }
    setLoading(false);
  }, [classId]);

  useEffect(() => {
    if (classId) loadAttendance();
  }, [classId, loadAttendance]);

  // Save attendance
  const handleSave = async () => {
    if (!classId || students.length === 0) return;
    setSaving(true);
    setSaveMessage("");
    try {
      const records = students.map(s => ({
        student_id: s.student_id,
        status: shortToLong(statusMap[s.student_id] || "P"),
      }));
      await apiData("/api/attendance/mark", {
        method: "POST",
        body: JSON.stringify({ class_id: classId, records }),
      });
      setSaveMessage("Attendance saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (e: any) {
      setSaveMessage("Error: " + (e.message || "Failed to save"));
    }
    setSaving(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string; border: string; active_bg: string }[] = [
    { id: "quick",   label: "Quick Mark",    icon: <PencilDoodle size={16}/>,  color: "#FEF3DC", border: "#F5A623", active_bg: "#F5A623" },
    { id: "qr",      label: "QR Mode",       icon: <QRTabIcon/>,               color: "#D6EAF8", border: "#4A90D9", active_bg: "#4A90D9" },
    { id: "monthly", label: "Monthly View",  icon: <GridTabDoodle size={16}/>, color: "#FDFBF5", border: "#7A7670", active_bg: "#2C2A24" },
  ];

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
        <Sidebar />
        <main className="flex-1 ml-[240px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#F5A623] border-t-transparent rounded-full animate-spin"/>
            <p className="font-heading font-bold text-[#7A7670]">Loading attendance...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Sidebar />

      <div className="fixed left-[240px] top-0 bottom-0 z-30 pointer-events-none">
        <NotebookSpiralDoodle height={2000}/>
      </div>
      <div className="fixed top-16 right-6 z-20 pointer-events-none">
        <ClipboardDoodle size={130} opacity={0.12}/>
      </div>
      <div className="fixed top-28 right-40 z-10 pointer-events-none opacity-30">
        <StarburstDoodle size={44}/>
      </div>
      <div className="fixed bottom-24 right-64 z-10 pointer-events-none opacity-20">
        <StarburstDoodle size={30} color="#4A90D9"/>
      </div>

      <main className="flex-1 ml-[240px] pl-10 pr-8 py-10 max-w-none relative">
        {/* Save success toast */}
        {saveMessage && (
          <div className={`fixed top-6 right-6 z-[100] px-6 py-3 rounded-[12px] border-2 font-heading font-bold text-sm shadow-[4px_4px_0px_#2C2A24] animate-[fadeIn_0.3s_ease-out] ${saveMessage.startsWith("Error") ? 'bg-[#FDEDEC] border-[#E8534A] text-[#E8534A]' : 'bg-[#D5F5E3] border-[#5BAD6F] text-[#5BAD6F]'}`}>
            {saveMessage}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CheckmarkDoodle size={40} color="#F5A623"/>
              <h1 className="text-4xl font-extrabold text-[#2C2A24]" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Attendance
              </h1>
            </div>
            <SquiggleSVG width={200} color="#F5A623"/>
            <p className="text-[#7A7670] font-body mt-2 text-sm">
              Mark, track and export attendance records
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 border-2 border-[#2C2A24] rounded-[10px] px-4 py-2 bg-white shadow-[2px_2px_0px_#2C2A24]">
              <CalendarDoodle size={18}/>
              <span className="text-[#2C2A24] font-bold" style={{ fontFamily: '"Caveat", cursive', fontSize: "18px" }}>
                Today: {todayStr} ✦
              </span>
            </div>
            <button className="flex items-center gap-2 border-2 border-[#2C2A24] bg-white rounded-[10px] px-5 py-2.5 font-heading font-bold shadow-[4px_4px_0px_#2C2A24] hover:shadow-[2px_2px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              style={{ fontFamily: '"Nunito", sans-serif' }}>
              <ExportIcon size={16}/>
              Export Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-end gap-0 mb-8 border-b-2 border-[#E8E4D9]">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-6 py-3 border-2 border-b-0 rounded-t-[12px] font-heading font-bold text-sm transition-all cursor-pointer mr-1"
                style={{
                  fontFamily: '"Nunito", sans-serif',
                  backgroundColor: isActive ? tab.active_bg : tab.color,
                  borderColor: tab.border,
                  color: isActive ? "#fff" : "#2C2A24",
                  transform: isActive ? "translateY(2px)" : "translateY(4px)",
                  zIndex: isActive ? 10 : 1,
                  boxShadow: isActive ? "0 -2px 0 " + tab.active_bg : "none",
                  marginBottom: isActive ? "-2px" : "0",
                }}>
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="relative">
          {activeTab === "quick" && (
            <QuickMark
              classId={classId}
              students={students}
              statusMap={statusMap}
              setStatusMap={setStatusMap}
              saving={saving}
              onSave={handleSave}
              reloadData={loadAttendance}
            />
          )}
          {activeTab === "qr" && (
            <div className="flex flex-col items-center py-10">
              <p className="font-body text-[#7A7670] mb-4">QR Mode coming soon — use Quick Mark or Voice AI</p>
            </div>
          )}
          {activeTab === "monthly" && (
            <MonthlyView classId={classId} students={students}/>
          )}
        </div>
      </main>
    </div>
  );
}
