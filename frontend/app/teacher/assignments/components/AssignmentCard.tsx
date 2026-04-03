"use client";

import React from "react";
import { Calendar, Users, MoreVertical, Edit2, Trash2, Eye } from "lucide-react";

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    subject: string;
    classSection: string;
    dueDate: string;
    totalMarks: number;
    submissions: number;
    totalStudents: number;
    status: "Active" | "Archived";
  };
  onViewSubmissions: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const subjectColors: Record<string, { bg: string; text: string; border: string }> = {
  Mathematics: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  Science: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  English: { bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5" },
  History: { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" },
  Default: { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
};

export default function AssignmentCard({ assignment, onViewSubmissions, onEdit, onDelete }: AssignmentCardProps) {
  const colors = subjectColors[assignment.subject] || subjectColors.Default;
  
  const dueDate = new Date(assignment.dueDate);
  const now = new Date();
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const isOverdue = diffDays < 0;
  const countdownText = isOverdue 
    ? `Overdue by ${Math.abs(diffDays)} days` 
    : diffDays === 0 
      ? "Due today" 
      : `Due in ${diffDays} days`;

  const submissionRate = Math.round((assignment.submissions / assignment.totalStudents) * 100);

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E8E4D9] p-5 shadow-[4px_4px_0px_#E8E4D9] hover:shadow-[6px_6px_0px_#E8E4D9] transition-all group overflow-hidden relative">
      {/* Decorative Starburst for overdue assignments */}
      {isOverdue && (
        <div className="absolute -top-4 -right-4 opacity-10 rotate-12">
          <svg width="60" height="60" viewBox="0 0 48 48" fill="#E8534A">
            <path d="M24 2L27 15L40 10L33 22L46 24L33 26L40 38L27 33L24 46L21 33L8 38L15 26L2 24L15 22L8 10L21 15L24 2Z" />
          </svg>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <span 
          className="px-3 py-1 rounded-full text-xs font-bold border-2"
          style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, fontFamily: '"Nunito", sans-serif' }}
        >
          {assignment.subject}
        </span>
        <div className="flex gap-1">
          <button 
            onClick={() => onEdit(assignment.id)}
            className="p-1.5 text-[#7A7670] hover:text-[#2C2A24] hover:bg-[#FDFBF5] rounded-lg transition-colors border-2 border-transparent hover:border-[#E8E4D9]"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(assignment.id)}
            className="p-1.5 text-[#E8534A] hover:bg-red-50 rounded-lg transition-colors border-2 border-transparent hover:border-red-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-[#2C2A24] mb-2 leading-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
        {assignment.title}
      </h3>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-[#7A7670] font-medium">
          <Users size={16} className="text-[#A39E93]" />
          <span>{assignment.classSection}</span>
          <span className="text-[#E8E4D9]">|</span>
          <span>{assignment.totalMarks} Marks</span>
        </div>
        <div className={`flex items-center gap-2 text-sm font-bold ${isOverdue ? 'text-[#E8534A]' : 'text-[#5BAD6F]'}`}>
          <Calendar size={16} />
          <span style={{ fontFamily: '"Nunito", sans-serif' }}>{countdownText}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end text-xs font-bold text-[#4A473F]">
          <span style={{ fontFamily: '"Nunito", sans-serif' }}>Submissions</span>
          <span className="bg-[#FDFBF5] px-2 py-0.5 rounded-md border border-[#E8E4D9]">
            {assignment.submissions}/{assignment.totalStudents}
          </span>
        </div>
        
        {/* Pencil-style Progress Bar */}
        <div className="relative h-4 w-full">
          <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-[#E8E4D9] bg-[#F9F8F5]">
            <div
              className={`h-full transition-all duration-700 ease-out relative ${isOverdue ? 'bg-[#E8534A]' : 'bg-[#F5A623]'}`}
              style={{ width: `${submissionRate}%` }}
            >
              {/* Texture effect */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 10px, white 10px, white 12px)",
                }}
              />
            </div>
          </div>
          {/* Pencil Tip Indicator */}
          <div
            className="absolute top-0 h-4 w-2 -translate-x-full flex items-center pointer-events-none"
            style={{ left: `${submissionRate}%` }}
          >
            <svg width="8" height="16" viewBox="0 0 12 20">
              <path d="M0 0 L12 10 L0 20 Z" fill="#E8E4D9" stroke="#2C2A24" strokeWidth="1.5"/>
            </svg>
          </div>
        </div>
      </div>

      <button
        onClick={() => onViewSubmissions(assignment.id)}
        className="w-full mt-6 bg-white border-2 border-[#2C2A24] text-[#2C2A24] font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-[3px_3px_0px_#2C2A24] hover:bg-[#FDFBF5] transition-all active:translate-y-0.5 active:shadow-[1px_1px_0px_#2C2A24]"
        style={{ fontFamily: '"Nunito", sans-serif' }}
      >
        <Eye size={18} strokeWidth={3} />
        View Submissions
      </button>
    </div>
  );
}
