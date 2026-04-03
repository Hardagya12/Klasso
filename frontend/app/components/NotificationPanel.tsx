"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

// Doodles
const BellDoodle = () => (
  <svg width="24" height="24" viewBox="0 0 100 100" fill="none" className="animate-[wiggle_1s_ease-in-out_infinite] origin-top">
    <style>{`@keyframes wiggle { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }`}</style>
    <path d="M50 15C35 15 25 30 25 50V65L15 75H85L75 65V50C75 30 65 15 50 15Z" fill="#FBBF24" stroke="#D97706" strokeWidth="6" strokeLinejoin="round"/>
    <path d="M40 85C40 90.5 44.5 95 50 95C55.5 95 60 90.5 60 85" stroke="#D97706" strokeWidth="6" strokeLinecap="round"/>
    <path d="M20 40Q10 40 10 30" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" className="animate-pulse"/>
    <path d="M80 40Q90 40 90 30" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" className="animate-pulse"/>
  </svg>
);

const WarningDoodle = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
    <path d="M50 15L10 85H90L50 15Z" fill="#FEE2E2" stroke="#EF4444" strokeWidth="6" strokeLinejoin="round"/>
    <path d="M50 40V65" stroke="#EF4444" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="50" cy="78" r="4" fill="#EF4444"/>
  </svg>
);

const LightbulbDoodle = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
    <path d="M50 15C35 15 25 25 25 40C25 55 40 60 40 75H60C60 60 75 55 75 40C75 25 65 15 50 15Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="6" strokeLinejoin="round"/>
    <path d="M45 85H55 M40 95H60" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

const SparkleSmallDoodle = () => (
  <svg width="16" height="16" viewBox="0 0 100 100" fill="none" className="shrink-0">
    <path d="M50 5C50 35 65 50 95 50C65 50 50 65 50 95C50 65 35 50 5 50C35 50 50 35 50 5Z" fill="#F59E0B"/>
  </svg>
);

const GearDoodle = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none" className="animate-[spin_4s_linear_infinite]">
    <circle cx="50" cy="50" r="25" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="6"/>
    <path d="M50 10V25 M50 75V90 M10 50H25 M75 50H90 M20 20L32 32 M68 68L80 80 M20 80L32 68 M68 32L80 20" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

const SpeechDoodle = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
    <path d="M85 50C85 69.33 69.33 85 50 85H20L30 70C15 60 15 40 25 25C35 10 65 10 75 20C81.67 26.67 85 38.33 85 50Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="6" strokeLinejoin="round"/>
    <path d="M35 50H65 M45 35H55" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

const CheckDoodle = () => (
  <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="40" fill="#DCFCE7" stroke="#22C55E" strokeWidth="6"/>
    <path d="M30 50L45 65L75 35" stroke="#22C55E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightDoodle = () => (
  <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
    <path d="M20 50H80 M60 30L80 50L60 70" stroke="#F59E0B" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function NotificationPanel({ isOpen = true, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState("All");

  if (!isOpen) return null;

  const TABS = ["All", "Urgent", "AI", "System"];

  return (
    <div className="fixed top-0 right-0 h-full w-[380px] bg-[#FDFBF5] border-l-2 border-[#E8E4D9] shadow-[-8px_0_15px_rgba(0,0,0,0.05)] z-50 flex flex-col font-sans transition-transform duration-300 transform translate-x-0">
      
      {/* Header */}
      <div className="p-6 pb-4 border-b-2 border-[#E8E4D9] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[#2C2A24] font-['Nunito']">Notifications</h2>
            <BellDoodle />
          </div>
          <button onClick={onClose} className="p-1 text-[#A39E93] hover:text-[#4A473F] transition-colors"><X size={20} /></button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {TABS.map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${activeTab === tab ? 'bg-[#2C2A24] text-white' : 'bg-[#F3F4F6] text-[#7A7670] hover:bg-[#E5E7EB]'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="text-sm font-bold text-amber-500 hover:text-amber-600 underline decoration-amber-300 decoration-wavy underline-offset-2">Mark all read</button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2 space-y-6">
        
        {/* Today Divider */}
        <div>
           <div className="text-2xl font-bold font-['Caveat'] text-[#A39E93] mb-3">Today</div>
           <div className="space-y-4">
             
             {/* Type 1: Urgent */}
             <div className="bg-white border-2 border-[#E8E4D9] border-l-8 border-l-red-500 rounded-xl p-4 shadow-[2px_2px_0_#FCA5A5] relative hover:-translate-y-0.5 transition-transform">
               <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400" />
               <div className="flex items-start gap-3">
                 <div className="mt-1"><WarningDoodle /></div>
                 <div>
                   <h4 className="font-bold text-[#2C2A24] text-[15px] leading-tight mb-1 pr-4">Riya Shah below 75% attendance</h4>
                   <p className="text-sm text-[#A39E93] font-['Caveat'] text-lg font-bold">10 mins ago</p>
                   <button className="mt-3 text-xs bg-red-50 text-red-600 border-2 border-red-200 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 shadow-[1px_1px_0_#FECACA] active:shadow-none active:translate-y-[1px]">
                     Send Parent Alert
                   </button>
                 </div>
               </div>
             </div>

             {/* Type 2: AI Suggestion */}
             <div className="bg-[#FFFBEB] border-2 border-[#E8E4D9] rounded-xl p-4 shadow-[2px_2px_0_#FDE68A] relative hover:-translate-y-0.5 transition-transform">
               <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400" />
               <div className="flex items-start gap-3">
                 <div className="mt-1"><LightbulbDoodle /></div>
                 <div>
                   <h4 className="font-bold text-[#2C2A24] text-[15px] leading-tight mb-1">AI: 5 reports ready to review</h4>
                   <p className="text-sm text-[#A39E93] font-['Caveat'] text-lg font-bold">Generated 2 mins ago</p>
                   <button className="mt-3 text-xs flex items-center gap-1 bg-amber-400 text-[#2C2A24] border-2 border-[#D97706] px-3 py-1.5 rounded-lg font-bold hover:bg-amber-300 shadow-[1px_1px_0_#D97706] active:shadow-none active:translate-y-[1px]">
                     Review Now <SparkleSmallDoodle />
                   </button>
                 </div>
               </div>
             </div>

             {/* Type 4: Message */}
             <div className="bg-white border-2 border-[#E8E4D9] border-l-8 border-l-blue-400 rounded-xl p-4 shadow-[2px_2px_0_#BFDBFE] relative hover:-translate-y-0.5 transition-transform">
               <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-amber-400" />
               <div className="flex items-start gap-3">
                 <div className="mt-1"><SpeechDoodle /></div>
                 <div>
                   <h4 className="font-bold text-[#2C2A24] text-[15px] leading-tight mb-1">Parent of Arjun: Can we meet?</h4>
                   <p className="text-sm text-[#7A7670] mb-2 leading-tight">"Hi Ms. Sharma, Arjun is having trouble with the recent math assignment. Could we..."</p>
                   <p className="text-sm text-[#A39E93] font-['Caveat'] text-lg font-bold -mt-2">1 hour ago</p>
                   <button className="mt-2 text-xs bg-blue-50 text-blue-600 border-2 border-blue-200 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 shadow-[1px_1px_0_#BFDBFE] active:shadow-none active:translate-y-[1px]">
                     Reply
                   </button>
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Yesterday Divider */}
        <div>
           <div className="text-2xl font-bold font-['Caveat'] text-[#A39E93] mb-3">Yesterday</div>
           <div className="space-y-4">
             
             {/* Type 3: System */}
             <div className="bg-white border-2 border-[#E8E4D9] border-l-8 border-l-gray-400 rounded-xl p-4 shadow-[2px_2px_0_#D1D5DB] hover:-translate-y-0.5 transition-transform">
               <div className="flex items-start gap-3">
                 <div className="mt-1"><GearDoodle /></div>
                 <div>
                   <h4 className="font-bold text-[#2C2A24] text-[15px] leading-tight mb-1">Timetable updated by Admin</h4>
                   <p className="text-sm text-[#A39E93] font-['Caveat'] text-lg font-bold">Yesterday, 4:30 PM</p>
                 </div>
               </div>
             </div>

             {/* Type 5: Success */}
             <div className="bg-white border-2 border-[#E8E4D9] border-l-8 border-l-green-400 rounded-xl p-4 shadow-[2px_2px_0_#BBF7D0] hover:-translate-y-0.5 transition-transform">
               <div className="flex items-start gap-3">
                 <div className="mt-1"><CheckDoodle /></div>
                 <div>
                   <h4 className="font-bold text-[#2C2A24] text-[15px] leading-tight mb-1">Attendance marked for all classes today</h4>
                   <p className="text-green-600 font-['Caveat'] text-xl font-bold mt-1">Nice work ✦</p>
                 </div>
               </div>
             </div>

           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-[#E8E4D9] shrink-0 bg-[#F9F8F5]">
         <button className="w-full py-3 flex items-center justify-center gap-2 text-[#4A473F] font-bold font-['Nunito'] hover:text-[#F5A623] hover:underline decoration-wavy decoration-[#F5A623] transition-all">
            View all notifications <ArrowRightDoodle />
         </button>
      </div>

    </div>
  );
}
