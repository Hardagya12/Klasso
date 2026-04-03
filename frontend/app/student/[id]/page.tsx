"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiData } from "../../../lib/api";
import { 
  ChevronLeft, MessageCircle, FileText, Sparkles, BookOpen, 
  Lightbulb, Calendar, Download
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

type StudentProfilePayload = {
  student: { id: string; roll_no: string };
  user: { name: string; email: string; avatar_url?: string | null };
  class: {
    id?: string | null;
    name?: string | null;
    section?: string | null;
    class_teacher_name?: string | null;
  } | null;
  fee_status?: { paid: number; pending: number; total: number };
  attendance_summary: {
    percentage: number;
    present: number;
    absent: number;
    late?: number;
    excused?: number;
    total?: number;
  };
  recent_marks: Array<{
    subject_name: string;
    score: string | number;
    max_marks: string | number;
    grade: string;
    exam_name: string;
  }>;
  pending_assignments: Array<{ title: string; subject_name: string; due_date: string }>;
};

type AttendanceCalPayload = {
  month: number;
  year: number;
  calendar: Array<{ date: string; status: string; remark: string | null }>;
  summary: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
    percentage: number;
  };
};

type MarkRow = {
  exam_name: string;
  exam_type?: string;
  start_date: string;
  subject_name: string;
  subject_code?: string;
  score: string | number;
  max_marks: string | number;
  passing_marks?: string | number;
  grade: string;
  remarks: string | null;
};

type DocRow = {
  id: string;
  type: string;
  generated_at: string;
  issued: boolean;
  file_url: string | null;
};

const SUBJ_COLORS = [
  "#EF4444",
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];

function formatClassLabel(
  c: StudentProfilePayload["class"]
): string {
  if (!c) return "—";
  const n = c.name?.trim();
  const s = c.section?.trim();
  if (!n && !s) return "—";
  if (n && s) return `${n}-${s}`;
  return n || s || "—";
}

function attendanceMoodLabel(pct: number): string {
  if (pct >= 90) return "Excellent";
  if (pct >= 85) return "On track";
  if (pct >= 70) return "Needs focus";
  return "At risk";
}

export default function StudentProfile() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [activeTab, setActiveTab] = useState("Overview");
  const [payload, setPayload] = useState<StudentProfilePayload | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [attCal, setAttCal] = useState<AttendanceCalPayload | null>(null);
  const [attErr, setAttErr] = useState<string | null>(null);
  const [allMarks, setAllMarks] = useState<MarkRow[] | null>(null);
  const [marksErr, setMarksErr] = useState<string | null>(null);
  const [docs, setDocs] = useState<DocRow[] | null>(null);
  const [docsErr, setDocsErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    void (async () => {
      try {
        const d = await apiData<StudentProfilePayload>(`/api/students/${id}`);
        setPayload(d);
      } catch (e) {
        setLoadErr(e instanceof Error ? e.message : "Failed to load student");
      }
    })();
  }, [id]);

  useEffect(() => {
    if (activeTab !== "Attendance" || !id) return;
    setAttErr(null);
    void (async () => {
      try {
        const d = await apiData<AttendanceCalPayload>(
          `/api/students/${id}/attendance?month=${calMonth}&year=${calYear}`
        );
        setAttCal(d);
      } catch (e) {
        setAttErr(e instanceof Error ? e.message : "Failed to load attendance");
      }
    })();
  }, [activeTab, id, calMonth, calYear]);

  useEffect(() => {
    if ((activeTab !== "Grades" && activeTab !== "Notes & Docs") || !id) return;
    setMarksErr(null);
    void (async () => {
      try {
        const rows = await apiData<MarkRow[]>(`/api/students/${id}/marks`);
        setAllMarks(rows);
      } catch (e) {
        setMarksErr(e instanceof Error ? e.message : "Failed to load marks");
      }
    })();
  }, [activeTab, id]);

  useEffect(() => {
    if (activeTab !== "Notes & Docs" || !id) return;
    setDocsErr(null);
    void (async () => {
      try {
        const rows = await apiData<DocRow[]>(`/api/documents/student/${id}`);
        setDocs(rows);
      } catch (e) {
        setDocsErr(e instanceof Error ? e.message : "Failed to load documents");
      }
    })();
  }, [activeTab, id]);

  const pct = payload?.attendance_summary?.percentage ?? 0;
  const tags: { label: string; color: string }[] = [];
  if ((payload?.fee_status?.pending ?? 0) > 0) {
    tags.push({
      label: "Fee pending",
      color: "bg-amber-100 text-amber-900 border-amber-300",
    });
  }
  if (payload && pct < 75 && (payload.attendance_summary?.total ?? 0) > 0) {
    tags.push({
      label: "Attendance watch",
      color: "bg-red-100 text-red-800 border-red-300",
    });
  }

  const student = {
    name: payload?.user?.name ?? "Loading…",
    class: formatClassLabel(payload?.class ?? null),
    roll: payload?.student?.roll_no ?? "—",
    isTopPerformer: pct >= 90,
    tags,
    avatar:
      payload?.user?.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(payload?.user?.name || "Student")}`,
    attendance: Math.round(pct),
    grade: payload?.recent_marks?.[0]?.grade ?? "—",
    gradeMood:
      payload?.recent_marks?.length ?
        "From latest recorded exam"
      : "No grades yet",
    attendanceMood: payload ? attendanceMoodLabel(Math.round(pct)) : "—",
    assignments: payload ? `${payload.pending_assignments?.length ?? 0} pending` : "—",
    aiInsights: [] as string[],
    subjects:
      payload?.recent_marks?.length ?
        payload.recent_marks.map((m, i) => ({
          name: m.subject_name,
          grade: m.grade,
          progress: Math.min(
            100,
            Math.round((Number(m.score) / Math.max(1, Number(m.max_marks))) * 100)
          ),
          color: SUBJ_COLORS[i % SUBJ_COLORS.length],
        }))
      : [],
  };

  const TABS = ["Overview", "Attendance", "Grades", "Notes & Docs"];

  return (
    <div className="flex min-h-screen bg-[#Fdfbfc] text-[#4A473F] font-sans" style={{ backgroundImage: 'radial-gradient(#E8E4D9 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}>
      <Sidebar collapsed={true} />

      <main className="flex-1 ml-[80px] px-8 py-8 w-full max-w-full">
        {/* Breadcrumb / Back Navigation */}
        <Link href="/teacher/students" className="inline-flex items-center gap-2 text-[#7A7670] hover:text-[#2C2A24] font-bold mb-6 font-['Nunito']">
            <ChevronLeft size={20} strokeWidth={3} /> Back to Directory
        </Link>

        {loadErr && (
          <p className="text-red-600 font-bold mb-4" role="alert">
            {loadErr}
          </p>
        )}

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
                       <div className="text-2xl font-black text-[#2C2A24] font-['Nunito']">{student.attendanceMood}</div>
                    </div>
                 </div>

                 <div className="bg-[#FAF9F6] border-2 border-dashed border-[#E8E4D9] p-6 rounded-2xl flex items-center gap-6">
                    <GradeBadge grade={student.grade} />
                    <div>
                       <div className="text-[#A39E93] text-sm font-bold uppercase tracking-widest mb-1">Latest grade</div>
                       <div className="text-2xl font-black text-[#2C2A24] font-['Nunito']">{student.gradeMood}</div>
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

               {/* Recent assessments (from profile payload) */}
               <div className="bg-white border-2 border-[#E8E4D9] rounded-2xl p-6 mb-10 relative shadow-[2px_2px_0_#F3F4F6]">
                  <h3 className="text-xl font-bold font-['Nunito'] mb-6 flex items-center gap-2">
                     <BookOpen className="text-blue-500" size={24} strokeWidth={2.5} />
                     Recent assessments
                  </h3>
                  {!payload?.recent_marks?.length ? (
                    <p className="text-[#A39E93] font-bold">
                      No marks recorded yet. Grades will appear here after exams are graded.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {payload.recent_marks.map((m, i) => (
                        <li
                          key={`${m.exam_name}-${m.subject_name}-${i}`}
                          className="flex flex-wrap items-baseline justify-between gap-2 border-2 border-dashed border-[#E8E4D9] rounded-xl px-4 py-3"
                        >
                          <span className="font-bold text-[#2C2A24]">{m.subject_name}</span>
                          <span className="text-sm font-bold text-[#7A7670]">{m.exam_name}</span>
                          <span className="font-black text-[#C2410C] font-['Caveat'] text-xl">
                            {m.grade}{" "}
                            <span className="text-sm font-['Nunito'] text-[#A39E93]">
                              ({m.score}/{m.max_marks})
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
               </div>

               {/* AI Insights Card */}
               <div className="bg-[#FFFBEB] border-2 border-amber-200 rounded-2xl p-6 relative">
                  <div className="absolute -top-4 -left-4 bg-amber-100 rounded-full p-2 border-2 border-amber-300">
                     <Lightbulb className="text-amber-500" size={32} />
                  </div>
                  <h3 className="text-xl font-black font-['Nunito'] text-amber-900 ml-10 mb-4">AI Observations</h3>
                  {student.aiInsights.length === 0 ? (
                    <p className="text-amber-800 font-medium text-lg ml-10">
                      No AI summary for this learner yet. Use the AI tools elsewhere in the app to generate
                      personalized insights when that workflow is enabled for your school.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {student.aiInsights.map((insight, i) => (
                        <li key={i} className="flex gap-4 items-start text-amber-800 font-medium text-lg">
                          <svg width="30" height="30" viewBox="0 0 100 100" fill="none" className="shrink-0 mt-1">
                            <path d="M20 50Q50 20 80 50M60 30L80 50L60 70" stroke="#D97706" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          &ldquo;{insight}&rdquo;
                        </li>
                      ))}
                    </ul>
                  )}
               </div>
            </div>
          )}

          {/* TAB 2: ATTENDANCE */}
          {activeTab === "Attendance" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h3 className="text-2xl font-black font-['Nunito'] text-[#2C2A24] flex items-center gap-3">
                  <Calendar className="text-emerald-500" /> Attendance
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl border-2 border-[#E8E4D9] font-bold text-[#4A473F] hover:bg-[#FAFAFA]"
                    onClick={() => {
                      const d = new Date(calYear, calMonth - 2, 1);
                      setCalMonth(d.getMonth() + 1);
                      setCalYear(d.getFullYear());
                    }}
                  >
                    Previous
                  </button>
                  <span className="font-bold text-[#2C2A24] min-w-[10rem] text-center">
                    {new Date(calYear, calMonth - 1, 1).toLocaleString(undefined, {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl border-2 border-[#E8E4D9] font-bold text-[#4A473F] hover:bg-[#FAFAFA]"
                    onClick={() => {
                      const d = new Date(calYear, calMonth, 1);
                      setCalMonth(d.getMonth() + 1);
                      setCalYear(d.getFullYear());
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>

              {attErr && (
                <p className="text-red-600 font-bold mb-4" role="alert">
                  {attErr}
                </p>
              )}

              {attCal && (
                <p className="text-sm font-bold text-[#7A7670] mb-4">
                  This month: {attCal.summary.present} present · {attCal.summary.absent} absent ·{" "}
                  {attCal.summary.late} late · {attCal.summary.excused} excused ·{" "}
                  {attCal.summary.total ? `${attCal.summary.percentage}%` : "no sessions"} recorded
                </p>
              )}

              {(() => {
                const daysInMonth = new Date(calYear, calMonth, 0).getDate();
                const startWeekday = new Date(calYear, calMonth - 1, 1).getDay();
                const leading = (startWeekday + 6) % 7;
                const byDay = new Map<
                  number,
                  { status: string; remark: string | null }
                >();
                for (const c of attCal?.calendar ?? []) {
                  const dt = new Date(c.date);
                  if (dt.getMonth() + 1 === calMonth && dt.getFullYear() === calYear) {
                    byDay.set(dt.getDate(), { status: c.status, remark: c.remark });
                  }
                }
                const cellClass = (status: string | undefined) => {
                  switch (status) {
                    case "present":
                      return "bg-emerald-50 border-emerald-300 text-emerald-900";
                    case "absent":
                      return "bg-red-100 border-red-300 text-red-800 relative";
                    case "late":
                      return "bg-amber-100 border-amber-300 text-amber-900";
                    case "excused":
                      return "bg-slate-100 border-slate-300 text-slate-800";
                    default:
                      return "bg-[#FAFAFA] border-[#E8E4D9] text-[#A39E93]";
                  }
                };
                const cells: React.ReactNode[] = [];
                for (let i = 0; i < leading; i++) {
                  cells.push(<div key={`pad-${i}`} className="aspect-square" />);
                }
                for (let day = 1; day <= daysInMonth; day++) {
                  const rec = byDay.get(day);
                  cells.push(
                    <div
                      key={day}
                      title={
                        rec?.remark?.trim() ?
                          `${rec.status}: ${rec.remark}`
                        : rec?.status || "No attendance recorded"
                      }
                      className={`relative aspect-square rounded-xl border-2 flex items-center justify-center font-bold font-['Nunito'] text-sm ${cellClass(rec?.status)}`}
                    >
                      {day}
                      {rec?.status === "absent" && (
                        <div className="absolute inset-0 m-auto w-[120%] h-[2px] bg-red-500 transform rotate-45 pointer-events-none" />
                      )}
                    </div>
                  );
                }
                return (
                  <div className="grid grid-cols-7 gap-2 mb-8 bg-[#FAFAFA] p-6 rounded-2xl border-2 border-[#E8E4D9] relative">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                      <div key={d} className="text-center font-bold text-[#A39E93] text-sm">
                        {d}
                      </div>
                    ))}
                    {cells}
                  </div>
                );
              })()}

              <h4 className="font-bold text-[#4A473F] mb-4">Absence log (this month)</h4>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-dashed border-[#E8E4D9]">
                    <th className="py-3 text-[#A39E93]">Date</th>
                    <th className="py-3 text-[#A39E93]">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-dashed divide-[#F3F4F6]">
                  {(attCal?.calendar ?? [])
                    .filter((c) => c.status === "absent")
                    .map((c, i) => (
                      <tr key={`${c.date}-${i}`}>
                        <td className="py-4 font-bold">
                          {new Date(c.date).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </td>
                        <td className="py-4 font-medium text-[#7A7670]">
                          {c.remark?.trim() || "—"}
                        </td>
                      </tr>
                    ))}
                  {(attCal?.calendar ?? []).filter((c) => c.status === "absent").length === 0 && (
                    <tr>
                      <td colSpan={2} className="py-6 text-[#A39E93] font-bold">
                        No absences recorded for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: GRADES */}
          {activeTab === "Grades" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               {marksErr && (
                 <p className="text-red-600 font-bold mb-4" role="alert">
                   {marksErr}
                 </p>
               )}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(allMarks ?? []).map((row, i) => {
                    const sub = {
                      name: row.subject_name,
                      grade: row.grade,
                      progress: Math.min(
                        100,
                        Math.round(
                          (Number(row.score) / Math.max(1, Number(row.max_marks))) * 100
                        )
                      ),
                      color: SUBJ_COLORS[i % SUBJ_COLORS.length],
                      exam: row.exam_name,
                      when: row.start_date,
                    };
                    return (
                      <div
                        key={`${row.exam_name}-${row.subject_name}-${row.start_date}-${i}`}
                        className="bg-white border-2 border-[#E8E4D9] rounded-2xl p-6 shadow-[2px_2px_0_#E8E4D9] group hover:-translate-y-1 transition-transform relative overflow-hidden"
                        style={{ borderLeftColor: sub.color, borderLeftWidth: 8 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-xl font-bold font-['Nunito'] text-[#2C2A24]">
                            {sub.name}
                          </h4>
                          <span
                            className="text-3xl font-black font-['Caveat']"
                            style={{ color: sub.color }}
                          >
                            {sub.grade}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#A39E93] mb-4">
                          {sub.exam} ·{" "}
                          {new Date(sub.when).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}{" "}
                          · {row.score}/{row.max_marks}
                        </p>

                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-bold text-[#A39E93] mb-1">
                            <span>Score vs max</span>
                            <span>{sub.progress}%</span>
                          </div>
                          <div className="w-full bg-[#F3F4F6] h-3 rounded-full overflow-hidden border-2 border-[#E8E4D9]">
                            <div
                              className="h-full rounded-r-none rounded-l-full"
                              style={{
                                width: `${sub.progress}%`,
                                backgroundColor: sub.color,
                              }}
                            />
                          </div>
                        </div>

                        {row.remarks?.trim() && (
                          <p className="text-sm font-medium text-[#4A473F] border-t-2 border-dashed border-[#E8E4D9] pt-3">
                            {row.remarks}
                          </p>
                        )}

                        <div className="absolute bottom-0 left-0 w-full opacity-50 translate-y-1/2 group-hover:translate-y-0 transition-transform">
                          <RulerDoodle />
                        </div>
                      </div>
                    );
                  })}
                  {(allMarks ?? []).length === 0 && !marksErr && (
                    <p className="text-[#A39E93] font-bold col-span-full">
                      No grades recorded yet.
                    </p>
                  )}
               </div>
            </div>
          )}

          {/* TAB 4: NOTES & DOCS */}
          {activeTab === "Notes & Docs" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <h3 className="text-2xl font-black font-['Nunito'] text-[#2C2A24]">Remarks from marks</h3>
                     <AppleDoodle />
                  </div>
                  {marksErr && (
                    <p className="text-red-600 font-bold mb-4" role="alert">
                      {marksErr}
                    </p>
                  )}
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 opacity-50 transform -rotate-12">
                      <PaperclipDoodle />
                    </div>
                    <div
                      className="min-h-[20rem] rounded-xl p-8 pt-10 font-bold text-lg font-['Nunito'] text-[#2C2A24] border-2 border-dashed border-[#E8E4D9] shadow-[4px_4px_0_#E8E4D9] space-y-4 bg-[#F8FAFC]"
                    >
                      {(allMarks ?? []).filter((m) => m.remarks?.trim()).length === 0 ? (
                        <p className="text-[#7A7670]">
                          No teacher remarks on file. Remarks appear here when they are saved on individual
                          marks entries.
                        </p>
                      ) : (
                        <ul className="space-y-4">
                          {(allMarks ?? [])
                            .filter((m) => m.remarks?.trim())
                            .map((m, i) => (
                              <li
                                key={`${m.subject_name}-${m.exam_name}-${i}`}
                                className="border-b-2 border-dashed border-[#E8E4D9] pb-3 last:border-0"
                              >
                                <div className="text-sm font-bold text-[#A39E93] mb-1">
                                  {m.subject_name} · {m.exam_name}
                                </div>
                                <div className="font-['Caveat'] text-xl text-blue-900">
                                  {m.remarks}
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-bold text-[#A39E93]">
                    Free-form teacher notes will need a dedicated school policy and API; for now, use mark
                    remarks when recording grades.
                  </p>
               </div>

               <div>
                 <h3 className="text-2xl font-black font-['Nunito'] text-[#2C2A24] mb-4">Generated documents</h3>
                 {docsErr && (
                   <p className="text-red-600 font-bold mb-4" role="alert">
                     {docsErr}
                   </p>
                 )}
                 <div className="space-y-3">
                   {(docs ?? []).length === 0 && !docsErr && (
                     <p className="text-[#A39E93] font-bold">
                       No documents generated for this student yet.
                     </p>
                   )}
                   {(docs ?? []).map((doc) => {
                      const label = doc.type.replace(/_/g, " ");
                      return (
                       <div
                         key={doc.id}
                         className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-[#E8E4D9] hover:bg-[#FAF9F6] group transition-colors"
                       >
                          <div className="flex items-center gap-4">
                             <div className="bg-white p-2 border-2 border-[#E8E4D9] rounded-lg shadow-sm">
                                <FileText className="text-blue-500" size={20} />
                             </div>
                             <div>
                                <div className="font-bold text-[#4A473F] capitalize">{label}</div>
                                <div className="text-xs font-bold text-[#A39E93]">
                                  {new Date(doc.generated_at).toLocaleString(undefined, {
                                    dateStyle: "medium",
                                  })}
                                  {doc.issued ? " · Issued" : " · Draft"}
                                </div>
                             </div>
                          </div>
                          {doc.file_url ? (
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#A39E93] hover:text-blue-500"
                              aria-label="Download document"
                            >
                              <Download size={20} />
                            </a>
                          ) : (
                            <Download className="text-[#E8E4D9]" size={20} aria-hidden />
                          )}
                       </div>
                     );
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
