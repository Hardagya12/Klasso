"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import { 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  LayoutGrid, 
  List,
  Sparkles,
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  DashboardStatCard, 
  NotebookTexture, 
  ScatteredDoodles,
  StackDoodle,
  ReportDoodle,
  LightbulbDoodle,
  ChartDoodle,
  SquigglySVG
} from "../../components/dashboard/DashboardComponents";
import AssignmentCard from "./components/AssignmentCard";
import CreateAssignmentModal from "./components/CreateAssignmentModal";
import SubmissionsDrawer from "./components/SubmissionsDrawer";

// --- Mock Data ---
const INITIAL_ASSIGNMENTS = [
  { id: "1", title: "Algebraic Expressions Quiz", subject: "Mathematics", classSection: "8-A", dueDate: "2024-04-10", totalMarks: 100, submissions: 24, totalStudents: 32, status: "Active" },
  { id: "2", title: "Photosynthesis Lab Report", subject: "Science", classSection: "8-C", dueDate: "2024-04-05", totalMarks: 50, submissions: 18, totalStudents: 28, status: "Active" },
  { id: "3", title: "Shakespeare Sonnets Analysis", subject: "English", classSection: "9-B", dueDate: "2024-04-02", totalMarks: 75, submissions: 30, totalStudents: 30, status: "Active" },
  { id: "4", title: "Industrial Revolution Timeline", subject: "History", classSection: "8-B", dueDate: "2024-04-08", totalMarks: 100, submissions: 12, totalStudents: 32, status: "Active" },
  { id: "5", title: "Geometry Basics Homework", subject: "Mathematics", classSection: "8-A", dueDate: "2024-03-25", totalMarks: 20, submissions: 32, totalStudents: 32, status: "Archived" },
  { id: "6", title: "Chemical Reactions Worksheet", subject: "Science", classSection: "10-A", dueDate: "2024-04-15", totalMarks: 40, submissions: 5, totalStudents: 25, status: "Active" },
  { id: "7", title: "Global Warming Essay", subject: "English", classSection: "8-A", dueDate: "2024-03-20", totalMarks: 100, submissions: 28, totalStudents: 32, status: "Archived" },
];

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [activeTab, setActiveTab] = useState<"Active" | "Archived">("Active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAssignments = assignments.filter(a => 
    a.status === activeTab && 
    (a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.subject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePublish = (newAssignment: any) => {
    setAssignments([newAssignment, ...assignments]);
  };

  const handleViewSubmissions = (id: string) => {
    const assignment = assignments.find(a => a.id === id);
    setSelectedAssignment(assignment);
    setIsDrawerOpen(true);
  };

  const handleEdit = (id: string) => {
    console.log("Edit assignment:", id);
    // Future expansion: Open edit modal
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFBF5] relative overflow-hidden" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <NotebookTexture />
      <ScatteredDoodles />
      <Sidebar />

      <main className="flex-1 ml-[240px] pl-10 pr-8 py-10 max-w-none relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-6">
          <div className="relative group">
            <div className="absolute -top-6 -left-6 opacity-0 group-hover:opacity-100 transition-opacity rotate-12">
              <Sparkles size={32} className="text-[#F5A623]" />
            </div>
            <h1 className="text-5xl font-black text-[#2C2A24] tracking-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
              Assignments
              <div className="mt-1">
                <SquigglySVG width={240} />
              </div>
            </h1>
            <p className="text-[#7A7670] font-bold mt-3 text-lg flex items-center gap-2">
              Empowering student growth through <span className="text-[#F5A623] underline decoration-wavy decoration-[#5BAD6F]">creative tasks</span>
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-[#F5A623] hover:bg-[#F59E0B] text-[#2C2A24] px-8 py-4 rounded-2xl border-4 border-[#2C2A24] font-black shadow-[6px_6px_0px_#2C2A24] transition-all hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none uppercase tracking-widest text-lg"
            style={{ fontFamily: '"Nunito", sans-serif' }}
          >
            <Plus size={24} strokeWidth={4} />
            Create Assignment
          </button>
        </div>

        {/* Summary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <DashboardStatCard 
            label="Total Assignments" 
            value={assignments.length.toString()} 
            color="#4A90D9" 
            icon={StackDoodle} 
            progress={75} 
          />
          <DashboardStatCard 
            label="Pending Grading" 
            value="5" 
            color="#F5A623" 
            icon={ReportDoodle} 
            progress={40} 
          />
          <DashboardStatCard 
            label="Avg Submissions" 
            value="84%" 
            color="#5BAD6F" 
            icon={ChartDoodle} 
            progress={84} 
          />
          <DashboardStatCard 
            label="Overdue Tasks" 
            value="2" 
            color="#E8534A" 
            icon={LightbulbDoodle} 
            progress={15} 
          />
        </div>

        {/* Filters & Tabs Bar */}
        <div className="bg-white rounded-3xl border-4 border-[#2C2A24] p-6 mb-8 shadow-[6px_6px_0px_#E8E4D9] flex flex-wrap gap-6 items-center justify-between">
          <div className="flex gap-2 bg-[#FDFBF5] p-2 rounded-2xl border-2 border-[#E8E4D9]">
            <button 
              onClick={() => setActiveTab("Active")}
              className={`px-8 py-2.5 rounded-xl font-black transition-all text-sm uppercase tracking-wider ${activeTab === "Active" ? 'bg-[#2C2A24] text-white' : 'text-[#7A7670] hover:bg-white'}`}
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveTab("Archived")}
              className={`px-8 py-2.5 rounded-xl font-black transition-all text-sm uppercase tracking-wider ${activeTab === "Archived" ? 'bg-[#2C2A24] text-white' : 'text-[#7A7670] hover:bg-white'}`}
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              Archived
            </button>
          </div>

          <div className="flex flex-1 max-w-md items-center gap-4">
             <div className="relative flex-1">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A39E93]" size={20} />
               <input 
                 type="text" 
                 placeholder="Search assignments or subjects..."
                 className="w-full bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-[#F5A623] font-bold text-[#2C2A24] placeholder:text-[#A39E93]"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <button className="bg-white border-2 border-[#E8E4D9] p-3 rounded-2xl text-[#2C2A24] hover:bg-[#FDFBF5] transition-all shadow-[3px_3px_0px_#E8E4D9] active:shadow-none">
               <Filter size={20} strokeWidth={3} />
             </button>
          </div>
        </div>

        {/* Assignments Grid */}
        {filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard 
                key={assignment.id} 
                assignment={assignment as any} 
                onViewSubmissions={handleViewSubmissions}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border-4 border-dashed border-[#E8E4D9] rounded-3xl p-20 flex flex-col items-center justify-center text-center">
            <div className="bg-[#FDFBF5] p-6 rounded-full border-4 border-[#E8E4D9] mb-6">
              <BookOpen size={64} className="text-[#A39E93]" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-[#2C2A24] mb-2" style={{ fontFamily: '"Nunito", sans-serif' }}>No Assignments Found</h3>
            <p className="text-[#7A7670] font-bold max-w-sm">
              {searchTerm ? "Try adjusting your search terms or filters." : `You don't have any ${activeTab.toLowerCase()} assignments yet.`}
            </p>
            {!searchTerm && activeTab === "Active" && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-6 text-[#F5A623] font-black underline decoration-wavy decoration-[#5BAD6F] hover:text-[#F59E0B]"
              >
                Create your first assignment
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modal & Drawer */}
      <CreateAssignmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPublish={handlePublish} 
      />
      
      <SubmissionsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        assignmentTitle={selectedAssignment?.title || ""} 
      />
    </div>
  );
}