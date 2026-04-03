"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, MessageCircle, FileText, Sparkles, BookOpen, Clock, 
  Lightbulb, ShieldAlert, Award, Calendar, Download
} from "lucide-react";

// Doodles
const PaperclipDoodle = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" className="transform rotate-[30deg]">
    <path d="M45 25V65C45 73.28 51.71 80 60 80C68.28 80 75 73.28 75 65V30C75 24.47 70.52 20 65 20C59.47 20 55 24.47 55 30V65C55 67.76 57.23 70 60 70C62.76 70 65 67.76 65 65V35" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

const RingDoodle = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" className="absolute -top-2 -left-2 z-0 animate-[spin_10s_linear_infinite]">
    <path d="M50 5C74.85 5 95 25.14 95 50C95 74.85 74.85 95 50 95C25.14 95 5 74.85 5 50C5 25.14 25.14 5 50 5Z" stroke="#F59E0B" strokeWidth="3" strokeDasharray="10 6" strokeLinecap="round"/>
  </svg>
);

const StarBadge = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
    <path d="M50 10L62.36 38.63L93.3 38.63L68.27 56.81L77.81 85.45L50 67.27L22.18 85.45L31.72 56.81L6.69 38.63L37.63 38.63L50 10Z" fill="#FBBF24" stroke="#D97706" strokeWidth="4" strokeLinejoin="round"/>
  </svg>
);

const ProgressRingDoodle = ({ value }: { value: number }) => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none" className="transform -rotate-90">
    <circle cx="50" cy="50" r="40" stroke="#FEE2E2" strokeWidth="8" />
    <path d="M50 10 A 40 40 0 1 1 10 50" stroke={value < 85 ? "#F59E0B" : "#10B981"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${value * 2.51} 251`}/>
  </svg>
);

const AppleDoodle = () => (
  <svg width="30" height="30" viewBox="0 0 100 100" fill="none">
    <path d="M50 30C65 30 75 40 75 60C75 80 60 90 50 90C40 90 25 80 25 60C25 40 35 30 50 30Z" fill="#EF4444" stroke="#B91C1C" strokeWidth="4"/>
    <path d="M45 10Q50 20 50 30" stroke="#15803D" strokeWidth="4" strokeLinecap="round"/>
    <path d="M50 20Q60 15 65 25" fill="#22C55E" stroke="#15803D" strokeWidth="3"/>
  </svg>
);

const GradeBadge = ({ grade }: { grade: string }) => (
  <div className="relative">
    <svg width="60" height="50" viewBox="0 0 100 80" fill="none" className="absolute -top-1 -left-2 z-0">
       <path d="M10 40Q30 10 90 20Q80 60 40 70Q10 60 10 40Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5 5"/>
    </svg>
    <span className="relative z-10 text-3xl font-black text-blue-700 font-['Caveat']">{grade}</span>
  </div>
);

const StackDoodle = () => (
  <svg width="50" height="40" viewBox="0 0 100 80" fill="none">
     <path d="M10 30L50 15L90 30L50 45L10 30Z" fill="#F3E8FF" stroke="#9333EA" strokeWidth="4" strokeLinejoin="round"/>
     <path d="M10 45L50 60L90 45" stroke="#9333EA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
     <path d="M10 60L50 75L90 60" stroke="#9333EA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RulerDoodle = () => (
  <svg width="100%" height="20" viewBox="0 0 300 30" fill="none" preserveAspectRatio="none">
    <rect x="0" y="5" width="100%" height="20" fill="#FDE68A" stroke="#D97706" strokeWidth="2"/>
    <path d="M10 5V15 M30 5V10 M50 5V15 M70 5V10 M90 5V15 M110 5V10 M130 5V15 M150 5V10 M170 5V15 M190 5V10 M210 5V15 M230 5V10 M250 5V15 M270 5V10 M290 5V15" stroke="#D97706" strokeWidth="2"/>
  </svg>
);

const SparklineSVG = () => (
  <svg width="100" height="30" viewBox="0 0 100 30" fill="none">
    <path d="M5 25L25 10L45 15L65 5L85 20L95 10" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="5" cy="25" r="3" fill="#3B82F6"/>
    <circle cx="25" cy="10" r="3" fill="#3B82F6"/>
    <circle cx="45" cy="15" r="3" fill="#3B82F6"/>
    <circle cx="65" cy="5" r="3" fill="#3B82F6"/>
    <circle cx="85" cy="20" r="3" fill="#3B82F6"/>
    <circle cx="95" cy="10" r="3" fill="#3B82F6"/>
  </svg>
);

export default function StudentProfile() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [activeTab, setActiveTab] = useState("Overview");

  // Mock Student
  const student = {
    name: "Isha Sharma", class: "8-A", roll: "14", isTopPerformer: true,
    tags: [{ label: "Math Weak", color: "bg-red-100 text-red-700 border-red-300" }, { label: "Science Strong", color: "bg-green-100 text-green-700 border-green-300" }, { label: "Fee Pending", color: "bg-gray-100 text-gray-700 border-gray-300" }],
    avatar: "https://i.pravatar.cc/150?u=2",
    attendance: 82, grade: "B+", assignments: "18/22",
    aiInsights: ["Attendance dropped 15% this month, correlating with missed assignments.", "Shows strong aptitude in practical Science projects.", "Needs immediate intervention for upcoming Math midterm."],
    subjects: [
      { name: "Mathematics", grade: "C-", progress: 65, color: "#EF4444" },
      { name: "Science", grade: "A", progress: 92, color: "#10B981" },
      { name: "English", grade: "B+", progress: 85, color: "#3B82F6" },
      { name: "History", grade: "B", progress: 78, color: "#F59E0B" },
      { name: "Art", grade: "A+", progress: 98, color: "#8B5CF6" },
      { name: "Geography", grade: "B-", progress: 72, color: "#EC4899" }
    ]
  };

  const TABS = ["Overview", "Attendance", "Grades", "Notes & Docs"];

  return (
    <div className="flex min-h-screen bg-[#Fdfbfc] text-[#4A473F] font-sans" style={{ backgroundImage: 'radial-gradient(#E8E4D9 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}>
      <Sidebar collapsed={true} />

      <main className="flex-1 ml-[80px] px-8 py-8 w-full max-w-full">
        {/* Breadcrumb / Back Navigation */}
        <Link href="/students" className="inline-flex items-center gap-2 text-[#7A7670] hover:text-[#2C2A24] font-bold mb-6 font-['Nunito']">
            <ChevronLeft size={20} strokeWidth={3} /> Back to Directory
        </Link>

        {/* HERO SECTION */}
        <div className="relative bg-white border-2 border-[#E8E4D9] rounded-2xl p-8 mb-12 shadow-[4px_4px_0_#E8E4D9] overflow-hidden" 
            style={{ 
              backgroundImage: 'linear-gradient(transparent 95%, #FDE68A 95%)', 
              backgroundSize: '100% 32px' 
            }}>
          <div className="absolute top-4 right-4"><PaperclipDoodle /></div>
          
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              {/* Avatar + Ring + Star */}
              <div className="relative">
                 <div className="w-20 h-20 rounded-full border-2 border-[#2C2A24] relative z-10 overflow-hidden bg-white">
                    <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <RingDoodle />
                 {student.isTopPerformer && (
                    <div className="absolute -bottom-2 -right-2 z-20">
                      <StarBadge />
                    </div>
                 )}
              </div>

              {/* Info */}
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-[#2C2A24] font-['Nunito']">{student.name}</h1>
                    <span className="text-[#A39E93] font-bold text-lg">• Class {student.class} • Roll No. {student.roll}</span>
                 </div>
                 <div className="flex gap-2">
                   {student.tags.map((tag, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${tag.color} font-['Nunito'] uppercase tracking-wider`}>
                        {tag.label}
                      </span>
                   ))}
                 </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
               <button className="flex items-center gap-2 bg-purple-50 text-purple-700 border-2 border-purple-200 px-4 py-2 rounded-xl font-bold hover:bg-purple-100 shadow-[2px_2px_0_#E9D5FF] active:shadow-none active:translate-y-1 transition-all">
                  <Sparkles size={18} /> Generate Report
               </button>
               <button className="flex items-center gap-2 bg-blue-50 text-blue-700 border-2 border-blue-200 px-4 py-2 rounded-xl font-bold hover:bg-blue-100 shadow-[2px_2px_0_#BFDBFE] active:shadow-none active:translate-y-1 transition-all">
                  <MessageCircle size={18} /> Message Parent
               </button>
               <button className="flex items-center gap-2 bg-amber-400 text-[#2C2A24] border-2 border-amber-500 px-4 py-2 rounded-xl font-bold hover:bg-amber-300 shadow-[2px_2px_0_#D97706] active:shadow-none active:translate-y-1 transition-all">
                  <FileText size={18} /> Add Note
               </button>
            </div>
          </div>
        </div>

        {/* TABS (Sticker Style) */}
        <div className="relative z-10 w-full mb-[-2px] flex gap-3 pl-8">
            {TABS.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-t-xl font-bold border-2 border-b-0 border-[#E8E4D9] transition-all font-['Caveat'] text-2xl
                ${activeTab === tab ? 'bg-amber-400 text-[#2C2A24] h-[54px] z-20 shadow-[0_-4px_0_rgba(0,0,0,0.05)]' : 'bg-[#FAFAFA] text-[#A39E93] h-[48px] mt-[6px] hover:bg-[#F3F4F6] z-10'}`}
              >
                {tab}
              </button>
            ))}
        </div>

        {/* TAB CONTENT (The Folder Base) */}
        <div className="bg-white border-2 border-[#E8E4D9] rounded-2xl rounded-tl-none shadow-[8px_8px_0_#D1D5DB] p-8 w-full min-h-[600px] relative z-20 overflow-hidden">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "Overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               {/* Stat Cards */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                 <div className="bg-[#FAF9F6] border-2 border-dashed border-[#E8E4D9] p-6 rounded-2xl flex items-center gap-6 relative">
                    <div className="relative">
                      <ProgressRingDoodle value={student.attendance} />
                      <div className="absolute inset-0 flex items-center justify-center font-bold font-['Nunito'] text-sm">{student.attendance}%</div>
                    </div>
                    <div>
                       <div className="text-[#A39E93] text-sm font-bold uppercase tracking-widest mb-1">Attendance</div>
                       <div className="text-2xl font-black text-[#2C2A24] font-['Nunito']">Needs Focus</div>
                    </div>
                 </div>

                 <div className="bg-[#FAF9F6] border-2 border-dashed border-[#E8E4D9] p-6 rounded-2xl flex items-center gap-6">
                    <GradeBadge grade={student.grade} />
                    <div>
                       <div className="text-[#A39E93] text-sm font-bold uppercase tracking-widest mb-1">Average Grade</div>
                       <div className="text-2xl font-black text-[#2C2A24] font-['Nunito']">Good Standing</div>
                    </div>
                 </div>

                 <div className="bg-[#FAF9F6] border-2 border-dashed border-[#E8E4D9] p-6 rounded-2xl flex items-center gap-6">
                    <StackDoodle />
                    <div>
                       <div className="text-[#A39E93] text-sm font-bold uppercase tracking-widest mb-1">Assignments</div>
                       <div className="text-2xl font-black text-[#2C2A24] font-['Nunito']">{student.assignments}</div>
                    </div>
                 </div>
               </div>

               {/* Performance Timeline */}
               <div className="bg-white border-2 border-[#E8E4D9] rounded-2xl p-6 mb-10 relative shadow-[2px_2px_0_#F3F4F6]">
                  <h3 className="text-xl font-bold font-['Nunito'] mb-6 flex items-center gap-2">
                     <svg width="24" height="24" viewBox="0 0 100 100" fill="none"><path d="M10 90L90 90M10 90V10M10 90L30 50L50 60L90 20" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     Performance Timeline (Yearly Trend)
                  </h3>
                  {/* Wobbly line chart visualization */}
                  <div className="relative h-48 w-full border-b-2 border-l-2 border-[#E8E4D9] flex items-end ml-4">
                     {/* Y-Axis labels */}
                     <div className="absolute -left-8 bottom-0 text-xs font-bold text-[#A39E93]">0%</div>
                     <div className="absolute -left-10 top-1/2 text-xs font-bold text-[#A39E93]">50%</div>
                     <div className="absolute -left-12 top-0 text-xs font-bold text-[#A39E93]">100%</div>
                     
                     <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute bottom-0 left-0">
                       <path d="M50 120 Q150 140 250 80 T450 60 T650 90 T850 40 T950 20" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"/>
                       <circle cx="50" cy="120" r="10" fill="#FBBF24" stroke="#B45309" strokeWidth="3"/>
                       <circle cx="250" cy="80" r="10" fill="#FBBF24" stroke="#B45309" strokeWidth="3"/>
                       <circle cx="450" cy="60" r="10" fill="#FBBF24" stroke="#B45309" strokeWidth="3"/>
                       <circle cx="650" cy="90" r="10" fill="#FBBF24" stroke="#B45309" strokeWidth="3"/>
                       <circle cx="850" cy="40" r="10" fill="#FBBF24" stroke="#B45309" strokeWidth="3"/>
                       <circle cx="950" cy="20" r="10" fill="#FBBF24" stroke="#B45309" strokeWidth="3"/>
                     </svg>
                     
                     <div className="absolute -bottom-8 left-[50px] text-xs font-bold text-[#A39E93]">Sep</div>
                     <div className="absolute -bottom-8 left-[250px] text-xs font-bold text-[#A39E93]">Oct</div>
                     <div className="absolute -bottom-8 left-[450px] text-xs font-bold text-[#A39E93]">Nov</div>
                     <div className="absolute -bottom-8 left-[650px] text-xs font-bold text-[#A39E93]">Dec</div>
                     <div className="absolute -bottom-8 left-[850px] text-xs font-bold text-[#A39E93]">Jan</div>
                     <div className="absolute -bottom-8 left-[950px] text-xs font-bold text-[#A39E93]">Feb</div>
                  </div>
                  <div className="mt-12 text-center text-sm font-bold text-[#A39E93] italic">Aggregate monthly averages plotted</div>
               </div>

               {/* AI Insights Card */}
               <div className="bg-[#FFFBEB] border-2 border-amber-200 rounded-2xl p-6 relative">
                  <div className="absolute -top-4 -left-4 bg-amber-100 rounded-full p-2 border-2 border-amber-300">
                     <Lightbulb className="text-amber-500" size={32} />
                  </div>
                  <h3 className="text-xl font-black font-['Nunito'] text-amber-900 ml-10 mb-4">AI Observations</h3>
                  <ul className="space-y-4">
                    {student.aiInsights.map((insight, i) => (
                      <li key={i} className="flex gap-4 items-start text-amber-800 font-medium text-lg">
                        <svg width="30" height="30" viewBox="0 0 100 100" fill="none" className="shrink-0 mt-1">
                          <path d="M20 50Q50 20 80 50M60 30L80 50L60 70" stroke="#D97706" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        "{insight}"
                      </li>
                    ))}
                  </ul>
               </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === "Attendance" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black font-['Nunito'] text-[#2C2A24] flex items-center gap-3">
                  <Calendar className="text-emerald-500" /> Attendance Ledger
                </h3>
                <button className="flex items-center gap-2 bg-red-50 text-red-700 border-2 border-red-200 px-4 py-2 rounded-xl font-bold shadow-[2px_2px_0_#FECACA] hover:bg-red-100 active:translate-y-1 active:shadow-none transition-all">
                   <ShieldAlert size={18} /> Send Attendance Warning
                </button>
              </div>

              {/* Monthly Grid Mock */}
              <div className="grid grid-cols-7 gap-2 mb-8 bg-[#FAFAFA] p-6 rounded-2xl border-2 border-[#E8E4D9]">
                 {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d} className="text-center font-bold text-[#A39E93]">{d}</div>)}
                 {Array.from({length: 30}).map((_, i) => (
                    <div key={i} className={`aspect-square rounded-xl border-2 flex items-center justify-center font-bold font-['Nunito'] ${
                       [12, 14, 28].includes(i+1) ? 'bg-red-100 border-red-300 text-red-700 relative' : 
                       [5, 6].includes(i+1) ? 'bg-amber-100 border-amber-300 text-amber-700' : 
                       'bg-white border-[#E8E4D9] text-[#4A473F]'
                    }`}>
                      {i+1}
                      {[12, 14, 28].includes(i+1) && <div className="absolute inset-0 m-auto w-[120%] h-[2px] bg-red-500 transform rotate-45 pointer-events-none"/>}
                    </div>
                 ))}
              </div>

              {/* Absence Log */}
              <h4 className="font-bold text-[#4A473F] mb-4">Absence Log (Current Term)</h4>
              <table className="w-full text-left">
                 <thead>
                   <tr className="border-b-2 border-dashed border-[#E8E4D9]">
                     <th className="py-3 text-[#A39E93]">Date</th>
                     <th className="py-3 text-[#A39E93]">Reason</th>
                     <th className="py-3 text-[#A39E93]">Parent Notified</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y-2 divide-dashed divide-[#F3F4F6]">
                   {[{ d: "Oct 28", r: "Sick Leave (Fever)", n: true }, { d: "Oct 14", r: "Unexcused Absence", n: true }, { d: "Oct 12", r: "Unexcused Absence", n: false }].map((ab, i) => (
                     <tr key={i}>
                       <td className="py-4 font-bold">{ab.d}</td>
                       <td className="py-4 font-medium text-[#7A7670]">{ab.r}</td>
                       <td className="py-4">
                         {ab.n ? (
                           <svg width="24" height="24" viewBox="0 0 100 100" fill="none"><path d="M20 50L40 70L80 30" stroke="#10B981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                         ) : (
                           <span className="text-[#A39E93] text-sm font-bold">Pending</span>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: GRADES */}
          {activeTab === "Grades" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {student.subjects.map((sub, i) => (
                     <div key={i} className="bg-white border-2 border-[#E8E4D9] rounded-2xl p-6 shadow-[2px_2px_0_#E8E4D9] group hover:-translate-y-1 transition-transform relative overflow-hidden" style={{ borderLeftColor: sub.color, borderLeftWidth: 8 }}>
                        <div className="flex justify-between items-start mb-4">
                           <h4 className="text-xl font-bold font-['Nunito'] text-[#2C2A24]">{sub.name}</h4>
                           <span className="text-3xl font-black font-['Caveat']" style={{ color: sub.color }}>{sub.grade}</span>
                        </div>
                        
                        {/* Progress */}
                        <div className="mb-4">
                           <div className="flex justify-between text-xs font-bold text-[#A39E93] mb-1">
                              <span>Term Progress</span><span>{sub.progress}%</span>
                           </div>
                           <div className="w-full bg-[#F3F4F6] h-3 rounded-full overflow-hidden border-2 border-[#E8E4D9]">
                              <div className="h-full rounded-r-none rounded-l-full" style={{ width: `${sub.progress}%`, backgroundColor: sub.color }} />
                           </div>
                        </div>

                        {/* Recent Performance Sparkline */}
                        <div className="flex items-center gap-3">
                           <span className="text-xs font-bold text-[#A39E93]">Recent</span>
                           <SparklineSVG />
                        </div>

                        {/* Hand-drawn Ruler decoration */}
                        <div className="absolute bottom-0 left-0 w-full opacity-50 translate-y-1/2 group-hover:translate-y-0 transition-transform">
                           <RulerDoodle />
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* TAB 4: NOTES & DOCS */}
          {activeTab === "Notes & Docs" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Left: Notes Section (Lined Paper Style) */}
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <h3 className="text-2xl font-black font-['Nunito'] text-[#2C2A24]">Teacher Log</h3>
                     <AppleDoodle />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 opacity-50 transform -rotate-12"><PaperclipDoodle /></div>
                    <textarea 
                      className="w-full h-80 rounded-xl p-8 pt-10 font-bold text-xl font-['Caveat'] text-blue-900 border-2 border-dashed border-[#E8E4D9] focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-50 resize-none shadow-[4px_4px_0_#E8E4D9]"
                      placeholder="Write an observational note here..."
                      style={{ 
                        backgroundImage: 'linear-gradient(transparent 95%, #E2E8F0 95%)', 
                        lineHeight: '2rem',
                        backgroundSize: '100% 2rem',
                        backgroundColor: '#F8FAFC'
                      }}
                       defaultValue={"Isha seemed distracted during today's math module. Need to check if she is understanding the core concepts of Algebra."}
                    />
                  </div>
                  <button className="mt-4 flex items-center gap-2 bg-[#2C2A24] text-white px-6 py-3 rounded-xl font-bold hover:bg-black shadow-[2px_2px_0_#A39E93] active:translate-y-1 active:shadow-none transition-all">
                    Save Note
                  </button>
               </div>

               {/* Right: Docs List */}
               <div>
                 <h3 className="text-2xl font-black font-['Nunito'] text-[#2C2A24] mb-4">Documents File</h3>
                 <div className="space-y-3">
                   {[
                     { name: "Medical Certificate (Flu)", date: "Oct 29", icon: ShieldAlert },
                     { name: "Bonafide Certificate Request", date: "Sep 15", icon: BookOpen },
                     { name: "Science Fair Registration", date: "Aug 02", icon: Lightbulb }
                   ].map((doc, i) => {
                      const Icon = doc.icon;
                      return (
                       <div key={i} className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-[#E8E4D9] hover:bg-[#FAF9F6] group cursor-pointer transition-colors">
                          <div className="flex items-center gap-4">
                             <div className="bg-white p-2 border-2 border-[#E8E4D9] rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                <Icon className="text-blue-500" size={20} />
                             </div>
                             <div>
                                <div className="font-bold text-[#4A473F]">{doc.name}</div>
                                <div className="text-xs font-bold text-[#A39E93]">{doc.date}</div>
                             </div>
                          </div>
                          <Download className="text-[#A39E93] group-hover:text-blue-500 transition-colors" size={20} />
                       </div>
                     )
                   })}
                 </div>
               </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
