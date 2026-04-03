"use client";

import React, { useState, useEffect } from "react";

// Doodles & SVGs
const SchoolBuildingDoodle = () => (
  <svg width="120" height="120" viewBox="0 0 100 100" fill="none">
    <path d="M50 10L10 40V90H90V40L50 10Z" fill="#FDE68A" stroke="#D97706" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M40 90V60H60V90" fill="#FFFBEB" stroke="#D97706" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M25 50H35V65H25V50Z M65 50H75V65H65V50Z" fill="#FFFBEB" stroke="#D97706" strokeWidth="4" strokeLinejoin="round"/>
    <circle cx="50" cy="35" r="5" fill="#FFFBEB" stroke="#D97706" strokeWidth="3"/>
  </svg>
);

const PencilSmallDoodle = () => (
  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
    <path d="M20 80L10 90L20 90L25 85" stroke="#2C2A24" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 80L80 20L90 30L30 90L10 90L20 80Z" fill="#FBBF24" stroke="#2C2A24" strokeWidth="6" strokeLinejoin="round"/>
    <path d="M70 30L80 40" stroke="#2C2A24" strokeWidth="6" strokeLinecap="round"/>
  </svg>
);

const CornerFoldSVG = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="absolute top-0 right-0 pointer-events-none">
    <path d="M40 0V40L0 0H40Z" fill="#F5A623" opacity="0.3"/>
    <path d="M0 0L40 40V0H0Z" fill="#FDFBF5"/>
    <path d="M0 0L40 40H0V0Z" fill="white" stroke="#E8E4D9" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);

const StarDoodle = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="15" height="15" viewBox="0 0 100 100" fill="none" style={style}>
    <path d="M50 10L62 38L93 38L68 56L77 85L50 67L22 85L31 56L6 38L37 38L50 10Z" fill="#FBBF24"/>
  </svg>
);

const ClassroomDoodle = () => (
  <svg width="160" height="160" viewBox="0 0 100 100" fill="none">
    <rect x="10" y="20" width="80" height="40" fill="#22C55E" stroke="#14532D" strokeWidth="4" strokeLinejoin="round"/>
    <path d="M15 65H85" stroke="#D97706" strokeWidth="4" strokeLinecap="round"/>
    <path d="M25 65V90 M75 65V90" stroke="#D97706" strokeWidth="4" strokeLinecap="round"/>
    <path d="M20 30H40 M20 40H50" stroke="#FFF" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="85" cy="15" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="3"/>
  </svg>
);

const SpreadsheetDoodle = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
    <rect x="15" y="15" width="70" height="70" rx="8" fill="#D1FAE5" stroke="#059669" strokeWidth="5" strokeLinejoin="round"/>
    <path d="M15 40H85 M40 15V85 M65 15V85" stroke="#059669" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

const PencilWritingDoodle = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
    <path d="M20 70C30 60 40 80 50 70C60 60 70 80 80 70" stroke="#4B5563" strokeWidth="5" strokeLinecap="round"/>
    <path d="M60 20L80 40L40 80L20 80L20 60L60 20Z" fill="#FDE68A" stroke="#D97706" strokeWidth="5" strokeLinejoin="round"/>
    <path d="M50 30L70 50" stroke="#D97706" strokeWidth="5" strokeLinecap="round"/>
    <path d="M20 80L30 70" stroke="#4B5563" strokeWidth="5" strokeLinecap="round"/>
  </svg>
);

const GoogleDoodle = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
    <path d="M85 50H50V65H70C68 75 60 80 50 80C35 80 20 65 20 50C20 35 35 20 50 20C60 20 65 25 70 30L85 15C75 5 65 0 50 0C25 0 0 25 0 50C0 75 25 100 50 100C75 100 95 85 95 50C95 45 90 50 85 50Z" fill="#DBEAFE" stroke="#3B82F6" strokeWidth="6" strokeLinejoin="round"/>
  </svg>
);

// Underline Input Field
const UnderlineInput = ({ label, placeholder }: { label: string, placeholder: string }) => (
  <div className="flex flex-col mb-4">
    <label className="font-['Caveat'] text-2xl font-bold text-[#A39E93] mb-1">{label}</label>
    <input 
      type="text" 
      placeholder={placeholder}
      className="bg-transparent border-b-2 border-dashed border-[#A39E93] outline-none text-[#2C2A24] font-bold font-['Nunito'] text-lg py-1 w-full focus:border-amber-400 focus:bg-amber-50/50 transition-colors"
    />
  </div>
);

// Progress Circles
const ProgressCircle = ({ active }: { active: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="transition-all duration-300 transform scale-110">
     <circle cx="10" cy="10" r="7" fill={active ? "#F5A623" : "transparent"} stroke="#F5A623" strokeWidth="3" strokeDasharray={active ? "none" : "2 2"} />
  </svg>
);

// Burst Animation Overlay
const StarBurst = ({ active }: { active: boolean }) => {
   if (!active) return null;
   return (
     <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
       <div className="relative animate-[ping_0.5s_ease-out_forwards]">
         <StarDoodle style={{ position: 'absolute', top: -50, left: -50, transform: 'scale(1.5)' }} />
         <StarDoodle style={{ position: 'absolute', top: -60, right: -40, transform: 'scale(2)' }} />
         <StarDoodle style={{ position: 'absolute', bottom: -50, left: -30, transform: 'scale(1.2)' }} />
         <StarDoodle style={{ position: 'absolute', bottom: -40, right: -50, transform: 'scale(1.8)' }} />
       </div>
     </div>
   );
};

export default function OnboardingModal({ isOpen = true, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const [step, setStep] = useState(1);
  const [burst, setBurst] = useState(false);

  useEffect(() => {
    if (burst) {
      const t = setTimeout(() => setBurst(false), 600);
      return () => clearTimeout(t);
    }
  }, [burst]);

  const handleNext = () => {
    setBurst(true);
    setTimeout(() => {
      if (step < 3) setStep(step + 1);
      else if (onClose) onClose();
    }, 400); // Wait a bit for the burst before changing state
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2C2A24]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-sans">
       
       {/* Modal Card */}
       <div 
         className="relative bg-white w-full max-w-2xl rounded-2xl shadow-[12px_12px_0_rgba(0,0,0,0.15)] overflow-hidden border-4 border-[#E8E4D9] transition-all duration-500"
         style={{ 
           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23e8e4d9\' fill-opacity=\'0.2\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Cg/%3E%3C/svg%3E")',
         }}
       >
          <CornerFoldSVG />
          <StarBurst active={burst} />

          {/* Scattered background stars */}
          <StarDoodle style={{ position: 'absolute', top: '10%', left: '5%', opacity: 0.5 }} />
          <StarDoodle style={{ position: 'absolute', bottom: '20%', left: '8%', opacity: 0.3, transform: 'scale(0.8)' }} />
          <StarDoodle style={{ position: 'absolute', top: '15%', right: '10%', opacity: 0.6, transform: 'scale(1.2)' }} />

          <div className="p-10 pt-12 relative z-10 min-h-[400px] flex flex-col items-center justify-center">

            {/* STEP 1: WELCOME */}
            {step === 1 && (
              <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-500 w-full">
                <div className="mb-6 transform hover:scale-105 transition-transform"><SchoolBuildingDoodle /></div>
                <h2 className="text-3xl font-black font-['Nunito'] text-[#2C2A24] mb-2">Welcome to Klasso, Ms. Sharma!</h2>
                <p className="font-['Caveat'] text-3xl text-[#A39E93] mb-10 decoration-wavy underline decoration-amber-200 underline-offset-4">Let's set up your classroom in 3 quick steps.</p>
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-amber-400 text-[#2C2A24] px-10 py-4 rounded-xl font-black text-xl hover:bg-amber-300 shadow-[6px_6px_0_#D97706] active:translate-y-1 active:translate-x-1 active:shadow-[0_0_0_#D97706] transition-all"
                >
                  Let's Go! <PencilSmallDoodle />
                </button>
              </div>
            )}

            {/* STEP 2: ADD CLASS */}
            {step === 2 && (
              <div className="w-full flex items-center justify-between gap-8 animate-in slide-in-from-right-12 duration-500">
                <div className="flex-1">
                  <h2 className="text-3xl font-black font-['Nunito'] text-[#2C2A24] mb-6">Create Your Class</h2>
                  <UnderlineInput label="Class Name" placeholder="e.g. 8-A Science" />
                  <div className="grid grid-cols-2 gap-4">
                    <UnderlineInput label="Grade" placeholder="e.g. 8" />
                    <UnderlineInput label="Section" placeholder="e.g. A" />
                  </div>
                  <UnderlineInput label="Subject" placeholder="e.g. Complete Science" />
                  <button 
                    onClick={handleNext}
                    className="mt-6 flex items-center justify-center w-full gap-2 bg-[#2C2A24] text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-black shadow-[4px_4px_0_#A39E93] active:translate-y-1 active:shadow-none transition-all"
                  >
                    Save Classroom
                  </button>
                </div>
                <div className="flex-1 flex justify-center transform hover:rotate-2 transition-transform">
                  <ClassroomDoodle />
                </div>
              </div>
            )}

            {/* STEP 3: ADD STUDENTS */}
            {step === 3 && (
              <div className="w-full flex flex-col items-center animate-in slide-in-from-right-12 duration-500">
                <h2 className="text-3xl font-black font-['Nunito'] text-[#2C2A24] mb-8">Add Your Students</h2>
                
                <div className="flex justify-center gap-6 w-full mb-8">
                   {/* Card 1 */}
                   <button onClick={handleNext} className="flex-1 bg-[#F9F8F5] border-2 border-dashed border-[#A39E93] rounded-2xl p-6 flex flex-col items-center gap-4 hover:bg-white hover:border-emerald-400 hover:shadow-[4px_4px_0_#A7F3D0] transition-all group">
                     <div className="transform group-hover:scale-110 transition-transform"><SpreadsheetDoodle /></div>
                     <span className="font-bold text-[#4A473F] font-['Nunito']">Upload CSV</span>
                   </button>
                   
                   {/* Card 2 */}
                   <button onClick={handleNext} className="flex-1 bg-[#F9F8F5] border-2 border-dashed border-[#A39E93] rounded-2xl p-6 flex flex-col items-center gap-4 hover:bg-white hover:border-amber-400 hover:shadow-[4px_4px_0_#FDE68A] transition-all group">
                     <div className="transform group-hover:scale-110 transition-transform"><PencilWritingDoodle /></div>
                     <span className="font-bold text-[#4A473F] font-['Nunito']">Add Manually</span>
                   </button>

                   {/* Card 3 */}
                   <button onClick={handleNext} className="flex-1 bg-[#F9F8F5] border-2 border-dashed border-[#A39E93] rounded-2xl p-6 flex flex-col items-center gap-4 hover:bg-white hover:border-blue-400 hover:shadow-[4px_4px_0_#BFDBFE] transition-all group">
                     <div className="transform group-hover:scale-110 transition-transform"><GoogleDoodle /></div>
                     <span className="font-bold text-[#4A473F] font-['Nunito'] text-center">Import from<br/>Google</span>
                   </button>
                </div>

                <button onClick={onClose} className="font-['Caveat'] text-2xl text-[#A39E93] hover:text-[#4A473F] underline decoration-wavy decoration-[#E8E4D9]">
                  Skip this for now
                </button>
              </div>
            )}

          </div>

          {/* Progress Indicators */}
          <div className="bg-[#FAF9F6] border-t-2 border-[#E8E4D9] py-4 flex justify-center gap-3">
             <ProgressCircle active={step >= 1} />
             <ProgressCircle active={step >= 2} />
             <ProgressCircle active={step >= 3} />
          </div>

       </div>
    </div>
  );
}
