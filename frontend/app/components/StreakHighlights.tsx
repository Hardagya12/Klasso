import React, { useState, useEffect } from 'react';
import { apiData } from '../../lib/api';
import { StarburstSVG, StickerStar } from './dashboard/DashboardComponents';

type LeaderboardRow = {
  student_id: string;
  name: string;
  avatar_url: string;
  current_streak: number;
  longest_streak: number;
};

type RecentBadge = {
  badge_name: string;
  color: string;
  student_name: string;
  earned_at: string;
};

type StreakSummary = {
  classStreak: {
    avgStreak: number;
    maxStreak: number;
    activeStreaks: number;
  };
  topStudents: LeaderboardRow[];
  recentBadges: RecentBadge[];
};

const FlameSVG = ({ size = 20, isAnimated = false }: { size?: number, isAnimated?: boolean }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={isAnimated ? "animate-[pulse_2s_infinite]" : ""}
  >
    <path d="M12 2C12 2 17 8 17 13C17 16.5 14.5 19 12 19C9.5 19 7 16.5 7 13C7 8 12 2 12 2Z" fill="#FFE566"/>
    <path d="M12 6C12 6 15 10 15 14C15 16.2 13.5 18 12 18C10.5 18 9 16.2 9 14C9 10 12 6 12 6Z" fill="#F5A623"/>
    <path d="M12 10C12 10 13.5 13 13.5 15.5C13.5 16.9 12.8 17.5 12 17.5C11.2 17.5 10.5 16.9 10.5 15.5C10.5 13 12 10 12 10Z" fill="#FFFFFF"/>
  </svg>
);

const BadgePill = ({ badge }: { badge: RecentBadge }) => (
  <div 
    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-opacity-30"
    style={{ borderColor: badge.color, backgroundColor: `${badge.color}15` }}
  >
    <svg width={12} height={12} viewBox="0 0 24 24" fill={badge.color}>
      <circle cx="12" cy="12" r="12" />
    </svg>
    <span style={{ color: badge.color }} className="font-heading font-bold text-xs uppercase tracking-wider">
      {badge.badge_name}
    </span>
    <span className="font-body text-xs text-[#7A7670] ml-1">{badge.student_name}</span>
  </div>
);

export default function StreakHighlights({ classId }: { classId: string }) {
  const [data, setData] = useState<StreakSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullLeaderboard, setFullLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (!classId) return;
    apiData<StreakSummary>(`/api/streak/class/${classId}/summary`)
      .then(res => setData(res))
      .catch(console.error);
  }, [classId]);

  const loadLeaderboard = async () => {
    setIsModalOpen(true);
    setLoadingModal(true);
    try {
      const res = await apiData<LeaderboardRow[]>(`/api/streak/leaderboard/${classId}?limit=50`);
      setFullLeaderboard(res || []);
    } catch (e) {
      console.error(e);
    }
    setLoadingModal(false);
  };

  if (!data) return null;

  return (
    <>
      <div className="relative bg-white border-2 border-[#D4EDE8] rounded-[16px] shadow-[4px_4px_0px_#1C2B27] p-5 w-full">
        {/* Decorative corner */}
        <div className="absolute -top-3 -right-3 rotate-12">
          <StickerStar size={28} color="#FFE566" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <FlameSVG size={24} isAnimated />
          <h3 className="font-heading font-bold text-lg text-[#2C2A24] m-0">Streak Highlights</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Top Streak */}
          {data.topStudents.length > 0 && (
            <div className="flex-1 bg-[#FDFBF5] border border-[#E8E4D9] rounded-xl p-3 flex items-center gap-4">
              <div className="relative w-[46px] h-[46px] rounded-full bg-[#FFE566] border-2 border-[#2C2A24] flex items-center justify-center overflow-hidden">
                 {data.topStudents[0].avatar_url ? (
                   <img src={data.topStudents[0].avatar_url} alt="avatar" className="w-full h-full object-cover" />
                 ) : (
                   <span className="font-heading font-bold text-[#2C2A24] text-lg">{data.topStudents[0].name[0]}</span>
                 )}
                 <div className="absolute -bottom-1 -right-1 bg-white rounded-full">
                   <FlameSVG size={16} />
                 </div>
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-[#2C2A24] m-0 text-sm">Top Streak Leader</p>
                <p className="font-body text-[#7A7670] m-0 text-xs">{data.topStudents[0].name}</p>
              </div>
              <div className="text-right">
                <p className="font-heading font-bold text-2xl text-[#FF8C42] m-0 leading-none">{data.topStudents[0].current_streak}</p>
                <p className="font-body text-[#7A7670] m-0 text-[10px] uppercase font-bold">Days</p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="flex-1 flex flex-col justify-center border-l-2 border-dashed border-[#E8E4D9] pl-6">
            <div className="flex items-end gap-2 mb-1">
               <span className="font-heading font-bold text-[#2C2A24] text-3xl leading-none">{data.classStreak.activeStreaks}</span>
               <span className="font-body text-[#7A7670] text-sm pb-1">active streaks in class</span>
            </div>
            <p className="font-body text-xs text-[#7A7670] m-0">Average class streak is {data.classStreak.avgStreak} days</p>
          </div>
        </div>

        {/* Badges Earned Recently */}
        {data.recentBadges.length > 0 ? (
          <div className="mt-4 pt-4 border-t border-[#E8E4D9]">
            <p className="font-heading font-bold text-[#2C2A24] text-xs m-0 mb-2 uppercase">Recent Badges Earned</p>
            <div className="flex px-1 pb-2 gap-2 overflow-x-auto hide-scrollbar">
              {data.recentBadges.map((badge, i) => <BadgePill key={i} badge={badge} />)}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-[#E8E4D9]">
            <p className="font-body text-[#7A7670] text-sm italic m-0">No badges earned recently.</p>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={loadLeaderboard}
          className="mt-4 w-full py-2 bg-white border-2 border-[#2C2A24] rounded-lg font-heading font-bold text-[#2C2A24] shadow-[2px_2px_0px_#2C2A24] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#2C2A24] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-sm"
        >
          View Full Leaderboard
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2A24] bg-opacity-60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-[20px] border-2 border-[#2C2A24] shadow-[8px_8px_0px_#1C2B27] w-full max-w-2xl max-h-[85vh] flex flex-col relative animate-[slideUp_0.3s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-[#E8E4D9]">
              <div className="flex items-center gap-3">
                <FlameSVG size={32} isAnimated />
                <h2 className="font-heading font-bold text-2xl text-[#2C2A24] m-0">Class Leaderboard</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FDFBF5] border-2 border-[#E8E4D9] flex items-center justify-center hover:bg-[#FDEDEC] hover:border-[#FF6B6B] transition-colors"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto">
              {loadingModal ? (
                <div className="text-center py-10 font-body text-[#7A7670]">Loading ranking...</div>
              ) : fullLeaderboard.length === 0 ? (
                <div className="text-center py-10 font-body text-[#7A7670]">No active streaks currently.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 font-heading font-bold text-sm text-[#7A7670] border-b-2 border-[#E8E4D9]">Rank</th>
                      <th className="py-3 px-4 font-heading font-bold text-sm text-[#7A7670] border-b-2 border-[#E8E4D9]">Student</th>
                      <th className="py-3 px-4 font-heading font-bold text-sm text-[#7A7670] border-b-2 border-[#E8E4D9] text-right">Current Streak</th>
                      <th className="py-3 px-4 font-heading font-bold text-sm text-[#7A7670] border-b-2 border-[#E8E4D9] text-right">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullLeaderboard.map((row, i) => (
                      <tr key={row.student_id} className="hover:bg-[#FDFBF5] group">
                        <td className="py-4 px-4 border-b border-[#E8E4D9]">
                          <div className={`font-heading font-black text-xl w-8 h-8 flex items-center justify-center rounded-full ${i === 0 ? 'bg-[#FFE566] text-[#2C2A24]' : i === 1 ? 'bg-[#E3E8E9] text-[#2C2A24]' : i === 2 ? 'bg-[#E6B88A] text-[#2C2A24]' : 'text-[#B5B0A8]'}`}>
                            {i + 1}
                          </div>
                        </td>
                        <td className="py-4 px-4 border-b border-[#E8E4D9] font-heading font-bold text-[#2C2A24]">
                          {row.name}
                        </td>
                        <td className="py-4 px-4 border-b border-[#E8E4D9] text-right">
                          <span className="inline-flex items-center gap-1 font-heading font-bold text-lg text-[#FF8C42]">
                            <FlameSVG size={14} /> {row.current_streak}
                          </span>
                        </td>
                        <td className="py-4 px-4 border-b border-[#E8E4D9] text-right font-body text-sm text-[#7A7670]">
                          {row.longest_streak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Decorative background element */}
            <div className="absolute -bottom-10 -left-10 opacity-10 pointer-events-none">
              <StarburstSVG size={140} color="#FF6B6B" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
