"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Clock, AlertCircle, Send, Check } from "lucide-react";

interface SubmissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentTitle: string;
}

const MOCK_SUBMISSIONS = [
  { id: 1, name: "Aarav Patel", status: "Submitted", date: "2024-04-02 10:30 AM", marks: 85, feedback: "Great work on the problem set!" },
  { id: 2, name: "Isha Sharma", status: "Late", date: "2024-04-03 09:15 AM", marks: 70, feedback: "Late submission, but good accuracy." },
  { id: 3, name: "Rohan Gupta", status: "Pending", date: "-", marks: null, feedback: "" },
  { id: 4, name: "Meera Singh", status: "Submitted", date: "2024-04-02 04:45 PM", marks: 92, feedback: "Perfect execution." },
  { id: 5, name: "Karan Desai", status: "Submitted", date: "2024-04-01 11:20 AM", marks: null, feedback: "" },
  { id: 6, name: "Ananya Reddy", status: "Pending", date: "-", marks: null, feedback: "" },
  { id: 7, name: "Vikram Malhotra", status: "Late", date: "2024-04-03 02:30 PM", marks: null, feedback: "" },
  { id: 8, name: "Neha Verma", status: "Submitted", date: "2024-04-02 01:10 PM", marks: 88, feedback: "" },
];

export default function SubmissionsDrawer({ isOpen, onClose, assignmentTitle }: SubmissionsDrawerProps) {
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [gradeValue, setGradeValue] = useState("");
  const [feedbackValue, setFeedbackValue] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-[#FDFBF5] h-full shadow-[-10px_0px_30px_rgba(0,0,0,0.1)] border-l-4 border-[#2C2A24] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b-4 border-[#E8E4D9] bg-white">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-black text-[#2C2A24] leading-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Submissions: <br />
              <span className="text-[#F5A623]">{assignmentTitle}</span>
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#FDFBF5] rounded-xl border-2 border-transparent hover:border-[#E8E4D9] transition-all"
            >
              <X size={24} strokeWidth={3} className="text-[#2C2A24]" />
            </button>
          </div>
          <div className="flex gap-4 text-sm font-bold">
            <div className="flex items-center gap-1.5 text-[#5BAD6F]">
              <CheckCircle2 size={16} /> 18 Submitted
            </div>
            <div className="flex items-center gap-1.5 text-[#E8534A]">
              <AlertCircle size={16} /> 4 Late
            </div>
            <div className="flex items-center gap-1.5 text-[#A39E93]">
              <Clock size={16} /> 10 Pending
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {MOCK_SUBMISSIONS.map((sub) => (
            <div 
              key={sub.id}
              className={`bg-white rounded-2xl border-2 p-4 transition-all ${gradingId === sub.id ? 'border-[#F5A623] shadow-[4px_4px_0px_#F5A623]' : 'border-[#E8E4D9]'}`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#E8E4D9] bg-[#D6EAF8] flex items-center justify-center font-bold text-[#2C2A24]">
                    {sub.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#2C2A24] tracking-tight">{sub.name}</p>
                    <p className="text-xs text-[#7A7670] font-medium">{sub.date}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                  sub.status === 'Submitted' ? 'bg-green-50 text-green-700 border-green-200' :
                  sub.status === 'Late' ? 'bg-red-50 text-red-700 border-red-200' :
                  'bg-gray-50 text-gray-500 border-gray-200'
                }`}>
                  {sub.status}
                </div>
              </div>

              {gradingId === sub.id ? (
                <div className="mt-4 space-y-4 pt-4 border-t-2 border-dashed border-[#E8E4D9]">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black uppercase text-[#A39E93] mb-1 block">Marks</label>
                      <input 
                        autoFocus
                        type="number"
                        placeholder="/100"
                        className="w-full bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                        value={gradeValue}
                        onChange={(e) => setGradeValue(e.target.value)}
                      />
                    </div>
                    <div className="flex-[2]">
                      <label className="text-[10px] font-black uppercase text-[#A39E93] mb-1 block">Feedback</label>
                      <input 
                        type="text"
                        placeholder="Add a comment..."
                        className="w-full bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-lg px-3 py-2 focus:outline-none focus:border-[#F5A623]"
                        value={feedbackValue}
                        onChange={(e) => setFeedbackValue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setGradingId(null)}
                      className="flex-1 bg-white border-2 border-[#E8E4D9] py-2 rounded-lg text-sm font-bold text-[#7A7670] hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        // In a real app, save data here
                        setGradingId(null);
                      }}
                      className="flex-1 bg-[#F5A623] border-2 border-[#2C2A24] py-2 rounded-lg text-sm font-bold text-[#2C2A24] shadow-[2px_2px_0px_#2C2A24] active:shadow-none translate-y-[-2px] active:translate-y-[0px] transition-all"
                    >
                      Submit Grade
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center mt-2">
                  <div className="flex-1">
                    {sub.marks ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-black text-[#5BAD6F]">Graded: {sub.marks}/100</span>
                        {sub.feedback && <p className="text-xs text-[#7A7670] italic truncate max-w-[200px]">&quot;{sub.feedback}&quot;</p>}
                      </div>
                    ) : (
                        <span className="text-xs font-bold text-[#A39E93]">Not Graded Yet</span>
                    )}
                  </div>
                  <button 
                    disabled={sub.status === 'Pending'}
                    onClick={() => {
                      setGradingId(sub.id);
                      setGradeValue(sub.marks?.toString() || "");
                      setFeedbackValue(sub.feedback);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                      sub.status === 'Pending' 
                      ? 'border-[#E8E4D9] text-[#E8E4D9] cursor-not-allowed' 
                      : 'border-[#2C2A24] text-[#2C2A24] shadow-[3px_3px_0px_#2C2A24] hover:bg-[#FDFBF5] active:shadow-none active:translate-y-0.5'
                    }`}
                  >
                    <Send size={14} strokeWidth={3} />
                    Grade
                  </button>
                </div>
              )
              }
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-[#2C2A24] bg-[#F9F8F5]">
           <button 
             className="w-full bg-[#2C2A24] text-white font-black py-4 rounded-2xl shadow-[4px_4px_0px_#A39E93] hover:translate-y-[-2px] active:translate-y-[0px] active:shadow-none transition-all uppercase tracking-widest flex items-center justify-center gap-3"
             style={{ fontFamily: '"Nunito", sans-serif' }}
           >
             <Check size={20} strokeWidth={4} />
             Finalize All Grades
           </button>
        </div>
      </div>
    </div>
  );
}
