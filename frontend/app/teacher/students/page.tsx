"use client";

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Link from "next/link";
import { Search, SlidersHorizontal, Plus, ChevronRight, Eye, Mail, MoreVertical } from "lucide-react";

// --- Doodles & Icons ---
const GroupDoodle = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-6">
    <path d="M50 45C58.2843 45 65 38.2843 65 30C65 21.7157 58.2843 15 50 15C41.7157 15 35 21.7157 35 30C35 38.2843 41.7157 45 50 45Z" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 85C20 68.4315 33.4315 55 50 55C66.5685 55 80 68.4315 80 85" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M25 40C30 40 34 36 34 31C34 26 30 22 25 22C20 22 16 26 16 31C16 36 20 40 25 40Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 75C5 63 13 53 24 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M75 40C80 40 84 36 84 31C84 26 80 22 75 22C70 22 66 26 66 31C66 36 70 40 75 40Z" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M95 75C95 63 87 53 76 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UnderlineDoodle = () => (
  <svg width="100%" height="8" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
    <path d="M2 5C50 2 150 7 198 3" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

// --- Mock Data ---
const MOCK_STUDENTS = [
  { id: 1, name: "Aarav Patel", rollNo: "01", classSection: "8-A", status: "Active", attendance: "98%", avatar: "https://i.pravatar.cc/150?u=1" },
  { id: 2, name: "Isha Sharma", rollNo: "14", classSection: "8-A", status: "At Risk", attendance: "76%", avatar: "https://i.pravatar.cc/150?u=2" },
  { id: 3, name: "Rohan Gupta", rollNo: "22", classSection: "8-B", status: "Active", attendance: "92%", avatar: "https://i.pravatar.cc/150?u=3" },
  { id: 4, name: "Meera Singh", rollNo: "18", classSection: "8-A", status: "Fee Pending", attendance: "88%", avatar: "https://i.pravatar.cc/150?u=4" },
  { id: 5, name: "Karan Desai", rollNo: "05", classSection: "9-C", status: "Active", attendance: "95%", avatar: "https://i.pravatar.cc/150?u=5" },
  { id: 6, name: "Ananya Reddy", rollNo: "31", classSection: "10-A", status: "Active", attendance: "100%", avatar: "https://i.pravatar.cc/150?u=6" },
  { id: 7, name: "Vikram Malhotra", rollNo: "11", classSection: "8-B", status: "At Risk", attendance: "81%", avatar: "https://i.pravatar.cc/150?u=7" },
  { id: 8, name: "Neha Verma", rollNo: "27", classSection: "9-A", status: "Active", attendance: "93%", avatar: "https://i.pravatar.cc/150?u=8" },
];

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("All");

  const filteredStudents = MOCK_STUDENTS.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || student.rollNo.includes(searchTerm);
    const matchesClass = filterClass === "All" || student.classSection.startsWith(filterClass);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Sidebar />

      <main className="flex-1 ml-[210px] pl-6 pr-8 py-10 max-w-none relative">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-blue-600 bg-blue-100 p-3 rounded-2xl transform rotate-3 shadow-[4px_4px_0px_#2563EB,-4px_-4px_0_#fff,-4px_-4px_0_2px_#E8E4D9]">
              <GroupDoodle />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-[#2C2A24]" style={{ fontFamily: '"Nunito", sans-serif' }}>
                Student Directory
              </h1>
              <p className="text-[#7A7670] font-medium mt-1 text-base flex items-center gap-2">
                Manage all student profiles and records <span className="text-amber-500 text-xl font-bold font-[Caveat] underline decoration-wavy decoration-red-400">1,240 records</span>
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white px-6 py-3 rounded-xl font-bold shadow-[4px_4px_0px_#B45309] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_#B45309]">
            <Plus size={20} strokeWidth={3} />
            <span style={{ fontFamily: '"Nunito", sans-serif' }} className="tracking-wide">Add Student</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border-2 border-[#E8E4D9] p-4 shadow-sm mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex bg-[#F9F8F5] border-2 border-[#E8E4D9] rounded-xl px-4 py-2 flex-1 min-w-[250px] focus-within:border-blue-400 transition-colors">
            <Search className="text-[#A39E93] mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Search by name, roll no..."
              className="bg-transparent border-none outline-none w-full text-[#4A473F] placeholder-[#A39E93] font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                className="appearance-none bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-2 pr-10 text-[#4A473F] font-medium cursor-pointer hover:bg-gray-50 focus:outline-none focus:border-amber-400"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="All">All Classes</option>
                <option value="8">Class 8</option>
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#A39E93]">
                <ChevronRight className="transform rotate-90" size={16} strokeWidth={3} />
              </div>
            </div>

            <button className="flex items-center gap-2 bg-white border-2 border-[#E8E4D9] hover:bg-gray-50 text-[#4A473F] px-4 py-2 rounded-xl font-bold transition-all shadow-[2px_2px_0px_#E8E4D9]">
              <SlidersHorizontal size={18} />
              <span>More Filters</span>
            </button>
          </div>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-2xl border-2 border-[#E8E4D9] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FDFBF5] border-b-2 border-[#E8E4D9] text-[#7A7670] uppercase text-xs tracking-wider" style={{ fontFamily: '"Nunito", sans-serif' }}>
                  <th className="px-6 py-4 font-bold">Roll No.</th>
                  <th className="px-6 py-4 font-bold">Student Name</th>
                  <th className="px-6 py-4 font-bold">Class Section</th>
                  <th className="px-6 py-4 font-bold">Attendance</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-dashed divide-[#F0ECE1]">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#FCFAFA] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-[#A39E93]" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.2rem' }}>
                        #{student.rollNo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 relative">
                          <img className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm" src={student.avatar} alt="" />
                          <div className="absolute inset-0 border-2 border-amber-300 rounded-full transform rotate-12 scale-110 pointer-events-none opacity-50 group-hover:rotate-[24deg] transition-transform" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[#2C2A24]" style={{ fontFamily: '"Nunito", sans-serif' }}>
                            {student.name}
                          </div>
                          <div className="text-xs text-[#A39E93]">ID: STU-2024-{student.id.toString().padStart(3, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-blue-700 font-bold">
                        {student.classSection}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 w-32">
                        <div className="flex justify-between text-xs font-bold font-body">
                          <span className={parseInt(student.attendance) < 80 ? "text-red-500" : "text-[#4A473F]"}>{student.attendance}</span>
                        </div>
                        <div className="w-full bg-[#F0ECE1] rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full ${parseInt(student.attendance) < 80 ? 'bg-red-400' : 'bg-green-400'}`} 
                            style={{ width: student.attendance }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border-2 
                        ${student.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                          student.status === 'At Risk' ? 'bg-red-50 text-red-700 border-red-200' : 
                          'bg-amber-50 text-amber-700 border-amber-200'}`}
                      style={{ fontFamily: '"Nunito", sans-serif' }}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/student/${student.id}`}>
                          <button className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors border-2 border-transparent hover:border-blue-200" title="View Profile">
                            <Eye size={18} />
                          </button>
                        </Link>
                        <button className="text-[#A39E93] hover:text-[#4A473F] hover:bg-[#F9F8F5] p-2 rounded-lg transition-colors border-2 border-transparent hover:border-[#E8E4D9]" title="Message Parent">
                          <Mail size={18} />
                        </button>
                        <button className="text-[#A39E93] hover:text-[#4A473F] p-1" title="More Actions">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredStudents.length === 0 && (
              <div className="p-12 text-center text-[#A39E93]">
                <div className="inline-block bg-[#F9F8F5] rounded-full p-4 mb-4">
                  <Search size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#4A473F] font-['Nunito'] mb-1">No students found</h3>
                <p>Try adjusting your search or filters to find what you're looking for.</p>
              </div>
            )}
          </div>
          
          {/* Pagination Footer */}
          <div className="bg-[#FDFBF5] border-t-2 border-[#E8E4D9] px-6 py-4 flex items-center justify-between">
            <span className="text-[#A39E93] text-sm font-medium">Showing <b className="text-[#4A473F]">{filteredStudents.length}</b> of <b className="text-[#4A473F]">{MOCK_STUDENTS.length}</b> students</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border-2 border-[#E8E4D9] bg-white text-[#4A473F] font-bold text-sm hover:bg-[#F9F8F5] disabled:opacity-50">Previous</button>
              <button className="px-4 py-2 rounded-lg border-2 border-[#E8E4D9] bg-white text-[#4A473F] font-bold text-sm hover:bg-[#F9F8F5]">Next</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}