"use client";

import React from "react";
import { BarChart3, Clock, BookOpen, AlertCircle, TrendingUp } from "lucide-react";

interface WorkloadSidebarProps {
  periods: any[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function WorkloadSidebar({ periods }: WorkloadSidebarProps) {
  const totalPeriods = periods.length;
  const uniqueSubjects = Array.from(new Set(periods.map(p => p.subject))).length;
  
  // Calculate periods per day
  const periodsPerDay = DAYS.map((day, i) => ({
    name: day,
    count: periods.filter(p => p.day === i).length
  }));

  const busiestDay = [...periodsPerDay].sort((a, b) => b.count - a.count)[0];
  const maxCount = Math.max(...periodsPerDay.map(d => d.count), 1);
  
  const freePeriods = 42 - totalPeriods; // 6 days * 7 slots (assuming 8-3)

  return (
    <div className="w-[280px] space-y-6">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl border-2 border-[#E8E4D9] p-5 shadow-[4px_4px_0px_#E8E4D9]">
        <h3 className="text-sm font-black text-[#2C2A24] uppercase tracking-widest mb-4 flex items-center gap-2" style={{ fontFamily: '"Nunito", sans-serif' }}>
          <TrendingUp size={16} /> Workload Analysis
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7A7670]">
              <Clock size={14} /> Total Periods
            </div>
            <span className="text-lg font-black text-[#2C2A24]">{totalPeriods}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs font-bold text-[#7A7670]">
              <BookOpen size={14} /> Subjects
            </div>
            <span className="text-lg font-black text-[#2C2A24]">{uniqueSubjects}</span>
          </div>
          
          {busiestDay && (
            <div className="bg-[#FDFBF5] rounded-xl border-2 border-[#E8E4D9] p-3">
              <span className="text-[10px] font-black uppercase text-[#A39E93] block mb-1">Busiest Day</span>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#2C2A24]">{busiestDay.name}</span>
                <span className="bg-[#E8534A] text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                  {busiestDay.count} Classes
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white rounded-2xl border-2 border-[#E8E4D9] p-5 shadow-[4px_4px_0px_#E8E4D9]">
        <h3 className="text-sm font-black text-[#2C2A24] uppercase tracking-widest mb-6 flex items-center gap-2" style={{ fontFamily: '"Nunito", sans-serif' }}>
          <BarChart3 size={16} /> Weekly Distribution
        </h3>
        
        <div className="space-y-4">
          {periodsPerDay.map((day, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-[#7A7670] uppercase">
                <span>{day.name}</span>
                <span>{day.count}</span>
              </div>
              <div className="h-3 w-full bg-[#F9F8F5] rounded-full overflow-hidden border border-[#E8E4D9] p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(day.count / maxCount) * 100}%`,
                    backgroundColor: day.count === maxCount ? '#E8534A' : '#F5A623'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free Periods Alert */}
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex gap-3 items-center">
        <AlertCircle size={20} className="text-green-500" />
        <div>
          <p className="text-[10px] font-black uppercase text-green-600 tracking-wider">Free Periods</p>
          <p className="text-sm font-black text-[#166534]">{freePeriods} slots available <br /> this week</p>
        </div>
      </div>
    </div>
  );
}
