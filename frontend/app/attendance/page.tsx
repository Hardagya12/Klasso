"use client";

import React, { useState } from "react";

// ═══════════════════════════════════════════════
//  INLINE SVG DOODLES
// ═══════════════════════════════════════════════

const CheckmarkDoodle = ({ size = 36, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 26 L18 38 L42 12" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 24 L18 36 L42 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
  </svg>
);

const SquiggleSVG = ({ width = 160, color = "#F5A623" }) => (
  <svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none">
    <path
      d={`M4 6 C${width * 0.1} 2, ${width * 0.2} 10, ${width * 0.3} 6 S${width * 0.5} 2, ${width * 0.6} 6 S${width * 0.8} 10, ${width - 4} 6`}
      stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"
    />
  </svg>
);

const CalendarDoodle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <rect x="7" y="13" width="3" height="3" rx="0.5" fill="#F5A623"/>
    <rect x="13" y="13" width="3" height="3" rx="0.5" fill="#4A90D9"/>
  </svg>
);

const PencilDoodle = ({ size = 20, color = "#2C2A24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20H21"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="#F5A623" fillOpacity="0.3"/>
  </svg>
);

const QRDoodle = ({ size = 180 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="#2C2A24">
    {/* Top-left box */}
    <rect x="5" y="5" width="30" height="30" rx="2" strokeWidth="3"/>
    <rect x="11" y="11" width="18" height="18" rx="1" fill="#2C2A24"/>
    {/* Top-right box */}
    <rect x="65" y="5" width="30" height="30" rx="2" strokeWidth="3"/>
    <rect x="71" y="11" width="18" height="18" rx="1" fill="#2C2A24"/>
    {/* Bottom-left box */}
    <rect x="5" y="65" width="30" height="30" rx="2" strokeWidth="3"/>
    <rect x="11" y="71" width="18" height="18" rx="1" fill="#2C2A24"/>
    {/* Data cells */}
    {[
      [42,5],[50,5],[58,5],[42,13],[58,13],[42,21],[50,21],
      [5,42],[13,42],[21,42],[5,50],[21,50],[13,58],[21,58],
      [42,42],[58,42],[50,50],[42,58],[58,58],
      [66,42],[74,42],[66,58],[82,50],[90,42],[90,50],[90,58],
      [42,66],[50,74],[58,66],[42,82],[58,82],[50,90],[66,66],[74,74],[82,66],[90,74],[82,82],[90,90],
    ].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width="6" height="6" rx="0.5" fill="#2C2A24"/>
    ))}
  </svg>
);

const DottedFrameDoodle = ({ size = 240 }) => (
  <svg width={size} height={size} viewBox="0 0 240 240" fill="none">
    <rect x="4" y="4" width="232" height="232" rx="8"
      stroke="#2C2A24" strokeWidth="2.5" strokeDasharray="8 5"
      strokeLinecap="round"/>
    {/* Corner doodles */}
    <path d="M14 14 L30 14 M14 14 L14 30" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/>
    <path d="M226 14 L210 14 M226 14 L226 30" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/>
    <path d="M14 226 L30 226 M14 226 L14 210" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/>
    <path d="M226 226 L210 226 M226 226 L226 210" stroke="#F5A623" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const TimerDoodle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="13" r="9"/>
    <path d="M12 8v5l3 3"/>
    <path d="M9 2h6M12 2v2"/>
  </svg>
);

const RulerDoodle = ({ width = 220 }) => (
  <svg width={width} height="24" viewBox={`0 0 ${width} 24`} fill="none">
    <rect x="2" y="6" width={width - 4} height="12" rx="2" fill="#4A90D9" fillOpacity="0.15" stroke="#2C2A24" strokeWidth="2"/>
    {Array.from({ length: Math.floor((width - 20) / 12) }).map((_, i) => (
      <line key={i}
        x1={16 + i * 12} y1="6"
        x2={16 + i * 12} y2={i % 2 === 0 ? "12" : "15"}
        stroke="#2C2A24" strokeWidth="1.5"
      />
    ))}
  </svg>
);

const ClipboardDoodle = ({ size = 120, opacity = 0.12 }) => (
  <svg width={size} height={size} viewBox="0 0 100 130" fill="none" opacity={opacity}>
    <rect x="10" y="15" width="80" height="110" rx="4" fill="#2C2A24" stroke="#2C2A24" strokeWidth="2"/>
    <rect x="35" y="8" width="30" height="16" rx="4" fill="#2C2A24" stroke="#2C2A24" strokeWidth="2"/>
    <line x1="22" y1="40" x2="78" y2="40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    <line x1="22" y1="55" x2="78" y2="55" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="68" x2="60" y2="68" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="81" x2="70" y2="81" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="22" y1="94" x2="55" y2="94" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NotebookSpiralDoodle = ({ height = 600 }) => (
  <svg width="24" height={height} viewBox={`0 0 24 ${height}`} fill="none">
    <line x1="12" y1="0" x2="12" y2={height} stroke="#E8E4D9" strokeWidth="2"/>
    {Array.from({ length: Math.floor(height / 28) }).map((_, i) => (
      <ellipse key={i} cx="12" cy={14 + i * 28} rx="8" ry="5"
        stroke="#4A90D9" strokeWidth="2" strokeOpacity="0.35" fill="none"/>
    ))}
  </svg>
);

const StarburstDoodle = ({ size = 40, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M20 2L22.5 15L35 10L27 20L38 22.5L27 25L35 35L22.5 28L20 40L17.5 28L5 35L13 25L2 22.5L13 20L5 10L17.5 15Z"
      fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round" opacity="0.8"/>
  </svg>
);

const XDoodle = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="#E8534A" strokeWidth="3" strokeLinecap="round">
    <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
  </svg>
);

const ClockMiniDoodle = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round">
    <circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>
  </svg>
);

const CheckMiniDoodle = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="#5BAD6F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8 L6 11 L13 4"/>
  </svg>
);

const GridTabDoodle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/>
    <line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);

const DownArrowDoodle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

// ═══════════════════════════════════════════════
//  STUDENT DATA
// ═══════════════════════════════════════════════

const STUDENTS = [
  { id: 1, name: "Aarav Patel",     roll: "01" },
  { id: 2, name: "Ananya Sharma",  roll: "02" },
  { id: 3, name: "Arjun Mehta",    roll: "03" },
  { id: 4, name: "Divya Singh",    roll: "04" },
  { id: 5, name: "Ishaan Kumar",   roll: "05" },
  { id: 6, name: "Kavya Reddy",    roll: "06" },
  { id: 7, name: "Manav Joshi",    roll: "07" },
  { id: 8, name: "Nisha Verma",    roll: "08" },
  { id: 9, name: "Om Mishra",      roll: "09" },
  { id: 10, name: "Prachi Agarwal", roll: "10" },
  { id: 11, name: "Rahul Gupta",   roll: "11" },
  { id: 12, name: "Riya Chopra",   roll: "12" },
  { id: 13, name: "Sanya Bose",    roll: "13" },
  { id: 14, name: "Shivam Rao",    roll: "14" },
  { id: 15, name: "Sneha Nair",    roll: "15" },
  { id: 16, name: "Tanmay Das",    roll: "16" },
  { id: 17, name: "Uday Pillai",   roll: "17" },
  { id: 18, name: "Vanya Khanna",  roll: "18" },
  { id: 19, name: "Vivek Tiwari",  roll: "19" },
  { id: 20, name: "Zara Ansari",   roll: "20" },
];

const MONTHLY_STUDENTS = STUDENTS.slice(0, 10);
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

// deterministic random seeded by student + day
const fakeStatus = (sid: number, day: number) => {
  const r = (sid * 7 + day * 13) % 10;
  if (day > 28 && sid % 3 === 0) return "holiday";
  if (r < 7) return "present";
  if (r < 9) return "absent";
  return "late";
};

const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase();

const avatarColor = (id: number) =>
  ["#FFD6E0","#D6EAF8","#D5F5E3","#FEF9E7","#F9EBEA","#E8DAEF"][id % 6];

// ═══════════════════════════════════════════════
//  QUICK MARK TAB
// ═══════════════════════════════════════════════

function QuickMark() {
  const [status, setStatus] = useState<Record<number, "P" | "A" | "L">>(() => {
    const init: Record<number, "P" | "A" | "L"> = {};
    STUDENTS.forEach(s => { init[s.id] = "P"; });
    return init;
  });

  const counts = {
    P: Object.values(status).filter(v => v === "P").length,
    A: Object.values(status).filter(v => v === "A").length,
    L: Object.values(status).filter(v => v === "L").length,
  };

  const borderFor = (s: "P" | "A" | "L") =>
    s === "P" ? "border-l-[5px] border-l-[#5BAD6F]"
    : s === "A" ? "border-l-[5px] border-l-[#E8534A]"
    : "border-l-[5px] border-l-[#F5A623]";

  return (
    <div className="relative">
      {/* Class selector */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="relative inline-flex items-center gap-3 border-2 border-[#2C2A24] rounded-[10px] px-5 py-2.5 bg-[#FFFFFF] cursor-pointer shadow-[3px_3px_0px_#2C2A24] hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <PencilDoodle size={16}/>
            <span className="font-heading font-bold text-[#2C2A24]">Class 8-A · Mathematics · Period 3</span>
            <DownArrowDoodle size={16}/>
          </div>
        </div>
        <div className="flex gap-2">
          {STUDENTS.slice(0,3).map(s => (
            <div key={s.id} onClick={() =>
              setStatus(prev => {
                const next = {...prev};
                STUDENTS.forEach(st => { next[st.id] = "P"; });
                return next;
              })
            } className="hidden"/>
          ))}
          <button onClick={() => setStatus(prev => Object.fromEntries(STUDENTS.map(s => [s.id,"P"])) as any)}
            className="text-xs font-heading font-bold px-3 py-1.5 rounded-lg border-2 border-[#5BAD6F] bg-[#D5F5E3] hover:bg-[#5BAD6F] transition-colors">
            ✓ All Present
          </button>
          <button onClick={() => setStatus(prev => Object.fromEntries(STUDENTS.map(s => [s.id,"A"])) as any)}
            className="text-xs font-heading font-bold px-3 py-1.5 rounded-lg border-2 border-[#E8534A] bg-[#FDEDEC] hover:bg-[#E8534A] hover:text-white transition-colors">
            ✗ All Absent
          </button>
        </div>
      </div>

      {/* Student grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-32">
        {STUDENTS.map(s => {
          const st = status[s.id];
          return (
            <div key={s.id}
              className={`bg-[#FFFFFF] rounded-[14px] border-2 border-[#E8E4D9] p-4 shadow-[3px_3px_0px_#E8E4D9] relative transition-all duration-200 ${borderFor(st)}`}>
              {/* Corner doodle indicator */}
              <div className="absolute top-2 right-2">
                {st === "P" && <CheckMiniDoodle size={16}/>}
                {st === "A" && <XDoodle size={14}/>}
                {st === "L" && <ClockMiniDoodle size={14}/>}
              </div>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-extrabold text-sm border-2 border-[#2C2A24] mb-2"
                style={{ backgroundColor: avatarColor(s.id) }}>
                {initials(s.name)}
              </div>
              <p className="font-body font-semibold text-[#2C2A24] text-sm leading-tight truncate">{s.name}</p>
              <p className="font-accent font-bold text-xs text-[#7A7670] mb-3">#{s.roll}</p>

              {/* PAL toggles */}
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
                      onClick={() => setStatus(prev => ({ ...prev, [s.id]: opt }))}
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
          <span className="text-sm font-body text-[#7A7670]">Today's Summary:</span>
          <span className="px-3 py-1 rounded-full bg-[#D5F5E3] border-2 border-[#5BAD6F] text-[#5BAD6F] font-heading font-bold text-sm">{counts.P} Present</span>
          <span className="px-3 py-1 rounded-full bg-[#FDEDEC] border-2 border-[#E8534A] text-[#E8534A] font-heading font-bold text-sm">{counts.A} Absent</span>
          <span className="px-3 py-1 rounded-full bg-[#FEF9E7] border-2 border-[#F5A623] text-[#F5A623] font-heading font-bold text-sm">{counts.L} Late</span>
        </div>
        <button className="flex items-center gap-2 bg-[#F5A623] border-2 border-[#2C2A24] rounded-[12px] px-7 py-3 font-heading font-extrabold shadow-[4px_4px_0px_#2C2A24] hover:shadow-[2px_2px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
          <PencilDoodle size={18} color="#2C2A24"/>
          Save Attendance
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  QR MODE TAB
// ═══════════════════════════════════════════════

function QRMode() {
  const [scanned] = useState([
    { id: 1, name: "Aarav Patel",    time: "10:03 AM" },
    { id: 2, name: "Ananya Sharma",  time: "10:04 AM" },
    { id: 3, name: "Arjun Mehta",    time: "10:05 AM" },
    { id: 5, name: "Ishaan Kumar",   time: "10:07 AM" },
    { id: 6, name: "Kavya Reddy",    time: "10:08 AM" },
  ]);

  return (
    <div className="flex flex-col items-center">
      <p className="font-body text-[#7A7670] mb-6 text-center">
        Share this QR code with students to mark attendance automatically
      </p>

      {/* QR frame */}
      <div className="relative flex items-center justify-center mb-6">
        <DottedFrameDoodle size={240}/>
        <div className="absolute inset-0 flex items-center justify-center">
          <QRDoodle size={180}/>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2 mb-2">
        <TimerDoodle size={20}/>
        <span className="font-heading font-bold text-[#E8534A] text-xl">QR expires in 2:47</span>
      </div>
      <p className="font-accent font-bold text-[#7A7670] text-lg mb-2">
        This QR is valid for <span className="text-[#2C2A24] font-extrabold">Class 9B · Period 2</span> only
      </p>

      <SquiggleSVG width={280} color="#E8E4D9"/>

      {/* Live scan list */}
      <div className="mt-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#5BAD6F] animate-pulse"/>
          <span className="font-heading font-bold text-[#2C2A24]">Live Scan Feed</span>
          <span className="ml-auto font-accent text-[#7A7670]">{scanned.length} scanned</span>
        </div>

        <div className="space-y-3">
          {scanned.map((s, i) => (
            <div key={s.id}
              className="flex items-center gap-4 bg-[#FFFFFF] border-2 border-[#E8E4D9] rounded-[12px] px-4 py-3 shadow-[2px_2px_0px_#E8E4D9]"
              style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-sm border-2 border-[#2C2A24]"
                style={{ backgroundColor: avatarColor(s.id) }}>
                {initials(s.name)}
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-[#2C2A24] text-sm">{s.name}</p>
                <p className="font-accent text-[#7A7670] text-sm">{s.time}</p>
              </div>
              <div className="flex items-center gap-1.5 bg-[#D5F5E3] border border-[#5BAD6F] rounded-full px-3 py-1">
                <CheckMiniDoodle size={14}/>
                <span className="text-xs font-heading font-bold text-[#5BAD6F]">Present</span>
              </div>
            </div>
          ))}
        </div>

        <button className="mt-6 w-full py-3 border-2 border-dashed border-[#4A90D9] rounded-[12px] text-[#4A90D9] font-heading font-bold hover:bg-[#D6EAF8] transition-colors">
          ↻ Regenerate QR Code
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MONTHLY VIEW TAB
// ═══════════════════════════════════════════════

function MonthlyView() {
  const dotColor = {
    present: "#5BAD6F",
    absent:  "#E8534A",
    late:    "#F5A623",
    holiday: "#E8E4D9",
  };

  const studentPct = (sid: number) => {
    const total = DAYS.filter(d => fakeStatus(sid, d) !== "holiday").length;
    const present = DAYS.filter(d => fakeStatus(sid, d) === "present").length;
    return Math.round((present / total) * 100);
  };

  const dayPct = (day: number) => {
    const statuses = MONTHLY_STUDENTS.map(s => fakeStatus(s.id, day));
    const p = statuses.filter(s => s === "present").length;
    const total = statuses.filter(s => s !== "holiday").length;
    return total > 0 ? Math.round((p / total) * 100) : null;
  };

  return (
    <div>
      {/* Ruler decorative header */}
      <div className="flex items-center gap-4 mb-6">
        <RulerDoodle width={320}/>
        <span className="font-accent text-[#7A7670] font-bold shrink-0">April 2025</span>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {(["present","absent","late","holiday"] as const).map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border border-[#2C2A24]" style={{ backgroundColor: dotColor[s]}}/>
            <span className="text-xs font-heading font-bold capitalize text-[#7A7670]">{s}</span>
          </div>
        ))}
      </div>

      {/* Scrollable grid */}
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
            {MONTHLY_STUDENTS.map((s, si) => {
              const pct = studentPct(s.id);
              return (
                <tr key={s.id} className={`border-b border-[#E8E4D9] ${si % 2 === 0 ? "bg-white" : "bg-[#FDFBF5]"}`}>
                  {/* Student name — sticky left */}
                  <td className={`px-4 py-2.5 sticky left-0 z-10 ${si % 2 === 0 ? "bg-white" : "bg-[#FDFBF5]"}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center font-heading font-bold text-xs border border-[#2C2A24] shrink-0"
                        style={{ backgroundColor: avatarColor(s.id) }}>
                        {initials(s.name)}
                      </div>
                      <span className="font-body text-sm text-[#2C2A24] font-medium">{s.name}</span>
                    </div>
                  </td>
                  {/* Status dots */}
                  {DAYS.map(d => {
                    const st = fakeStatus(s.id, d);
                    return (
                      <td key={d} className="px-1.5 py-2.5 text-center">
                        <div className="w-4 h-4 rounded-full mx-auto border border-white"
                          style={{ backgroundColor: dotColor[st as keyof typeof dotColor], boxShadow: "0 0 0 1px rgba(0,0,0,0.08)"}}
                          title={`${s.name} — Day ${d}: ${st}`}
                        />
                      </td>
                    );
                  })}
                  {/* % column — sticky right */}
                  <td className={`px-3 py-2.5 sticky right-0 z-10 ${si % 2 === 0 ? "bg-white" : "bg-[#FDFBF5]"}`}>
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-heading font-extrabold text-sm ${pct >= 75 ? "text-[#5BAD6F]" : "text-[#E8534A]"}`}>{pct}%</span>
                      {/* Sparkline bar */}
                      <div className="w-12 h-1.5 bg-[#E8E4D9] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 75 ? "#5BAD6F" : "#E8534A"}}/>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Bottom row: day-wise % */}
            <tr className="bg-[#FDFBF5] border-t-2 border-[#E8E4D9]">
              <td className="px-4 py-2.5 font-heading font-bold text-xs text-[#7A7670] sticky left-0 bg-[#FDFBF5] z-10">Daily %</td>
              {DAYS.map(d => {
                const pct = dayPct(d);
                return (
                  <td key={d} className="px-1.5 py-2.5 text-center">
                    {pct !== null ? (
                      <span className="font-accent font-bold text-xs"
                        style={{ color: pct >= 75 ? "#5BAD6F" : "#E8534A" }}>
                        {pct}
                      </span>
                    ) : (
                      <span className="text-[#E8E4D9] text-xs">–</span>
                    )}
                  </td>
                );
              })}
              <td className="sticky right-0 bg-[#FDFBF5] z-10"/>
            </tr>
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
  const [activeTab, setActiveTab] = useState<Tab>("quick");

  const tabs: { id: Tab; label: string; icon: React.ReactNode; color: string; border: string; active_bg: string }[] = [
    { id: "quick",   label: "Quick Mark",    icon: <PencilDoodle size={16}/>,  color: "#FEF3DC", border: "#F5A623", active_bg: "#F5A623" },
    { id: "qr",      label: "QR Mode",       icon: <QRTabIcon/>,               color: "#D6EAF8", border: "#4A90D9", active_bg: "#4A90D9" },
    { id: "monthly", label: "Monthly View",  icon: <GridTabDoodle size={16}/>, color: "#FDFBF5", border: "#7A7670", active_bg: "#2C2A24" },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      {/* Notebook spiral — left edge */}
      <div className="fixed left-[240px] top-0 bottom-0 z-30 pointer-events-none">
        <NotebookSpiralDoodle height={2000}/>
      </div>

      {/* Clipboard doodle — top right decorative */}
      <div className="fixed top-16 right-6 z-20 pointer-events-none">
        <ClipboardDoodle size={130} opacity={0.12}/>
      </div>

      {/* Scattered starburst accents */}
      <div className="fixed top-28 right-40 z-10 pointer-events-none opacity-30">
        <StarburstDoodle size={44}/>
      </div>
      <div className="fixed bottom-24 right-64 z-10 pointer-events-none opacity-20">
        <StarburstDoodle size={30} color="#4A90D9"/>
      </div>

      {/* Main content (offset from sidebar) */}
      <main className="flex-1 ml-[240px] pl-10 pr-8 py-10 max-w-none relative">

        {/* ── PAGE HEADER ── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <CheckmarkDoodle size={40} color="#F5A623"/>
              <h1 className="text-4xl font-extrabold text-[#2C2A24]"
                style={{ fontFamily: '"Nunito", sans-serif' }}>
                Attendance
              </h1>
            </div>
            <SquiggleSVG width={200} color="#F5A623"/>
            <p className="text-[#7A7670] font-body mt-2 text-sm">
              Mark, track and export attendance records
            </p>
          </div>

          {/* Top-right actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 border-2 border-[#2C2A24] rounded-[10px] px-4 py-2 bg-white shadow-[2px_2px_0px_#2C2A24]">
              <CalendarDoodle size={18}/>
              <span className="text-[#2C2A24] font-bold" style={{ fontFamily: '"Caveat", cursive', fontSize: "18px" }}>
                Today: Thursday 3 Apr ✦
              </span>
            </div>
            <button className="flex items-center gap-2 border-2 border-[#2C2A24] bg-white rounded-[10px] px-5 py-2.5 font-heading font-bold shadow-[4px_4px_0px_#2C2A24] hover:shadow-[2px_2px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              style={{ fontFamily: '"Nunito", sans-serif' }}>
              <ExportIcon size={16}/>
              Export Report
            </button>
          </div>
        </div>

        {/* Scattered pencil doodle between header and tabs */}
        <div className="flex gap-6 mb-6 opacity-25 pointer-events-none">
          <PencilDoodle size={20}/>
          <div style={{ transform: "rotate(45deg)" }}><PencilDoodle size={14}/></div>
          <div style={{ transform: "rotate(-20deg)" }}><PencilDoodle size={18}/></div>
        </div>

        {/* ── TABS ── */}
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

        {/* Pencil doodle scattered between tabs and content */}
        <div className="absolute right-24 top-[200px] opacity-15 pointer-events-none" style={{ transform: "rotate(30deg)" }}>
          <PencilDoodle size={28}/>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="relative">
          {activeTab === "quick"   && <QuickMark/>}
          {activeTab === "qr"      && <QRMode/>}
          {activeTab === "monthly" && <MonthlyView/>}
        </div>
      </main>
    </div>
  );
}

// Small local icons
const ExportIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const QRTabIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <rect x="14" y="14" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/>
  </svg>
);
