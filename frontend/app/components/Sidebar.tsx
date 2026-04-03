"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PencilSVG, SquigglySVG,
  HouseDoodle, AttendanceDoodle, ChartDoodle, ReportDoodle,
  StackDoodle, GridDoodle, MessageDoodle, PeopleDoodle,
  LightbulbDoodle, RulerPencilDoodle,
} from "../components/dashboard/DashboardComponents";

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

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

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
    { label: "Dashboard", path: "/dashboard", icon: <HouseDoodle size={20}/> },
    { label: "Attendance", path: "/attendance", icon: <AttendanceDoodle size={20}/> },
    { label: "Grades", path: "/grades", icon: <ChartDoodle size={20}/> },
    { label: "Reports", path: "/report-generator", icon: <ReportDoodle size={20}/> },
    { label: "Assignments", path: "/assignments", icon: <StackDoodle size={20}/> },
    { label: "Timetable", path: "/timetable", icon: <GridDoodle size={20}/> },
    { label: "Messages", path: "/messages", icon: <MessageDoodle size={20}/> },
    { label: "Students", path: "/students", icon: <PeopleDoodle size={20}/> },
  ];

  const navItems = isAdmin ? adminNavItems : teacherNavItems;

  return (
    <aside style={{
      width: 240, flexShrink: 0, position: "fixed", top: 0, left: 0, height: "100vh",
      borderRight: "2px solid #E8E4D9", backgroundColor: "#FFFFFF",
      display: "flex", flexDirection: "column", padding: "24px 20px",
      zIndex: 50, overflowY: "auto",
    }}>
      {/* Notebook margin line */}
      <div style={{ position: "absolute", left: 40, top: 0, bottom: 0, width: 1, backgroundColor: "#F5A623", opacity: 0.2 }}/>

      {/* Logo */}
      <div style={{ marginBottom: 28, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <PencilSVG size={26}/>
          <h1 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 22, margin: 0, color: "#2C2A24" }}>
            Klasso
          </h1>
        </div>
        <SquigglySVG width={80} color="#F5A623"/>
      </div>

      {/* User avatar */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28, textAlign: "center" }}>
        <div style={{ position: "relative", width: 64, height: 64, marginBottom: 10 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            backgroundColor: "#FEF3DC", border: "2px solid #2C2A24",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 18, color: "#2C2A24",
          }}>{isAdmin ? 'A' : 'PS'}</div>
        </div>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14, margin: "0 0 2px", color: "#2C2A24" }}>
          {isAdmin ? 'Admin User' : 'Priya Sharma'}
        </p>
        <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: "#7A7670", margin: 0 }}>
          {isAdmin ? 'Administrator' : 'Grade 8 · Math & Science'}
        </p>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {navItems.map(item => (
          <SidebarItem key={item.path} label={item.label} path={item.path} icon={item.icon} />
        ))}
      </div>

      {/* AI Assistant + Ruler/Pencil */}
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
    </aside>
  );
}