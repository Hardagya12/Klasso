"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../providers";
import {
  PencilSVG, SquigglySVG,
  HouseDoodle, AttendanceDoodle, ChartDoodle, ReportDoodle,
  StackDoodle, GridDoodle, MessageDoodle, PeopleDoodle,
  LightbulbDoodle, RulerPencilDoodle,
} from "../components/dashboard/DashboardComponents";

const QuestScrollDoodle = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="5" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 9h18M8 5V3M16 5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M7 13h6M7 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="18" cy="17" r="3" fill="#F5A623" />
    <path d="M16.5 17l1 1 1.5-1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Sidebar nav item ──
const SidebarItem = ({ icon, label, path, active = false }: { icon: React.ReactNode; label: string; path: string; active?: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === path;

  return (
    <Link href={path} style={{
      display: "flex", alignItems: "center", gap: "12px",
      padding: "10px 16px", borderRadius: "12px", cursor: "pointer",
      border: isActive ? "2px solid #F5A623" : "2px solid transparent",
      backgroundColor: isActive ? "#FEF3DC" : "transparent",
      boxShadow: isActive ? "2px 2px 0px #2C2A24" : "none",
      transition: "all 0.15s",
      textDecoration: "none",
    }}>
      <span style={{ color: isActive ? "#F5A623" : "#7A7670" }}>{icon}</span>
      <span style={{
        fontFamily: '"Nunito", sans-serif', fontWeight: 700,
        color: isActive ? "#2C2A24" : "#7A7670", fontSize: "14px",
      }}>{label}</span>
    </Link>
  );
};

export default function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = pathname.startsWith('/admin');
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase() || '?';

  // Admin navigation items
  const adminNavItems = [
    { label: "Overview", path: "/admin", icon: <HouseDoodle size={20}/> },
    { label: "Teachers", path: "/admin/teachers", icon: <PeopleDoodle size={20}/> },
    { label: "Students", path: "/admin/students", icon: <PeopleDoodle size={20}/> },
    { label: "Timetable", path: "/admin/timetable", icon: <GridDoodle size={20}/> },
    { label: "Reports", path: "/admin/reports", icon: <ReportDoodle size={20}/> },
    { label: "Attendance", path: "/admin/attendance", icon: <AttendanceDoodle size={20}/> },
    { label: "Fee Management", path: "/admin/fees", icon: <ChartDoodle size={20}/> },
    { label: "Announcements", path: "/admin/announcements", icon: <MessageDoodle size={20}/> },
  ];

  // Teacher navigation items
  const teacherNavItems = [
    { label: "Dashboard", path: "/teacher", icon: <HouseDoodle size={20}/> },
    { label: "Attendance", path: "/teacher/attendance", icon: <AttendanceDoodle size={20}/> },
    { label: "Grades", path: "/teacher/grades", icon: <ChartDoodle size={20}/> },
    { label: "Reports", path: "/teacher/reports", icon: <ReportDoodle size={20}/> },
    { label: "Assignments", path: "/teacher/assignments", icon: <StackDoodle size={20}/> },
    { label: "Timetable", path: "/teacher/timetable", icon: <GridDoodle size={20}/> },
    { label: "Messages", path: "/teacher/messages", icon: <MessageDoodle size={20}/> },
    { label: "Students", path: "/teacher/students", icon: <PeopleDoodle size={20}/> },
    { label: "Quests", path: "/teacher/quests", icon: <QuestScrollDoodle size={20}/> },
    { label: "Knowledge Duel", path: "/teacher/duel", icon: <LightbulbDoodle size={20}/> },
  ];

  const navItems = isAdmin ? adminNavItems : teacherNavItems;
  const sidebarWidth = collapsed ? 80 : 240;

  return (
    <aside style={{
      width: sidebarWidth, flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh",
      borderRight: "2px solid #E8E4D9", backgroundColor: "#FFFFFF",
      display: "flex", flexDirection: "column", padding: collapsed ? "24px 10px" : "24px 20px",
      zIndex: 50, overflowY: "auto", transition: "width 0.3s ease, padding 0.3s ease"
    }}>
      {/* Notebook margin line */}
      <div style={{ position: "absolute", left: collapsed ? 20 : 40, top: 0, bottom: 0, width: 1, backgroundColor: "#F5A623", opacity: 0.2, transition: "left 0.3s ease" }}/>

      {/* Logo */}
      <div style={{ marginBottom: 28, position: "relative", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 8, marginBottom: 4 }}>
          <PencilSVG size={collapsed ? 32 : 26}/>
          {!collapsed && <h1 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 22, margin: 0, color: "#2C2A24" }}>
            Klasso
          </h1>}
        </div>
        {!collapsed && <SquigglySVG width={80} color="#F5A623"/>}
      </div>

      {/* User avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, textAlign: "center" }}>
        <div style={{ position: "relative", width: collapsed ? 48 : 64, height: collapsed ? 48 : 64, marginBottom: collapsed ? 0 : 10, transition: "width 0.3s, height 0.3s" }}>
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            backgroundColor: "#FEF3DC", border: "2px solid #2C2A24",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: collapsed ? 14 : 18, color: "#2C2A24",
          }}>{ initials }</div>
        </div>
        {!collapsed && (
          <>
            <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14, margin: "0 0 2px", color: "#2C2A24" }}>
              {user?.name || 'Loading...'}
            </p>
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: "#7A7670", margin: 0 }}>
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'teacher' ? 'Teacher' : user?.role || ''}
            </p>
          </>
        )}
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {navItems.map(item => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} title={collapsed ? item.label : undefined} style={{
              display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between", gap: "12px",
              padding: collapsed ? "10px 0" : "10px 16px", borderRadius: "12px", cursor: "pointer",
              border: isActive ? "2px solid #F5A623" : "2px solid transparent",
              backgroundColor: isActive ? "#FEF3DC" : "transparent",
              boxShadow: isActive ? "2px 2px 0px #2C2A24" : "none",
              transition: "all 0.15s",
              textDecoration: "none",
              margin: collapsed ? "0 auto" : "0",
              width: collapsed ? "44px" : "100%",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ color: isActive ? "#F5A623" : "#7A7670", display: "flex" }}>{item.icon}</span>
                {!collapsed && (
                  <span style={{
                    fontFamily: '"Nunito", sans-serif', fontWeight: 700,
                    color: isActive ? "#2C2A24" : "#7A7670", fontSize: "14px",
                  }}>{item.label}</span>
                )}
              </div>
              {!collapsed && item.label === "Messages" && (
                <span style={{
                  backgroundColor: "#E8534A", color: "white", borderRadius: "999px",
                  padding: "2px 6px", fontSize: "10px", fontWeight: 900, fontFamily: '"Nunito", sans-serif',
                  boxShadow: "1px 1px 0px #2C2A24", border: "1px solid #2C2A24"
                }}>3</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* AI Assistant + Ruler/Pencil */}
      {!collapsed && (
        <div style={{ borderTop: "2px solid #E8E4D9", paddingTop: 20, marginTop: 16 }}>
          <button style={{
            width: "100%", backgroundColor: "#F5A623", border: "2px solid #2C2A24",
            borderRadius: 12, padding: "12px 0", cursor: "pointer",
            fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14, color: "#2C2A24",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "4px 4px 0px #2C2A24", position: "relative", overflow: "hidden",
            transition: "all 0.15s",
          }}>
            <LightbulbDoodle size={20}/>
            AI Assistant
          </button>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 12, opacity: 0.55 }}>
            <RulerPencilDoodle size={48}/>
          </div>
        </div>
      )}
    </aside>
  );
}