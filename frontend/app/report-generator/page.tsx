"use client";

import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

// ═══════════════════════════════════════════════
//  SVG DOODLES
// ═══════════════════════════════════════════════

const MagicWandDoodle = ({ size = 50, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M12 36L34 14" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <path d="M10 38L14 34L18 38L14 42L10 38Z" fill={color} />
    <path d="M36 8l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill={color} opacity="0.8"/>
    <path d="M28 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill={color} opacity="0.6"/>
    <path d="M42 20l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill={color} opacity="0.4"/>
  </svg>
);

const GraduationCapDoodle = ({ size = 30, color = "#2C2A24" }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ position: "absolute", top: "-15px", left: "20px", opacity: 0.15, transform: "rotate(-15deg)" }}>
    <polygon points="16,6 4,12 16,18 28,12" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="#FDFBF5" />
    <polyline points="8,14 8,22 16,26 24,22 24,14" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    <line x1="28" y1="12" x2="28" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="28" cy="22" r="2" fill={color} />
  </svg>
);

const RedUnderlineDoodle = ({ width = 300, color = "#E8534A" }) => (
  <svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none">
    <path d={`M4 8 C${width * 0.2} 4, ${width * 0.4} 10, ${width * 0.7} 4 S${width * 0.9} 8, ${width - 4} 6`}
      stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d={`M8 8 C${width * 0.3} 6, ${width * 0.5} 8, ${width * 0.8} 6`}
      stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
  </svg>
);

const SparkleStar = ({ size = 16, color = "#FDFBF5", opacity = 1 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" opacity={opacity}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

const DownloadArrowDoodle = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="15"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="4" y1="20" x2="20" y2="20"/>
  </svg>
);

const PencilProgressBar = ({ percent = 30 }) => (
  <div className="relative w-48 h-6 flex items-center">
    {/* Pencil Body Outline */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 24" fill="none" preserveAspectRatio="none">
      <path d="M4 4h160l30 8-30 8H4V4z" stroke="#2C2A24" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M164 4v16" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round"/>
      <path d="M4 12h160" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
      {/* Pencil Eraser end */}
      <rect x="0" y="4" width="8" height="16" fill="#E8534A" stroke="#2C2A24" strokeWidth="2"/>
    </svg>
    {/* Progress Fill (Green) inside the body */}
    <div className="absolute left-[8px] top-[4px] bottom-[4px] overflow-hidden" style={{ width: `calc((156px) * ${percent / 100})` }}>
      <div className="h-full bg-[#5BAD6F]" />
    </div>
  </div>
);

const MagnifierDoodle = ({ size = 18, color = "#7A7670" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const HandRing = ({ size = 48, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="absolute -inset-1 z-10 pointer-events-none">
    <path d="M20 4C30 4 36 12 36 20C36 30 28 36 20 36C10 36 4 28 4 20C4 10 12 4 18 4" 
      stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
  </svg>
);

const GoldStarSmall = ({ size = 16, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M10 2l1.8 5.5H17l-4.6 3.3 1.8 5.5L10 13l-4.2 3.3 1.8-5.5L3 7.5h5.2z"
      fill={color} stroke="#2C2A24" strokeWidth="1.5" strokeLinejoin="round"/>
  </svg>
);

const CheckmarkWhite = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const RefreshIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const GearDoodle = ({ size = 20, color = "#7A7670" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const RadioDoodle = ({ checked = false }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#2C2A24" strokeWidth="2.5" />
    {checked && <circle cx="12" cy="12" r="4" fill="#4A90D9" />}
  </svg>
);

const CheckboxDoodle = ({ checked = false }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#2C2A24" strokeWidth="2.5" />
    {checked && <path d="M7 12l4 4 6-8" stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>}
  </svg>
);

const LightbulbIcon = ({ size = 20, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21h6M10 17h4M12 3a7 7 0 0 1 5 11.9V17H7v-2.1a7 7 0 0 1 5-11.9z" fill={color} fillOpacity="0.2"/>
  </svg>
);

const TinyArrowDoodle = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const OpenBookDoodle = ({ size = 100, color = "#F5A623" }) => (
  <svg width={size} height={(size * 2) / 3} viewBox="0 0 100 66" fill="none" opacity="0.15">
    <path d="M50 60 C30 65 10 55 10 55 L10 15 C10 15 30 25 50 20" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M50 60 C70 65 90 55 90 55 L90 15 C90 15 70 25 50 20" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <line x1="50" y1="20" x2="50" y2="60" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    <line x1="16" y1="28" x2="44" y2="25" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="36" x2="44" y2="33" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="56" y1="25" x2="84" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <line x1="56" y1="33" x2="84" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NotebookSpiral = ({ height = 800 }) => (
  <svg width="24" height={height} viewBox={`0 0 24 ${height}`} fill="none" className="fixed left-0 top-0 z-0 opacity-80 pointer-events-none">
    <line x1="20" y1="0" x2="20" y2={height} stroke="#E8E4D9" strokeWidth="2"/>
    {Array.from({ length: Math.floor(height / 28) }).map((_, i) => (
      <ellipse key={i} cx="12" cy={14 + i * 28} rx="10" ry="5"
        stroke="#4A90D9" strokeWidth="2.5" strokeOpacity="0.4" fill="#FDFBF5"/>
    ))}
  </svg>
);

const CornerDiamonds = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="fixed bottom-0 right-0 z-0 opacity-20 pointer-events-none">
    <rect x="70" y="70" width="30" height="30" transform="rotate(45 85 85)" fill="#4A90D9"/>
    <rect x="40" y="85" width="15" height="15" transform="rotate(45 47.5 92.5)" fill="#F5A623"/>
    <rect x="90" y="40" width="20" height="20" transform="rotate(45 100 50)" fill="#E8534A"/>
    <path d="M5 110 L100 5" stroke="#2C2A24" strokeWidth="1" strokeDasharray="4 4" opacity="0.5"/>
  </svg>
);

// ═══════════════════════════════════════════════
//  DATA & MOCKS
// ═══════════════════════════════════════════════

type Status = "Approved" | "Draft" | "Pending";

const STUDENTS = [
  { id: 1, name: "Aarav Patel",     status: "Approved", avatarId: 1 },
  { id: 2, name: "Ananya Sharma",   status: "Approved", avatarId: 2 },
  { id: 3, name: "Arjun Mehta",     status: "Draft",    avatarId: 3 },
  { id: 4, name: "Divya Singh",     status: "Pending",  avatarId: 4 },
  { id: 5, name: "Ishaan Kumar",    status: "Approved", avatarId: 5 },
  { id: 6, name: "Kavya Reddy",     status: "Pending",  avatarId: 0 },
  { id: 7, name: "Manav Joshi",     status: "Draft",    avatarId: 1 },
  { id: 8, name: "Nisha Verma",     status: "Pending",  avatarId: 2 },
];

const avatarColor = (id: number) =>
  ["#FFD6E0", "#D6EAF8", "#D5F5E3", "#FEF9E7", "#F9EBEA", "#E8DAEF"][id % 6];

const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

const MOCK_REPORT_TEXT = (name: string) => 
  `${name.split(" ")[0]} has shown commendable progress throughout Term 2. In Mathematics, there's been a noticeable improvement in problem-solving speed and analytical reasoning, reflecting a strong understanding of core concepts. Science and Language arts continue to be areas of strength, where ${name.split(" ")[0]} frequently participates actively in class discussions. While occasionally distracted during longer sessions, ${name.split(" ")[0]}'s overall focus has matured. I recommend continuing the habit of daily reading out loud to further enhance vocabulary and comprehension skills.\n\nA joy to have in the classroom, bringing positive energy and a collaborative spirit to group projects.`;

// ═══════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════

export default function ReportGeneratorPage() {
  const [selectedStudent, setSelectedStudent] = useState(STUDENTS[2]);
  const [tone, setTone] = useState("Encouraging");
  const [lengthPref, setLengthPref] = useState("Standard");
  const [lang, setLang] = useState("English");
  const [includes, setIncludes] = useState({
    attendance: true,
    grades: true,
    behaviour: true,
    recommendations: true,
  });
  
  const totalReports = 40;
  const approvedCount = 12;

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Sidebar />

      {/* ── DECORATIVE ELEMENTS ── */}
      <NotebookSpiral height={1500} />
      <CornerDiamonds />
      
      {/* Tiny scattered stars */}
      <div className="fixed top-32 left-80 z-0 opacity-40"><GoldStarSmall size={12} color="#F5A623"/></div>
      <div className="fixed top-60 right-[350px] z-0 opacity-30"><GoldStarSmall size={14} color="#4A90D9"/></div>
      <div className="fixed bottom-40 left-[400px] z-0 opacity-30"><GoldStarSmall size={18} color="#E8534A"/></div>
      
      {/* Main Container */}
      <main className="flex-1 ml-[240px] pr-10 py-10 relative z-10 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden">
        
        {/* ════════════════════════════════
            PAGE HEADER
        ════════════════════════════════ */}
        <header className="flex justify-between items-start mb-6 shrink-0 relative">
          <div>
            <GraduationCapDoodle />
            <div className="flex items-center gap-3">
              <MagicWandDoodle size={48} color="#F5A623"/>
              <h1 className="text-[40px] font-extrabold text-[#2C2A24] tracking-tight leading-none" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Report Generator
              </h1>
            </div>
            <div className="mt-2 ml-4 relative inline-block">
              <span style={{ fontFamily: '"Caveat", cursive', fontSize: "22px", color: "#2C2A24", fontWeight: 700 }}>
                AI writes your reports. You just approve.
              </span>
              <div className="absolute -bottom-2 left-0 right-0">
                <RedUnderlineDoodle width={310} />
              </div>
            </div>
          </div>
          
          <button className="relative bg-[#C47D0E] text-white font-heading font-extrabold text-base px-8 py-3.5 rounded-[12px] border-2 border-[#2C2A24] shadow-[5px_5px_0px_#2C2A24] hover:shadow-[2px_2px_0px_#2C2A24] hover:translate-x-[3px] hover:translate-y-[3px] transition-all overflow-visible flex items-center gap-2 group mt-2"
            style={{ fontFamily: '"Nunito", sans-serif', backgroundColor: "#F5A623" }}>
            <div className="absolute -left-3 -top-3 group-hover:scale-110 transition-transform"><SparkleStar size={20} color="#FFD600"/></div>
            <div className="absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform"><SparkleStar size={18} color="#FFD600"/></div>
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 group-hover:scale-110 transition-transform"><SparkleStar size={14} color="#FFF"/></div>
            <span>Batch Generate (40 reports)</span>
          </button>
        </header>

        {/* ════════════════════════════════
            TOP STATUS BAR
        ════════════════════════════════ */}
        <div className="bg-white border-2 border-[#2C2A24] rounded-[14px] shadow-[3px_3px_0px_#2C2A24] px-6 py-4 mb-6 flex justify-between items-center shrink-0 w-full z-10">
          <div className="flex items-center gap-6">
            <span className="font-heading font-extrabold text-[#2C2A24] text-lg" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Term 2 Progress Reports · Class 8-A
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#E8E4D9]" />
            <div className="flex gap-4" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: "14px", fontWeight: 600 }}>
              <span className="text-[#5BAD6F]">{approvedCount} Approved</span>
              <span className="text-[#F5A623]">8 Draft</span>
              <span className="text-[#7A7670]">20 Pending</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="font-heading font-bold text-sm text-[#7A7670]">{approvedCount}/{totalReports} Done</span>
              <PencilProgressBar percent={(approvedCount / totalReports) * 100} />
            </div>
            <div className="w-px h-8 bg-[#E8E4D9]"></div>
            <button className="flex items-center gap-2 text-[#4A90D9] font-heading font-bold hover:text-[#2471A3] transition-colors" style={{ fontFamily: '"Nunito", sans-serif' }}>
              <DownloadArrowDoodle size={18} />
              Export All Approved
            </button>
          </div>
        </div>

        {/* ════════════════════════════════
            MAIN 3-COLUMN LAYOUT
        ════════════════════════════════ */}
        <div className="flex gap-6 flex-1 min-h-0 overflow-hidden pb-4">
          
          {/* ── LEFT COLUMN (Student List) ── */}
          <div className="w-[280px] shrink-0 flex flex-col bg-white border-2 border-[#E8E4D9] rounded-[16px] shadow-[3px_3px_0px_#E8E4D9] p-4">
            <div className="relative mb-4 shrink-0">
              <input type="text" placeholder="Search students..." 
                className="w-full bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-[10px] pl-10 pr-4 py-2.5 outline-none focus:border-[#4A90D9] transition-colors font-body text-sm" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <MagnifierDoodle size={18} />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {STUDENTS.map(student => {
                const isActive = selectedStudent.id === student.id;
                const badgeColor = 
                  student.status === "Approved" ? "bg-[#D5F5E3] text-[#5BAD6F] border-[#5BAD6F]" :
                  student.status === "Draft" ? "bg-[#FEF3DC] text-[#F5A623] border-[#F5A623]" :
                  "bg-[#F3F2EE] text-[#7A7670] border-[#C0BFBA]";
                  
                return (
                  <div key={student.id} 
                    onClick={() => setSelectedStudent(student)}
                    className={`flex items-center justify-between p-3 rounded-[12px] cursor-pointer transition-all border-2
                      ${isActive ? "bg-[#EEF5FF] border-[#4A90D9] shadow-[2px_2px_0px_#4A90D9]" : "border-transparent hover:bg-[#FDFBF5]"}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-heading font-extrabold text-sm border-2 border-[#2C2A24] shrink-0"
                          style={{ backgroundColor: avatarColor(student.avatarId), fontFamily: '"Nunito", sans-serif' }}>
                          {initials(student.name)}
                        </div>
                        {isActive && <HandRing size={48} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-[#2C2A24] text-sm leading-tight text-left" style={{ fontFamily: '"Nunito", sans-serif' }}>
                          {student.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-heading font-extrabold uppercase px-1.5 py-0.5 rounded border ${badgeColor}`}>
                            {student.status}
                          </span>
                          {student.status === "Approved" && <GoldStarSmall size={12} />}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* ── CENTER COLUMN (Report Preview & Hero) ── */}
          <div className="flex-1 flex flex-col bg-white border-2 border-[#2C2A24] rounded-[16px] shadow-[4px_4px_0px_#2C2A24] overflow-hidden min-w-0">
            {/* Column Header */}
            <div className="bg-[#FDFBF5] border-b-2 border-[#E8E4D9] px-6 py-4 shrink-0 flex justify-between items-center">
              <span className="font-heading font-extrabold text-[#2C2A24] text-lg" style={{ fontFamily: '"Nunito", sans-serif' }}>
                {selectedStudent.name} <span className="text-[#7A7670] font-semibold">· Progress Report</span>
              </span>
              <span className="px-3 py-1 bg-[#D6EAF8] text-[#2471A3] border-2 border-[#4A90D9] rounded-full text-xs font-bold uppercase" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Term 2
              </span>
            </div>
            
            {/* Document Scroll Area */}
            <div className="flex-1 overflow-y-auto bg-[#E8E4D9]/30 p-6 md:p-8 flex justify-center custom-scrollbar">
              {/* Actual Paper Document */}
              <div className="bg-white max-w-2xl w-full min-h-[800px] shadow-sm border border-[#E8E4D9] p-10 pt-12 relative flex flex-col">
                <div className="w-full h-2 bg-[#F5A623] absolute top-0 left-0" />
                
                {/* Letterhead */}
                <div className="text-center border-b-2 border-dashed border-[#E8E4D9] pb-6 mb-8">
                  <div className="w-16 h-16 bg-[#2C2A24] text-white flex items-center justify-center font-serif text-3xl font-bold mx-auto mb-3 rounded-sm shadow-sm">
                    K
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#2C2A24] tracking-wide uppercase">Klasso Academy</h2>
                  <p className="text-xs text-[#7A7670] font-mono mt-1 tracking-wider uppercase">Excellence in Education</p>
                </div>
                
                {/* Student Info Table */}
                <div className="grid grid-cols-2 gap-4 border-2 border-[#2C2A24] rounded-sm p-4 mb-8 text-sm">
                  <div><span className="text-[#7A7670] font-bold inline-block w-20">Student:</span> <span className="font-serif font-bold text-base">{selectedStudent.name}</span></div>
                  <div><span className="text-[#7A7670] font-bold inline-block w-20">Class:</span> <span className="font-serif font-bold text-base">8-A</span></div>
                  <div><span className="text-[#7A7670] font-bold inline-block w-20">Roll No:</span> <span className="font-serif font-bold text-base">{(selectedStudent.id + 12).toString().padStart(2, '0')}</span></div>
                  <div><span className="text-[#7A7670] font-bold inline-block w-20">Term:</span> <span className="font-serif font-bold text-base">2 (2025)</span></div>
                </div>
                
                {/* AI Text Narrative */}
                <h3 className="font-serif text-lg font-bold text-[#2C2A24] mb-3 uppercase tracking-wider relative inline-block">
                  Teacher's Remarks
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#4A90D9] w-12" />
                </h3>
                
                <div className="relative z-0">
                  <div className="font-serif text-[15px] leading-loose text-[#2C2A24] text-justify whitespace-pre-wrap">
                    {MOCK_REPORT_TEXT(selectedStudent.name)}
                  </div>
                  {/* Subtle highlighter effect behind text */}
                  <div className="absolute top-[28px] left-0 w-[40%] h-4 bg-[#FFD6E0] opacity-30 -z-10 mix-blend-multiply" />
                  <div className="absolute top-[88px] left-[5%] w-[80%] h-4 bg-[#FEF9E7] opacity-60 -z-10 mix-blend-multiply" />
                </div>
                
                {/* Grades Summary */}
                <div className="mt-8">
                  <h3 className="font-serif text-sm font-bold text-[#7A7670] mb-3 uppercase tracking-wider">Academic Overview</h3>
                  <table className="w-full text-sm font-serif border-collapse">
                    <tbody>
                      <tr className="border-b border-[#E8E4D9]"><td className="py-2">Mathematics</td><td className="text-right font-bold">92% (A)</td></tr>
                      <tr className="border-b border-[#E8E4D9]"><td className="py-2">Science</td><td className="text-right font-bold">88% (B+)</td></tr>
                      <tr className="border-b border-[#E8E4D9]"><td className="py-2">English</td><td className="text-right font-bold">95% (A+)</td></tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Signatures */}
                <div className="mt-auto pt-16 flex justify-between px-8">
                  <div className="text-center w-40 border-t border-[#2C2A24] pt-2 text-sm font-serif text-[#7A7670] relative">
                    {/* Fake signature */}
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-2xl opacity-60 text-[#2471A3]" style={{ fontFamily: '"Caveat", cursive', transform: "translateX(-50%) rotate(-5deg)" }}>M. Sharma</span>
                    Class Teacher
                  </div>
                  <div className="text-center w-40 border-t border-[#2C2A24] pt-2 text-sm font-serif text-[#7A7670]">
                    Principal
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="bg-[#FDFBF5] border-t-2 border-[#E8E4D9] p-4 shrink-0 flex items-center justify-between">
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-[#2C2A24] rounded-[10px] bg-white font-heading font-bold text-sm hover:bg-[#FDFBF5] hover:shadow-[2px_2px_0px_#2C2A24] transition-all">
                <RefreshIcon size={14} />
                Regenerate
              </button>
              
              <div className="flex gap-3">
                <button className="px-6 py-2 border-2 border-[#2C2A24] rounded-[10px] bg-white font-heading font-bold text-sm hover:bg-[#EEF5FF] transition-all">
                  Edit Text
                </button>
                <button className="flex items-center gap-2 px-8 py-2 border-2 border-[#2C2A24] rounded-[10px] bg-[#5BAD6F] text-white font-heading font-extrabold text-sm shadow-[3px_3px_0px_#2C2A24] hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[2px] w-[200px] justify-center hover:translate-y-[2px] transition-all">
                  <CheckmarkWhite size={18} />
                  Approve Report
                </button>
              </div>
            </div>
          </div>
          
          {/* ── RIGHT COLUMN (AI Controls) ── */}
          <div className="w-[300px] shrink-0 flex flex-col gap-5">
            {/* Report Settings Card */}
            <div className="bg-white border-2 border-[#E8E4D9] rounded-[16px] shadow-[3px_3px_0px_#E8E4D9] p-5">
              <div className="flex items-center gap-2 mb-6 border-b-2 border-[#FDFBF5] pb-3">
                <GearDoodle />
                <h2 className="font-heading font-extrabold text-[#2C2A24] text-lg">Report Settings</h2>
              </div>
              
              {/* Tone */}
              <div className="mb-5">
                <span className="block font-heading font-bold text-sm text-[#7A7670] mb-3">Tone</span>
                <div className="flex flex-col gap-2">
                  {["Encouraging", "Neutral", "Formal"].map(t => (
                    <label key={t} className="flex items-center gap-3 cursor-pointer group">
                      <div className="group-hover:scale-110 transition-transform"><RadioDoodle checked={tone === t} /></div>
                      <span className={`font-body text-sm font-medium ${tone === t ? "text-[#2C2A24]" : "text-[#7A7670]"}`}
                        onClick={() => setTone(t)}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Length */}
              <div className="mb-5">
                <span className="block font-heading font-bold text-sm text-[#7A7670] mb-3">Length</span>
                <div className="flex bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-[8px] p-1">
                  {["Short", "Standard", "Detailed"].map(l => (
                    <button key={l} onClick={() => setLengthPref(l)}
                      className={`flex-1 py-1.5 text-xs font-heading font-bold rounded-[6px] transition-all ${lengthPref === l ? "bg-[#4A90D9] text-white shadow-sm" : "text-[#7A7670] hover:bg-[#E8E4D9]/50"}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include */}
              <div>
                <span className="block font-heading font-bold text-sm text-[#7A7670] mb-3">Include Sections</span>
                <div className="flex flex-col gap-2.5">
                  {Object.entries(includes).map(([key, value]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div className="group-hover:scale-110 transition-transform" onClick={() => setIncludes({...includes, [key]: !value})}>
                        <CheckboxDoodle checked={value} />
                      </div>
                      <span className="font-body text-sm text-[#2C2A24] capitalize font-medium cursor-pointer" onClick={() => setIncludes({...includes, [key]: !value})}>{key}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            {/* AI Insights Card */}
            <div className="bg-[#FEF3DC] border-2 border-[#F5A623] rounded-[16px] shadow-[3px_3px_0px_#F5A623] p-5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4"><OpenBookDoodle /></div>
              
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <LightbulbIcon />
                <h3 className="font-heading font-extrabold text-[#C47D0E] text-base">AI Insights</h3>
              </div>
              
              <ul className="space-y-3 relative z-10">
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0"><TinyArrowDoodle /></div>
                  <span className="font-body text-sm font-medium text-[#2C2A24]">{selectedStudent.name.split(" ")[0]} improved 12% in Math this term <span className="text-[#5BAD6F] font-bold">↑</span></span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0"><TinyArrowDoodle /></div>
                  <span className="font-body text-sm font-medium text-[#2C2A24]">Attendance dropped in Jan — detail it?</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0"><TinyArrowDoodle /></div>
                  <span className="font-body text-sm font-medium text-[#2C2A24]">Strong performer in Science — highlight?</span>
                </li>
              </ul>
            </div>
          </div>
          
        </div>
      </main>
      
      {/* Scrollbar hide classes injection for this page only if needed */}
      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E8E4D9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C0BFBA; }
      `}} />
    </div>
  );
}
