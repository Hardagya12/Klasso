"use client";

import React, { useState } from "react";
import AdminSidebar from "../../components/ui/AdminSidebar";

// ═══════════════════════════════════════════════
//  SVG DOODLES
// ═══════════════════════════════════════════════

const TimetableGridDoodle = ({ size = 50, color = "#4A90D9" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="6" y="8" width="36" height="32" rx="3" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M6 18h36M18 18v22M30 18v22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="12" cy="13" r="2" fill={color} />
    <circle cx="24" cy="13" r="2" fill={color} />
    <circle cx="36" cy="13" r="2" fill={color} />
  </svg>
);

const PrinterDoodle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const PencilSmallDoodle = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2471A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20H21" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill="#4A90D9" fillOpacity="0.2"/>
  </svg>
);

const TrashSmallDoodle = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E8534A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
);

const PlusDottedDoodle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#A9A59E" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 3">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" strokeDasharray="none" strokeWidth="2.5" stroke="#7A7670"/>
    <line x1="8" y1="12" x2="16" y2="12" strokeDasharray="none" strokeWidth="2.5" stroke="#7A7670"/>
  </svg>
);

const FlagDoodle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="#4A90D9" fillOpacity="0.2"/>
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);

const FoodDoodle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a3 3 0 0 0-6 0c0 4 6 5 6 13M6 8a3 3 0 0 1 6 0c0 4-6 5-6 13" stroke="#E8534A" />
    <line x1="12" y1="2" x2="12" y2="22" />
  </svg>
);

const WarningTriangleDoodle = ({ size = 20, color = "#E8534A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill={color} fillOpacity="0.1"/>
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckmarkBig = ({ size = 48, color = "#5BAD6F" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="40 12 18 34 8 24" />
  </svg>
);

// Weather Doodles
const SunDoodle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" fill="#FEF3DC"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);
const CloudDoodle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#D6EAF8"/>
  </svg>
);
const SunCloudDoodle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2471A3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2M22 12h-2M19.07 4.93l-1.41 1.41M13.29 17.5H18a4.5 4.5 0 0 0 0-9h-1.79a7 7 0 0 0-11.83 3.65A4.5 4.5 0 0 0 7 21h6" fill="#D6EAF8"/>
  </svg>
);
const RainDoodle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A90D9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.5 16H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="#D6EAF8"/><path d="M16 19l-2 4M12 19l-2 4M8 19l-2 4"/>
  </svg>
);
const StarMoodDoodle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FEF3DC"/>
  </svg>
);

const ClockDoodle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7A7670" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2"/>
  </svg>
);

// Large Background Doodles
const CompassBackground = () => (
  <svg width="300" height="300" viewBox="0 0 100 100" fill="none" className="fixed right-0 bottom-24 z-0 opacity-5 pointer-events-none">
    <circle cx="50" cy="50" r="40" stroke="#2471A3" strokeWidth="3" />
    <line x1="50" y1="10" x2="50" y2="90" stroke="#2471A3" strokeWidth="2" strokeDasharray="4 4" />
    <line x1="10" y1="50" x2="90" y2="50" stroke="#2471A3" strokeWidth="2" strokeDasharray="4 4" />
    <path d="M50 20 L55 45 L80 50 L55 55 L50 80 L45 55 L20 50 L45 45 Z" stroke="#2C2A24" strokeWidth="2" fill="#2471A3" fillOpacity="0.2"/>
  </svg>
);

const MidCenturyCornerAccent = () => (
  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="fixed top-20 right-10 z-0 opacity-20 pointer-events-none">
    <path d="M10 90 L50 10 L90 90 Z" stroke="#F5A623" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="15" fill="#4A90D9" />
    <line x1="10" y1="50" x2="90" y2="50" stroke="#F5A623" strokeWidth="4" />
  </svg>
);

// ═══════════════════════════════════════════════
//  MOCK DATA
// ═══════════════════════════════════════════════

const PERIODS = [
  { id: "P1", name: "Period 1", time: "08:00 - 08:45" },
  { id: "P2", name: "Period 2", time: "08:45 - 09:30" },
  { id: "ASSEMBLY", name: "Assembly", time: "09:30 - 09:45", special: true, icon: <FlagDoodle /> },
  { id: "P3", name: "Period 3", time: "09:45 - 10:30" },
  { id: "P4", name: "Period 4", time: "10:30 - 11:15" },
  { id: "LUNCH", name: "Lunch Break", time: "11:15 - 11:45", special: true, icon: <FoodDoodle /> },
  { id: "P5", name: "Period 5", time: "11:45 - 12:30" },
  { id: "P6", name: "Period 6", time: "12:30 - 01:15" },
  { id: "P7", name: "Period 7", time: "01:15 - 02:00" },
  { id: "P8", name: "Period 8", time: "02:00 - 02:45" },
];

const DAYS = [
  { id: "Mon", name: "Monday", doodle: <SunDoodle /> },
  { id: "Tue", name: "Tuesday", doodle: <CloudDoodle /> },
  { id: "Wed", name: "Wednesday", doodle: <SunCloudDoodle /> },
  { id: "Thu", name: "Thursday", doodle: <RainDoodle /> },
  { id: "Fri", name: "Friday", doodle: <SunDoodle /> },
  { id: "Sat", name: "Saturday", doodle: <StarMoodDoodle />, half: true },
];

const SUBJECTS = [
  { id: "s1", name: "Mathematics", border: "#4A90D9", bg: "#EEF5FF", initial: "R" },
  { id: "s2", name: "Science", border: "#5BAD6F", bg: "#D5F5E3", initial: "A" },
  { id: "s3", name: "English", border: "#F5A623", bg: "#FEF3DC", initial: "K" },
  { id: "s4", name: "History", border: "#E8534A", bg: "#FDEDEC", initial: "S" },
  { id: "s5", name: "Art", border: "#9B59B6", bg: "#E8DAEF", initial: "N" },
  { id: "s6", name: "P.E.", border: "#2C2A24", bg: "#F3F2EE", initial: "V" },
];

// Initial pre-filled grid
const INIT_GRID: Record<string, any> = {
  "Mon-P1": { subject: "Science", teacher: "A. Sharma", class: "8-A", type: "s2" },
  "Mon-P2": { subject: "English", teacher: "K. Menon", class: "8-A", type: "s3" },
  "Tue-P1": { subject: "Mathematics", teacher: "R. Gupta", class: "8-A", type: "s1" },
  "Wed-P4": { subject: "History", teacher: "S. Patel", class: "8-A", type: "s4" },
  "Thu-P6": { subject: "Art", teacher: "N. Desai", class: "8-A", type: "s5" },
  "Fri-P5": { subject: "P.E.", teacher: "V. Kumar", class: "8-A", type: "s6" },
};

// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function TimetableBuilderPage() {
  const [grid, setGrid] = useState<Record<string, any>>(INIT_GRID);
  
  return (
    <div className="flex h-screen bg-[#FDFBF5] relative overflow-hidden" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      
      {/* ── BACKGROUND ── */}
      <CompassBackground />
      <MidCenturyCornerAccent />

      {/* ── SIDEBAR ── */}
      <AdminSidebar />
      
      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative ml-[240px]">
        
        {/* ── TOP HEADER ── */}
        <header className="h-[80px] shrink-0 border-b-2 border-[#E8E4D9] bg-white px-8 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <TimetableGridDoodle />
            <div>
              <h1 className="text-3xl font-extrabold text-[#2C2A24] leading-none tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Timetable Builder
              </h1>
            </div>
            
            <div className="ml-4 px-4 py-1.5 border-2 border-[#2C2A24] rounded-[8px] bg-[#FEF3DC] inline-flex items-center cursor-text shadow-[2px_2px_0px_#2C2A24] hover:bg-[#FDFBF5] transition-colors">
              <span className="text-[#C47D0E] font-bold" style={{ fontFamily: '"Caveat", cursive', fontSize: "16px" }}>Term 2 · 2024-25 ✎</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 p-2.5 rounded-[10px] text-[#7A7670] hover:bg-[#E8E4D9]/50 transition-colors tooltip relative group">
               <PrinterDoodle />
            </button>
            <button className="px-5 py-2.5 rounded-[10px] text-[#7A7670] font-heading font-bold hover:bg-[#FDEDEC] transition-colors border-2 border-transparent">
              Save Draft
            </button>
            <button className="px-6 py-2.5 border-2 border-[#2C2A24] bg-[#4A90D9] text-white rounded-[10px] font-heading font-extrabold shadow-[4px_4px_0px_#2C2A24] hover:shadow-[2px_2px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              Publish Timetable
            </button>
          </div>
        </header>
        
        {/* ── WORKSPACE ── */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6 min-h-0">
          
          {/* ── LEFT SIDEBAR (Unassigned) ── */}
          <div className="w-[200px] shrink-0 bg-white border-2 border-[#E8E4D9] rounded-[16px] p-4 flex flex-col shadow-[2px_2px_0px_#E8E4D9]">
            <h3 className="font-heading font-extrabold text-[#2C2A24] mb-4 pb-2 border-b-2 border-[#FDFBF5] text-sm">Unassigned Subjects</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              
              {SUBJECTS.map((sub, i) => (
                <div key={i} className="flex items-center gap-2 p-2 border-2 border-[#2C2A24] rounded-[10px] shadow-[2px_2px_0px_#2C2A24] cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all bg-white group">
                  <div className="w-8 h-8 rounded-full border-2 border-[#2C2A24] flex items-center justify-center font-heading font-bold text-xs shrink-0 relative"
                    style={{ backgroundColor: sub.bg }}>
                    {sub.initial}
                    {/* Hand drawn ring decoration */}
                    <div className="absolute inset-0 border-2 border-[#F5A623] rounded-full scale-[1.15] opacity-0 group-hover:opacity-100 transition-opacity" style={{ transform: "scale(1.15) rotate(15deg)" }}></div>
                  </div>
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-[#2C2A24] text-xs truncate leading-tight">{sub.name}</p>
                    <p className="font-accent text-[#7A7670] text-[11px] font-bold">Class 8-A</p>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t-2 border-dashed border-[#E8E4D9] text-center">
                <span className="font-accent text-[#A9A59E] text-xs font-bold block mb-2">Drag cards into the grid</span>
              </div>
            </div>
          </div>
          
          {/* ── MAIN TIMETABLE GRID ── */}
          <div className="flex-1 bg-white border-2 border-[#2C2A24] rounded-[16px] shadow-[4px_4px_0px_#2C2A24] flex flex-col overflow-hidden relative">
            
            {/* Grid Header (Days) */}
            <div className="flex border-b-2 border-[#2C2A24] bg-[#FDFBF5] shrink-0">
              <div className="w-[80px] shrink-0 border-r-2 border-[#E8E4D9]" /> {/* Empty Corner */}
              {DAYS.map(day => (
                <div key={day.id} className="flex-1 flex flex-col items-center justify-center py-2.5 border-r border-[#E8E4D9]/60 last:border-0 relative">
                  <div className="absolute right-2 opacity-60">{day.doodle}</div>
                  <span className="font-heading font-extrabold text-[#2C2A24] text-[13px] uppercase tracking-wider">{day.name}</span>
                  {day.half && <span className="text-[10px] font-accent text-[#A9A59E] font-bold">(Half Day)</span>}
                </div>
              ))}
            </div>
            
            {/* Grid Body (Scrollable notebook style) */}
            <div className="flex-1 overflow-auto bg-[#FDFBF5] relative custom-scrollbar">
              {/* Ruled lines background (horizontal) */}
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent, transparent 96px, #4A90D9 96px, #4A90D9 98px)", opacity: 0.15, backgroundPositionY: "-2px" }} />
              
              <div className="flex flex-col min-w-[800px]">
                {PERIODS.map(period => {
                  
                  // Special Row (Assembly / Lunch)
                  if (period.special) {
                    return (
                      <div key={period.id} className="flex border-b-2 border-dashed border-[#F5A623]/50 h-[60px] relative items-center" style={{ backgroundColor: period.id === "LUNCH" ? "#FEF9E7" : "#F4F9FA" }}>
                        <div className="w-[80px] border-r-2 border-[#E8E4D9] shrink-0 flex flex-col items-center justify-center h-full z-10 bg-inherit relative">
                          <span className="text-[#2C2A24] font-heading font-bold text-[11px] text-center w-full">{period.time.split(" - ")[0]}<br/>{period.time.split(" - ")[1]}</span>
                        </div>
                        <div className="flex-1 flex items-center justify-center gap-4 z-10 opacity-70">
                          {period.icon}
                          <span className="font-heading font-extrabold text-[#C47D0E] text-sm uppercase tracking-widest">{period.name}</span>
                          {period.icon}
                        </div>
                      </div>
                    );
                  }

                  // Normal Period Row
                  return (
                    <div key={period.id} className="flex border-b border-[#E8E4D9]/40 h-[96px] relative">
                      {/* Left Header - Period Time */}
                      <div className="w-[80px] border-r-2 border-[#E8E4D9] shrink-0 flex flex-col items-center justify-center h-full z-10 bg-[#FDFBF5]">
                        <ClockDoodle />
                        <span className="font-heading font-bold text-[#2C2A24] text-[15px] mt-1">{period.id}</span>
                        <span className="font-body text-[#A9A59E] text-[10px] mt-0.5">{period.time}</span>
                      </div>
                      
                      {/* Grid Cells */}
                      {DAYS.map(day => {
                        const cellId = `${day.id}-${period.id}`;
                        const slot = grid[cellId];
                        
                        // Disable if Saturday after P4
                        const disabled = day.half && period.id.replace("P", "") > "4";
                        
                        if (disabled) {
                          return <div key={cellId} className="flex-1 border-r border-[#E8E4D9]/60 bg-[#E8E4D9]/30" />;
                        }

                        return (
                          <div key={cellId} className="flex-1 border-r border-[#E8E4D9]/60 p-2 relative group z-10">
                            {slot ? (
                              // Filled Slot
                              <div className="h-full bg-white border-2 border-[#E8E4D9] rounded-[8px] shadow-sm relative overflow-hidden group-hover:border-[#4A90D9] transition-colors cursor-grab p-2 flex flex-col justify-between">
                                {/* Left Color Strip */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: SUBJECTS.find(s=>s.id === slot.type)?.border }} />
                                
                                <div className="pl-1 relative z-10 shrink-0">
                                  <h4 className="font-heading font-bold text-[#2C2A24] text-[13px] leading-tight truncate">{slot.subject}</h4>
                                  <p className="font-body text-[#7A7670] text-[11px] truncate mt-0.5">{slot.teacher}</p>
                                </div>
                                
                                <div className="pl-1 mt-auto">
                                  <span className="font-accent font-bold text-[#4A90D9] text-xs px-1.5 py-0.5 bg-[#EEF5FF] rounded">{slot.class}</span>
                                </div>
                                
                                {/* Hover Actions */}
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/90 p-1 rounded backdrop-blur-sm shadow-sm border border-[#E8E4D9]">
                                  <button className="p-1 hover:bg-[#EEF5FF] rounded"><PencilSmallDoodle /></button>
                                  <button className="p-1 hover:bg-[#FDEDEC] rounded"><TrashSmallDoodle /></button>
                                </div>
                              </div>
                            ) : (
                              // Empty Slot
                              <div className="h-full border-2 border-dashed border-[#E8E4D9] rounded-[8px] bg-white/50 opacity-50 group-hover:opacity-100 group-hover:border-[#4A90D9] transition-all flex items-center justify-center cursor-pointer">
                                <PlusDottedDoodle />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
          
          {/* ── RIGHT SIDEBAR (Conflicts) ── */}
          <div className="w-[220px] shrink-0 bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-[16px] shadow-[2px_2px_0px_#E8E4D9] flex flex-col overflow-hidden relative">
            <div className="p-4 border-b-2 border-[#FDFBF5] bg-white z-10">
              <div className="flex items-center gap-2">
                <WarningTriangleDoodle size={18} />
                <h3 className="font-heading font-extrabold text-[#B03A33] text-sm leading-tight">Conflict Detector</h3>
              </div>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar z-10">
              {/* Fake conflict item 1 */}
              <div className="bg-white border-2 border-[#E8534A] rounded-[12px] p-3 shadow-[2px_2px_0px_#E8534A]/30">
                <p className="font-body text-[#B03A33] text-[11px] font-bold mb-1">Mr. Patel</p>
                <p className="font-body text-[#2C2A24] text-xs font-medium leading-snug mb-2">Double-booked Period 3 on Monday (8-A & 9-B)</p>
                <button className="text-[10px] w-full py-1.5 uppercase font-bold tracking-wider bg-[#E8534A] text-white rounded hover:bg-[#B03A33]">Fix Issue</button>
              </div>
              
              {/* Fake conflict item 2 */}
              <div className="bg-white border-2 border-[#F5A623] rounded-[12px] p-3 shadow-[2px_2px_0px_#F5A623]/30">
                <p className="font-body text-[#C47D0E] text-[11px] font-bold mb-1">Room 4B (Science Lab)</p>
                <p className="font-body text-[#2C2A24] text-xs font-medium leading-snug mb-2">Overlap on Wednesday Period 4</p>
                <button className="text-[10px] w-full py-1.5 uppercase font-bold tracking-wider bg-[#F5A623] text-white rounded hover:bg-[#C47D0E]">Fix Issue</button>
              </div>
              
              {/* All Clear state (hidden currently to show rules) */}
              <div className="hidden flex-col items-center justify-center h-full opacity-60">
                <CheckmarkBig />
                <p className="font-accent font-bold text-[#5BAD6F] text-lg mt-3">All Clear!</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Scope scrollbar style */}
      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E8E4D9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C0BFBA; }
      `}} />
    </div>
  );
}
