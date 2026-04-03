"use client";

import React from "react";
import AdminSidebar from "../components/ui/AdminSidebar";

// ═══════════════════════════════════════════════
//  SVG DOODLES - ICONS & DECORATIONS
// ═══════════════════════════════════════════════

const KlassoLogo = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="4" width="32" height="32" rx="6" fill="#2C2A24" />
    <path d="M12 10V30" stroke="#FDFBF5" strokeWidth="4" strokeLinecap="round" />
    <path d="M28 10L12 20L28 30" stroke="#FDFBF5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SchoolBuildingDoodle = ({ size = 24, outline = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={outline ? "2" : "1.5"} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L2 9v12h20V9L12 3z" fill={outline ? "none" : "currentColor"} fillOpacity={outline ? 0 : 0.1} />
    <path d="M10 21v-6h4v6" />
    <path d="M6 13h2v2H6z M16 13h2v2h-2z" />
  </svg>
);

const PersonAppleDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <circle cx="18" cy="16" r="3" fill="#E8534A" stroke="#E8534A" fillOpacity="0.2"/>
    <path d="M18 13c-.5 1-1 1-1 1" stroke="#E8534A" />
  </svg>
);

const GroupDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const GridDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18 M3 15h18 M9 3v18 M15 3v18" />
  </svg>
);

const ClipboardDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 12h6 M9 16h6" />
  </svg>
);

const CheckmarkDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CoinDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8h4 M10 12h4 M12 8v1M12 13v3" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const MegaphoneDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const GearDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const BellDoodle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CalendarDoodle = ({ size = 20, color = "#4A90D9" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <circle cx="12" cy="15" r="1" fill={color}/>
  </svg>
);

const WeighingScaleDoodle = ({ size = 24, color = "#2471A3" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="5" y1="20" x2="19" y2="20" />
    <path d="M12 6c-3 0-6 2-8 5 0 2 2 3 8 3s8-1 8-3c-2-3-5-5-8-5z" fill={color} fillOpacity="0.1"/>
    <circle cx="12" cy="6" r="2" fill="#FDFBF5" />
    <line x1="4" y1="11" x2="4" y2="16" />
    <line x1="20" y1="11" x2="20" y2="16" />
    <path d="M2 16h4M18 16h4" />
  </svg>
);

const WarningTriangleDoodle = ({ size = 20, color = "#E8534A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill={color} fillOpacity="0.1"/>
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SparkleSVG = ({ size = 24, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const PersonSwapSVG = ({ size = 24, color = "#4A90D9" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

const DownloadSVG = ({ size = 24, color = "#5BAD6F" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PlusDoodle = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="10" y1="4" x2="10" y2="16"/><line x1="4" y1="10" x2="16" y2="10"/>
  </svg>
);

const TinyXDoodle = ({ size = 8 }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="#A9A59E" strokeWidth="2" strokeLinecap="round">
    <line x1="2" y1="2" x2="8" y2="8" />
    <line x1="8" y1="2" x2="2" y2="8" />
  </svg>
);

// High-Opacity Large Background Element
const SchoolSilhouetteBackground = () => (
  <svg width="240" height="240" viewBox="0 0 100 100" fill="none" className="fixed right-[-20px] bottom-[-20px] z-0 opacity-[0.05] pointer-events-none">
    <path d="M10 90 L10 40 L50 10 L90 40 L90 90 Z" stroke="#2471A3" strokeWidth="4" strokeLinejoin="round" />
    <rect x="40" y="60" width="20" height="30" stroke="#2471A3" strokeWidth="4" strokeLinejoin="round" />
    <rect x="25" y="45" width="10" height="15" stroke="#2471A3" strokeWidth="4" strokeLinejoin="round" />
    <rect x="65" y="45" width="10" height="15" stroke="#2471A3" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="50" cy="30" r="4" stroke="#2471A3" strokeWidth="3" />
  </svg>
);

const KlassoWatermark = () => (
  <svg width="400" height="150" viewBox="0 0 200 60" fill="none" className="fixed top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 -rotate-12 z-0 opacity-[0.03] pointer-events-none">
    <text x="10" y="45" fontFamily='"Caveat", cursive' fontSize="60" fontWeight="bold" fill="#2471A3">Klasso</text>
  </svg>
);

const MutedAmberStarburst = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return <line key={i} x1="50" y1="50" x2={50 + 40 * Math.cos(a)} y2={50 + 40 * Math.sin(a)} stroke="#F5A623" strokeWidth="3" strokeLinecap="round" opacity="0.4"/>;
    })}
    <circle cx="50" cy="50" r="10" fill="#F5A623" opacity="0.3"/>
  </svg>
);

const RulerCompassCorners = () => (
  <>
    <svg width="60" height="60" viewBox="0 0 40 40" fill="none" className="fixed top-24 right-8 z-0 opacity-20 pointer-events-none">
      <path d="M5 35 L35 5 L40 10 L10 40 Z" stroke="#2471A3" strokeWidth="2" strokeLinejoin="round"/>
      <line x1="12" y1="30" x2="18" y2="36" stroke="#2471A3" strokeWidth="1.5"/>
      <line x1="18" y1="24" x2="24" y2="30" stroke="#2471A3" strokeWidth="1.5"/>
      <line x1="24" y1="18" x2="30" y2="24" stroke="#2471A3" strokeWidth="1.5"/>
    </svg>
    <svg width="50" height="50" viewBox="0 0 40 40" fill="none" className="fixed bottom-12 left-64 z-0 opacity-20 pointer-events-none">
      <path d="M20 5 L10 35 L12 37 L20 20 L28 37 L30 35 Z" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinejoin="round"/>
      <circle cx="20" cy="5" r="3" fill="#E8534A" />
      <line x1="15" y1="25" x2="25" y2="25" stroke="#2C2A24" strokeWidth="1.5"/>
    </svg>
  </>
);

// ═══════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-heading font-bold text-sm ${
    active ? "bg-[#EEF5FF] text-[#2471A3] border-2 border-[#4A90D9] shadow-[2px_2px_0px_#4A90D9]" 
           : "text-[#7A7670] border-2 border-transparent hover:bg-[#FDFBF5] hover:text-[#2C2A24]"
  }`} style={{ fontFamily: '"Nunito", sans-serif' }}>
    {icon}
    {label}
  </a>
);

const KPICard = ({ title, value, icon, valueColor = "#2C2A24", specialSub = null }: any) => (
  <div className="bg-white border-2 border-[#2C2A24] rounded-[12px] p-4 shadow-[3px_3px_0px_#2C2A24] hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex flex-col justify-between h-28">
    <div className="flex justify-between items-start">
      <span className="font-heading font-bold text-[#7A7670] text-sm" style={{ fontFamily: '"Nunito", sans-serif' }}>{title}</span>
      <div className="text-[#2471A3] bg-[#EEF5FF] p-2 rounded-lg border border-[#4A90D9]/30">
        {icon}
      </div>
    </div>
    <div className="mt-2">
      <span className="font-heading font-extrabold text-2xl tracking-tight" style={{ color: valueColor, fontFamily: '"Nunito", sans-serif' }}>{value}</span>
      {specialSub}
    </div>
  </div>
);

const HeatmapLegendDot = ({ color, label }: { color: string, label: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-4 h-4 rounded-full border-2 border-[#2C2A24]" style={{ backgroundColor: color }} />
    <span style={{ fontFamily: '"Caveat", cursive', fontSize: "12px", fontWeight: 700, color: "#7A7670" }}>{label}</span>
  </div>
);

const PencilBar = ({ name, score, color, width }: { name: string, score: number, color: string, width: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-24 text-right font-body text-sm font-semibold truncate text-[#2C2A24]">{name}</span>
    <div className="flex-1 h-6 flex items-center relative">
      {/* Background track */}
      <div className="absolute inset-0 bg-[#E8E4D9] rounded-full opacity-30 h-4 top-1" />
      {/* Pencil Bar */}
      <div className="h-6 flex z-10 transition-all duration-500" style={{ width }}>
        {/* Eraser */}
        <div className="w-3 h-full bg-[#E8534A] border-2 border-[#2C2A24] rounded-l-[4px] shrink-0" />
        {/* Metal band */}
        <div className="w-2 h-full bg-[#E8E4D9] border-y-2 border-[#2C2A24] border-x border-[#2C2A24] shrink-0" />
        {/* Body */}
        <div className="flex-1 h-full border-y-2 border-[#2C2A24] relative shadow-[0_2px_0px_rgba(0,0,0,0.1)]" style={{ backgroundColor: color }}>
           <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-0.5 bg-black opacity-10" />
        </div>
        {/* Tip (tapered) */}
        <div className="w-6 h-full border-y-2 border-r-2 border-[#2C2A24] rounded-r-[12px] bg-[#FEF3DC] relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#2C2A24]"></div>
        </div>
      </div>
      <span className="ml-3 font-heading font-extrabold text-sm" style={{ color: color === "#E8534A" ? "#E8534A" : "#2C2A24", fontFamily: '"Nunito", sans-serif' }}>{score}</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════
//  MAIN DASHBOARD
// ═══════════════════════════════════════════════

export default function AdminDashboard() {
  
  // Fake Heatmap Data
  const days = Array.from({length: 30}, (_, i) => {
    if (i % 7 === 5 || i % 7 === 6) return { type: "weekend" };
    const rand = Math.random();
    if (rand > 0.4) return { type: "high", val: ">95%" }; 
    if (rand > 0.15) return { type: "med", val: "90-95%" };
    if (rand > 0.05) return { type: "low", val: "80-90%" };
    return { type: "bad", val: "<80%" };
  });

  const heatmapColor = (type: string) => {
    switch(type) {
      case "high": return "#5BAD6F"; // dark green
      case "med": return "#A9D6B5"; // light green
      case "low": return "#F5A623"; // amber
      case "bad": return "#E8534A"; // red
      default: return "#F3F2EE"; // weekend/grey
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFBF5] relative overflow-hidden" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      
      {/* ── BACKGROUND DECORATIONS ── */}
      <SchoolSilhouetteBackground />
      <KlassoWatermark />
      <RulerCompassCorners />
      <div className="fixed top-32 left-[300px] z-0"><MutedAmberStarburst size={60} /></div>
      <div className="fixed bottom-64 right-[400px] z-0 opacity-60"><MutedAmberStarburst size={90} /></div>

      {/* ── SIDEBAR ── */}
      <AdminSidebar />

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col z-10 min-w-0 h-full ml-[240px]">
        
        {/* ── TOP HEADER ── */}
        <header className="h-[80px] shrink-0 border-b-2 border-[#E8E4D9] bg-white px-8 flex justify-between items-center shadow-sm relative z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-extrabold text-[#2C2A24]" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Good morning, Principal Sharma <span className="text-[#F5A623]">✦</span>
            </h1>
            <div className="px-3 py-1 bg-[#EEF5FF] text-[#2471A3] border border-[#4A90D9] rounded-full text-xs font-bold font-heading">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#2C2A24] bg-white rounded-lg text-sm font-heading font-bold shadow-[2px_2px_0px_#2C2A24] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[#2C2A24]">
              <PlusDoodle size={14} /> Teacher
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#2C2A24] bg-white rounded-lg text-sm font-heading font-bold shadow-[2px_2px_0px_#2C2A24] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[#2C2A24]">
              <PlusDoodle size={14} /> Student
            </button>
            <div className="w-px h-8 bg-[#E8E4D9] mx-2" />
            <button className="relative p-2 rounded-full hover:bg-[#FDFBF5] text-[#7A7670] transition-colors border-2 border-transparent hover:border-[#E8E4D9]">
              <BellDoodle />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#E8534A] border-2 border-white rounded-full"></div>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-[#2C2A24] bg-[#2471A3] text-white flex items-center justify-center font-heading font-extrabold ml-2 shadow-[2px_2px_0px_#2C2A24]">
              PS
            </div>
          </div>
        </header>
        
        {/* ── SCROLLABLE CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar pb-16">
          
          {/* ════ ROW 1: KPIs ════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            <KPICard title="Total Students" value="1,240" icon={<GroupDoodle size={20}/>} />
            <KPICard title="Total Teachers" value="48" icon={<PersonAppleDoodle size={20}/>} />
            <KPICard title="Today's Attendance" value="94.2%" valueColor="#5BAD6F" icon={<CheckmarkDoodle size={20}/>} 
              specialSub={<span className="text-xs font-bold text-[#5BAD6F] bg-[#D5F5E3] px-1.5 py-0.5 rounded ml-2">+1.2%</span>}/>
            <KPICard title="Pending Reports" value="23" valueColor="#F5A623" icon={<ClipboardDoodle size={20}/>} />
            <KPICard title="Fee Collected" value="₹4.2L" icon={<CoinDoodle size={20}/>} 
              specialSub={
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-[#E8E4D9] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4A90D9] rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-[#7A7670] whitespace-nowrap">/ ₹6L</span>
                </div>
              }/>
          </div>
          
          {/* ════ ROW 2: Heatmap & Workload ════ */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Panel: Attendance Heatmap (55%) */}
            <div className="flex-[55] bg-white border-2 border-[#2C2A24] rounded-[16px] shadow-[4px_4px_0px_#2C2A24] p-6 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 border-b-2 border-[#FDFBF5] pb-3">
                <CalendarDoodle />
                <h2 className="font-heading font-extrabold text-[#2C2A24] text-lg">School Attendance Heatmap</h2>
                <span className="ml-auto text-sm font-heading font-bold text-[#7A7670]">April 2025</span>
              </div>
              
              <div className="grid grid-cols-7 gap-2 mb-6">
                {['M','T','W','T','F','S','S'].map((day, i) => (
                  <div key={i} className="text-center font-heading font-bold text-xs text-[#A9A59E] mb-2">{day}</div>
                ))}
                
                {/* 2 fillers at start assuming month starts on Wednesday */}
                <div /><div />
                
                {days.map((day, i) => (
                  <div key={i} 
                    className="aspect-square rounded-[8px] flex items-center justify-center border-2 border-black/5 hover:scale-110 transition-transform cursor-pointer relative"
                    style={{ backgroundColor: heatmapColor(day.type) }}
                    title={day.val}
                  >
                    {day.type === "weekend" && <TinyXDoodle size={10} />}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center gap-6 mt-2 pt-4 border-t border-[#E8E4D9]">
                 <HeatmapLegendDot color="#5BAD6F" label=">95%" />
                 <HeatmapLegendDot color="#A9D6B5" label="90-95%" />
                 <HeatmapLegendDot color="#F5A623" label="80-90%" />
                 <HeatmapLegendDot color="#E8534A" label="<80%" />
              </div>
            </div>
            
            {/* Panel: Teacher Workload (45%) */}
            <div className="flex-[45] bg-white border-2 border-[#2C2A24] rounded-[16px] shadow-[4px_4px_0px_#2C2A24] p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b-2 border-[#FDFBF5] pb-3">
                <div className="flex items-center gap-3">
                  <WeighingScaleDoodle />
                  <h2 className="font-heading font-extrabold text-[#2C2A24] text-lg">Teacher Workload</h2>
                </div>
                <button className="text-xs font-heading font-bold text-[#2471A3] hover:underline">View All</button>
              </div>
              
              <div className="flex-1 space-y-2">
                <PencilBar name="A. Gupta" score={32} color="#5BAD6F" width="60%" />
                <PencilBar name="R. Verma" score={48} color="#E8534A" width="95%" />
                <PencilBar name="S. Iyer" score={28} color="#5BAD6F" width="50%" />
                <PencilBar name="K. Menon" score={38} color="#F5A623" width="75%" />
                <PencilBar name="M. Sharma" score={35} color="#5BAD6F" width="65%" />
              </div>
              
              <div className="mt-4 pt-4 border-t border-[#E8E4D9] flex justify-end">
                <button className="bg-[#4A90D9] text-white px-5 py-2 rounded-lg border-2 border-[#2C2A24] shadow-[2px_2px_0px_#2C2A24] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] font-heading font-bold text-sm transition-all">
                  Redistribute Load
                </button>
              </div>
            </div>
            
          </div>
          
          {/* ════ ROW 3: At-Risk, Activity, Quick Actions ════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Panel 1: At-Risk Students */}
            <div className="bg-[#FDEDEC] border-2 border-[#E8534A] rounded-[16px] shadow-[4px_4px_0px_#E8534A]/20 p-5">
              <div className="flex items-center gap-3 mb-5">
                <WarningTriangleDoodle />
                <h2 className="font-heading font-extrabold text-[#B03A33] text-lg">At-Risk Students</h2>
              </div>
              
              <div className="space-y-3">
                {[
                  { name: "Rahul Gupta", reason: "Attendance < 60%", class: "8-A" },
                  { name: "Sneha Nair", reason: "Grades Dropping", class: "9-C" },
                  { name: "Vanya Khanna", reason: "Behavioral", class: "7-B" },
                  { name: "Om Mishra", reason: "Missing Fees", class: "8-A" },
                  { name: "Kavya Reddy", reason: "Attendance < 60%", class: "10-A" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-[#E8534A]/30 p-2.5 rounded-xl shadow-sm">
                    <div className="min-w-0 pr-2">
                      <div className="font-heading font-bold text-[#2C2A24] text-sm truncate">{s.name} <span className="text-[10px] text-[#7A7670] font-normal font-body ml-1">{s.class}</span></div>
                      <div className="font-body text-xs text-[#E8534A] font-semibold mt-0.5">{s.reason}</div>
                    </div>
                    <button className="text-[10px] uppercase font-bold tracking-wider bg-[#E8534A] text-white px-2 py-1.5 rounded-md hover:bg-[#B03A33] shrink-0">
                      Alert
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Panel 2: Recent Activity */}
            <div className="bg-white border-2 border-[#E8E4D9] rounded-[16px] shadow-[3px_3px_0px_#E8E4D9] p-5">
               <div className="flex items-center gap-3 mb-5">
                <div className="w-5 h-5 rounded-full border-2 border-[#4A90D9] flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#2471A3]" />
                </div>
                <h2 className="font-heading font-extrabold text-[#2C2A24] text-lg">Recent Activity</h2>
              </div>
              
              <div className="relative pl-3 space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8E4D9]">
                {[
                  { time: "10 mins ago", text: "Math Dept submitted Term 2 Reports", color: "#5BAD6F" },
                  { time: "1 hr ago", text: "Timetable updated for Grade 9", color: "#4A90D9" },
                  { time: "2 hrs ago", text: "M. Sharma reported absent (sick leave)", color: "#F5A623" },
                  { time: "3 hrs ago", text: "Bulk SMS sent to parents (Fee Reminder)", color: "#2471A3" },
                  { time: "Yesterday", text: "Assembly announcement published", color: "#7A7670" },
                ].map((act, i) => (
                  <div key={i} className="relative pl-6">
                    {/* Node Dot */}
                    <div className="absolute left-[-5px] top-1.5 w-3 h-3 rounded-full border-2 bg-white z-10" style={{ borderColor: act.color }} />
                    <p className="font-body text-sm font-medium text-[#2C2A24] leading-snug">{act.text}</p>
                    <p className="font-accent text-xs text-[#A9A59E] font-semibold mt-0.5">{act.time}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Panel 3: Quick Actions */}
            <div className="bg-[#EEF5FF] border-2 border-[#4A90D9] rounded-[16px] shadow-[4px_4px_0px_#4A90D9]/30 p-5">
               <div className="flex items-center gap-3 mb-5">
                <SparkleSVG size={20} color="#2471A3" />
                <h2 className="font-heading font-extrabold text-[#2471A3] text-lg">Quick Actions</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Bulk Reports", icon: <SparkleSVG size={24}/>, color: "#F5A623", bg: "#FEF3DC" },
                  { label: "Announce", icon: <MegaphoneDoodle size={24}/>, color: "#4A90D9", bg: "#D6EAF8" },
                  { label: "Timetable", icon: <GridDoodle size={24}/>, color: "#5BAD6F", bg: "#D5F5E3" },
                  { label: "Substitute", icon: <PersonSwapSVG size={24}/>, color: "#2471A3", bg: "#white" },
                  { label: "Export Data", icon: <DownloadSVG size={24}/>, color: "#2C2A24", bg: "#E8E4D9" },
                  { label: "Fee Reminders", icon: <BellDoodle size={24}/>, color: "#E8534A", bg: "#FDEDEC" },
                ].map((btn, i) => (
                  <button key={i} 
                    className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-[#2C2A24] bg-white shadow-[2px_2px_0px_#2C2A24] hover:shadow-[4px_4px_0px_#2C2A24] hover:-translate-y-1 transition-all group aspect-[4/3]">
                    <div className="p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform" style={{ backgroundColor: btn.bg, color: btn.color }}>
                      {btn.icon}
                    </div>
                    <span className="font-heading font-bold text-xs text-center text-[#2C2A24] leading-tight">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
          </div>
          
        </main>
      </div>
      
      {/* Scrollbar styling */}
      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E8E4D9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C0BFBA; }
      `}} />
    </div>
  );
}
