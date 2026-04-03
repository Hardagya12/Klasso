"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, BookOpen, Users, MapPin, AlertTriangle, Sparkles } from "lucide-react";

interface AddPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (period: any) => void;
  conflict: string | null;
  initialDay?: number;
  initialSlot?: number;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
];

export default function AddPeriodModal({ isOpen, onClose, onSave, conflict, initialDay, initialSlot }: AddPeriodModalProps) {
  const [formData, setFormData] = useState({
    day: initialDay || 0,
    timeSlot: initialSlot || 0,
    subject: "Mathematics",
    classSection: "Grade 8-A",
    room: "101",
    type: "Lecture",
  });

  useEffect(() => {
    if (initialDay !== undefined) setFormData(prev => ({ ...prev, day: initialDay }));
    if (initialSlot !== undefined) setFormData(prev => ({ ...prev, timeSlot: initialSlot }));
  }, [initialDay, initialSlot]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conflict) onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-[#FDFBF5] w-full max-w-lg rounded-3xl border-4 border-[#2C2A24] shadow-[8px_8px_0px_#2C2A24] overflow-hidden"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        {/* Header */}
        <div className="bg-[#4A90D9] border-b-4 border-[#2C2A24] p-6 flex justify-between items-center relative">
          <div className="absolute top-2 right-12 opacity-20 transform -rotate-12">
            <Sparkles size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#2C2A24] flex items-center gap-3" style={{ fontFamily: '"Nunito", sans-serif' }}>
            <Clock size={28} strokeWidth={3} />
            Add New Period
          </h2>
          <button 
            onClick={onClose}
            className="bg-white border-2 border-[#2C2A24] p-1.5 rounded-lg hover:bg-[#FDFBF5] transition-all shadow-[2px_2px_0px_#2C2A24] active:shadow-none active:translate-y-0.5"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Day */}
            <div>
              <label className="block text-xs font-black text-[#2C2A24] mb-2 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} /> Day
              </label>
              <select
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A90D9] transition-all font-bold text-sm shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
              >
                {DAYS.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-xs font-black text-[#2C2A24] mb-2 uppercase tracking-widest flex items-center gap-2">
                <Clock size={14} /> Time Slot
              </label>
              <select
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A90D9] transition-all font-bold text-sm shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: parseInt(e.target.value) })}
              >
                {TIME_SLOTS.map((slot, i) => (
                  <option key={i} value={i}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Subject */}
            <div>
              <label className="block text-xs font-black text-[#2C2A24] mb-2 uppercase tracking-widest flex items-center gap-2">
                <BookOpen size={14} /> Subject
              </label>
              <select
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A90D9] transition-all font-bold text-sm shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
                <option>History</option>
                <option>Sports</option>
                <option>Art</option>
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block text-xs font-black text-[#2C2A24] mb-2 uppercase tracking-widest flex items-center gap-2">
                <Users size={14} /> Class Section
              </label>
              <select
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A90D9] transition-all font-bold text-sm shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.classSection}
                onChange={(e) => setFormData({ ...formData, classSection: e.target.value })}
              >
                <option>Grade 8-A</option>
                <option>Grade 8-B</option>
                <option>Grade 8-C</option>
                <option>Grade 9-A</option>
                <option>Grade 10-A</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Room */}
            <div>
              <label className="block text-xs font-black text-[#2C2A24] mb-2 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={14} /> Room Number
              </label>
              <input
                type="text"
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A90D9] transition-all font-bold text-sm shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              />
            </div>

            {/* Period Type */}
            <div>
              <label className="block text-xs font-black text-[#2C2A24] mb-2 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} /> Period Type
              </label>
              <select
                className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-3 focus:outline-none focus:border-[#4A90D9] transition-all font-bold text-sm shadow-[2px_2px_0px_#E8E4D9]"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option>Lecture</option>
                <option>Lab</option>
                <option>Sports</option>
                <option>Free</option>
              </select>
            </div>
          </div>

          {/* Conflict Warning */}
          {conflict && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex gap-3 items-start">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-bold text-red-700 leading-tight">
                <span className="uppercase text-[10px] block mb-1">Schedule Conflict</span>
                {conflict}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border-4 border-[#2C2A24] text-[#2C2A24] font-black py-4 rounded-2xl shadow-[4px_4px_0px_#E8E4D9] hover:bg-[#FDFBF5] transition-all active:translate-y-1 active:shadow-none uppercase tracking-widest text-sm"
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!conflict}
              className={`flex-1 border-4 border-[#2C2A24] text-[#2C2A24] font-black py-4 rounded-2xl shadow-[4px_4px_0px_#2C2A24] transition-all uppercase tracking-widest text-sm ${conflict ? 'bg-gray-200 cursor-not-allowed grayscale' : 'bg-[#F59E0B] hover:bg-amber-400 active:translate-y-1 active:shadow-none'}`}
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              Add to Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
