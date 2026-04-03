"use client";

import React from "react";
import { Plus } from "lucide-react";
import TimetableCard from "./TimetableCard";

interface TimetableGridProps {
  periods: any[];
  onAddSlot: (day: number, slot: number) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
];

export default function TimetableGrid({ periods, onAddSlot }: TimetableGridProps) {
  const currentDay = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const adjustedToday = currentDay === 0 ? -1 : currentDay - 1; // Map Monday to 0, Sat to 5

  return (
    <div className="flex-1 min-w-[800px] bg-white rounded-3xl border-4 border-[#2C2A24] overflow-hidden shadow-[8px_8px_0px_#E8E4D9]">
      <div className="grid grid-cols-[100px_repeat(6,1fr)] h-full overflow-y-auto custom-scrollbar">
        {/* Empty top-left corner */}
        <div className="bg-[#F9F8F5] border-b-4 border-r-4 border-[#2C2A24]" />

        {/* Day Headers */}
        {DAYS.map((day, i) => (
          <div 
            key={day} 
            className={`bg-[#F9F8F5] border-b-4 border-r-4 border-[#2C2A24] p-4 text-center relative group ${adjustedToday === i ? 'bg-[#FFF7ED]' : ''}`}
          >
            {adjustedToday === i && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#5BAD6F] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-[2px_2px_0px_#2C2A24] z-10">
                Today
              </span>
            )}
            <span className="text-sm font-black text-[#2C2A24] uppercase tracking-widest" style={{ fontFamily: '"Nunito", sans-serif' }}>
              {day}
            </span>
          </div>
        ))}

        {/* Time Grid Rows */}
        {TIME_SLOTS.map((time, slotIndex) => (
          <React.Fragment key={time}>
            {/* Time Label */}
            <div className="bg-[#F9F8F5] border-b-4 border-r-4 border-[#2C2A24] p-3 flex items-center justify-center">
              <span className="text-[11px] font-black text-[#7A7670] uppercase">
                {time}
              </span>
            </div>

            {/* Day Slots */}
            {DAYS.map((_, dayIndex) => {
              const period = periods.find(p => p.day === dayIndex && p.timeSlot === slotIndex);
              
              return (
                <div 
                  key={`${dayIndex}-${slotIndex}`}
                  className={`border-b-4 border-r-4 border-[#E8E4D9] p-2 min-h-[100px] relative group hover:bg-[#FDFBF5] transition-colors ${adjustedToday === dayIndex ? 'bg-[#FFF7ED]/30' : ''}`}
                >
                  {period ? (
                    <TimetableCard period={period} />
                  ) : (
                    <button 
                      onClick={() => onAddSlot(dayIndex, slotIndex)}
                      className="h-full w-full border-2 border-dashed border-[#E8E4D9] rounded-xl flex items-center justify-center text-[#E8E4D9] hover:border-[#F5A623] hover:text-[#F5A623] hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Plus size={24} strokeWidth={3} />
                    </button>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
