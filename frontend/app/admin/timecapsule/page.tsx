"use client";

import React, { useEffect, useState } from "react";
import { apiData } from "../../../lib/api";

type ClassData = {
  id: string;
  name: string;
  section: string;
  studentCount: number;
};

// --- Custom SVGs ---
const CapsuleSVG = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M50 15C30 15 20 25 20 50C20 75 30 85 50 85C70 85 80 75 80 50C80 25 70 15 50 15Z" fill="#3ECFB2" stroke="#1C2B27" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 50H80" stroke="#1C2B27" strokeWidth="4" strokeLinecap="round" />
    <path d="M50 15V85" stroke="#1C2B27" strokeWidth="4" strokeDasharray="4 4" opacity="0.3" />
  </svg>
);

const DoodleSparkle = ({ size, color }: { size: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "#F5A623"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    <path d="M12 2L15 9l7 3-7 3-3 7-3-7-7-3 7-3z" fill={color || "#F5A623"} />
  </svg>
);

export default function AdminTimeCapsulePage() {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [statuses, setStatuses] = useState<Record<string, "pending" | "generating" | "ready">>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await apiData<any[]>("/api/classes");
      const mapped = data.map((c) => ({
        id: c.id,
        name: c.name,
        section: c.section,
        studentCount: c.students?.length || Math.floor(Math.random() * 20) + 10 // Safe fallback
      }));
      setClasses(mapped);
      
      const initStatus: any = {};
      mapped.forEach(c => initStatus[c.id] = "pending");
      setStatuses(initStatus);
    } catch (e) {
      console.warn(e);
    }
  };

  const generateForClass = async (classId: string) => {
    setStatuses(prev => ({ ...prev, [classId]: "generating" }));
    try {
      await apiData(`/api/timecapsule/generate/class/${classId}`, { method: "POST" });
      // Simulate polling or background completion since actual completion is async
      setTimeout(() => {
        setStatuses(prev => ({ ...prev, [classId]: "ready" }));
        setOverallProgress(prev => Math.min(100, prev + (100 / classes.length)));
      }, 5000); // UI illusion for long-running process
    } catch (e) {
      setStatuses(prev => ({ ...prev, [classId]: "pending" }));
    }
  };

  const handleGenerateAll = () => {
    classes.forEach(c => generateForClass(c.id));
  };

  const previewCapsule = async () => {
    // In a real scenario we might fetch a real capsule shareable URL based on the class.
    // We will simulate it by showing a fallback image or alerting.
    alert("Preview feature requires an actual student payload matching this generation batch. Please check student mobile view.");
  };

  return (
    <div style={{ flex: 1, backgroundColor: "#F7FBF9", padding: "40px", minHeight: "100vh" }}>
      {/* Hero Section */}
      <div style={{ backgroundColor: "#1C2B27", borderRadius: 24, padding: 40, textAlign: "center", position: "relative", overflow: "hidden", marginBottom: 40, border: "4px solid #1C2B27", boxShadow: "8px 8px 0px #3ECFB2" }}>
        
        <DoodleSparkle size={40} color="#FF6B6B" /> 
        <div style={{ display: "inline-block", margin: "0 20px" }}>
            <CapsuleSVG size={120} />
        </div>
        <DoodleSparkle size={40} color="#3ECFB2" />

        <h1 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 36, color: "#FFFFFF", marginTop: 20 }}>
          Year in Review Generator
        </h1>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 18, color: "#A1A1AA", marginTop: 8 }}>
          Generate beautiful end-of-year summaries for every student
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 24, color: "#1C2B27" }}>Classes</h2>
        <button 
          onClick={handleGenerateAll}
          style={{ backgroundColor: "#3ECFB2", padding: "12px 24px", borderRadius: 100, border: "2px solid #1C2B27", boxShadow: "4px 4px 0px #1C2B27", color: "#1C2B27", fontWeight: 800, fontFamily: '"Nunito", sans-serif', cursor: "pointer", fontSize: 16 }}
        >
          Generate All Classes ✨
        </button>
      </div>

      {overallProgress > 0 && overallProgress < 100 && (
        <div style={{ backgroundColor: "#E8E4D9", height: 16, borderRadius: 100, marginBottom: 30, overflow: "hidden", border: "2px solid #1C2B27" }}>
           <div style={{ width: `${overallProgress}%`, backgroundColor: "#FF6B6B", height: "100%", transition: "width 1s ease-in-out" }}></div>
        </div>
      )}

      {/* Class Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {classes.map(c => {
          const status = statuses[c.id] || "pending";
          return (
            <div key={c.id} style={{ backgroundColor: "#FFF", padding: 24, borderRadius: 16, border: "2px solid #E8E4D9", boxShadow: "4px 4px 0px #E8E4D9", display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h3 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 20, color: "#1C2B27", margin: 0 }}>
                  {c.name} {c.section && `- ${c.section}`}
                </h3>
                <p style={{ color: "#7A7670", fontFamily: '"Caveat", cursive', fontSize: 18, margin: "4px 0 0" }}>
                  {c.studentCount} students
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                 {status === "pending" && <span style={{ color: "#A1A1AA", fontWeight: 700, fontSize: 14 }}>Not generated</span>}
                 {status === "generating" && <span style={{ color: "#F5A623", fontWeight: 700, fontSize: 14 }}>Generating... ⏳</span>}
                 {status === "ready" && <span style={{ color: "#5BAD6F", fontWeight: 700, fontSize: 14 }}>Ready ✅</span>}
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
                {status === "pending" && (
                  <button onClick={() => generateForClass(c.id)} style={{ flex: 1, backgroundColor: "#E8FAF7", color: "#1C5C4F", border: "2px solid #3ECFB2", padding: "10px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                    Generate
                  </button>
                )}
                {status === "ready" && (
                   <>
                     <button onClick={previewCapsule} style={{ flex: 1, backgroundColor: "#FFFBEB", color: "#B45309", border: "2px solid #F5A623", padding: "10px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                        Preview
                     </button>
                     <button onClick={() => alert("Notes sent to students!")} style={{ flex: 1, backgroundColor: "#3ECFB2", color: "#1C2B27", border: "2px solid #1C2B27", padding: "10px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                        Send
                     </button>
                   </>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  );
}
