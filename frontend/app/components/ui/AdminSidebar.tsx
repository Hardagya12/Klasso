"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ═══════════════════════════════════════════════
//  SVG DOODLES - ICONS
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

// ═══════════════════════════════════════════════
//  NAV ITEM COMPONENT
// ═══════════════════════════════════════════════

const NavItem = ({ icon, label, path }: { icon: React.ReactNode, label: string, path: string }) => {
  const pathname = usePathname();
  const active = pathname === path;
  
  return (
    <Link href={path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-heading font-bold text-sm ${
      active ? "bg-[#EEF5FF] text-[#2471A3] border-2 border-[#4A90D9] shadow-[2px_2px_0px_#4A90D9]" 
             : "text-[#7A7670] border-2 border-transparent hover:bg-[#FDFBF5] hover:text-[#2C2A24]"
    }`} style={{ fontFamily: '"Nunito", sans-serif' }}>
      {icon}
      {label}
    </Link>
  );
};

// ═══════════════════════════════════════════════
//  MAIN SIDEBAR COMPONENT
// ═══════════════════════════════════════════════

export default function AdminSidebar() {
  return (
    <aside className="w-[240px] shrink-0 border-r-2 border-[#E8E4D9] bg-white flex flex-col z-20 shadow-[2px_0_10px_rgba(0,0,0,0.03)] h-full overflow-y-auto custom-scrollbar">
      <div className="p-6 border-b-2 border-[#E8E4D9] flex flex-col items-center mt-2">
        <KlassoLogo size={48} />
        <span className="mt-2 text-[#4A90D9] font-bold tracking-wider" style={{ fontFamily: '"Caveat", cursive', fontSize: "20px" }}>Admin Panel</span>
      </div>
      
      <nav className="p-4 flex flex-col gap-1.5 flex-1">
        <NavItem icon={<SchoolBuildingDoodle />} label="Overview" path="/admin" />
        <NavItem icon={<PersonAppleDoodle />} label="Teachers" path="/admin/teachers" />
        <NavItem icon={<GroupDoodle />} label="Students" path="/admin/students" />
        <NavItem icon={<GridDoodle />} label="Timetable" path="/admin/timetable" />
        <NavItem icon={<ClipboardDoodle />} label="Reports" path="/admin/reports" />
        <NavItem icon={<CheckmarkDoodle />} label="Attendance" path="/admin/attendance" />
        <NavItem icon={<CoinDoodle />} label="Fee Management" path="/admin/fees" />
        <NavItem icon={<MegaphoneDoodle />} label="Announcements" path="/admin/announcements" />
      </nav>
      
      <div className="p-4 border-t-2 border-[#E8E4D9] mt-auto">
        <NavItem icon={<GearDoodle />} label="Settings" path="/admin/settings" />
      </div>
      
      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E8E4D9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C0BFBA; }
      `}} />
    </aside>
  );
}
