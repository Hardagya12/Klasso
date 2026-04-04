"use client";
import React, { useState, useEffect } from "react";
import { apiData } from "../../lib/api";

type ClassXP = {
  id: string;
  currentLevel: number;
  currentTitle: string;
  totalXP: number;
  xpToNextLevel: number;
  progressPct: number;
  events?: Array<any>;
};

export default function ClassXPModule({ classId, className }: { classId: string, className: string }) {
  const [xp, setXp] = useState<ClassXP | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(25);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (classId) {
      apiData<any>(`/api/xp/class/${classId}`).then((res: any) => {
         if (res && res.id) setXp(res);
      }).catch(console.warn);
    }
  }, [classId]);

  const handleAwardBonus = async () => {
    if (!reason) return alert("Please enter a reason.");
    setSaving(true);
    try {
      await apiData(`/api/xp/class/${classId}/bonus`, {
        method: "POST",
        body: JSON.stringify({ xp: bonusAmount, reason })
      });
      setModalOpen(false);
      setReason("");
      
      // Refresh XP
      const res = await apiData<any>(`/api/xp/class/${classId}`);
      if (res && res.id) setXp(res);
      
    } catch(err) {
      alert("Failed to award bonus.");
    }
    setSaving(false);
  };

  if (!xp) return null;

  return (
    <div className="bg-white rounded-2xl p-6 relative" style={{ boxShadow: "4px 4px 0px #1C2B27", border: "1.5px solid #D4EDE8" }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold font-heading text-primary">Class XP · {className}</h3>
          <p className="text-muted text-sm flex items-center gap-2">
            <span className="font-caveat text-xl text-mint">{xp.currentTitle}</span>
            (Level {xp.currentLevel})
          </p>
        </div>
        <button 
           onClick={() => setModalOpen(true)}
           className="bg-yellow text-primary px-4 py-2 font-heading font-bold rounded-full border-2 border-primary"
           style={{ boxShadow: "2px 2px 0px #1C2B27" }}
        >
           + Award Bonus
        </button>
      </div>

      <div className="relative h-4 bg-bg rounded-full overflow-hidden mt-4">
        <div className="absolute top-0 left-0 h-full bg-mint transition-all duration-700" style={{ width: `${xp.progressPct}%` }}></div>
      </div>
      <div className="flex justify-between text-xs font-body text-muted mt-2">
        <span>{xp.totalXP} XP</span>
        <span>{xp.xpToNextLevel} limit</span>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm border-2 border-primary shadow-retro">
            <h2 className="text-2xl font-caveat font-bold text-mint mb-4">Award Bonus XP</h2>
            
            <label className="block text-sm font-bold font-heading mb-1">XP Amount: {bonusAmount}</label>
            <input 
               type="range" min="10" max="100" step="5"
               value={bonusAmount}
               onChange={(e) => setBonusAmount(Number(e.target.value))}
               className="w-full mb-4 accent-mint"
            />

            <label className="block text-sm font-bold font-heading mb-1">Reason</label>
            <input 
               type="text" 
               maxLength={60}
               placeholder="e.g. Great teamwork today!"
               value={reason}
               onChange={(e) => setReason(e.target.value)}
               className="w-full bg-bg border-2 border-[#D4EDE8] rounded-xl px-4 py-2 font-body mb-4 focus:outline-none focus:border-mint"
            />

            <div className="bg-bg/50 p-3 rounded-lg mb-6 border border-mint/20">
               <p className="text-sm font-body italic text-muted">Preview: Your class will receive +{bonusAmount} XP for: "{reason || '...'}"</p>
            </div>

            <div className="flex gap-4">
              <button 
                 onClick={() => setModalOpen(false)}
                 className="flex-1 px-4 py-2 font-heading font-bold rounded-xl border-2 border-[#D4EDE8] text-muted hover:bg-bg"
              >Cancel</button>
              <button 
                 onClick={handleAwardBonus}
                 disabled={saving}
                 className="flex-1 bg-mint text-white px-4 py-2 font-heading font-bold rounded-xl shadow-retro hover:-translate-y-1 transition disabled:opacity-50 disabled:transform-none shadow-[2px_2px_0px_#1C2B27]"
              >Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
