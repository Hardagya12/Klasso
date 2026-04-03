"use client";
import React, { useState, useEffect } from "react";
import { apiData } from "../../lib/api";
import { useAuth } from "../providers";

type LeaderboardRow = {
  id: string;
  totalXP: number;
  currentLevel: number;
  currentTitle: string;
  weeklyXP: number;
  class: {
    name: string;
    section: string;
  };
};

export default function SchoolXPLeaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardRow[]>([]);
  const [sortBy, setSortBy] = useState<"total" | "weekly">("total");

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    
    // Call school xp leaderboard api. Requires schoolId, which is available in user
    const schoolId = (user as any).school_id || (user as any).schoolId;
    if (schoolId) {
       apiData<LeaderboardRow[]>(`/api/xp/school/${schoolId}/leaderboard?sort=${sortBy}`)
         .then((res: any) => {
            if (Array.isArray(res)) setData(res);
         })
         .catch(console.error);
    }
  }, [user, sortBy]);

  const toggleSort = () => setSortBy(s => s === "total" ? "weekly" : "total");

  if (!user || user.role !== "admin") return null;

  return (
    <div className="bg-white rounded-3xl p-8 mb-12 shadow-[4px_4px_0px_#1C2B27] border-2 border-[#D4EDE8] relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-primary flex items-center gap-2">
            🏆 School XP Leaderboard
          </h2>
          <p className="font-body text-muted mt-1 text-sm">Collective track of class progress.</p>
        </div>
        <button 
           onClick={toggleSort}
           className="bg-[#F7FBF9] text-mint px-4 py-2 font-heading font-bold rounded-xl border-2 border-[#D4EDE8] hover:bg-white"
        >
           Sort by: {sortBy === "total" ? "All-Time XP" : "This Week's XP"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-bg">
              <th className="py-3 px-4 font-heading font-bold text-muted text-sm">Rank</th>
              <th className="py-3 px-4 font-heading font-bold text-muted text-sm">Class</th>
              <th className="py-3 px-4 font-heading font-bold text-muted text-sm">Team Level</th>
              <th className="py-3 px-4 font-heading font-bold text-muted text-sm text-right">Total XP</th>
              <th className="py-3 px-4 font-heading font-bold text-muted text-sm text-right">Weekly XP</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.id} className="border-b border-bg hover:bg-[#F7FBF9] transition">
                <td className="py-4 px-4 font-heading font-bold text-lg text-primary">#{i + 1}</td>
                <td className="py-4 px-4 font-heading font-bold text-primary">{row.class.name}-{row.class.section}</td>
                <td className="py-4 px-4 flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-mint flex items-center justify-center text-white font-bold text-xs">{row.currentLevel}</div>
                   <span className="font-caveat text-xl text-mint font-bold">{row.currentTitle}</span>
                </td>
                <td className="py-4 px-4 font-caveat font-bold text-xl text-primary text-right">{row.totalXP}</td>
                <td className="py-4 px-4 font-heading font-bold text-mint text-right">+{row.weeklyXP}</td>
              </tr>
            ))}
            {data.length === 0 && (
               <tr>
                 <td colSpan={5} className="py-6 text-center text-muted font-body">No data available yet.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
