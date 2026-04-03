"use client";
import React from "react";
import {
  PencilSVG, SquigglySVG, StarburstSVG, CircleRingSVG,
  DashboardStatCard,
  HouseDoodle, AttendanceDoodle, ChartDoodle, ReportDoodle,
  StackDoodle, GridDoodle, MessageDoodle, PeopleDoodle,
  LightbulbDoodle, NotebookTexture, ScatteredDoodles,
  StickerStar, StickerApple, RulerPencilDoodle,
} from "../components/dashboard/DashboardComponents";
import Sidebar from "../components/Sidebar";
import NotificationPanel from "../components/NotificationPanel";
import OnboardingModal from "../components/OnboardingModal";

export default function TeacherDashboard() {
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showOnboarding, setShowOnboarding] = React.useState(true);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FDFBF5", fontFamily: '"DM Sans", sans-serif', position: "relative", overflow: "hidden" }}>
      <NotebookTexture />
      <ScatteredDoodles />

      <Sidebar />
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {/* ─── MAIN AREA ─── */}
      <main style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header style={{
          height: 64, borderBottom: "2px solid #E8E4D9", backgroundColor: "#FFFFFF",
          padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 40,
        }}>
          <p style={{ fontFamily: '"Caveat", cursive', fontSize: 20, fontWeight: 700, color: "#7A7670", margin: 0 }}>
            Thursday, 3rd April <span style={{ color: "#F5A623" }}>✦</span>
          </p>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 400, margin: "0 32px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search students, classes..."
              style={{
                width: "100%", border: "2px solid #E8E4D9", borderRadius: 999,
                padding: "8px 44px 8px 20px", fontFamily: '"DM Sans", sans-serif',
                fontSize: 14, color: "#2C2A24", outline: "none",
                boxSizing: "border-box", backgroundColor: "#FDFBF5",
              }}
            />
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
              <PencilSVG size={14} color="#7A7670"/>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowNotifications(true)}>
              <BellIcon size={22}/>
              <span style={{
                position: "absolute", top: 0, right: 0, width: 9, height: 9,
                backgroundColor: "#E8534A", borderRadius: "50%", border: "2px solid white",
              }}/>
            </div>
            <SettingsIcon size={22}/>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              border: "2px solid #2C2A24", backgroundColor: "#D6EAF8",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color: "#2C2A24",
            }}>PS</div>
          </div>
        </header>

        {/* Page content */}
        <div style={{ padding: 32 }}>

          {/* ── STAT CARDS ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 48, position: "relative" }}>
            {/* Sticker decorations */}
            <div style={{ position: "absolute", top: -20, left: -20, zIndex: 20, transform: "rotate(-12deg)" }}>
              <StickerStar size={44}/>
            </div>
            <div style={{ position: "absolute", bottom: -16, right: "25%", zIndex: 20, transform: "rotate(15deg)" }}>
              <StickerApple size={40}/>
            </div>

            <DashboardStatCard label="Today's Attendance" value="36/40" color="#5BAD6F" icon={PeopleDoodle} progress={90}/>
            <DashboardStatCard label="Pending Grades"     value="12"    color="#F5A623" icon={StackDoodle}  progress={60}/>
            <DashboardStatCard label="Reports Due"        value="3"     color="#4A90D9" icon={ReportDoodle} progress={30}/>
            <DashboardStatCard label="AI Time Saved"      value="4.2 hrs" color="#E8534A" icon={LightbulbDoodle} progress={85}/>
          </div>

          {/* ── TWO COLUMN ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>

            {/* Schedule */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: -12, right: -8, zIndex: 20, transform: "rotate(12deg)" }}>
                <StickerStar size={30} color="#4A90D9"/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ClockIcon size={22}/>
                  <h3 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 18, margin: 0, color: "#2C2A24" }}>
                    Today&apos;s Class Schedule
                  </h3>
                </div>
                <SquigglySVG width={260} color="#E8E4D9"/>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { time: "09:00–10:00", subject: "Math",     cls: "Grade 8-A", active: false, past: true  },
                  { time: "10:15–11:15", subject: "Science",  cls: "Grade 8-C", active: true,  past: false },
                  { time: "11:30–12:30", subject: "Practical",cls: "Lab B",     active: false, past: false },
                  { time: "13:30–14:30", subject: "Math",     cls: "Grade 8-B", active: false, past: false },
                ].map((slot, i) => (
                  <div key={i} style={{
                    backgroundColor: "#FFFFFF", borderRadius: 14, padding: "14px 16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    border: slot.active ? "2px solid #F5A623" : "2px solid #E8E4D9",
                    borderLeft: slot.active ? "10px solid #F5A623" : "2px solid #E8E4D9",
                    boxShadow: "3px 3px 0px #E8E4D9",
                    opacity: slot.past ? 0.6 : 1, position: "relative", overflow: "hidden",
                  }}>
                    {slot.active && <div style={{ position: "absolute", top: 6, right: 8 }}><DashboardStarSVG size={18}/></div>}
                    {slot.past  && <div style={{ position: "absolute", top: 6, left: 8  }}><CheckDoodleSVG size={16}/></div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                      <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color: "#7A7670", margin: 0, minWidth: 90 }}>{slot.time}</p>
                      <div>
                        <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14, margin: 0, color: "#2C2A24" }}>{slot.subject}</p>
                        <p style={{ fontSize: 12, color: "#7A7670", margin: 0 }}>{slot.cls}</p>
                      </div>
                    </div>
                    <button style={{
                      fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 12,
                      padding: "6px 14px", borderRadius: 8,
                      border: slot.past ? "none" : "2px solid #2C2A24",
                      backgroundColor: slot.past ? "#E8E4D9" : "#F5A623",
                      color: slot.past ? "#7A7670" : "#2C2A24",
                      cursor: "pointer",
                      boxShadow: slot.past ? "none" : "2px 2px 0px #2C2A24",
                    }}>{slot.past ? "Marked ✓" : "Take Attendance"}</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Students Needing Attention */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", bottom: -20, right: -12, zIndex: 20, transform: "rotate(-12deg)", opacity: 0.7 }}>
                <PencilSVG size={44}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <WarningFlagSVG size={22}/>
                  <h3 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 18, margin: 0, color: "#2C2A24" }}>
                    Students Needing Attention
                  </h3>
                </div>
                <WavyLine width={290}/>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", border: "2px solid #E8E4D9", borderRadius: 16, overflow: "hidden", boxShadow: "3px 3px 0px #E8E4D9" }}>
                {[
                  { name: "Arjun Mehta",  issue: "Low attendance", level: "red"   },
                  { name: "Sanya Gupta",  issue: "Failing grade",  level: "amber" },
                  { name: "Vikram Singh", issue: "Behavioral",     level: "amber" },
                  { name: "Isha Patel",   issue: "Late submissions",level: "red"  },
                ].map((st, i) => (
                  <div key={i} style={{
                    padding: "14px 16px", borderBottom: i < 3 ? "2px solid #E8E4D9" : "none",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ position: "relative", width: 38, height: 38 }}>
                        <CircleRingSVG size={38} color={st.level === "red" ? "#E8534A" : "#F5A623"}/>
                        <div style={{
                          position: "absolute", top: 5, left: 5, width: 28, height: 28,
                          borderRadius: "50%", backgroundColor: st.level === "red" ? "#FDEDEC" : "#FEF3DC",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color: "#2C2A24",
                        }}>{st.name[0]}</div>
                      </div>
                      <div>
                        <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 13, margin: "0 0 3px", color: "#2C2A24" }}>{st.name}</p>
                        <span style={{
                          fontSize: 10, fontFamily: '"Nunito", sans-serif', fontWeight: 700,
                          padding: "2px 8px", borderRadius: 999,
                          border: `1px solid ${st.level === "red" ? "#E8534A" : "#F5A623"}`,
                          backgroundColor: st.level === "red" ? "#FDEDEC" : "#FEF3DC",
                          color: st.level === "red" ? "#E8534A" : "#F5A623",
                          textTransform: "uppercase", letterSpacing: "0.03em",
                        }}>{st.issue}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ArrowRightSVG size={20}/>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#7A7670" }}>
                        <DotsVerticalSVG size={18}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── ACTIVITY FEED ── */}
          <div style={{ marginTop: 60 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 18, margin: "0 0 4px", color: "#2C2A24" }}>Recent Activity Feed</h3>
              <SquigglySVG width={180} color="#F5A623"/>
            </div>
            <div style={{ maxWidth: 640, borderLeft: "3px dotted #2C2A24", marginLeft: 12, paddingLeft: 32, display: "flex", flexDirection: "column", gap: 28 }}>
              {[
                "Attendance marked for Grade 8-A Math class.",
                "Generated monthly progress report for Arjun Mehta.",
                "Updated homework status for Grade 8-C Science.",
                "Sent lesson plan to HOD for Science Practical.",
                "Responded to Sanya Gupta's message regarding assignment.",
              ].map((text, i) => (
                <div key={i} style={{ position: "relative" }}>
                  <div style={{
                    position: "absolute", left: -44, top: 4,
                    width: 22, height: 22, borderRadius: "50%",
                    backgroundColor: "#FFFFFF", border: "2px solid #2C2A24",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="#F5A623"><circle cx="5" cy="5" r="4"/></svg>
                  </div>
                  <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 14, margin: "0 0 2px", color: "#2C2A24" }}>{text}</p>
                  <p style={{ fontFamily: '"Caveat", cursive', fontSize: 15, color: "#7A7670", margin: 0 }}>Today at {10 - i}:30 AM ✦</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Mid-century starburst accents */}
      <div style={{ position: "fixed", top: 48, right: 48, opacity: 0.35, pointerEvents: "none" }}>
        <StarburstSVG size={72} color="#F5A623"/>
      </div>
      <div style={{ position: "fixed", bottom: 96, right: 144, opacity: 0.25, pointerEvents: "none" }}>
        <StarburstSVG size={36} color="#4A90D9"/>
      </div>
    </div>
  );
}

// ── Inline utility SVGs (no Tailwind dependency) ──
const BellIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer" }}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const SettingsIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: "pointer" }}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const ClockIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7A7670" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const DashboardStarSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#F5A623" stroke="#2C2A24" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.27 7.82 21l1.18-6.88-5-4.87 6.91-1.01L12 2z"/>
  </svg>
);
const CheckDoodleSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#5BAD6F" strokeWidth="3" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const WarningFlagSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E8534A" strokeWidth="2" strokeLinecap="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);
const WavyLine = ({ width }: { width: number }) => (
  <svg width={width} height="10" viewBox={`0 0 ${width} 10`} fill="none">
    <path d={`M2 5Q${width / 4} 1 ${width / 2} 5T${width} 5`} stroke="#E8534A" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const ArrowRightSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7A7670" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12h14M13 5l7 7-7 7"/>
  </svg>
);
const DotsVerticalSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);
