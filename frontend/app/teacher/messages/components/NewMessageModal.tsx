"use client";

import React, { useState } from "react";
import { X, Search, User, Users, Mail, Send, Sparkles, CheckSquare, Square } from "lucide-react";

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: any) => void;
}

const MOCK_CONTACTS = [
  { id: "s1", name: "Aarav Patel", role: "Student" },
  { id: "s2", name: "Isha Sharma", role: "Student" },
  { id: "p1", name: "Mr. Gupta", role: "Parent" },
  { id: "p2", name: "Mrs. Reddy", role: "Parent" },
  { id: "st1", name: "HOD Science", role: "Staff" },
  { id: "st2", name: "Vikram Singh", role: "Staff" },
];

const MOCK_CLASSES = ["Grade 8-A", "Grade 8-B", "Grade 8-C", "Grade 9-A"];

export default function NewMessageModal({ isOpen, onClose, onSend }: NewMessageModalProps) {
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [selectedTo, setSelectedTo] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSend({
      isBroadcast,
      to: isBroadcast ? selectedClasses : selectedTo,
      subject,
      message,
    });
    onClose();
  };

  const toggleTo = (id: string) => {
    setSelectedTo(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleClass = (cls: string) => {
    setSelectedClasses(prev => prev.includes(cls) ? prev.filter(i => i !== cls) : [...prev, cls]);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-[#FDFBF5] w-full max-w-xl rounded-3xl border-4 border-[#2C2A24] shadow-[8px_8px_0px_#2C2A24] overflow-hidden"
        style={{ fontFamily: '"DM Sans", sans-serif' }}
      >
        {/* Header */}
        <div className="bg-[#F5A623] border-b-4 border-[#2C2A24] p-6 flex justify-between items-center relative">
          <div className="absolute top-2 right-12 opacity-20 transform -rotate-12">
             <Sparkles size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#2C2A24] flex items-center gap-3" style={{ fontFamily: '"Nunito", sans-serif' }}>
            <Mail size={28} strokeWidth={3} />
            Compose Message
          </h2>
          <button 
            onClick={onClose}
            className="bg-white border-2 border-[#2C2A24] p-1.5 rounded-lg hover:bg-[#FDFBF5] transition-all shadow-[2px_2px_0px_#2C2A24] active:shadow-none active:translate-y-0.5"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Broadcast Toggle */}
          <button 
            type="button"
            onClick={() => setIsBroadcast(!isBroadcast)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
              isBroadcast 
              ? 'bg-[#FEF3DC] border-[#F5A623] shadow-[4px_4px_0px_rgba(245,166,35,0.2)]' 
              : 'bg-white border-[#E8E4D9] hover:bg-[#FDFBF5]'
            }`}
          >
            {isBroadcast ? <CheckSquare className="text-[#F5A623]" size={20} strokeWidth={3} /> : <Square className="text-[#A39E93]" size={20} strokeWidth={2} />}
            <div className="text-left">
              <span className="block text-xs font-black uppercase text-[#2C2A24] tracking-widest leading-none mb-1">Broadcast Announcement</span>
              <span className="text-[10px] font-bold text-[#7A7670]">Send message to all students & parents in specific classes</span>
            </div>
          </button>

          {!isBroadcast ? (
            /* To Field Individual */
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-[#2C2A24] tracking-widest pl-1">To: (Recipients)</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-[#A39E93]" size={16} />
                <input 
                  type="text"
                  placeholder="Search students, parents, or staff..."
                  className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#F5A623] shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="max-h-32 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 p-1">
                 {MOCK_CONTACTS.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(contact => (
                   <button
                     key={contact.id}
                     type="button"
                     onClick={() => toggleTo(contact.id)}
                     className={`px-3 py-1.5 rounded-lg border-2 text-[10px] font-black transition-all ${
                       selectedTo.includes(contact.id) 
                       ? 'bg-[#F5A623] border-[#2C2A24] text-[#2C2A24] shadow-[2px_2px_0px_#2C2A24]' 
                       : 'bg-white border-[#E8E4D9] text-[#7A7670] hover:border-[#2C2A24]'
                     }`}
                   >
                     {contact.name} ({contact.role})
                   </button>
                 ))}
              </div>
            </div>
          ) : (
            /* To Field Classes */
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase text-[#2C2A24] tracking-widest pl-1">Select Target Classes:</label>
              <div className="flex flex-wrap gap-2">
                 {MOCK_CLASSES.map(cls => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClass(cls)}
                      className={`px-4 py-2 rounded-xl border-2 font-black text-xs transition-all ${
                        selectedClasses.includes(cls)
                        ? 'bg-[#4A90D9] border-[#2C2A24] text-white shadow-[3px_3px_0px_#2C2A24]'
                        : 'bg-white border-[#E8E4D9] text-[#7A7670] hover:bg-[#FDFBF5]'
                      }`}
                    >
                      {cls}
                    </button>
                 ))}
              </div>
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-[#2C2A24] tracking-widest pl-1">Subject (Optional):</label>
            <input 
              type="text"
              placeholder="What is this message about?"
              className="w-full bg-white border-2 border-[#E8E4D9] rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-[#F5A623] shadow-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase text-[#2C2A24] tracking-widest pl-1">Message:</label>
            <textarea 
              rows={4}
              placeholder="Type your message here..."
              className="w-full bg-white border-2 border-[#E8E4D9] rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-[#F5A623] shadow-sm resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border-4 border-[#2C2A24] text-[#2C2A24] font-black py-4 rounded-2xl shadow-[4px_4px_0px_#2C2A24] hover:bg-[#FDFBF5] transition-all active:translate-y-1 active:shadow-none uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={(!isBroadcast && selectedTo.length === 0) || (isBroadcast && selectedClasses.length === 0) || !message.trim()}
              className={`flex-1 bg-[#F5A623] border-4 border-[#2C2A24] text-[#2C2A24] font-black py-4 rounded-2xl shadow-[4px_4px_0px_#2C2A24] hover:bg-[#F59E0B] transition-all active:translate-y-1 active:shadow-none uppercase tracking-widest text-xs flex items-center justify-center gap-2 ${
                ((!isBroadcast && selectedTo.length === 0) || (isBroadcast && selectedClasses.length === 0) || !message.trim()) ? 'opacity-50 grayscale cursor-not-allowed' : ''
              }`}
            >
              <Send size={16} strokeWidth={3} />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
