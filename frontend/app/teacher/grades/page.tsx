"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { apiData, apiPaginated } from "../../../lib/api";

type ClassData = { id: string; name: string; section: string };
type ExamData = { id: string; name: string };
type SubjectData = { subject_id: string; name: string; code?: string; exam_subject_id: string; max_marks: string };
type StudentData = { id: string; name: string; roll_no: string };
type MarkRow = {
  student: StudentData;
  marks: Record<string, { id: string; score: string; grade: string; remarks: string; passed: boolean } | null>;
  totals: any;
};


// ═══════════════════════════════════════════════
//  SVG DOODLES
// ═══════════════════════════════════════════════

const BarChartDoodle = ({ size = 40, color = "#4A90D9" }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="4" y="28" width="8" height="16" rx="1.5" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="16" y="18" width="8" height="26" rx="1.5" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="28" y="10" width="8" height="34" rx="1.5" fill={color} fillOpacity="0.7" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="40" y="22" width="8" height="22" rx="1.5" fill={color} fillOpacity="0.35" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="2" y1="44" x2="50" y2="44" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    {/* Sketch double-stroke */}
    <line x1="4" y1="28" x2="12" y2="28" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    <line x1="16" y1="18" x2="24" y2="18" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

const UpArrowDoodle = ({ size = 16, color = "#2C2A24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7"/>
  </svg>
);

const SparkleStar = ({ size = 16, color = "#2C2A24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round"/>
    <path d="M5 19l1.5 1.5M19 5l-1.5-1.5M5 5l1.5-1.5M19 19l-1.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const PaperFoldDoodle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M2 2 L26 2 L30 6 L30 30 L2 30 Z" fill="#FDFBF5" stroke="#2C2A24" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M26 2 L26 6 L30 6" fill="#E8E4D9" stroke="#2C2A24" strokeWidth="2" strokeLinejoin="round"/>
    <line x1="7" y1="12" x2="25" y2="12" stroke="#E8E4D9" strokeWidth="2" strokeLinecap="round"/>
    <line x1="7" y1="17" x2="25" y2="17" stroke="#E8E4D9" strokeWidth="2" strokeLinecap="round"/>
    <line x1="7" y1="22" x2="18" y2="22" stroke="#E8E4D9" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LightbulbDoodle = ({ size = 20, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21h6M10 17h4M12 3a7 7 0 0 1 5 11.9V17H7v-2.1a7 7 0 0 1 5-11.9z"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.15"/>
    <path d="M9.5 8.5 Q12 6 14.5 8.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const PencilIconDoodle = ({ size = 16, color = "#4A90D9" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20H21"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" fill={color} fillOpacity="0.2"/>
  </svg>
);

const TrashDoodle = ({ size = 16, color = "#E8534A" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
);

const CheckDoodle = ({ size = 16, color = "#5BAD6F" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const RefreshDoodle = ({ size = 16, color = "#4A90D9" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const PlusDoodle = ({ size = 16, color = "#2C2A24" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const SpeechBubbleDoodle = ({ size = 60, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 80 70" fill="none">
    <path d="M6 6 Q4 6 4 8 L4 44 Q4 46 6 46 L28 46 L22 62 L40 46 L74 46 Q76 46 76 44 L76 8 Q76 6 74 6 Z"
      fill={color} fillOpacity="0.12" stroke={color} strokeWidth="2.5" strokeLinejoin="round"/>
    <line x1="16" y1="20" x2="64" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    <line x1="16" y1="30" x2="55" y2="30" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const BigPencilDoodle = ({ height = 150 }) => (
  <svg width={height * 0.32} height={height} viewBox="0 0 48 150" fill="none" opacity="0.08">
    <polygon points="24,4 40,30 40,140 8,140 8,30" fill="#2C2A24"/>
    <polygon points="8,140 24,148 40,140" fill="#F5A623"/>
    <rect x="8" y="28" width="32" height="6" fill="#FDFBF5" opacity="0.6"/>
    <line x1="24" y1="4" x2="24" y2="142" stroke="#FDFBF5" strokeWidth="1.5" strokeLinecap="round" opacity="0.3"/>
    <ellipse cx="24" cy="6" rx="3" ry="4" fill="#E8534A"/>
  </svg>
);

const StarSmallDoodle = ({ size = 14, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M10 2l1.8 5.5H17l-4.6 3.3 1.8 5.5L10 13l-4.2 3.3 1.8-5.5L3 7.5h5.2z"
      fill={color} stroke={color} strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

const StarburstBg = ({ size = 110, color = "#F5A623" }) => (
  <svg width={size} height={size} viewBox="0 0 110 110" fill="none" style={{ position: "absolute", zIndex: 0 }}>
    {Array.from({ length: 16 }).map((_, i) => {
      const angle = (i * 22.5 * Math.PI) / 180;
      const x1 = 55 + 18 * Math.cos(angle);
      const y1 = 55 + 18 * Math.sin(angle);
      const x2 = 55 + 52 * Math.cos(angle);
      const y2 = 55 + 52 * Math.sin(angle);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.35"/>;
    })}
    <circle cx="55" cy="55" r="20" fill={color} fillOpacity="0.2"/>
  </svg>
);

const DownChevron = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#2C2A24" strokeWidth="2.5" strokeLinecap="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

const SquiggleUnderline = ({ width = 80, color = "#4A90D9" }) => (
  <svg width={width} height="8" viewBox={`0 0 ${width} 8`} fill="none">
    <path d={`M2 4 C${width * 0.15} 1, ${width * 0.3} 7, ${width * 0.5} 4 S${width * 0.75} 1, ${width - 2} 4`}
      stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

// ═══════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════

// removed hardcoded INITIAL_SCORES and STUDENTS_DATA

const FEEDBACK_BANK: Record<string, string[]> = {
  encouraging: [
    "Fantastic effort, {name}! Your score of {score}/100 reflects your dedication. You showed excellent understanding of core concepts, especially in the analytical section. Keep building on this momentum — you have the potential to achieve even greater results in the upcoming exams.",
    "Well done, {name}! Your score of {score}/100 is something to be genuinely proud of. Your consistent hard work is clearly paying off. I noticed particularly strong reasoning skills in your answers. Continue channelling this energy and you will scale new heights!",
    "Great work, {name}! Scoring {score}/100 shows real commitment to your studies. Your enthusiasm for learning shines through your answers. With a little more focus on the weaker areas, you are well on your way to mastering this subject completely.",
  ],
  constructive: [
    "{name}, you scored {score}/100 in the mid-term assessment. While there are areas where you have shown promise, there is significant room for improvement — particularly in application-based questions. I recommend revisiting Chapters 4–6 and practising past papers to strengthen your understanding before the final exam.",
    "Your result of {score}/100, {name}, indicates a moderate grasp of the subject material. To improve, focus on structuring your answers more clearly and allocating time wisely during exams. Regular revision and seeking help for topics you find challenging will make a meaningful difference.",
    "{name}, scoring {score}/100 means there are specific gaps that need your attention. Let us identify those areas together and create a targeted study plan. Hard work and consistent practice will help you greatly improve your performance in the final assessment.",
  ],
  formal: [
    "Student {name} has obtained a score of {score} out of 100 in the Mid-term Examination. This performance reflects a satisfactory command of the prescribed syllabus. It is recommended that the student devote increased attention to the topics assessed in Section B to achieve a higher standard of academic performance.",
    "This is to formally acknowledge that {name} has received a score of {score}/100 in the assessment conducted for Class 8-A. The performance is noted. The student is advised to refer to the prescribed study material and consult the subject teacher for guidance on areas requiring improvement.",
    "{name}'s score of {score}/100 has been recorded for the Mid-term Examination. Subject teachers will provide individual feedback upon request. It is advisable for the student to maintain consistent academic effort to meet the expected benchmarks for the upcoming final examination.",
  ],
};

function generateFeedback(name: string, score: number, tone: "encouraging" | "constructive" | "formal"): string {
  const pool = FEEDBACK_BANK[tone];
  const template = pool[Math.floor(Math.random() * pool.length)];
  return template.replace(/{name}/g, name).replace(/{score}/g, String(score));
}

const calcGrade = (score: number): "A" | "B" | "C" | "D" | "F" => {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
};

const gradeStyle: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "#D5F5E3", text: "#3A8D53", border: "#5BAD6F" },
  B: { bg: "#D6EAF8", text: "#2471A3", border: "#4A90D9" },
  C: { bg: "#FEF3DC", text: "#C47D0E", border: "#F5A623" },
  D: { bg: "#FDEDEC", text: "#B03A33", border: "#E8534A" },
  F: { bg: "#F5E6E5", text: "#8B0000", border: "#C00000" },
};

const avatarColor = (id: string) => {
  const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ["#FFD6E0", "#D6EAF8", "#D5F5E3", "#FEF9E7", "#F9EBEA", "#E8DAEF"][hash % 6];
};

const initials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase();

// ═══════════════════════════════════════════════
//  RUBRIC DATA
// ═══════════════════════════════════════════════
const RUBRICS = [
  { id: 1, name: "Critical Thinking", subject: "Mathematics", criteria: 5 },
  { id: 2, name: "Lab Report",         subject: "Science",     criteria: 4 },
  { id: 3, name: "Essay Structure",    subject: "English",     criteria: 6 },
];

// ═══════════════════════════════════════════════
//  GRADE DISTRIBUTION BAR (mini)
// ═══════════════════════════════════════════════
function MiniDistBar({ grades }: { grades: string[] }) {
  const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  grades.forEach(g => { counts[g as keyof typeof counts]++; });
  const total = grades.length;
  const colors = { A: "#5BAD6F", B: "#4A90D9", C: "#F5A623", D: "#E8534A", F: "#B03A33" };

  return (
    <div className="flex items-end gap-1 h-8">
      {(["A","B","C","D","F"] as const).map(g => (
        <div key={g} className="flex flex-col items-center gap-0.5">
          <div
            className="w-6 rounded-t-sm"
            style={{
              height: total > 0 ? `${(counts[g] / total) * 32}px` : "4px",
              backgroundColor: colors[g],
              minHeight: "4px",
            }}
          />
          <span style={{ fontFamily: '"Caveat", cursive', fontSize: "11px", color: "#7A7670", fontWeight: 700 }}>{g}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════

type Tone = "encouraging" | "constructive" | "formal";

export default function GradesFeedbackPage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [exams, setExams] = useState<ExamData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [gridRows, setGridRows] = useState<MarkRow[]>([]);
  
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [markIds, setMarkIds] = useState<Record<string, string>>({}); // studentId -> markId
  
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [tone, setTone] = useState<Tone>("encouraging");
  const [previewFeedback, setPreviewFeedback] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatingAll, setGeneratingAll] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitial() {
      try {
        const clsRes = await apiPaginated<ClassData>("/api/classes");
        const cls = clsRes.data || [];
        setClasses(cls);
        if (cls.length > 0) setSelectedClassId(cls[0].id);

        const exRes = await apiData<any>("/api/exams");
        const exms = exRes || [];
        setExams(exms);
        if (exms.length > 0) setSelectedExamId(exms[0].id);
      } catch (err) { }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (!selectedClassId || !selectedExamId) return;
    async function fetchMarks() {
      setLoading(true);
      try {
        const res = await apiData<any>(`/api/marks?class_id=${selectedClassId}&exam_id=${selectedExamId}`);
        const sbj = res.subjects || [];
        setSubjects(sbj);
        if (sbj.length > 0 && !selectedSubjectId) setSelectedSubjectId(sbj[0].subject_id);
        
        const rows = res.rows || [];
        setGridRows(rows);
        setStudentsData(rows.map((r: any) => r.student));
        
        if (rows.length > 0 && !selectedStudent) {
          setSelectedStudent(rows[0].student.id);
        }
      } catch (err) {
        setGridRows([]);
        setStudentsData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMarks();
  }, [selectedClassId, selectedExamId]);

  useEffect(() => {
    if (!selectedSubjectId || gridRows.length === 0) return;
    const newScores: Record<string, string> = {};
    const newFeedbacks: Record<string, string> = {};
    const newMarkIds: Record<string, string> = {};
    
    gridRows.forEach(row => {
      const mark = row.marks[selectedSubjectId];
      if (mark) {
        newScores[row.student.id] = String(mark.score);
        newFeedbacks[row.student.id] = mark.remarks || "";
        if (mark.id) newMarkIds[row.student.id] = mark.id;
      }
    });
    setScores(newScores);
    setFeedbacks(newFeedbacks);
    setMarkIds(newMarkIds);
  }, [selectedSubjectId, gridRows]);

  const getScore = (id: string) => {
    const v = scores[id];
    if (!v) return NaN;
    const n = parseFloat(v);
    return isNaN(n) ? NaN : Math.min(100, Math.max(0, n));
  };

  const validScores = studentsData
    .map(s => getScore(s.id))
    .filter(n => !isNaN(n));

  const avg = validScores.length > 0
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
    : 0;

  const gradeList = studentsData.map(s => {
    const sc = getScore(s.id);
    return isNaN(sc) ? "–" : calcGrade(sc);
  }).filter(g => g !== "–");

  const handleGenerateSingle = (studentId: string) => {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) return;
    const sc = getScore(studentId);
    if (isNaN(sc)) return;
    setSelectedStudent(studentId);
    setGenerating(true);
    setTimeout(() => {
      const text = generateFeedback(student.name, sc, tone);
      setPreviewFeedback(text);
      setGenerating(false);
    }, 900);
  };

  const handleGenerateAll = () => {
    setGeneratingAll(true);
    setTimeout(() => {
      const newFeedbacks: Record<string, string> = { ...feedbacks };
      studentsData.forEach(s => {
        const sc = getScore(s.id);
        if (!isNaN(sc)) {
          newFeedbacks[s.id] = generateFeedback(s.name, sc, tone);
        }
      });
      setFeedbacks(newFeedbacks);
      setGeneratingAll(false);
      const selSc = getScore(selectedStudent);
      const selSt = studentsData.find(s => s.id === selectedStudent);
      if (selSt && !isNaN(selSc)) {
        setPreviewFeedback(generateFeedback(selSt.name, selSc, tone));
      }
    }, 1500);
  };

  const handleApprove = async () => {
    if (!selectedStudent || !selectedSubjectId) return;
    const scoreStr = scores[selectedStudent];
    const fbText = previewFeedback || feedbacks[selectedStudent];
    
    // Save locally
    setFeedbacks(prev => ({ ...prev, [selectedStudent]: fbText }));
    
    // Send to backend
    try {
      await apiData("/api/marks/bulk", {
        method: "POST",
        body: JSON.stringify({
          exam_id: selectedExamId,
          marks: [{
            student_id: selectedStudent,
            subject_id: selectedSubjectId,
            score: scoreStr,
            remarks: fbText
          }]
        })
      });
      setSavedFeedback(prev => ({ ...prev, [selectedStudent]: true }));
      setTimeout(() => setSavedFeedback(prev => ({ ...prev, [selectedStudent]: false })), 2000);
      
      // refresh marks to get mark id if it was newly created
      const res = await apiData<any>(`/api/marks?class_id=${selectedClassId}&exam_id=${selectedExamId}`);
      if (res.rows) setGridRows(res.rows);
    } catch(err) {
      alert("Failed to save mark.");
    }
  };

  const handleDeleteMark = async (studentId: string) => {
    const mId = markIds[studentId];
    if (mId) {
       try {
         await apiData(`/api/marks/${mId}`, { method: "DELETE" });
       } catch (err) {
         alert("Failed to delete mark");
         return;
       }
    }
    setScores(prev => { const n = {...prev}; delete n[studentId]; return n; });
    setFeedbacks(prev => { const n = {...prev}; delete n[studentId]; return n; });
    setMarkIds(prev => { const n = {...prev}; delete n[studentId]; return n; });
  };

  const handleRegenerate = () => {
    const student = studentsData.find(s => s.id === selectedStudent);
    if (!student) return;
    const sc = getScore(selectedStudent);
    if (isNaN(sc)) return;
    setGenerating(true);
    setTimeout(() => {
      const text = generateFeedback(student.name, sc, tone);
      setPreviewFeedback(text);
      setGenerating(false);
    }, 700);
  };

  const selectedStudentData = studentsData.find(s => s.id === selectedStudent);
  const selectedScore = getScore(selectedStudent);

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Sidebar />

      {/* ── BIG PENCIL DECOR ── */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-0 pointer-events-none">
        <BigPencilDoodle height={300} />
      </div>

      {/* ── SMALL STARBURST ACCENT ── */}
      <div className="fixed top-24 right-48 z-0 pointer-events-none opacity-20">
        <StarSmallDoodle size={28} color="#F5A623"/>
      </div>
      <div className="fixed bottom-40 right-72 z-0 pointer-events-none opacity-15">
        <StarSmallDoodle size={20} color="#4A90D9"/>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 ml-[240px] px-10 py-10 relative z-10 max-w-none">

        {/* ════════════════════════════════
            PAGE HEADER
        ════════════════════════════════ */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BarChartDoodle size={40} color="#4A90D9" />
              <h1 className="text-4xl font-extrabold text-[#2C2A24]" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Grades &amp; Feedback
              </h1>
            </div>
            <SquiggleUnderline width={220} color="#4A90D9" />
            <p className="text-[#7A7670] font-body mt-2 text-sm">
              Enter grades, auto-generate personalized feedback
            </p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Subject selector */}
            <div className="relative flex flex-col gap-0.5">
              <span style={{ fontFamily: '"Caveat", cursive', fontSize: "13px", color: "#7A7670", fontWeight: 700, paddingLeft: "4px" }}>Subject</span>
              <div className="flex items-center gap-2 border-2 border-[#2C2A24] rounded-[10px] px-4 py-2 bg-white shadow-[2px_2px_0px_#2C2A24] cursor-pointer hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                <select 
                   value={selectedSubjectId} 
                   onChange={e => setSelectedSubjectId(e.target.value)} 
                   className="font-heading font-bold text-[#2C2A24] text-sm bg-transparent outline-none cursor-pointer appearance-none" style={{ fontFamily: '"Nunito", sans-serif' }}
                >
                  {subjects.length > 0 ? subjects.map(s => (
                    <option key={s.subject_id} value={s.subject_id}>{s.name}</option>
                  )) : (
                    <option value="">No Subjects</option>
                  )}
                </select>
                <DownChevron size={16} />
              </div>
            </div>

            {/* Upload CSV */}
            <div className="flex flex-col gap-0.5">
              <span style={{ fontFamily: '"Caveat", cursive', fontSize: "13px", color: "#7A7670", fontWeight: 700, paddingLeft: "4px" }}>&nbsp;</span>
              <button className="flex items-center gap-2 border-2 border-[#2C2A24] bg-white rounded-[10px] px-5 py-2.5 font-heading font-bold text-sm shadow-[3px_3px_0px_#2C2A24] hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] transition-all" style={{ fontFamily: '"Nunito", sans-serif' }}>
                <UpArrowDoodle size={15} />
                Upload CSV
              </button>
            </div>

            {/* Generate All Feedback — special amber button with starburst & sparkles */}
            <div className="flex flex-col gap-0.5">
              <span style={{ fontFamily: '"Caveat", cursive', fontSize: "13px", color: "#7A7670", fontWeight: 700, paddingLeft: "4px" }}>&nbsp;</span>
              <button
                onClick={handleGenerateAll}
                disabled={generatingAll}
                className="relative flex items-center gap-2 bg-[#F5A623] border-2 border-[#2C2A24] rounded-[12px] px-6 py-2.5 font-heading font-extrabold text-sm shadow-[4px_4px_0px_#2C2A24] hover:shadow-[2px_2px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all overflow-visible disabled:opacity-70"
                style={{ fontFamily: '"Nunito", sans-serif' }}
              >
                {/* Starburst behind */}
                <div className="absolute -inset-4 flex items-center justify-center pointer-events-none" style={{ zIndex: -1 }}>
                  <StarburstBg size={110} color="#F5A623" />
                </div>
                <SparkleStar size={15} color="#2C2A24" />
                <span>{generatingAll ? "Generating..." : "Generate All Feedback"}</span>
                <SparkleStar size={15} color="#2C2A24" />
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            FILTERS BAR
        ════════════════════════════════ */}
        <div className="flex items-end gap-4 mb-8 flex-wrap">
            <div className="flex flex-col gap-1">
              <span style={{ fontFamily: '"Caveat", cursive', fontSize: "14px", color: "#7A7670", fontWeight: 700 }}>Class</span>
              <div className="relative flex items-center gap-2 border-2 border-[#2C2A24] rounded-[8px] px-4 py-2 bg-white cursor-pointer hover:bg-[#FDFBF5] transition-colors min-w-[130px]"
                style={{ boxShadow: "2px 2px 0px #2C2A24", fontFamily: '"DM Sans", sans-serif' }}>
                 <select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} className="w-full bg-transparent outline-none font-medium appearance-none">
                   {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
                 </select>
                 <DownChevron size={14} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span style={{ fontFamily: '"Caveat", cursive', fontSize: "14px", color: "#7A7670", fontWeight: 700 }}>Exam</span>
              <div className="relative flex items-center gap-2 border-2 border-[#2C2A24] rounded-[8px] px-4 py-2 bg-white cursor-pointer hover:bg-[#FDFBF5] transition-colors min-w-[130px]"
                style={{ boxShadow: "2px 2px 0px #2C2A24", fontFamily: '"DM Sans", sans-serif' }}>
                 <select value={selectedExamId} onChange={e => setSelectedExamId(e.target.value)} className="w-full bg-transparent outline-none font-medium appearance-none">
                   {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                 </select>
                 <DownChevron size={14} />
              </div>
            </div>
        </div>

        {/* ════════════════════════════════
            TWO-PANEL LAYOUT
        ════════════════════════════════ */}
        <div className="flex gap-6 mb-8 items-start">

          {/* ── LEFT PANEL: Grade Entry Table ── */}
          <div className="flex-[3] min-w-0">
            <div className="bg-white border-2 border-[#2C2A24] rounded-[16px] shadow-[4px_4px_0px_#2C2A24] overflow-hidden">

              {/* Panel header */}
              <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#E8E4D9] bg-[#FDFBF5]">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-[#2C2A24] text-lg" style={{ fontFamily: '"Nunito", sans-serif' }}>
                    {classes.find(c => c.id === selectedClassId)?.name} · {exams.find(e => e.id === selectedExamId)?.name}
                  </span>
                  <PaperFoldDoodle size={22} />
                </div>
                <span style={{ fontFamily: '"Caveat", cursive', fontSize: "14px", color: "#7A7670", fontWeight: 600 }}>
                  {validScores.length}/{studentsData.length} graded
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-[#E8E4D9] bg-[#FDFBF5]">
                      {["#", "Student Name", "Score (/100)", "Grade", "AI Feedback", "Actions"].map(col => (
                        <th key={col} className="text-left px-4 py-3 text-xs uppercase tracking-wide text-[#7A7670] font-bold"
                          style={{ fontFamily: '"Nunito", sans-serif' }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                    ) : studentsData.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-8">No students found.</td></tr>
                    ) : studentsData.map((student, idx) => {
                      const scoreVal = getScore(student.id);
                      const grade = isNaN(scoreVal) ? null : calcGrade(scoreVal);
                      const gs = grade ? gradeStyle[grade] : null;
                      const fb = feedbacks[student.id];
                      const isSelected = selectedStudent === student.id;

                      return (
                        <tr
                          key={student.id}
                          onClick={() => {
                            setSelectedStudent(student.id);
                            if (fb) setPreviewFeedback(fb);
                          }}
                          className="border-b border-[#E8E4D9] cursor-pointer transition-all duration-150"
                          style={{
                            backgroundColor: isSelected
                              ? "#EEF5FF"
                              : idx % 2 === 0 ? "#FFFFFF" : "#FDFBF5",
                            backgroundImage: idx % 2 !== 0
                              ? "repeating-linear-gradient(0deg, transparent, transparent 22px, #E8E4D950 23px)"
                              : "none",
                          }}
                        >
                          {/* Row # */}
                          <td className="px-4 py-3">
                            <span style={{ fontFamily: '"Caveat", cursive', fontSize: "16px", color: "#7A7670", fontWeight: 700 }}>
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                          </td>

                          {/* Student name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-xs border-2 border-[#2C2A24] shrink-0"
                                style={{ backgroundColor: avatarColor(student.id), fontFamily: '"Nunito", sans-serif' }}>
                                {initials(student.name)}
                              </div>
                              <span className="font-body font-semibold text-[#2C2A24] text-sm">{student.name}</span>
                              {/* Star doodle for A grade */}
                              {grade === "A" && (
                                <StarSmallDoodle size={14} color="#F5A623" />
                              )}
                            </div>
                          </td>

                          {/* Score — hand-drawn underline input */}
                          <td className="px-4 py-3">
                            <div className="flex flex-col items-start">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={scores[student.id] ?? ""}
                                onChange={e => setScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                                onClick={e => e.stopPropagation()}
                                placeholder="—"
                                className="w-16 bg-transparent outline-none text-[#2C2A24] font-heading font-bold text-base text-center pb-1"
                                style={{
                                  fontFamily: '"Nunito", sans-serif',
                                  borderBottom: "2px solid #4A90D9",
                                  appearance: "none",
                                }}
                              />
                            </div>
                          </td>

                          {/* Grade pill */}
                          <td className="px-4 py-3">
                            {gs ? (
                              <span className="px-3 py-1 rounded-full text-xs font-heading font-extrabold border-2"
                                style={{ backgroundColor: gs.bg, color: gs.text, borderColor: gs.border, fontFamily: '"Nunito", sans-serif' }}>
                                {grade}
                              </span>
                            ) : (
                              <span className="text-[#E8E4D9] font-accent text-sm" style={{ fontFamily: '"Caveat", cursive' }}>—</span>
                            )}
                          </td>

                          {/* AI Feedback column */}
                          <td className="px-4 py-3 max-w-[200px]">
                            {fb ? (
                              <div className="flex items-start gap-1.5">
                                {/* Speech bubble preview */}
                                <div className="bg-[#FEF3DC] border border-[#F5A623] rounded-[8px] px-2.5 py-1.5 text-xs text-[#2C2A24] font-body leading-snug"
                                  style={{ maxWidth: "160px" }}>
                                  {fb.slice(0, 42)}…
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={e => { e.stopPropagation(); handleGenerateSingle(student.id); }}
                                disabled={isNaN(scoreVal)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border-2 border-[#F5A623] bg-[#FEF3DC] text-[#C47D0E] text-xs font-heading font-bold hover:bg-[#F5A623] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ fontFamily: '"Nunito", sans-serif' }}>
                                <LightbulbDoodle size={13} color="currentColor" />
                                Generate
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={e => { e.stopPropagation(); handleGenerateSingle(student.id); }}
                                className="p-1.5 rounded-[6px] hover:bg-[#D6EAF8] transition-colors"
                                title="Edit / Regenerate">
                                <PencilIconDoodle size={14} color="#4A90D9" />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleDeleteMark(student.id);
                                }}
                                className="p-1.5 rounded-[6px] hover:bg-[#FDEDEC] transition-colors"
                                title="Clear row">
                                <TrashDoodle size={14} color="#E8534A" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer: average + distribution */}
              <div className="flex items-center justify-between px-6 py-4 border-t-2 border-[#E8E4D9] bg-[#FDFBF5]">
                <div className="flex items-center gap-3">
                  <span className="text-[#7A7670] text-sm font-body">Class Average</span>
                  <span className="text-3xl font-extrabold text-[#2C2A24]" style={{ fontFamily: '"Nunito", sans-serif' }}>
                    {validScores.length > 0 ? avg : "—"}<span className="text-base font-bold text-[#7A7670]">/100</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold border-2"
                    style={validScores.length > 0 ? gradeStyle[calcGrade(avg)] : { backgroundColor: "#f5f5f5", color: "#999", borderColor: "#ddd", fontFamily: '"Nunito", sans-serif' }}>
                    {validScores.length > 0 ? calcGrade(avg) : "—"}
                  </span>
                </div>
                <MiniDistBar grades={gradeList} />
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL: AI Feedback Preview ── */}
          <div className="flex-[2] min-w-0">
            <div className="bg-white border-2 border-[#2C2A24] rounded-[16px] shadow-[4px_4px_0px_#2C2A24] overflow-hidden sticky top-6">

              {/* Panel header — amber bg */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-[#F5A623] border-b-2 border-[#2C2A24] relative overflow-hidden">
                <div className="flex items-center gap-2 z-10 relative">
                  <LightbulbDoodle size={20} color="#2C2A24" />
                  <span className="font-heading font-extrabold text-[#2C2A24] text-base" style={{ fontFamily: '"Nunito", sans-serif' }}>
                    AI Feedback Generator
                  </span>
                </div>
                {/* Floating speech bubble near header */}
                <div className="absolute right-3 top-0 opacity-25 pointer-events-none">
                  <SpeechBubbleDoodle size={48} color="#2C2A24" />
                </div>
              </div>

              {/* Currently selected student */}
              <div className="px-5 pt-4 pb-3 border-b border-[#E8E4D9]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-heading font-extrabold text-sm border-2 border-[#2C2A24]"
                    style={{ backgroundColor: selectedStudentData ? avatarColor(selectedStudent) : "#eee", fontFamily: '"Nunito", sans-serif' }}>
                    {selectedStudentData ? initials(selectedStudentData.name) : ""}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-[#2C2A24] text-sm" style={{ fontFamily: '"Nunito", sans-serif' }}>
                      {selectedStudentData?.name || "Select a student"}
                    </p>
                    <p style={{ fontFamily: '"Caveat", cursive', fontSize: "14px", color: "#7A7670", fontWeight: 600 }}>
                      Score: {isNaN(selectedScore) ? "—" : `${selectedScore}/100`}
                      {!isNaN(selectedScore) && (
                        <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold"
                          style={{ ...gradeStyle[calcGrade(selectedScore)], fontFamily: '"Nunito", sans-serif', fontSize: "11px" }}>
                          {calcGrade(selectedScore)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback textarea */}
              <div className="px-5 pt-4 pb-2">
                <textarea
                  value={generating ? "✨ Generating personalized feedback..." : previewFeedback}
                  onChange={e => setPreviewFeedback(e.target.value)}
                  readOnly={generating}
                  placeholder="Click 'Generate' on any student row, or type feedback manually here…"
                  rows={7}
                  className="w-full border-2 border-[#E8E4D9] rounded-[10px] px-3.5 py-3 text-sm text-[#2C2A24] font-body leading-relaxed resize-none outline-none focus:border-[#4A90D9] transition-colors bg-[#FDFBF5]"
                  style={{ fontFamily: '"DM Sans", sans-serif' }}
                />
              </div>

              {/* Tone pills */}
              <div className="px-5 pb-3">
                <p style={{ fontFamily: '"Caveat", cursive', fontSize: "13px", color: "#7A7670", fontWeight: 700, marginBottom: "6px" }}>Tone</p>
                <div className="flex items-center gap-2">
                  {(["encouraging", "constructive", "formal"] as Tone[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className="px-3 py-1.5 rounded-full text-xs font-heading font-bold border-2 capitalize transition-all"
                      style={{
                        fontFamily: '"Nunito", sans-serif',
                        backgroundColor: tone === t ? "#4A90D9" : "#D6EAF8",
                        borderColor: "#4A90D9",
                        color: tone === t ? "#fff" : "#2471A3",
                        boxShadow: tone === t ? "2px 2px 0px #2C2A24" : "none",
                        transform: tone === t ? "scale(1.05)" : "scale(1)",
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 px-5 pb-5 pt-2">
                <button
                  onClick={handleRegenerate}
                  disabled={generating || isNaN(selectedScore)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] border-2 border-[#4A90D9] text-[#4A90D9] bg-[#D6EAF8] text-sm font-heading font-bold hover:bg-[#4A90D9] hover:text-white transition-all disabled:opacity-40 shadow-[2px_2px_0px_#2C2A24]"
                  style={{ fontFamily: '"Nunito", sans-serif' }}>
                  <RefreshDoodle size={14} color="currentColor" />
                  Regenerate
                </button>
                <button
                  onClick={handleApprove}
                  disabled={!previewFeedback || generating}
                  className="flex items-center gap-1.5 flex-1 justify-center px-4 py-2 rounded-[10px] border-2 border-[#5BAD6F] bg-[#5BAD6F] text-white text-sm font-heading font-bold hover:bg-[#3A8D53] transition-all disabled:opacity-40 shadow-[2px_2px_0px_#2C2A24]"
                  style={{ fontFamily: '"Nunito", sans-serif' }}>
                  {savedFeedback[selectedStudent] ? (
                    <>✓ Saved!</>
                  ) : (
                    <>
                      <CheckDoodle size={14} color="white" />
                      Approve &amp; Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════
            RUBRIC BUILDER
        ════════════════════════════════ */}
        <div className="bg-white border-2 border-[#2C2A24] rounded-[16px] shadow-[4px_4px_0px_#2C2A24] px-6 py-5 mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="font-heading font-extrabold text-[#2C2A24] text-xl" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Rubric Builder
              </span>
              <SquiggleUnderline width={100} color="#F5A623" />
            </div>
            <button className="flex items-center gap-2 border-2 border-[#2C2A24] bg-[#FEF3DC] rounded-[10px] px-5 py-2.5 font-heading font-bold text-sm shadow-[3px_3px_0px_#2C2A24] hover:shadow-[1px_1px_0px_#2C2A24] hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-[#2C2A24]"
              style={{ fontFamily: '"Nunito", sans-serif' }}>
              <PlusDoodle size={16} color="#2C2A24" />
              Create Rubric
            </button>
          </div>

          {/* Rubric cards */}
          <div className="flex gap-4 flex-wrap">
            {RUBRICS.map(rubric => (
              <div key={rubric.id}
                className="relative bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-[14px] px-5 py-4 w-56 shadow-[3px_3px_0px_#E8E4D9] hover:shadow-[3px_3px_0px_#2C2A24] hover:border-[#2C2A24] transition-all group">
                {/* Paper-fold corner */}
                <div className="absolute top-2 right-2 opacity-60 group-hover:opacity-100 transition-opacity">
                  <PaperFoldDoodle size={20} />
                </div>
                <h3 className="font-heading font-extrabold text-[#2C2A24] text-base mb-1 pr-6" style={{ fontFamily: '"Nunito", sans-serif' }}>
                  {rubric.name}
                </h3>
                <p style={{ fontFamily: '"Caveat", cursive', fontSize: "14px", color: "#7A7670", fontWeight: 600 }}>
                  {rubric.subject}
                </p>
                <p className="font-body text-xs text-[#7A7670] mt-1 mb-4">
                  {rubric.criteria} criteria
                </p>
                <button className="w-full py-1.5 border-2 border-[#4A90D9] text-[#4A90D9] rounded-[8px] text-xs font-heading font-bold bg-[#D6EAF8] hover:bg-[#4A90D9] hover:text-white transition-colors"
                  style={{ fontFamily: '"Nunito", sans-serif' }}>
                  Use
                </button>
              </div>
            ))}

            {/* Add new placeholder card */}
            <div className="flex items-center justify-center border-2 border-dashed border-[#E8E4D9] rounded-[14px] px-5 py-4 w-56 hover:border-[#4A90D9] hover:bg-[#F0F7FF] transition-all cursor-pointer group">
              <div className="flex flex-col items-center gap-2 text-[#C0BFBA] group-hover:text-[#4A90D9] transition-colors">
                <PlusDoodle size={20} color="currentColor" />
                <span style={{ fontFamily: '"Caveat", cursive', fontSize: "15px", fontWeight: 700 }}>New Rubric</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
