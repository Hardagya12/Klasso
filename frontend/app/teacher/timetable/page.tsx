"use client";

import React, { useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Plus,
  Users,
  LayoutGrid,
  Search,
  Sparkles
} from "lucide-react";
import { 
  DashboardStatCard, 
  NotebookTexture, 
  ScatteredDoodles,
  SquigglySVG
} from "../../components/dashboard/DashboardComponents";
import TimetableGrid from "./components/TimetableGrid";
import AddPeriodModal from "./components/AddPeriodModal";
import WorkloadSidebar from "./components/WorkloadSidebar";

// --- Mock Data ---
const MOCK_TEACHERS = [
  { id: "T1", name: "Mrs. Anjali Gupta" },
  { id: "T2", name: "Prof. Rajesh Sharma" },
];

const MOCK_CLASSES = ["Grade 8-A", "Grade 8-B", "Grade 8-C", "Grade 9-A"];

const INITIAL_TIMETABLE_DATA = [
  // Teacher 1 (Anjali) schedule
  { day: 0, timeSlot: 0, subject: "Mathematics", classSection: "Grade 8-A", room: "101", type: "Lecture", teacherId: "T1" },
  { day: 0, timeSlot: 2, subject: "Mathematics", classSection: "Grade 8-B", room: "102", type: "Lecture", teacherId: "T1" },
  { day: 1, timeSlot: 1, subject: "Mathematics", classSection: "Grade 8-A", room: "101", type: "Lecture", teacherId: "T1" },
  { day: 2, timeSlot: 0, subject: "Mathematics", classSection: "Grade 8-C", room: "103", type: "Lecture", teacherId: "T1" },
  { day: 3, timeSlot: 3, subject: "Mathematics", classSection: "Grade 8-B", room: "102", type: "Lab",     teacherId: "T1" },
  { day: 4, timeSlot: 1, subject: "Mathematics", classSection: "Grade 8-A", room: "101", type: "Lecture", teacherId: "T1" },
  { day: 5, timeSlot: 0, subject: "Mathematics", classSection: "Grade 8-C", room: "103", type: "Lecture", teacherId: "T1" },

  // Teacher 2 (Rajesh) schedule
  { day: 0, timeSlot: 1, subject: "Science",  classSection: "Grade 8-A", room: "201", type: "Lab",     teacherId: "T2" },
  { day: 1, timeSlot: 0, subject: "Science",  classSection: "Grade 8-C", room: "203", type: "Lecture", teacherId: "T2" },
  { day: 2, timeSlot: 2, subject: "Science",  classSection: "Grade 8-B", room: "202", type: "Lecture", teacherId: "T2" },
  { day: 4, timeSlot: 0, subject: "Science",  classSection: "Grade 8-A", room: "201", type: "Lecture", teacherId: "T2" },
];

export default function TimetablePage() {
  const [activeView, setActiveView] = useState<"My Schedule" | "Class View">("My Schedule");
  const [selectedClass, setSelectedClass] = useState(MOCK_CLASSES[0]);
  const [periods, setPeriods] = useState(INITIAL_TIMETABLE_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<{day?: number, slot?: number}>({});
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);

  // Filter periods based on view
  const currentTeacherId = "T1"; // Assuming logged in as Anjali
  
  const filteredPeriods = useMemo(() => {
    if (activeView === "My Schedule") {
      return periods.filter(p => p.teacherId === currentTeacherId);
    } else {
      return periods.filter(p => p.classSection === selectedClass);
    }
  }, [periods, activeView, selectedClass]);

  // Week Selector Logic (Mocked for now)
  const [weekOffset, setWeekOffset] = useState(0);
  const dateRange = useMemo(() => {
    const today = new Date();
    const first = today.getDate() - today.getDay() + 1 + (weekOffset * 7);
    const last = first + 5;
    const firstDay = new Date(today.setDate(first));
    const lastDay = new Date(today.setDate(last));
    return `${firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [weekOffset]);

  const handleAddSlot = (day: number, slot: number) => {
    setModalInitial({ day, slot });
    setConflictMsg(null);
    setIsModalOpen(true);
  };

  const handleSavePeriod = (newPeriod: any) => {
    // Re-check conflict just in case
    const conflict = detectConflict(newPeriod);
    if (conflict) {
      setConflictMsg(conflict);
      return;
    }
    
    setPeriods([...periods, { ...newPeriod, teacherId: currentTeacherId }]);
    setIsModalOpen(false);
  };

  const detectConflict = (data: any) => {
    // Check if teacher is already busy
    const teacherConflict = periods.find(p => p.teacherId === currentTeacherId && p.day === data.day && p.timeSlot === data.timeSlot);
    if (teacherConflict) return `You are already teaching ${teacherConflict.subject} to ${teacherConflict.classSection} at this time.`;

    // Check if class is already busy
    const classConflict = periods.find(p => p.classSection === data.classSection && p.day === data.day && p.timeSlot === data.timeSlot);
    if (classConflict) return `${data.classSection} is already scheduled for ${classConflict.subject} in RM ${classConflict.room}.`;

    return null;
  };

  return (
    <div className="flex min-h-screen bg-[#FDFBF5] relative overflow-hidden" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <NotebookTexture />
      <ScatteredDoodles />
      <Sidebar />

      <main className="flex-1 ml-[240px] pl-10 pr-8 py-10 max-w-none relative z-10 flex flex-col">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-6">
          <div className="relative group">
            <h1 className="text-5xl font-black text-[#2C2A24] tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Timetable
              <div className="mt-1">
                <SquigglySVG width={240} color="#4A90D9" />
              </div>
            </h1>
            <p className="text-[#7A7670] font-bold mt-3 text-lg flex items-center gap-2">
              Stay organized, stay <span className="text-[#4A90D9] underline decoration-wavy decoration-[#F5A623]">unstoppable</span> 
              <Sparkles size={18} className="text-[#F5A623]" />
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Week Selector */}
            <div className="bg-white border-4 border-[#2C2A24] rounded-2xl p-1 flex items-center shadow-[4px_4px_0px_#2C2A24]">
              <button 
                onClick={() => setWeekOffset(prev => prev - 1)}
                className="p-2 hover:bg-[#F9F8F5] rounded-xl transition-all"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <div className="px-6 flex items-center gap-3 border-x-2 border-[#E8E4D9]">
                <CalendarIcon size={18} className="text-[#A39E93]" />
                <span className="font-black text-sm text-[#2C2A24] uppercase tracking-wider" style={{ fontFamily: '"Nunito", sans-serif' }}>
                  {weekOffset === 0 ? "Current Week" : dateRange}
                </span>
              </div>
              <button 
                onClick={() => setWeekOffset(prev => prev + 1)}
                className="p-2 hover:bg-[#F9F8F5] rounded-xl transition-all"
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>

            <button 
              onClick={() => handleAddSlot(0, 0)}
              className="bg-[#F59E0B] hover:bg-amber-400 text-[#2C2A24] px-6 py-4 rounded-2xl border-4 border-[#2C2A24] font-black shadow-[6px_6px_0px_#2C2A24] transition-all active:translate-y-1 active:shadow-none uppercase tracking-widest text-sm flex items-center gap-2"
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              <Plus size={20} strokeWidth={4} />
              Add Period
            </button>
          </div>
        </div>

        {/* View Controls & List Grid */}
        <div className="flex gap-8 items-start mb-10 overflow-hidden">
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            {/* Toggles */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2 bg-[#E8E4D9]/30 p-1.5 rounded-2xl border-2 border-[#E8E4D9]">
                <button 
                  onClick={() => setActiveView("My Schedule")}
                  className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeView === "My Schedule" ? 'bg-[#2C2A24] text-white shadow-[2px_2px_0px_rgba(0,0,0,0.2)]' : 'text-[#7A7670] hover:bg-[#E8E4D9]'}`}
                  style={{ fontFamily: '"Nunito", sans-serif' }}
                >
                  My Schedule
                </button>
                <button 
                  onClick={() => setActiveView("Class View")}
                  className={`px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeView === "Class View" ? 'bg-[#2C2A24] text-white shadow-[2px_2px_0px_rgba(0,0,0,0.2)]' : 'text-[#7A7670] hover:bg-[#E8E4D9]'}`}
                  style={{ fontFamily: '"Nunito", sans-serif' }}
                >
                  Class View
                </button>
              </div>

              {activeView === "Class View" && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-[#A39E93] uppercase tracking-widest">Selected Class:</span>
                  <select 
                    className="bg-white border-4 border-[#2C2A24] rounded-xl px-4 py-2 font-black text-xs shadow-[3px_3px_0px_#E8E4D9] focus:outline-none"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {MOCK_CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Grid */}
            <TimetableGrid 
              periods={filteredPeriods} 
              onAddSlot={handleAddSlot} 
            />
          </div>

          {/* Workload Analysis Sidebar */}
          <div className="shrink-0 pt-16">
            <WorkloadSidebar periods={periods.filter(p => p.teacherId === currentTeacherId)} />
          </div>
        </div>
      </main>

      <AddPeriodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePeriod}
        conflict={conflictMsg}
        initialDay={modalInitial.day}
        initialSlot={modalInitial.slot}
      />
    </div>
  );
}