"use client";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/Sidebar";
import { apiData, apiFetch } from "../../../lib/api";
import { io, Socket } from "socket.io-client";

interface ClassInfo { id: string; name: string; section: string; }
interface SubjectInfo { id: string; name: string; }

interface QuestionForm {
  questionText: string;
  options: string[];
  correctIndex: number;
  timeLimit: number;
  points: number;
}

export default function TeacherDuelPage() {
  const [mode, setMode] = useState<"SETUP" | "LOBBY" | "LIVE" | "RESULTS">("SETUP");
  
  // Setup state
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("Pop Quiz Duel!");
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { questionText: "", options: ["", "", "", ""], correctIndex: 0, timeLimit: 30, points: 10 }
  ]);
  const [creating, setCreating] = useState(false);

  // Active game state
  const [duel, setDuel] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [studentsJoined, setStudentsJoined] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(-1);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [answersCount, setAnswersCount] = useState(0);
  const [heatmap, setHeatmap] = useState<number[]>([0,0,0,0]);
  const [questionEnded, setQuestionEnded] = useState(false);

  // Results state
  const [results, setResults] = useState<any>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Initial load
  useEffect(() => {
    async function load() {
      try {
        const dash = await apiData<{ my_classes?: ClassInfo[] }>("/api/analytics/teacher");
        const myClasses = dash?.my_classes ?? [];
        setClasses(myClasses);
        if (myClasses.length) setClassId(myClasses[0].id);

        const sub = await apiData<{ data: SubjectInfo[] } | SubjectInfo[]>("/api/subjects");
        const subArr = Array.isArray(sub) ? sub : (sub as any)?.data ?? [];
        setSubjects(subArr);
      } catch(e) { console.error("Failed to load classes/subjects", e); }
    }
    load();
  }, []);

  // Socket setup
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("duel:student-joined", ({ totalJoined }) => {
      setStudentsJoined(totalJoined);
    });

    newSocket.on("duel:answer-received", ({ totalAnswered, answerIndex }) => {
      setAnswersCount(totalAnswered);
      if (mode === "LIVE" && !questionEnded) {
        setHeatmap(prev => {
          const map = [...prev];
          if(answerIndex >= 0 && answerIndex < 4) map[answerIndex]++;
          return map;
        });
      }
    });

    newSocket.on("duel:question-result", ({ correctIndex, answerDistribution }) => {
      setHeatmap(answerDistribution);
      setQuestionEnded(true);
    });

    newSocket.on("duel:ended", () => {
      setMode("RESULTS");
    });

    return () => { newSocket.disconnect(); };
  }, []);

  const handleCreate = async () => {
    if (!classId || !title || !questions.length) return alert("Fill required fields");
    setCreating(true);
    try {
      const data: any = await apiData("/api/duels", {
        method: "POST",
        body: JSON.stringify({ classId, subjectId, title, questions })
      });
      setDuel(data.duel);
      setMode("LOBBY");
      socket?.emit("duel:teacher-join", { duelId: data.duel.id });
    } catch(e) { alert("Error creating duel"); }
    finally { setCreating(false); }
  };

  const handleStart = () => {
    socket?.emit("duel:start", { duelId: duel.id });
    setMode("LIVE");
    handleNextQuestion();
  };

  const handleNextQuestion = () => {
    setQuestionEnded(false);
    setAnswersCount(0);
    setHeatmap([0,0,0,0]);
    socket?.emit("duel:next-question", { duelId: duel.id });
    setCurrentQIndex(c => c + 1);
  };

  const handleEnd = () => {
    socket?.emit("duel:end", { duelId: duel.id });
  };

  useEffect(() => {
    if (mode === "RESULTS" && duel) {
      apiData(`/api/duels/${duel.id}/results`).then((res: any) => setResults(res));
    }
  }, [mode, duel]);

  const updateQuestion = (i: number, key: string, val: any) => {
    const qTemp = [...questions];
    (qTemp[i] as any)[key] = val;
    setQuestions(qTemp);
  };

  const updateOption = (qi: number, oi: number, val: string) => {
    const qTemp = [...questions];
    qTemp[qi].options[oi] = val;
    setQuestions(qTemp);
  };

  const getAiSuggestion = async () => {
    if (!results || !results.confusionHeatmap) return;
    const confusedQ = results.confusionHeatmap.sort((a: any,b: any) => parseFloat(a.correctRate) - parseFloat(b.correctRate))[0];
    if (!confusedQ) return;
    
    setLoadingAi(true);
    try {
      const qText = confusedQ.questionText;
      const res = await apiData<any>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ role: "user", content: `My students struggled with this quiz question: "${qText}". Give me a 2-sentence creative tip on how to teach this concept effectively.` }]
        })
      });
      setAiSuggestion(res.reply || res.message || "Could not generate suggestion.");
    } catch(e) {
      setAiSuggestion("Error connecting to AI.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#FDFBF5", fontFamily: '"DM Sans", sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 240, padding: 32 }}>

        {mode === "SETUP" && (
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <h1 style={{ fontFamily: '"Nunito", sans-serif', fontSize: 32, fontWeight: 900, color: "#2C2A24", marginBottom: 24 }}>
              ⚔️ Prepare Knowledge Duel
            </h1>
            
            <div style={{ backgroundColor: "white", padding: 24, borderRadius: 16, border: "2px solid #E8E4D9", boxShadow: "4px 4px 0px #1C2B27", marginBottom: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Review Title</label>
                  <input style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #E8E4D9" }} value={title} onChange={(e)=>setTitle(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Class</label>
                  <select style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #E8E4D9" }} value={classId} onChange={(e)=>setClassId(e.target.value)}>
                    <option value="">Select...</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}-{c.section}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {questions.map((q, qIndex) => (
              <div key={qIndex} style={{ backgroundColor: "white", padding: 24, borderRadius: 16, border: "2px solid #E8E4D9", boxShadow: "4px 4px 0px #E8E4D9", marginBottom: 24 }}>
                <h3 style={{ marginTop: 0, fontFamily: '"Nunito", sans-serif', fontWeight: 800 }}>Question {qIndex + 1}</h3>
                <textarea 
                  style={{ width: "100%", padding: 12, borderRadius: 8, border: "2px solid #E8E4D9", minHeight: 80, marginBottom: 16, fontFamily: '"Nunito", sans-serif', fontSize: 16 }} 
                  placeholder="Ask your question here..."
                  value={q.questionText} onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)} 
                />
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {q.options.map((opt, oIndex) => {
                    const isCorrect = q.correctIndex === oIndex;
                    return (
                      <div key={oIndex} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button 
                          onClick={() => updateQuestion(qIndex, 'correctIndex', oIndex)}
                          style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #1C2B27", backgroundColor: isCorrect ? "#3ECFB2" : "#FFF", color: isCorrect ? "white" : "transparent", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}
                        >✓</button>
                        <input 
                          placeholder={`Option ${["A","B","C","D"][oIndex]}`}
                          style={{ flex: 1, padding: 12, borderRadius: 8, border: "2px solid #E8E4D9", backgroundColor: isCorrect ? "#E8FBF8" : "#fff" }}
                          value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctIndex: 0, timeLimit: 30, points: 10 }])} style={{ padding: "12px 24px", borderRadius: 12, border: "2px solid #E8E4D9", background: "white", fontWeight: "bold" }}>+ Add Question</button>
              <button onClick={handleCreate} disabled={creating} style={{ padding: "12px 32px", borderRadius: 12, border: "2px solid #1C2B27", background: "#FF6B6B", color: "white", fontWeight: 900, boxShadow: "4px 4px 0px #1C2B27" }}>{creating ? "Saving..." : "Launch Duel"}</button>
            </div>
          </div>
        )}

        {mode === "LOBBY" && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <h1 style={{ fontFamily: '"Nunito", sans-serif', fontSize: 40, fontWeight: 900, color: "#FF6B6B", marginBottom: 16 }}>
              Ready for Battle?
            </h1>
            <p style={{ fontSize: 20, color: "#7A7670", marginBottom: 40 }}>Instruct students to open their apps and tap 'Join Duel'</p>
            
            <div style={{ fontSize: 48, fontWeight: 900, color: "#2C2A24", marginBottom: 40 }}>
              {studentsJoined} <span style={{ fontSize: 24, fontWeight: "normal", color: "#7A7670" }}>Students Joined</span>
            </div>

            <button onClick={handleStart} style={{ padding: "16px 48px", borderRadius: 12, border: "2px solid #1C2B27", background: "#3ECFB2", color: "#1C2B27", fontWeight: 900, fontSize: 24, boxShadow: "4px 4px 0px #1C2B27" }}>
              Start Duel
            </button>
          </div>
        )}

        {mode === "LIVE" && (
          <div style={{ display: "flex", gap: 32, height: "calc(100vh - 64px)" }}>
            <div style={{ flex: 1, backgroundColor: "white", padding: 32, borderRadius: 16, border: "2px solid #E8E4D9", boxShadow: "4px 4px 0px #1C2B27" }}>
              <h2 style={{ fontFamily: '"Caveat", cursive', fontSize: 24, color: "#7A7670", margin: "0 0 16px" }}>
                Question {currentQIndex + 1} of {duel.questions.length}
              </h2>
              <h1 style={{ fontFamily: '"Nunito", sans-serif', fontSize: 32, fontWeight: 900, color: "#2C2A24", marginBottom: 32 }}>
                {duel.questions[currentQIndex]?.questionText}
              </h1>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 48 }}>
                {duel.questions[currentQIndex]?.options.map((opt: string, i: number) => {
                  const isCorrect = i === duel.questions[currentQIndex].correctIndex;
                  return (
                    <div key={i} style={{ padding: 24, borderRadius: 12, border: isCorrect ? "3px solid #3ECFB2" : "2px solid #E8E4D9", background: isCorrect ? "#E8FBF8" : "#FDFBF5", fontWeight: "bold", fontSize: 18, color: "#2C2A24" }}>
                      <span style={{ marginRight: 16, opacity: 0.5 }}>{["A","B","C","D"][i]}</span>
                      {opt}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#7A7670" }}>
                  {answersCount} / {studentsJoined} Answered
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 16 }}>
                  {currentQIndex < duel.questions.length - 1 ? (
                    <button onClick={handleNextQuestion} disabled={!questionEnded} style={{ padding: "12px 32px", borderRadius: 12, border: "2px solid #1C2B27", background: questionEnded ? "#3ECFB2" : "#E8E4D9", fontWeight: 900, boxShadow: questionEnded ? "4px 4px 0px #1C2B27" : "none" }}>
                      Next Question
                    </button>
                  ) : (
                    <button onClick={handleEnd} disabled={!questionEnded} style={{ padding: "12px 32px", borderRadius: 12, border: "2px solid #1C2B27", background: questionEnded ? "#FF6B6B" : "#E8E4D9", color: questionEnded ? "white" : "#7A7670", fontWeight: 900, boxShadow: questionEnded ? "4px 4px 0px #1C2B27" : "none" }}>
                      End Duel
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Confusion Heatmap Panel */}
            <div style={{ width: 400, backgroundColor: "#FFFBF0", padding: 32, borderRadius: 16, border: "2px solid #D4A853", display: "flex", flexDirection: "column" }}>
              <h2 style={{ fontFamily: '"Nunito", sans-serif', fontSize: 24, fontWeight: 900, color: "#8B6914", marginBottom: 8 }}>
                Live Confusion Heatmap
              </h2>
              <p style={{ color: "#8B6914", opacity: 0.7, marginBottom: 32 }}>As students answer, bars grow in real-time.</p>

              <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 16, paddingBottom: 24, borderBottom: "2px dashed #D4A853" }}>
                {heatmap.map((count, i) => {
                  const maxCount = Math.max(...heatmap, 1);
                  const hPct = (count / maxCount) * 100;
                  const isCorrect = i === duel.questions[currentQIndex]?.correctIndex;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: "bold", fontSize: 14, color: "#8B6914" }}>{count}</span>
                      <div style={{ width: "100%", height: 200, backgroundColor: "rgba(212, 168, 83, 0.2)", borderRadius: 8, display: "flex", alignItems: "flex-end" }}>
                        <div style={{ width: "100%", height: `${hPct}%`, backgroundColor: isCorrect ? "#3ECFB2" : "#FF6B6B", borderRadius: 8, transition: "height 0.3s ease" }} />
                      </div>
                      <span style={{ fontWeight: "bold" }}>{["A","B","C","D"][i]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {mode === "RESULTS" && results && (
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <h1 style={{ fontFamily: '"Nunito", sans-serif', fontSize: 40, fontWeight: 900, color: "#2C2A24", marginBottom: 32, textAlign: "center" }}>
              🏆 Duel Results
            </h1>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 40 }}>
              <div style={{ backgroundColor: "white", padding: 24, borderRadius: 16, border: "2px solid #E8E4D9", boxShadow: "4px 4px 0px #1C2B27" }}>
                <h3 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Leaderboard</h3>
                {results.leaderboard.map((lb: any, i: number) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #E8E4D9" }}>
                    <div>
                      <span style={{ fontWeight: "bold", marginRight: 12, color: "#F5A623" }}>#{lb.rank}</span>
                      <span style={{ fontWeight: "bold" }}>{lb.name}</span>
                    </div>
                    <span style={{ fontWeight: "bold", color: "#3ECFB2" }}>{lb.totalScore} pts</span>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: "#E8FBF8", padding: 24, borderRadius: 16, border: "2px solid #3ECFB2" }}>
                <h3 style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 16, color: "#1C5C4F" }}>💡 AI Teaching Suggestion</h3>
                <p style={{ lineHeight: 1.6, color: "#2C2A24", marginBottom: 16 }}>
                  {aiSuggestion ? aiSuggestion : `Students struggled mostly with question: ${(results.confusionHeatmap.sort((a: any,b: any) => parseFloat(a.correctRate) - parseFloat(b.correctRate))[0] || {}).questionText}. Consider reviewing this specific concept next class!`}
                </p>
                {!aiSuggestion && (
                  <button onClick={getAiSuggestion} disabled={loadingAi} style={{ padding: "8px 16px", borderRadius: 8, border: "2px solid #1C5C4F", backgroundColor: "#3ECFB2", color: "#1C5C4F", fontWeight: "bold", cursor: "pointer" }}>
                    {loadingAi ? "Analyzing..." : "Generate AI Teaching Plan"}
                  </button>
                )}
              </div>
            </div>

            <h2 style={{ fontFamily: '"Nunito", sans-serif', fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Confusion Heatmap Breakdown</h2>
            {results.confusionHeatmap.map((ch: any, i: number) => (
              <div key={i} style={{ backgroundColor: "white", padding: 24, borderRadius: 16, border: "2px solid #E8E4D9", marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontWeight: 800 }}>Q{i+1}: {ch.questionText}</span>
                  <span style={{ fontWeight: "bold", color: parseFloat(ch.correctRate) < 50 ? "#FF6B6B" : "#3ECFB2" }}>{ch.correctRate}% Correct</span>
                </div>
                {/* Simplistic bar representation */}
                <div style={{ display: "flex", gap: 16 }}>
                  {ch.distribution.map((ct: number, oi: number) => {
                    const isCorrect = oi === ch.correctIndex;
                    return (
                      <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, backgroundColor: isCorrect?"#E8FBF8":"#FDFBF5", padding: "8px 12px", borderRadius: 8, border: "1px solid #E8E4D9" }}>
                        <span style={{ fontWeight: "bold" }}>{["A","B","C","D"][oi]}</span>
                        <div style={{ flex: 1, height: 8, backgroundColor: "#E8E4D9", borderRadius: 4 }}>
                          <div style={{ height: "100%", width: `${ch.totalAnswers ? (ct/ch.totalAnswers)*100 : 0}%`, backgroundColor: isCorrect ? "#3ECFB2" : "#FF6B6B", borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12 }}>{ct}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  );
}
