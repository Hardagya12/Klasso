"use client";

import React, { useState } from "react";
import { X, Calendar, Type, BookOpen, Layers, Target, FileText, Paperclip, Sparkles } from "lucide-react";

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (assignment: any) => void;
}

export default function CreateAssignmentModal({ isOpen, onClose, onPublish }: CreateAssignmentModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    subject: "Mathematics",
    classSection: "8-A",
    dueDate: "",
    totalMarks: 100,
    description: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPublish({
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      submissions: 0,
      totalStudents: 32, // Mock average
      status: "Active",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-[#FDFBF5] w-full max-w-2xl rounded-3xl border-4 border-[#2C2A24] shadow-[8px_8px_0px_#2C2A24] overflow-hidden"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        {/* Header */}
        <div className="bg-[#F5A623] border-b-4 border-[#2C2A24] p-6 flex justify-between items-center relative">
          <div className="absolute top-2 right-12 opacity-20">
            <Sparkles size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#2C2A24] flex items-center gap-3" style={{ fontFamily: '"Nunito", sans-serif' }}>
            <Target size={28} strokeWidth={3} />
            Create New Assignment
          </h2>
          <button 
            onClick={onClose}
            className="bg-white border-2 border-[#2C2A24] p-1.5 rounded-lg hover:bg-[#FDFBF5] transition-all shadow-[2px_2px_0px_#2C2A24] active:shadow-none active:translate-y-0.5"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-[#2C2A24] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Type size={16} /> Assignment Title
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Algebra Quiz - Chapter 4"
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5A623] transition-colors font-medium shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-black text-[#2C2A24] mb-2 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} /> Subject
              </label>
              <select
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5A623] transition-colors font-medium cursor-pointer shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
                <option>History</option>
                <option>Geography</option>
                <option>Computer Science</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-sm font-black text-[#2C2A24] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} /> Class/Section
              </label>
              <select
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5A623] transition-colors font-medium cursor-pointer shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.classSection}
                onChange={(e) => setFormData({ ...formData, classSection: e.target.value })}
              >
                <option>8-A</option>
                <option>8-B</option>
                <option>8-C</option>
                <option>9-A</option>
                <option>9-B</option>
                <option>10-A</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-black text-[#2C2A24] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} /> Due Date
              </label>
              <input
                required
                type="date"
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5A623] transition-colors font-medium shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            {/* Total Marks */}
            <div>
              <label className="block text-sm font-black text-[#2C2A24] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Target size={16} /> Total Marks
              </label>
              <input
                required
                type="number"
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5A623] transition-colors font-medium shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-[#2C2A24] mb-2 uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} /> Description
              </label>
              <textarea
                rows={4}
                placeholder="Briefly describe the assignment goals and instructions..."
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#F5A623] transition-colors font-medium resize-none shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Attachments */}
            <div className="md:col-span-2">
              <label className="block text-sm font-black text-[#2C2A24] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Paperclip size={16} /> Attachments (Optional)
              </label>
              <div className="border-2 border-dashed border-[#E8E4D9] rounded-2xl p-6 bg-white flex flex-col items-center justify-center gap-2 group hover:border-[#F5A623] transition-colors cursor-pointer relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="p-3 bg-[#FDFBF5] rounded-full group-hover:bg-[#FFF7ED] transition-colors">
                  <Paperclip className="text-[#A39E93] group-hover:text-[#F5A623]" />
                </div>
                <p className="text-sm font-bold text-[#A39E93] group-hover:text-[#2C2A24]">
                  Click to browse or drag and drop files
                </p>
                <p className="text-xs text-[#E8E4D9]">PDF, DOCX, JPG (Max 10MB)</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border-4 border-[#2C2A24] text-[#2C2A24] font-black py-4 rounded-2xl shadow-[4px_4px_0px_#2C2A24] hover:bg-[#FDFBF5] transition-all active:translate-y-1 active:shadow-none uppercase tracking-widest"
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#F5A623] border-4 border-[#2C2A24] text-[#2C2A24] font-black py-4 rounded-2xl shadow-[4px_4px_0px_#2C2A24] hover:bg-[#F59E0B] transition-all active:translate-y-1 active:shadow-none uppercase tracking-widest"
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
