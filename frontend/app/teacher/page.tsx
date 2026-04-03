"use client";
import React, { useEffect, useState } from "react";
import {
  PencilSVG,
  SquigglySVG,
  StarburstSVG,
  CircleRingSVG,
  DashboardStatCard,
  StackDoodle,
  ReportDoodle,
  PeopleDoodle,
  LightbulbDoodle,
  NotebookTexture,
  ScatteredDoodles,
  StickerStar,
} from "../components/dashboard/DashboardComponents";
import Sidebar from "../components/Sidebar";
import NotificationPanel from "../components/NotificationPanel";
import OnboardingModal from "../components/OnboardingModal";
import StreakHighlights from "../components/StreakHighlights";
import ClassXPModule from "../components/ClassXPModule";
import { apiData } from "../../lib/api";
import Link from "next/link";

type TeacherDash = {
  my_classes: Array<{
    id: string;
    name: string;
    section: string;
    student_count: number;
    today_attendance_marked: boolean;
  }>;
  today_schedule: Array<{
    period_number: number;
    start_time: string;
    end_time: string;
    subject: string;
    class_name: string;
    section: string;
  }>;
  pending_marks: Array<{ exam_name: string; class_name: string; pending_count: number }>;
  pending_assignments: Array<{ title: string; class_name: string; ungraded_count: number }>;
  at_risk_students: Array<{ name: string; class: string; issue: string; value: number }>;
  recent_submissions: Array<{ student_name: string; assignment_title: string; submitted_at: string }>;
};

function fmtTime(s: string) {
  if (!s) return "";
  const iso = s.includes("T") ? s : `1970-01-01T${s}`;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function TeacherDashboard() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dash, setDash] = useState<TeacherDash | null>(null);
  const [moodData, setMoodData] = useState<any>(null);
  const [unread, setUnread] = useState(0);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [d, c, m] = await Promise.all([
          apiData<TeacherDash>("/api/analytics/teacher"),
          apiData<{ unread?: number }>("/api/notifications/count"),
          apiData<any>("/api/mood/alerts")
        ]);
        if (!cancelled) {
          setDash(d);
          setUnread(typeof c?.unread === "number" ? c.unread : 0);
          setMoodData(m);
        }
      } catch (e) {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : "Failed to load dashboard");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const classes = dash?.my_classes ?? [];
  const markedToday = classes.filter((c) => c.today_attendance_marked).length;
  const totalStudents = classes.reduce((a, c) => a + (c.student_count || 0), 0);
  const pendingMarksSum = (dash?.pending_marks ?? []).reduce((a, r) => a + (Number(r.pending_count) || 0), 0);
  const ungradedSum = (dash?.pending_assignments ?? []).reduce((a, r) => a + (Number(r.ungraded_count) || 0), 0);
  const schedule = dash?.today_schedule ?? [];
  const atRisk = dash?.at_risk_students ?? [];
  const activity = dash?.recent_submissions ?? [];
  const moodAlerts = moodData?.alerts || [];
  const moodAgg = moodData?.classAggregate || { GREAT: 0, GOOD: 0, OKAY: 0, SAD: 0, STRESSED: 0, total: 0 };
  const getAggColor = () => {
    if (moodAgg.total === 0) return "#7A7670";
    const goodR = (moodAgg.GREAT + moodAgg.GOOD) / moodAgg.total;
    const badR = (moodAgg.SAD + moodAgg.STRESSED) / moodAgg.total;
    if (badR > 0.25) return "#E8534A";
    if (goodR > 0.6) return "#5BAD6F";
    return "#F5A623";
  };
  const getAggText = () => {
    if (moodAgg.total === 0) return "No data today";
    const goodR = (moodAgg.GREAT + moodAgg.GOOD) / moodAgg.total;
    const badR = (moodAgg.SAD + moodAgg.STRESSED) / moodAgg.total;
    if (badR > 0.25) return "Needs Attention";
    if (goodR > 0.6) return "Generally Good";
    return "Mixed";
  };

  const markAlertRead = async (id: string) => {
    try {
      await apiData(`/api/mood/alerts/${id}/read`, { method: "PATCH" });
      setMoodData({ ...moodData, alerts: moodAlerts.filter((a:any) => a.id !== id) });
    } catch(e) {}
  };

  const headerDate = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#FDFBF5",
        fontFamily: '"DM Sans", sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      <NotebookTexture />
      <ScatteredDoodles />

      <Sidebar />
      <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <main style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column" }}>
        <header
          style={{
            height: 64,
            borderBottom: "2px solid #E8E4D9",
            backgroundColor: "#FFFFFF",
            padding: "0 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <p
            style={{
              fontFamily: '"Caveat", cursive',
              fontSize: 20,
              fontWeight: 700,
              color: "#7A7670",
              margin: 0,
            }}
          >
            {headerDate} <span style={{ color: "#F5A623" }}>✦</span>
          </p>

          <div style={{ flex: 1, maxWidth: 400, margin: "0 32px", position: "relative" }}>
            <input
              type="text"
              placeholder="Search uses student list…"
              readOnly
              style={{
                width: "100%",
                border: "2px solid #E8E4D9",
                borderRadius: 999,
                padding: "8px 44px 8px 20px",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: 14,
                color: "#2C2A24",
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#FDFBF5",
              }}
            />
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
              <PencilSVG size={14} color="#7A7670" />
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Link href="/teacher/students" style={{ fontSize: 13, fontWeight: 700, color: "#2C2A24" }}>
              Students
            </Link>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => setShowNotifications(true)}>
              <BellIcon size={22} />
              {unread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    minWidth: 9,
                    height: 9,
                    backgroundColor: "#E8534A",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              )}
            </div>
            <SettingsIcon size={22} />
          </div>
        </header>

        <div style={{ padding: "32px 24px" }}>
          {loadErr && (
            <p style={{ color: "#E8534A", fontWeight: 600, marginBottom: 16 }}>{loadErr}</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 24,
              marginBottom: 48,
              position: "relative",
            }}
          >
            <div style={{ position: "absolute", top: -20, left: -20, zIndex: 20, transform: "rotate(-12deg)" }}>
              <StickerStar size={44} />
            </div>
            <DashboardStatCard
              label="Classes marked today"
              value={`${markedToday}/${classes.length || 0}`}
              color="#5BAD6F"
              icon={PeopleDoodle}
              progress={classes.length ? Math.round((markedToday / classes.length) * 100) : 0}
            />
            <DashboardStatCard
              label="Pending marks (cells)"
              value={String(pendingMarksSum)}
              color="#F5A623"
              icon={StackDoodle}
              progress={60}
            />
            <DashboardStatCard
              label="Ungraded submissions"
              value={String(ungradedSum)}
              color="#4A90D9"
              icon={ReportDoodle}
              progress={40}
            />
            <DashboardStatCard
              label="At-risk students"
              value={String(atRisk.length)}
              color="#E8534A"
              icon={LightbulbDoodle}
              progress={75}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
            {classes.length > 0 && <StreakHighlights classId={classes[0].id} />}
            {classes.length > 0 && <ClassXPModule classId={classes[0].id} className={`${classes[0].name}-${classes[0].section}`} />}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 40 }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", top: -12, right: -8, zIndex: 20, transform: "rotate(12deg)" }}>
                <StickerStar size={30} color="#4A90D9" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ClockIcon size={22} />
                  <h3
                    style={{
                      fontFamily: '"Nunito", sans-serif',
                      fontWeight: 800,
                      fontSize: 18,
                      margin: 0,
                      color: "#2C2A24",
                    }}
                  >
                    Today&apos;s schedule
                  </h3>
                </div>
                <SquigglySVG width={260} color="#E8E4D9" />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {schedule.length === 0 && (
                  <p style={{ color: "#7A7670", fontSize: 14 }}>No periods today (or weekend).</p>
                )}
                {schedule.map((slot, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 14,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      border: "2px solid #E8E4D9",
                      boxShadow: "3px 3px 0px #E8E4D9",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                      <p
                        style={{
                          fontFamily: '"Nunito", sans-serif',
                          fontWeight: 800,
                          fontSize: 12,
                          color: "#7A7670",
                          margin: 0,
                          minWidth: 100,
                        }}
                      >
                        {fmtTime(slot.start_time)}–{fmtTime(slot.end_time)}
                      </p>
                      <div>
                        <p
                          style={{
                            fontFamily: '"Nunito", sans-serif',
                            fontWeight: 800,
                            fontSize: 14,
                            margin: 0,
                            color: "#2C2A24",
                          }}
                        >
                          {slot.subject}
                        </p>
                        <p style={{ fontSize: 12, color: "#7A7670", margin: 0 }}>
                          {slot.class_name}-{slot.section} · P{slot.period_number}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  bottom: -20,
                  right: -12,
                  zIndex: 20,
                  transform: "rotate(-12deg)",
                  opacity: 0.7,
                }}
              >
                <PencilSVG size={44} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <WarningFlagSVG size={22} />
                  <h3
                    style={{
                      fontFamily: '"Nunito", sans-serif',
                      fontWeight: 800,
                      fontSize: 18,
                      margin: 0,
                      color: "#2C2A24",
                    }}
                  >
                    Students needing attention
                  </h3>
                </div>
                <WavyLine width={290} />
              </div>

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #E8E4D9",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "3px 3px 0px #E8E4D9",
                }}
              >
                {atRisk.length === 0 && (
                  <p style={{ padding: 16, color: "#7A7670", margin: 0 }}>No at-risk students detected.</p>
                )}
                {atRisk.map((st, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderBottom: i < atRisk.length - 1 ? "2px solid #E8E4D9" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ position: "relative", width: 38, height: 38 }}>
                        <CircleRingSVG size={38} color="#F5A623" />
                        <div
                          style={{
                            position: "absolute",
                            top: 5,
                            left: 5,
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            backgroundColor: "#FEF3DC",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: '"Nunito", sans-serif',
                            fontWeight: 800,
                            fontSize: 12,
                            color: "#2C2A24",
                          }}
                        >
                          {st.name[0]}
                        </div>
                      </div>
                      <div>
                        <p
                          style={{
                            fontFamily: '"Nunito", sans-serif',
                            fontWeight: 700,
                            fontSize: 13,
                            margin: "0 0 3px",
                            color: "#2C2A24",
                          }}
                        >
                          {st.name}
                        </p>
                        <span
                          style={{
                            fontSize: 10,
                            fontFamily: '"Nunito", sans-serif',
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            border: "1px solid #F5A623",
                            backgroundColor: "#FEF3DC",
                            color: "#F5A623",
                            textTransform: "uppercase",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {st.class} · {st.issue} {st.value}%
                        </span>
                      </div>
                    </div>
                    <ArrowRightSVG size={20} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
            {/* Student Wellbeing */}
            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <HeartSVG size={22} color="#E8534A" />
                  <h3 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 18, color: "#2C2A24", margin: 0 }}>
                    Wellbeing Signals
                  </h3>
                </div>
                <WavyLine width={180} />
              </div>

              <div style={{ backgroundColor: "#E8FAF7", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3ECFB2" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <p style={{ fontSize: 13, color: "#1C5C4F", margin: 0, fontWeight: 600 }}>
                  Individual mood data is private to each student. You see only patterns and aggregate signals.
                </p>
              </div>

              <div style={{ backgroundColor: "#FFFFFF", border: "2px solid #E8E4D9", borderRadius: 16, padding: "20px", boxShadow: "3px 3px 0px #E8E4D9", marginBottom: 20 }}>
                <h4 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 15, margin: "0 0 8px" }}>Class Mood Overview</h4>
                <p style={{ fontSize: 13, color: "#7A7670", margin: "0 0 16px" }}>Today: {moodAgg.total} students checked in</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ height: 12, flex: 1, backgroundColor: "#E8E4D9", borderRadius: 999, overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${moodAgg.total ? (moodAgg.GREAT + moodAgg.GOOD)/moodAgg.total * 100 : 0}%`, backgroundColor: "#5BAD6F" }} />
                    <div style={{ width: `${moodAgg.total ? (moodAgg.OKAY)/moodAgg.total * 100 : 0}%`, backgroundColor: "#F5A623" }} />
                    <div style={{ width: `${moodAgg.total ? (moodAgg.SAD + moodAgg.STRESSED)/moodAgg.total * 100 : 0}%`, backgroundColor: "#E8534A" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: getAggColor() }}>{getAggText()}</span>
                </div>
              </div>

              {moodAlerts.length === 0 ? (
                 <p style={{ color: "#7A7670", fontSize: 14 }}>No wellbeing alerts at this time.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {moodAlerts.map((alert: any) => (
                    <div key={alert.id} style={{ backgroundColor: "#FFF", borderRadius: 14, padding: "16px", borderLeft: "4px solid #FF6B6B", borderTop: "2px solid #E8E4D9", borderRight: "2px solid #E8E4D9", borderBottom: "2px solid #E8E4D9", boxShadow: "3px 3px 0px #E8E4D9" }}>
                      <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: 14, color: "#2C2A24", margin: "0 0 12px", lineHeight: 1.5 }}>
                        <strong>{alert.studentNameFallback}:</strong> {alert.message}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                         <span style={{ fontSize: 11, color: "#FF6B6B", fontWeight: 700, textTransform: "uppercase" }}>Check in with your class today</span>
                         <button onClick={() => markAlertRead(alert.id)} style={{ background: "transparent", border: "none", color: "#7A7670", fontSize: 12, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Mark as seen</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Submissions */}
            <div>
              <div style={{ marginBottom: 20 }}>
                <h3
                  style={{
                    fontFamily: '"Nunito", sans-serif',
                    fontWeight: 800,
                    fontSize: 18,
                    margin: "0 0 4px",
                    color: "#2C2A24",
                  }}
                >
                  Recent submissions
                </h3>
                <SquigglySVG width={180} color="#F5A623" />
              </div>
              <div
                style={{
                  maxWidth: 640,
                  borderLeft: "3px dotted #2C2A24",
                  marginLeft: 12,
                  paddingLeft: 32,
                  display: "flex",
                  flexDirection: "column",
                  gap: 28,
                }}
              >
                {activity.length === 0 && (
                  <p style={{ color: "#7A7670", fontSize: 14 }}>No recent submissions.</p>
                )}
                {activity.map((row, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: -44,
                        top: 4,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        backgroundColor: "#FFFFFF",
                        border: "2px solid #2C2A24",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="#F5A623">
                        <circle cx="5" cy="5" r="4" />
                      </svg>
                    </div>
                    <p
                      style={{
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 700,
                        fontSize: 14,
                        margin: "0 0 2px",
                        color: "#2C2A24",
                      }}
                    >
                      <strong>{row.student_name}</strong> · {row.assignment_title}
                    </p>
                    <p style={{ fontFamily: '"Caveat", cursive', fontSize: 15, color: "#7A7670", margin: 0 }}>
                      {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div style={{ position: "fixed", top: 48, right: 48, opacity: 0.35, pointerEvents: "none" }}>
        <StarburstSVG size={72} color="#F5A623" />
      </div>
      <div style={{ position: "fixed", bottom: 96, right: 144, opacity: 0.25, pointerEvents: "none" }}>
        <StarburstSVG size={36} color="#4A90D9" />
      </div>
    </div>
  );
}

const BellIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2C2A24"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ cursor: "pointer" }}
  >
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const SettingsIcon = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2C2A24"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ cursor: "pointer" }}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const ClockIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7A7670" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const WarningFlagSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E8534A" strokeWidth="2" strokeLinecap="round">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" y1="22" x2="4" y2="15" />
  </svg>
);
const WavyLine = ({ width }: { width: number }) => (
  <svg width={width} height="10" viewBox={`0 0 ${width} 10`} fill="none">
    <path
      d={`M2 5Q${width / 4} 1 ${width / 2} 5T${width} 5`}
      stroke="#E8534A"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
const HeartSVG = ({ size, color }: { size: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "#E8534A"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const ArrowRightSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#7A7670" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);
