"use client";

import React, { useState, useRef, useEffect } from "react";
import { Info, Paperclip, Send, X, MoreVertical, Search, Phone, Video } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: string;
}

interface ChatWindowProps {
  conversation: {
    id: string;
    contactName: string;
    role: "Student" | "Parent" | "Staff" | "Broadcast";
    avatarColor: string;
    messages: Message[];
  } | null;
  onSendMessage: (text: string) => void;
}

export default function ChatWindow({ conversation, onSendMessage }: ChatWindowProps) {
  const [inputText, setInputText] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-[#F9F8F5] p-10 text-center">
        <div className="max-w-xs grayscale opacity-50">
          <svg width="120" height="120" viewBox="0 0 100 100" className="mx-auto mb-6">
             <path d="M10 30 C10 20 20 10 50 10 C80 10 90 20 90 30 L90 70 C90 80 80 90 50 90 C20 90 10 80 10 70 Z" fill="none" stroke="#2C2A24" strokeWidth="4" />
             <path d="M30 40 H70 M30 55 H50" stroke="#2C2A24" strokeWidth="4" strokeLinecap="round" />
          </svg>
          <h3 className="text-xl font-black text-[#2C2A24] mb-2" style={{ fontFamily: '"Nunito", sans-serif' }}>Select a conversation</h3>
          <p className="text-[#7A7670] font-bold text-sm">Choose a contact from the left list to start communicating.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-[#FDFBF5] relative overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-[84px] bg-white border-b-2 border-[#E8E4D9] px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div 
              className="w-10 h-10 rounded-full border-2 border-[#2C2A24] flex items-center justify-center font-black text-lg shadow-[2px_2px_0px_#2C2A24]"
              style={{ backgroundColor: conversation.avatarColor }}
            >
              {conversation.contactName[0]}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-[#2C2A24] truncate leading-tight" style={{ fontFamily: '"Nunito", sans-serif' }}>
                {conversation.contactName}
              </h3>
              <p className="text-[10px] font-black uppercase text-[#A39E93] tracking-widest">{conversation.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-[#7A7670] hover:text-[#2C2A24] hover:bg-[#FDFBF5] rounded-xl transition-all"><Search size={20} /></button>
            <button className="p-2 text-[#7A7670] hover:text-[#2C2A24] hover:bg-[#FDFBF5] rounded-xl transition-all"><Phone size={20} /></button>
            <button className="p-2 text-[#7A7670] hover:text-[#2C2A24] hover:bg-[#FDFBF5] rounded-xl transition-all"><Video size={20} /></button>
            <div className="w-0.5 h-6 bg-[#E8E4D9] mx-1" />
            <button 
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className={`p-2 rounded-xl transition-all ${isInfoOpen ? 'bg-[#F59E0B] border-2 border-[#2C2A24] shadow-[1px_1px_0px_#2C2A24]' : 'text-[#7A7670] hover:bg-[#FDFBF5]'}`}
            >
              <Info size={20} />
            </button>
          </div>
        </div>

        {/* Message History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#F9F8F5]"
        >
          {conversation.messages.map((msg, i) => (
            <div 
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[70%] p-4 text-sm font-bold shadow-[3px_3px_0px_rgba(0,0,0,0.1)] transition-all group relative ${
                  msg.sender === 'me' 
                  ? 'bg-[#F5A623] text-[#2C2A24] rounded-2xl rounded-tr-none border-2 border-[#2C2A24]' 
                  : 'bg-white text-[#2C2A24] rounded-2xl rounded-tl-none border-2 border-[#E8E4D9]'
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>
                <div 
                  className={`absolute bottom-[-20px] whitespace-nowrap text-[9px] font-bold text-[#A39E93] opacity-0 group-hover:opacity-100 transition-opacity ${
                    msg.sender === 'me' ? 'right-0' : 'left-0'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Compose Bar */}
        <div className="p-6 bg-white border-top-2 border-[#E8E4D9] shrink-0">
          <form onSubmit={handleSend} className="bg-[#FDFBF5] border-2 border-[#2C2A24] rounded-2xl p-1 flex items-end shadow-[3px_3px_0px_#E8E4D9] focus-within:border-[#F5A623] transition-colors overflow-hidden">
            <button 
              type="button" 
              className="p-3 text-[#A39E93] hover:text-[#F5A623] transition-colors"
            >
              <Paperclip size={20} />
            </button>
            <textarea 
              className="flex-1 bg-transparent border-none outline-none p-3 max-h-32 text-sm font-bold text-[#2C2A24] placeholder:text-[#A39E93] placeholder:font-bold resize-none"
              placeholder="Type a message..."
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className={`m-1 p-3 rounded-xl transition-all ${
                inputText.trim() 
                ? 'bg-[#F5A623] text-[#2C2A24] border-2 border-[#2C2A24] shadow-[2px_2px_0px_#2C2A24] active:shadow-none translate-y-0 active:translate-y-0.5' 
                : 'text-[#A39E93] grayscale opacity-50'
              }`}
            >
              <Send size={20} className={inputText.trim() ? "translate-x-0.5" : ""} />
            </button>
          </form>
        </div>
      </div>

      {/* Info Sidebar */}
      {isInfoOpen && (
        <div className="w-80 bg-white border-l-2 border-[#E8E4D9] flex flex-col animate-in slide-in-from-right duration-300">
           <div className="p-6 border-b-2 border-[#E8E4D9] flex justify-between items-center">
             <h4 className="font-black text-[#2C2A24] uppercase tracking-widest text-xs" style={{ fontFamily: '"Nunito", sans-serif' }}>Contact Info</h4>
             <button onClick={() => setIsInfoOpen(false)} className="text-[#A39E93] hover:text-[#2C2A24] transition-colors"><X size={20} /></button>
           </div>
           
           <div className="p-8 text-center border-b-2 border-[#F0ECE1]">
              <div 
                className="w-24 h-24 rounded-full border-4 border-[#2C2A24] mx-auto mb-4 flex items-center justify-center font-black text-3xl shadow-[4px_4px_0px_rgba(0,0,0,0.1)]"
                style={{ backgroundColor: conversation.avatarColor }}
              >
                {conversation.contactName[0]}
              </div>
              <h3 className="text-xl font-black text-[#2C2A24] mb-1" style={{ fontFamily: '"Nunito", sans-serif' }}>{conversation.contactName}</h3>
              <p className="text-sm font-bold text-[#7A7670]">{conversation.role}</p>
           </div>

           <div className="p-6 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase text-[#A39E93] tracking-widest block mb-2">Detailed Role</span>
                <p className="text-sm font-black text-[#2C2A24]">
                  {conversation.role === 'Student' ? 'Grade 8-A Student' : 
                   conversation.role === 'Parent' ? 'Parent of Gaurav (8-A)' : 
                   conversation.role === 'Staff' ? 'Department of Mathematics' : 
                   'High Priority Broadcast'}
                </p>
              </div>
              
              <div>
                <span className="text-[10px] font-black uppercase text-[#A39E93] tracking-widest block mb-2">Contact Number</span>
                <p className="text-sm font-black text-[#2C2A24]">+91 98XXX-XXXXX</p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-[#A39E93] tracking-widest block mb-2">School Email</span>
                <p className="text-sm font-black text-[#2C2A24]">
                  {conversation.contactName.toLowerCase().replace(' ', '.') + '@school.edu'}
                </p>
              </div>

              <div className="pt-4">
                <button className="w-full bg-[#E8534A]/10 text-[#E8534A] border-2 border-dashed border-[#E8534A] py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#E8534A]/20 transition-all">
                  Block Contact
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
