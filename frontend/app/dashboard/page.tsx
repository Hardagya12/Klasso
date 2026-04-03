"use client";
import React from "react";
import {
  PencilSVG,
  SquigglySVG,
  StarburstSVG,
  CircleRingSVG,
  DashboardStatCard,
  HouseDoodle,
  AttendanceDoodle,
  ChartDoodle,
  ReportDoodle,
  StackDoodle,
  GridDoodle,
  MessageDoodle,
  PeopleDoodle,
  LightbulbDoodle,
  NotebookTexture,
  ScatteredDoodles,
  StickerStar,
  StickerApple,
  RulerPencilDoodle,
} from "../components/dashboard/DashboardComponents";

const SidebarItem = ({ icon: Icon, label, active = false }: any) => (
  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group
    ${active ? "bg-primary-light border-primary border-2 shadow-[2px_2px_0px_#2C2A24]" : "hover:bg-primary-light/50 border-2 border-transparent"}`}>
    <div className={`${active ? "text-primary" : "text-text-muted"} group-hover:text-primary transition-colors`}>
      {Icon}
    </div>
    <span className={`font-heading font-bold ${active ? "text-text" : "text-text-muted"} group-hover:text-text transition-colors`}>
      {label}
    </span>
  </div>
);

export default function TeacherDashboard() {
  return (
    <div className="flex min-h-screen bg-background font-body relative overflow-hidden">
      {/* ━━━ BACKGROUND DOODLE OVERLAY ━━━ */}
      <NotebookTexture />
      <ScatteredDoodles />

      {/* ─── LEFT SIDEBAR (240px) ─── */}
      <aside className="w-[240px] fixed h-screen border-r-2 border-border bg-surface flex flex-col p-6 z-50">
        {/* Notebook margin line */}
        <div className="absolute left-10 top-0 bottom-0 w-px bg-accent opacity-20 pointer-events-none" />
        
        <div className="mb-8 relative">
          <div className="flex items-center gap-2 mb-1">
            <PencilSVG size={28} />
            <h1 className="text-2xl font-heading font-extrabold text-text leading-none group cursor-default">
              Klasso
              <span className="absolute -top-1 -right-4 animate-bounce">✨</span>
            </h1>
          </div>
          <SquigglySVG width={80} color="#F5A623" />
        </div>

        <div className="flex flex-col items-center mb-10 text-center relative pt-4">
          <div className="relative w-16 h-16 mb-2">
            <CircleRingSVG size={64} />
            <div className="w-14 h-14 rounded-full bg-primary-light absolute top-1 left-1 border-2 border-border-dark overflow-hidden flex items-center justify-center font-heading font-bold text-lg">
              PS
            </div>
          </div>
          <p className="font-heading font-extrabold text-text">Priya Sharma</p>
          <p className="text-xs font-accent text-text-muted font-bold">Grade 8 · Math & Science</p>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          <SidebarItem label="Dashboard" active icon={<HouseDoodle size={20} />} />
          <SidebarItem label="Attendance" icon={<AttendanceDoodle size={20} />} />
          <SidebarItem label="Grades" icon={<ChartDoodle size={20} />} />
          <SidebarItem label="Reports" icon={<ReportDoodle size={20} />} />
          <SidebarItem label="Assignments" icon={<StackDoodle size={18} />} />
          <SidebarItem label="Timetable" icon={<GridDoodle size={20} />} />
          <SidebarItem label="Messages" icon={<MessageDoodle size={20} />} />
          <SidebarItem label="Students" icon={<PeopleDoodle size={18} />} />
        </div>

        <div className="mt-auto border-t-2 border-border pt-6 space-y-4">
          <button className="w-full bg-primary py-3 rounded-xl border-2 border-border-dark shadow-retro font-heading font-bold flex items-center justify-center gap-2 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_#2C2A24] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all relative overflow-hidden group">
            {/* Glowing amber background */}
            <div className="absolute inset-0 bg-primary opacity-50 blur-lg group-hover:opacity-80 transition-opacity" />
            <span className="relative z-10 flex items-center gap-2">
              <LightbulbDoodle size={20} />
              AI Assistant
            </span>
          </button>
          <div className="flex justify-center opacity-60">
             <RulerPencilDoodle size={48} />
          </div>
        </div>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <main className="flex-1 ml-[240px] flex flex-col">
        {/* TOP HEADER (64px) */}
        <header className="h-[64px] border-b-2 border-border bg-surface px-8 flex items-center justify-between sticky top-0 z-40">
          <p className="font-accent text-xl font-bold text-text-muted">
            Thursday, 3rd April <span className="text-primary">✦</span>
          </p>

          <div className="flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search students, classes..."
              className="w-full border-2 border-border rounded-full px-5 py-1.5 font-body focus:border-primary focus:outline-none focus:shadow-[2px_2px_0px_#F5A623] transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
              <PencilSVG size={14} color="currentColor" />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative cursor-pointer">
                <BellIcon size={24} />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-surface animate-pulse" />
             </div>
             <SettingsIcon size={24} />
             <div className="w-8 h-8 rounded-full border-2 border-border-dark bg-secondary-light" />
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-8">
          {/* STAT CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 relative">
            <div className="absolute -top-6 -left-6 z-20 rotate-[-12deg] hover:rotate-0 transition-transform">
              <StickerStar size={44} />
            </div>
            <div className="absolute -bottom-4 right-[25%] z-20 rotate-[15deg] hover:scale-110 transition-transform">
              <StickerApple size={40} />
            </div>

            <DashboardStatCard label="Today's Attendance" value="36/40" color="#5BAD6F" icon={PeopleDoodle} progress={90} />
            <DashboardStatCard label="Pending Grades" value="12" color="#F5A623" icon={StackDoodle} progress={60} />
            <DashboardStatCard label="Reports Due" value="3" color="#4A90D9" icon={ReportDoodle} progress={30} />
            <DashboardStatCard label="AI Time Saved" value="4.2 hrs" color="#E8534A" icon={LightbulbDoodle} progress={85} />
          </div>

          {/* TWO COLUMN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">
            {/* LEFT COLUMN: Schedule */}
            <div className="relative">
              <div className="absolute -top-4 -right-2 z-20 rotate-12 opacity-80">
                <StickerStar size={32} color="#4A90D9" />
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-3">
                   <ClockIcon size={24} className="text-text-muted" />
                   <h3 className="text-xl font-heading font-extrabold text-text">Today&apos;s Class Schedule</h3>
                </div>
                <SquigglySVG width={260} color="#E8E4D9" />
              </div>

              <div className="space-y-4">
                {[
                  { time: "09:00 - 10:00", subject: "Math", class: "Grade 8-A", active: false, past: true },
                  { time: "10:15 - 11:15", subject: "Science", class: "Grade 8-C", active: true, past: false },
                  { time: "11:30 - 12:30", subject: "Practical", class: "Lab B", active: false, past: false },
                  { time: "13:30 - 14:30", subject: "Math", class: "Grade 8-B", active: false, past: false },
                ].map((slot, i) => (
                  <div key={i} className={`bg-surface border-2 rounded-[16px] p-4 flex items-center justify-between shadow-retro relative overflow-hidden transition-all
                    ${slot.active ? "border-primary border-l-[12px]" : "border-border"}
                    ${slot.past ? "opacity-60" : "opacity-100"}
                  `}>
                    {slot.active && <div className="absolute top-1 right-2"><DashboardStar size={20} /></div>}
                    {slot.past && <div className="absolute top-1 left-2"><DoodledCheck size={16} /></div>}

                    <div className="flex items-center gap-6">
                      <p className="font-heading font-extrabold text-sm text-text-muted w-24">{slot.time}</p>
                      <div>
                        <p className="font-heading font-extrabold text-text">{slot.subject}</p>
                        <p className="text-xs text-text-muted font-bold">{slot.class}</p>
                      </div>
                    </div>

                    <button className={`font-heading font-bold text-xs px-4 py-2 rounded-lg border-2 border-border-dark
                      ${slot.past ? "bg-border text-text-muted border-none" : "bg-primary shadow-retro"}
                    `}>
                      {slot.past ? "Marked" : "Take Attendance"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Attention Students */}
            <div className="relative">
              <div className="absolute -bottom-6 -right-4 z-20 -rotate-12 opacity-80 scale-75">
                 <PencilSVG size={48} />
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-3">
                   <WarningFlag size={24} className="text-accent" />
                   <h3 className="text-xl font-heading font-extrabold text-text">Students Needing Attention</h3>
                </div>
                <WavyUnderline width={300} />
              </div>

              <div className="bg-surface border-2 border-border rounded-[16px] shadow-retro overflow-hidden">
                {[
                  { name: "Arjun Mehta", issue: "Low attendance", level: "red" },
                  { name: "Sanya Gupta", issue: "Failing grade", level: "amber" },
                  { name: "Vikram Singh", issue: "Behavioral", level: "amber" },
                  { name: "Isha Patel", issue: "Late submissions", level: "red" },
                ].map((st, i) => (
                  <div key={i} className="p-4 border-b-2 last:border-0 border-border group hover:bg-background transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border-2 border-border-dark flex items-center justify-center font-heading font-bold relative">
                         <CircleRingSVG size={40} color={st.level === "red" ? "#E8534A" : "#F5A623"} />
                         <span className="relative z-10 text-xs">{st.name[0]}</span>
                      </div>
                      <div>
                         <p className="font-heading font-bold text-sm text-text">{st.name}</p>
                         <span className={`text-[10px] uppercase font-heading font-bold px-2 py-0.5 rounded-full border
                           ${st.level === "red" ? "bg-accent-light text-accent border-accent" : "bg-primary-light text-primary border-primary"}
                         `}>
                           {st.issue}
                         </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <DoodleArrowRight size={24} />
                       <button className="text-text-muted hover:text-text"><DotsVertical size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT ACTIVITY FEED */}
          <div className="mt-16">
             <div className="mb-6">
                <h3 className="text-xl font-heading font-extrabold text-text">Recent Activity Feed</h3>
                <SquigglySVG width={180} color="#F5A623" />
             </div>

             <div className="max-w-2xl border-l-[3px] border-dotted border-border-dark ml-4 pl-8 space-y-8 relative">
                {[
                   "Attendance marked for Grade 8-A Math class.",
                   "Generated monthly progress report for Arjun Mehta.",
                   "Updated homework status for Grade 8-C Science.",
                   "Sent lesson plan to HOD for Science Practical.",
                   "Responded to Sanya Gupta's message regarding assignment."
                ].map((text, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[45px] top-1.5 w-6 h-6 rounded-full bg-surface border-2 border-border-dark flex items-center justify-center">
                       <DoodleDot size={12} />
                    </div>
                    <div>
                      <p className="text-text font-heading font-bold mb-1">{text}</p>
                      <p className="font-accent font-bold text-text-muted">Today at {10 - i}:30 AM ✦</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>

      {/* MID-CENTURY ACCENT: Starburst in top-right */}
      <div className="fixed top-12 right-12 opacity-40 pointer-events-none animate-pulse">
        <StarburstSVG size={72} color="#F5A623" />
      </div>
      <div className="fixed bottom-24 right-36 opacity-30 pointer-events-none">
        <StarburstSVG size={32} color="#4A90D9" />
      </div>
    </div>
  );
}

// ─── LOCAL UTILITY ICONS (Doodle versions) ───
const DashboardIcon = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CheckSquare = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const BarChart = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const PaperFold = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const GridIcon = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>;
const SpeechBubbleIcon = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const LightbulbIcon = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21h6"/><path d="M9 18h6"/><path d="M10 15H9a7 7 0 1 1 6 0h-1"/><path d="M11 11V8"/><path d="M13 11V8"/></svg>;
const BellIcon = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const SettingsIcon = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const ClockIcon = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const DashboardStar = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5A623" stroke="#2C2A24" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.27 7.82 21l1.18-6.88-5-4.87 6.91-1.01L12 2z"/></svg>;
const DoodledCheck = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#5BAD6F" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
const WarningFlag = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
const WavyUnderline = ({ width }: any) => <svg width={width} height="10" viewBox={`0 0 ${width} 10`} fill="none"><path d={`M2 5Q${width / 4} 1 ${width / 2} 5T${width} 5`} stroke="#E8534A" strokeWidth="2" strokeLinecap="round"/></svg>;
const DoodleArrowRight = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7A7670" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
const DotsVertical = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>;
const DoodleDot = ({ size }: any) => <svg width={size} height={size} viewBox="0 0 12 12" fill="#2C2A24"><circle cx="6" cy="6" r="4"/></svg>;

