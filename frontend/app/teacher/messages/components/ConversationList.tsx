"use client";

import React from "react";
import { Search, Plus } from "lucide-react";

interface Conversation {
  id: string;
  contactName: string;
  role: "Student" | "Parent" | "Staff" | "Broadcast";
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatarColor: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewMessage: () => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const roleColors = {
  Student: { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  Parent: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0" },
  Staff: { bg: "#FAF5FF", text: "#7E22CE", border: "#E9D5FF" },
  Broadcast: { bg: "#FFF7ED", text: "#C2410C", border: "#FFEDD5" },
};

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNewMessage,
  activeFilter,
  setActiveFilter,
  searchTerm,
  setSearchTerm
}: ConversationListProps) {
  
  const filters = ["All", "Students", "Parents", "Staff"];

  const filteredConversations = conversations.filter((c) => {
    const matchesFilter = 
      activeFilter === "All" || 
      (activeFilter === "Students" && c.role === "Student") ||
      (activeFilter === "Parents" && c.role === "Parent") ||
      (activeFilter === "Staff" && c.role === "Staff");
    
    const matchesSearch = c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col bg-white border-r-2 border-[#E8E4D9]">
      {/* Header */}
      <div className="p-6 border-b-2 border-[#E8E4D9]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-[#2C2A24]" style={{ fontFamily: '"Nunito", sans-serif' }}>Messages</h2>
          <button 
            onClick={onNewMessage}
            className="p-2 bg-[#F5A623] border-2 border-[#2C2A24] rounded-xl shadow-[2px_2px_0px_#2C2A24] hover:bg-[#F59E0B] transition-all active:translate-y-0.5 active:shadow-none"
          >
            <Plus size={20} strokeWidth={3} className="text-[#2C2A24]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E93]" size={18} />
          <input 
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-[#FDFBF5] border-2 border-[#E8E4D9] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold text-[#2C2A24] focus:outline-none focus:border-[#F5A623] transition-colors placeholder:text-[#A39E93]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1 bg-[#F9F8F5] p-1 rounded-xl border border-[#E8E4D9]">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                activeFilter === filter ? 'bg-[#2C2A24] text-white shadow-[1px_1px_0px_rgba(0,0,0,0.1)]' : 'text-[#7A7670] hover:bg-white'
              }`}
              style={{ fontFamily: '"Nunito", sans-serif' }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredConversations.map((conv) => {
          const colors = roleColors[conv.role];
          const isActive = activeId === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`p-4 border-b border-[#F0ECE1] cursor-pointer transition-all flex gap-4 ${
                isActive ? 'bg-[#FEF3DC] border-l-4 border-l-[#F5A623]' : 'hover:bg-[#FDFBF5]'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-full border-2 border-[#2C2A24] flex items-center justify-center shrink-0 font-black text-lg shadow-[2px_2px_0px_#2C2A24]"
                style={{ backgroundColor: conv.avatarColor }}
              >
                {conv.contactName[0]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-[#2C2A24] truncate leading-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
                    {conv.contactName}
                  </h4>
                  <span className="text-[10px] font-bold text-[#A39E93] whitespace-nowrap">{conv.timestamp}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border"
                    style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
                  >
                    {conv.role}
                  </span>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-black text-[#2C2A24]' : 'font-medium text-[#7A7670]'}`}>
                    {conv.lastMessage}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="bg-[#E8534A] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-[1px_1px_0px_#2C2A24] border border-[#2C2A24]">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredConversations.length === 0 && (
          <div className="p-10 text-center text-[#A39E93]">
            <p className="text-sm font-bold">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
