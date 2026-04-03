"use client";

import React from "react";
import { Book, FlaskConical, Trophy, Coffee, MapPin, Users } from "lucide-react";

interface TimetableCardProps {
  period: {
    subject: string;
    classSection: string;
    room: string;
    type: "Lecture" | "Lab" | "Sports" | "Free";
  };
}

const subjectColors: Record<string, { bg: string; text: string; border: string }> = {
  Mathematics: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  Science: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  English: { bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5" },
  History: { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" },
  Sports: { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  Art: { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  Default: { bg: "#F9FAFB", text: "#374151", border: "#E5E7EB" },
};

const TypeIcon = ({ type, size = 14 }: { type: string; size?: number }) => {
  switch (type) {
    case "Lecture": return <Book size={size} />;
    case "Lab": return <FlaskConical size={size} />;
    case "Sports": return <Trophy size={size} />;
    case "Free": return <Coffee size={size} />;
    default: return <Book size={size} />;
  }
};

export default function TimetableCard({ period }: TimetableCardProps) {
  const colors = subjectColors[period.subject] || subjectColors.Default;

  return (
    <div 
      className="h-full w-full p-2 rounded-xl border-2 shadow-[2px_2px_0px_#2C2A24] flex flex-col justify-between transition-all hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#2C2A24]"
      style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-xs font-black uppercase truncate max-w-[80%]" style={{ fontFamily: '"Nunito", sans-serif' }}>
          {period.subject}
        </h4>
        <TypeIcon type={period.type} />
      </div>

      <div className="mt-1 space-y-0.5">
        <div className="flex items-center gap-1 text-[10px] font-bold opacity-80">
          <Users size={10} />
          <span>{period.classSection}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold opacity-80">
          <MapPin size={10} />
          <span>RM {period.room}</span>
        </div>
      </div>
    </div>
  );
}
