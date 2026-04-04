"use client";
import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import { apiData, apiFetch } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuestType =
  | "ATTENDANCE_STREAK"
  | "AI_BUDDY_SESSIONS"
  | "ASSIGNMENT_SUBMISSIONS"
  | "GRADE_TARGET"
  | "ZERO_ABSENCES_WEEK"
  | "CUSTOM";

type ClassInfo = { id: string; name: string; section: string };
type SubjectInfo = { id: string; name: string };
type StudentInfo = { id: string; name: string; roll_no: string };

type Quest = {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  target: Record<string, unknown>;
  xpReward: number;
  badgeName?: string | null;
  badgeColor?: string | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  teacher: { id: string; name: string };
  targetStudent?: { id: string; name: string } | null;
};

type ClassQuestRow = {
  quest: Quest;
  stats: {
    totalTargeted: number;
    completed: number;
    completionRate: number;
    completedStudents: { studentId: string; name: string; completedAt: string; xpAwarded: number }[];
  };
};

// ─── Quest type metadata ──────────────────────────────────────────────────────
const QUEST_TYPES: {
  type: QuestType;
  label: string;
  example: string;
  color: string;
  Icon: () => React.ReactNode;
}[] = [
  {
    type: "ATTENDANCE_STREAK",
    label: "Attendance Streak",
    example: "Attend class ___ days in a row",
    color: "#FF6B6B",
    Icon: () => (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="#FF6B6B">
        <path d="M12 2C12 2 6 7.4 6 12.5C6 16.1 8.7 19 12 19s6-2.9 6-6.5C18 7.4 12 2 12 2zm0 15c-2.2 0-4-1.8-4-4 0-2.1 1.5-4.2 4-7 2.5 2.8 4 4.9 4 7 0 2.2-1.8 4-4 4z" />
      </svg>
    ),
  },
  {
    type: "AI_BUDDY_SESSIONS",
    label: "AI Buddy Sessions",
    example: "Complete ___ Study Buddy sessions this week",
    color: "#3ECFB2",
    Icon: () => (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="#3ECFB2">
        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z" />
      </svg>
    ),
  },
  {
    type: "ASSIGNMENT_SUBMISSIONS",
    label: "Assignment Submissions",
    example: "Submit ___ assignments this month",
    color: "#4A90D9",
    Icon: () => (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="#4A90D9">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
      </svg>
    ),
  },
  {
    type: "GRADE_TARGET",
    label: "Grade Target",
    example: "Score above ___% in a subject",
    color: "#F5A623",
    Icon: () => (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="#F5A623">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    type: "ZERO_ABSENCES_WEEK",
    label: "Zero Absences Week",
    example: "No absences in an entire week",
    color: "#7C5CBF",
    Icon: () => (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="#7C5CBF">
        <path d="M12 2L4 5v6c0 5.25 3.4 10.14 8 11.35C16.6 21.14 20 16.25 20 11V5l-8-3z" />
      </svg>
    ),
  },
  {
    type: "CUSTOM",
    label: "Custom Quest",
    example: "Define your own challenge — you mark it complete",
    color: "#6B8C82",
    Icon: () => (
      <svg width={40} height={40} viewBox="0 0 24 24" fill="#6B8C82">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
      </svg>
    ),
  },
];

const BADGE_COLORS = ["#3ECFB2", "#FF6B6B", "#F5A623", "#4A90D9", "#7C5CBF", "#E8534A"];

// ─── SVG Helpers ──────────────────────────────────────────────────────────────
const StarburstSVG = ({ size = 32, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => {
      const r = (a * Math.PI) / 180;
      return (
        <line
          key={i}
          x1="20" y1="20"
          x2={20 + 18 * Math.cos(r)}
          y2={20 + 18 * Math.sin(r)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
        />
      );
    })}
    <circle cx="20" cy="20" r="4" fill={color} />
  </svg>
);

const ScrollDoodleSVG = () => (
  <svg width="220" height="68" viewBox="0 0 220 68">
    <rect x="0" y="10" width="220" height="48" rx="4" fill="#FFFBF0" />
    <path d="M0,16 Q22,4 44,12 Q66,20 88,10 Q110,2 132,10 Q154,20 176,12 Q198,4 220,16 L220,10 L0,10 Z" fill="#D4A853" />
    <path d="M0,58 Q22,70 44,62 Q66,54 88,64 Q110,72 132,64 Q154,54 176,62 Q198,70 220,58 L220,58 L0,58 Z" fill="#D4A853" />
  </svg>
);

// ─── Mini Progress Bar ────────────────────────────────────────────────────────
const MiniProgressBar = ({ percent, color }: { percent: number; color: string }) => (
  <div style={{ height: 8, borderRadius: 4, backgroundColor: "#E8E4D9", overflow: "hidden" as const, width: "100%" }}>
    <div style={{ height: "100%", width: `${Math.min(100, percent)}%`, backgroundColor: color, borderRadius: 4, transition: "width 0.3s ease" }} />
  </div>
);

// ─── Sticker Star ────────────────────────────────────────────────────────────
const StickerStar = ({ size = 32, color = "#F5A623" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ─── Multi-Step Create Quest Modal ────────────────────────────────────────────
function CreateQuestModal({
  classes,
  subjects,
  students,
  onClose,
  onCreated,
}: {
  classes: ClassInfo[];
  subjects: SubjectInfo[];
  students: StudentInfo[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<QuestType | null>(null);
  const [form, setForm] = useState({
    classId: classes[0]?.id ?? "",
    title: "",
    description: "",
    targetValue: 5,
    subjectId: "",
    xpReward: 50,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    wholeClass: true,
    selectedStudents: [] as string[],
    giveBadge: false,
    badgeName: "",
    badgeColor: BADGE_COLORS[0],
  });
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const f = (key: string, val: unknown) => setForm(p => ({ ...p, [key]: val }));

  const buildTarget = () => {
    switch (selectedType) {
      case "ATTENDANCE_STREAK": return { metric: "streak", value: form.targetValue };
      case "AI_BUDDY_SESSIONS": return { metric: "aiSessions", value: form.targetValue };
      case "ASSIGNMENT_SUBMISSIONS": return { metric: "submissions", value: form.targetValue };
      case "GRADE_TARGET": return { metric: "scoreAbove", value: form.targetValue, subjectId: form.subjectId };
      case "ZERO_ABSENCES_WEEK": return { metric: "zeroAbsences", value: 5 };
      case "CUSTOM": return { metric: "custom", value: 1 };
      default: return {};
    }
  };

  const handleCreate = async () => {
    setSaving(true); setSaveErr(null);
    try {
      const studentIds = form.wholeClass ? [] : form.selectedStudents;
      // Create one quest per student if individual; or one class-wide quest
      if (studentIds.length === 0) {
        await apiFetch("/api/quests", {
          method: "POST",
          body: JSON.stringify({
            classId: form.classId, studentId: null,
            title: form.title, description: form.description,
            type: selectedType, target: buildTarget(),
            xpReward: form.xpReward, startDate: form.startDate, endDate: form.endDate,
            badgeName: form.giveBadge ? form.badgeName || null : null,
            badgeColor: form.giveBadge ? form.badgeColor : null,
          }),
        });
      } else {
        for (const sid of studentIds) {
          await apiFetch("/api/quests", {
            method: "POST",
            body: JSON.stringify({
              classId: form.classId, studentId: sid,
              title: form.title, description: form.description,
              type: selectedType, target: buildTarget(),
              xpReward: form.xpReward, startDate: form.startDate, endDate: form.endDate,
              badgeName: form.giveBadge ? form.badgeName || null : null,
              badgeColor: form.giveBadge ? form.badgeColor : null,
            }),
          });
        }
      }
      onCreated();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Failed to create quest");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    border: "2px solid #E8E4D9", borderRadius: 10, fontFamily: '"DM Sans", sans-serif',
    fontSize: 14, color: "#2C2A24", outline: "none", boxSizing: "border-box",
    backgroundColor: "#FDFBF5",
    borderBottom: "3px solid #D4A853", // notebook-line style
  };

  const STEP_LABELS = ["Type", "Details", "Audience", "Badge"];

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(28,43,39,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: 20, border: "2px solid #E8E4D9", boxShadow: "6px 6px 0px #1C2B27", width: "min(680px, 95vw)", maxHeight: "90vh", overflowY: "auto", padding: 32, position: "relative" }}>
        {/* Close */}
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#7A7670" }}>✕</button>

        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ opacity: 0.6 }}><ScrollDoodleSVG /></div>
          <div>
            <h2 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 22, margin: 0, color: "#2C2A24" }}>Create a Quest</h2>
            <p style={{ fontFamily: '"Caveat", cursive', fontSize: 15, color: "#7A7670", margin: 0 }}>Step {step} of {STEP_LABELS.length} — {STEP_LABELS[step - 1]}</p>
          </div>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < step ? "#3ECFB2" : "#E8E4D9", transition: "background-color 0.3s" }} />
          ))}
        </div>

        {/* STEP 1: Quest Type */}
        {step === 1 && (
          <div>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 14, color: "#7A7670", marginBottom: 16 }}>Select the type of challenge for your students:</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {QUEST_TYPES.map(qt => {
                const isSelected = selectedType === qt.type;
                return (
                  <button
                    key={qt.type}
                    onClick={() => setSelectedType(qt.type)}
                    style={{
                      border: isSelected ? `2px solid ${qt.color}` : "2px solid #E8E4D9",
                      borderRadius: 14, padding: "18px 12px", cursor: "pointer",
                      backgroundColor: isSelected ? `${qt.color}15` : "#FDFBF5",
                      boxShadow: isSelected ? `3px 3px 0px ${qt.color}` : "2px 2px 0px #E8E4D9",
                      transition: "all 0.15s", position: "relative", textAlign: "center",
                    }}
                  >
                    {isSelected && (
                      <div style={{ position: "absolute", top: 8, right: 8, width: 18, height: 18, backgroundColor: qt.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width={10} height={10} viewBox="0 0 10 10"><path d="M1.5 5l2.5 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                      </div>
                    )}
                    <div style={{ marginBottom: 8 }}><qt.Icon /></div>
                    <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: "#2C2A24", margin: "0 0 4px" }}>{qt.label}</p>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: "#7A7670", margin: 0 }}>{qt.example}</p>
                  </button>
                );
              })}
            </div>
            {!selectedType && <p style={{ fontFamily: '"Caveat", cursive', color: "#E8534A", marginTop: 12, fontSize: 15 }}>Please select a quest type to continue.</p>}
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 2 && selectedType && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Quest Title *</label>
              <input style={inputStyle} value={form.title} onChange={e => f("title", e.target.value)} placeholder="e.g. The Perfect Week" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const }} value={form.description} onChange={e => f("description", e.target.value)} placeholder="Describe what students need to do..." />
            </div>

            {/* Type-specific target */}
            {selectedType === "ATTENDANCE_STREAK" && (
              <div>
                <label style={labelStyle}>Reach a streak of ___ days</label>
                <input type="number" style={{ ...inputStyle, maxWidth: 160 }} min={1} max={30} value={form.targetValue} onChange={e => f("targetValue", parseInt(e.target.value))} />
              </div>
            )}
            {selectedType === "AI_BUDDY_SESSIONS" && (
              <div>
                <label style={labelStyle}>Complete ___ AI Buddy sessions this week</label>
                <input type="number" style={{ ...inputStyle, maxWidth: 160 }} min={1} max={20} value={form.targetValue} onChange={e => f("targetValue", parseInt(e.target.value))} />
              </div>
            )}
            {selectedType === "ASSIGNMENT_SUBMISSIONS" && (
              <div>
                <label style={labelStyle}>Submit ___ assignments this month</label>
                <input type="number" style={{ ...inputStyle, maxWidth: 160 }} min={1} max={30} value={form.targetValue} onChange={e => f("targetValue", parseInt(e.target.value))} />
              </div>
            )}
            {selectedType === "GRADE_TARGET" && (
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Subject</label>
                  <select style={inputStyle} value={form.subjectId} onChange={e => f("subjectId", e.target.value)}>
                    <option value="">Select subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Score above ___% </label>
                  <input type="number" style={{ ...inputStyle, maxWidth: 100 }} min={1} max={100} value={form.targetValue} onChange={e => f("targetValue", parseInt(e.target.value))} />
                </div>
              </div>
            )}
            {selectedType === "ZERO_ABSENCES_WEEK" && (
              <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: "#6B8C82" }}>Students must have zero absences in any school week during the quest period.</p>
            )}
            {selectedType === "CUSTOM" && (
              <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: "#6B8C82" }}>You will manually mark this quest as complete for each student.</p>
            )}

            {/* XP Reward slider */}
            <div>
              <label style={labelStyle}>XP Reward: <strong>{form.xpReward} XP</strong></label>
              <input type="range" min={10} max={200} step={10} value={form.xpReward} onChange={e => f("xpReward", parseInt(e.target.value))} style={{ width: "100%", accentColor: "#3ECFB2" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: "#7A7670" }}>
                <span>10 XP</span><span>200 XP</span>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" style={inputStyle} value={form.startDate} onChange={e => f("startDate", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input type="date" style={inputStyle} value={form.endDate} onChange={e => f("endDate", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Target Audience */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>Class</label>
              <select style={inputStyle} value={form.classId} onChange={e => f("classId", e.target.value)}>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              {["Whole Class", "Individual Students"].map((label, i) => (
                <button
                  key={i}
                  onClick={() => f("wholeClass", i === 0)}
                  style={{
                    flex: 1, padding: "12px 0", borderRadius: 10, cursor: "pointer",
                    border: (i === 0 ? form.wholeClass : !form.wholeClass) ? "2px solid #3ECFB2" : "2px solid #E8E4D9",
                    backgroundColor: (i === 0 ? form.wholeClass : !form.wholeClass) ? "#E8FBF8" : "#FDFBF5",
                    fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 14,
                    boxShadow: (i === 0 ? form.wholeClass : !form.wholeClass) ? "2px 2px 0px #3ECFB2" : "none",
                    transition: "all 0.15s",
                  }}
                >{label}</button>
              ))}
            </div>

            {!form.wholeClass && (
              <div>
                <label style={labelStyle}>Select Students</label>
                <div style={{ maxHeight: 220, overflowY: "auto" as const, border: "2px solid #E8E4D9", borderRadius: 10, padding: 8 }}>
                  {students.map(s => {
                    const checked = form.selectedStudents.includes(s.id);
                    return (
                      <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", backgroundColor: checked ? "#E8FBF8" : "transparent" }}>
                        <input type="checkbox" checked={checked} onChange={() => {
                          f("selectedStudents", checked
                            ? form.selectedStudents.filter(x => x !== s.id)
                            : [...form.selectedStudents, s.id]
                          );
                        }} style={{ accentColor: "#3ECFB2" }} />
                        <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "#E8FBF8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color: "#2C2A24", flexShrink: 0 }}>
                          {s.name[0]}
                        </div>
                        <div>
                          <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 13, margin: 0, color: "#2C2A24" }}>{s.name}</p>
                          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: "#7A7670", margin: 0 }}>Roll {s.roll_no}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ backgroundColor: "#FFFBF0", border: "2px solid #D4A853", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ fontFamily: '"Caveat", cursive', fontSize: 16, color: "#8B6914", margin: 0 }}>
                📜 This quest will be sent to <strong>
                  {form.wholeClass ? "the whole class" : `${form.selectedStudents.length} student(s)`}
                </strong>
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Badge */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={() => f("giveBadge", !form.giveBadge)}
                style={{
                  width: 44, height: 24, borderRadius: 12, cursor: "pointer", border: "none",
                  backgroundColor: form.giveBadge ? "#3ECFB2" : "#E8E4D9", transition: "background-color 0.2s",
                  position: "relative",
                }}
              >
                <div style={{ position: "absolute", top: 3, left: form.giveBadge ? 23 : 3, width: 18, height: 18, borderRadius: "50%", backgroundColor: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </button>
              <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 15, color: "#2C2A24" }}>Award a custom badge on completion</span>
            </div>

            {form.giveBadge && (
              <>
                <div>
                  <label style={labelStyle}>Badge Name</label>
                  <input style={inputStyle} value={form.badgeName} onChange={e => f("badgeName", e.target.value)} placeholder="e.g. Perfect Attendance Hero" />
                </div>
                <div>
                  <label style={labelStyle}>Badge Color</label>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    {BADGE_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => f("badgeColor", c)}
                        style={{
                          width: 36, height: 36, borderRadius: "50%", backgroundColor: c, border: form.badgeColor === c ? "3px solid #2C2A24" : "3px solid transparent", cursor: "pointer",
                          boxShadow: form.badgeColor === c ? "0 0 0 2px white inset" : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/* Live badge preview */}
                {form.badgeName && (
                  <div style={{ backgroundColor: "#FDFBF5", border: "2px solid #E8E4D9", borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <p style={{ fontFamily: '"Nunito", sans-serif', fontSize: 13, color: "#7A7670", margin: 0 }}>Preview:</p>
                    <div style={{ backgroundColor: form.badgeColor, borderRadius: 100, padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🏅</span>
                      <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: "white" }}>{form.badgeName}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {saveErr && <p style={{ fontFamily: '"DM Sans", sans-serif', color: "#E8534A", marginTop: 12, fontSize: 14 }}>{saveErr}</p>}

        {/* Navigation buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, gap: 12 }}>
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            style={{ ...btnOutline }}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>
          {step < 4 ? (
            <button
              onClick={() => {
                if (step === 1 && !selectedType) return;
                setStep(s => s + 1);
              }}
              style={{ ...btnPrimary, opacity: step === 1 && !selectedType ? 0.5 : 1 }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={saving || !form.title || !form.classId}
              style={{ ...btnPrimary, opacity: saving || !form.title ? 0.6 : 1 }}
            >
              {saving ? "Creating…" : "✨ Create Quest"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: '"Nunito", sans-serif', fontWeight: 700,
  fontSize: 13, color: "#2C2A24", marginBottom: 6,
};
const btnPrimary: React.CSSProperties = {
  backgroundColor: "#3ECFB2", border: "2px solid #1C2B27", borderRadius: 12,
  padding: "12px 28px", cursor: "pointer", fontFamily: '"Nunito", sans-serif',
  fontWeight: 800, fontSize: 14, color: "#1C2B27",
  boxShadow: "4px 4px 0px #1C2B27", transition: "transform 0.1s, box-shadow 0.1s",
};
const btnOutline: React.CSSProperties = {
  backgroundColor: "transparent", border: "2px solid #E8E4D9", borderRadius: 12,
  padding: "12px 24px", cursor: "pointer", fontFamily: '"Nunito", sans-serif',
  fontWeight: 700, fontSize: 14, color: "#7A7670",
};

// ─── Quest Analytics Expand Panel ─────────────────────────────────────────────
function QuestAnalytics({ row, onNudge, onManualComplete }: { row: ClassQuestRow; onNudge: (id: string) => void; onManualComplete?: (questId: string) => void }) {
  const { quest, stats } = row;
  const color = QUEST_TYPES.find(t => t.type === quest.type)?.color ?? "#3ECFB2";

  const totalTargeted = stats.totalTargeted;
  const completedCount = stats.completed;
  const notStarted = totalTargeted - completedCount;

  return (
    <div style={{ backgroundColor: "#FDFBF5", borderTop: "2px dashed #E8E4D9", padding: "16px 20px", display: "flex", gap: 20, flexWrap: "wrap" as const }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: "#2C2A24", margin: "0 0 8px" }}>✅ Completed ({completedCount})</p>
        {stats.completedStudents.length === 0 ? (
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: "#7A7670" }}>No completions yet.</p>
        ) : stats.completedStudents.map(s => (
          <div key={s.studentId} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #E8E4D9", fontFamily: '"DM Sans", sans-serif', fontSize: 13, color: "#2C2A24" }}>
            <span>{s.name}</span>
            <span style={{ color: "#3ECFB2", fontWeight: 700 }}>+{s.xpAwarded} XP</span>
          </div>
        ))}
      </div>

      {notStarted > 0 && (
        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: "#2C2A24", margin: "0 0 8px" }}>
            ⏳ Yet to complete ({notStarted})
          </p>
          <button
            onClick={() => onNudge(quest.id)}
            style={{ backgroundColor: "#FFF3DC", border: "2px solid #F5A623", borderRadius: 10, padding: "8px 16px", cursor: "pointer", fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 13, color: "#8B6914", boxShadow: "2px 2px 0px #F5A623" }}
          >
            💪 Nudge struggling students
          </button>
        </div>
      )}

      {quest.type === "CUSTOM" && onManualComplete && (
        <div style={{ flex: 1, minWidth: 180 }}>
          <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: "#2C2A24", margin: "0 0 8px" }}>✍️ Manual Completion</p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: "#7A7670", margin: "0 0 8px" }}>Click checkmarks in the main table to mark students complete.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeacherQuestsPage() {
  const [quests, setQuests] = useState<ClassQuestRow[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [nudgeMsg, setNudgeMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const dash = await apiData<{ my_classes?: ClassInfo[] }>("/api/analytics/teacher");
      const myClasses = dash?.my_classes ?? [];
      setClasses(myClasses);
      if (myClasses.length && !selectedClass) {
        setSelectedClass(myClasses[0].id);
      }

      // Load subjects
      const sub = await apiData<{ data: SubjectInfo[] } | SubjectInfo[]>("/api/subjects");
      const subArr = Array.isArray(sub) ? sub : (sub as any)?.data ?? [];
      setSubjects(subArr);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQuests = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await apiData<ClassQuestRow[]>(`/api/quests/class/${selectedClass}`);
      setQuests(Array.isArray(data) ? data : []);
    } catch { setQuests([]); }
  }, [selectedClass]);

  const loadStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const data = await apiData<{ students?: StudentInfo[] } | StudentInfo[]>(`/api/students?class_id=${selectedClass}`);
      const arr = Array.isArray(data) ? data : (data as any)?.students ?? (data as any)?.data ?? [];
      setStudents(arr);
    } catch { setStudents([]); }
  }, [selectedClass]);

  useEffect(() => { void loadData(); }, [loadData]);
  useEffect(() => { void loadQuests(); void loadStudents(); }, [loadQuests, loadStudents]);

  const handleNudge = async (questId: string) => {
    try {
      interface NudgeResp { nudged: number }
      const result = await apiData<NudgeResp>(`/api/quests/${questId}/nudge`, { method: "POST" } as RequestInit);
      setNudgeMsg(`Encouragement sent to ${(result as any)?.nudged ?? 0} student(s)!`);
      setTimeout(() => setNudgeMsg(null), 3000);
    } catch (e) {
      setNudgeMsg("Failed to send nudge");
    }
  };

  const handleDelete = async (questId: string) => {
    if (!confirm("Delete this quest? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/quests/${questId}`, { method: "DELETE" });
      void loadQuests();
    } catch (e) {
      alert("Failed to delete quest");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FDFBF5", fontFamily: '"DM Sans", sans-serif', position: "relative" }}>
      {/* Background doodles */}
      <div style={{ position: "fixed", top: 80, right: 60, opacity: 0.2, pointerEvents: "none" as const }}><StarburstSVG size={80} color="#F5A623" /></div>
      <div style={{ position: "fixed", bottom: 100, left: 260, opacity: 0.15, pointerEvents: "none" as const }}><StarburstSVG size={48} color="#3ECFB2" /></div>
      <div style={{ position: "fixed", top: 200, left: 270, opacity: 0.12, pointerEvents: "none" as const }}><StarburstSVG size={32} color="#FF6B6B" /></div>

      <Sidebar />

      <main style={{ flex: 1, marginLeft: 240 }}>
        {/* ─── Header (sticky) ─── */}
        <header style={{ height: 70, borderBottom: "2px solid #E8E4D9", backgroundColor: "#FFFFFF", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky" as const, top: 0, zIndex: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ opacity: 0.7 }}><ScrollDoodleSVG /></div>
            <div>
              <h1 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 24, margin: 0, color: "#2C2A24" }}>
                Study Quests <span style={{ fontSize: 16, color: "#7A7670", fontWeight: 600 }}>({quests.length})</span>
              </h1>
              <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: "#7A7670", margin: 0 }}>Assign challenges. Award XP. Make learning legendary.</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={{ border: "2px solid #E8E4D9", borderRadius: 10, padding: "8px 14px", fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 13, color: "#2C2A24", backgroundColor: "#FDFBF5" }}
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
            </select>

            <button
              onClick={() => setShowModal(true)}
              style={{ backgroundColor: "#3ECFB2", border: "2px solid #1C2B27", borderRadius: 12, padding: "10px 20px", cursor: "pointer", fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14, color: "#1C2B27", boxShadow: "4px 4px 0px #1C2B27", display: "flex", alignItems: "center", gap: 8 }}
            >
              <span style={{ fontSize: 18 }}>+</span> Create Quest
            </button>
          </div>
        </header>

        <div style={{ padding: "32px 32px" }}>
          {nudgeMsg && (
            <div style={{ backgroundColor: "#E8FBF8", border: "2px solid #3ECFB2", borderRadius: 10, padding: "10px 16px", marginBottom: 20, fontFamily: '"Nunito", sans-serif', fontWeight: 700, color: "#1C5C4F", display: "flex", gap: 10 }}>
              ✅ {nudgeMsg}
            </div>
          )}

          {err && <p style={{ color: "#E8534A", fontFamily: '"DM Sans", sans-serif', marginBottom: 16 }}>{err}</p>}

          {loading ? (
            <div style={{ textAlign: "center" as const, padding: 60, fontFamily: '"Caveat", cursive', fontSize: 20, color: "#7A7670" }}>Loading quests…</div>
          ) : quests.length === 0 ? (
            <div style={{ textAlign: "center" as const, padding: 72 }}>
              <div style={{ marginBottom: 16 }}>
                {[0, 1, 2, 3].map(i => (
                  <span key={i} style={{ display: "inline-block", margin: "0 6px" }}><StarburstSVG size={28} color={["#F5A623", "#FF6B6B", "#3ECFB2", "#7C5CBF"][i]} /></span>
                ))}
              </div>
              <h2 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 22, color: "#2C2A24", marginBottom: 8 }}>No quests yet!</h2>
              <p style={{ fontFamily: '"Caveat", cursive', fontSize: 18, color: "#7A7670", marginBottom: 24 }}>Create your first quest to motivate your students.</p>
              <button onClick={() => setShowModal(true)} style={{ ...btnPrimary, fontSize: 16, padding: "14px 32px" }}>✨ Create First Quest</button>
            </div>
          ) : (
            /* Quests Table */
            <div style={{ backgroundColor: "#FFFFFF", border: "2px solid #E8E4D9", borderRadius: 16, overflow: "hidden", boxShadow: "4px 4px 0px #E8E4D9" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr 1.2fr 0.7fr 0.9fr 1.1fr", padding: "12px 20px", backgroundColor: "#FFFBF0", borderBottom: "2px solid #E8E4D9", gap: 8 }}>
                {["Quest", "Type", "Target", "Progress", "XP", "Ends", "Actions"].map(h => (
                  <span key={h} style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color: "#7A7670", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>

              {quests.map((row, idx) => {
                const { quest, stats } = row;
                const color = QUEST_TYPES.find(t => t.type === quest.type)?.color ?? "#3ECFB2";
                const TypeInfo = QUEST_TYPES.find(t => t.type === quest.type);
                const isExpanded = expandedId === quest.id;
                const pct = stats.completionRate;
                const daysLeft = Math.max(0, Math.ceil((new Date(quest.endDate).getTime() - Date.now()) / 86400000));

                return (
                  <div key={quest.id}>
                    <div
                      style={{
                        display: "grid", gridTemplateColumns: "2fr 1.2fr 1.5fr 1.2fr 0.7fr 0.9fr 1.1fr",
                        padding: "16px 20px", gap: 8,
                        borderBottom: isExpanded ? "none" : idx < quests.length - 1 ? "1px solid #F0EDE8" : "none",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "background-color 0.15s",
                        backgroundColor: isExpanded ? "#FDFBF5" : "transparent",
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : quest.id)}
                    >
                      {/* Quest */}
                      <div>
                        <p style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14, margin: "0 0 2px", color: "#2C2A24" }}>{quest.title}</p>
                        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 12, color: "#7A7670", margin: 0 }} title={quest.description}>
                          {quest.description.length > 50 ? quest.description.slice(0, 50) + "…" : quest.description}
                        </p>
                      </div>
                      {/* Type */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <div style={{ backgroundColor: `${color}20`, borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                          {TypeInfo && <span style={{ display: "flex" }}><TypeInfo.Icon /></span>}
                          <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 11, color }}>{TypeInfo?.label ?? quest.type}</span>
                        </div>
                      </div>
                      {/* Target */}
                      <p style={{ fontFamily: '"Caveat", cursive', fontSize: 15, color: "#4A5F58", margin: 0 }}>
                        {quest.type === "ATTENDANCE_STREAK" && `Streak ${(quest.target as any)?.value} days`}
                        {quest.type === "ASSIGNMENT_SUBMISSIONS" && `${(quest.target as any)?.value} submissions`}
                        {quest.type === "AI_BUDDY_SESSIONS" && `${(quest.target as any)?.value} sessions`}
                        {quest.type === "GRADE_TARGET" && `>${(quest.target as any)?.value}% score`}
                        {quest.type === "ZERO_ABSENCES_WEEK" && `Zero absences / week`}
                        {quest.type === "CUSTOM" && "Manual completion"}
                      </p>
                      {/* Progress */}
                      <div>
                        <MiniProgressBar percent={pct} color={color} />
                        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 11, color: "#7A7670", margin: "4px 0 0", textAlign: "right" as const }}>
                          {stats.completed}/{stats.totalTargeted} completed ({pct}%)
                        </p>
                      </div>
                      {/* XP */}
                      <div style={{ backgroundColor: "#F5A623", borderRadius: 100, padding: "4px 10px", textAlign: "center" as const, display: "inline-block" }}>
                        <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color: "white" }}>+{quest.xpReward}</span>
                      </div>
                      {/* Ends */}
                      <p style={{ fontFamily: '"Caveat", cursive', fontSize: 14, color: daysLeft <= 1 ? "#E8534A" : "#7A7670", margin: 0 }}>
                        {daysLeft === 0 ? "Today!" : `${daysLeft}d`}
                      </p>
                      {/* Actions */}
                      <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : quest.id)}
                          style={{ backgroundColor: "#FDFBF5", border: "2px solid #E8E4D9", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 12, color: "#2C2A24" }}
                          title="View analytics"
                        >
                          {isExpanded ? "▲" : "▼"}
                        </button>
                        <button
                          onClick={() => handleDelete(quest.id)}
                          style={{ backgroundColor: "#FEE", border: "2px solid #E8534A", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 12, color: "#E8534A" }}
                          title="Delete quest"
                        >✕</button>
                      </div>
                    </div>

                    {/* Expanded Analytics */}
                    {isExpanded && (
                      <QuestAnalytics row={row} onNudge={handleNudge} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Quest Modal */}
      {showModal && (
        <CreateQuestModal
          classes={classes}
          subjects={subjects}
          students={students}
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); void loadQuests(); }}
        />
      )}
    </div>
  );
}
