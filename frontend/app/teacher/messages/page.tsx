"use client";

import React, { useState, useMemo } from "react";
import Sidebar from "../../components/Sidebar";
import { NotebookTexture, ScatteredDoodles } from "../../components/dashboard/DashboardComponents";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import NewMessageModal from "./components/NewMessageModal";

// --- Mock Data ---
const INITIAL_CONVERSATIONS = [
  {
    id: "1",
    contactName: "Aarav Patel",
    role: "Student",
    avatarColor: "#D6EAF8",
    lastMessage: "I finished the homework assignment early!",
    timestamp: "10:30 AM",
    unreadCount: 2,
    messages: [
      { id: "m1", text: "Hello teacher, can you help me with question 4?", sender: "them", timestamp: "Yesterday" },
      { id: "m2", text: "Of course Aarav, what part is confusing?", sender: "me", timestamp: "Yesterday" },
      { id: "m3", text: "The part about the square root of 256.", sender: "them", timestamp: "Yesterday" },
      { id: "m4", text: "I finished the homework assignment early!", sender: "them", timestamp: "10:30 AM" },
    ],
  },
  {
    id: "2",
    contactName: "Mr. Gupta",
    role: "Parent",
    avatarColor: "#D1F2EB",
    lastMessage: "Will there be a parent-teacher meeting this Friday?",
    timestamp: "9:45 AM",
    unreadCount: 1,
    messages: [
      { id: "m5", text: "Hello Mrs. Sharma, just checking on Rohan's progress.", sender: "them", timestamp: "Two days ago" },
      { id: "m6", text: "He is doing very well, especially in Math.", sender: "me", timestamp: "Yesterday" },
      { id: "m7", text: "Will there be a parent-teacher meeting this Friday?", sender: "them", timestamp: "9:45 AM" },
    ],
  },
  {
    id: "3",
    contactName: "HOD Science",
    role: "Staff",
    avatarColor: "#F5EEF8",
    lastMessage: "The department meeting has been moved to Monday.",
    timestamp: "Yesterday",
    unreadCount: 0,
    messages: [
      { id: "m8", text: "Please submit your monthly reports by 5 PM today.", sender: "them", timestamp: "Three days ago" },
      { id: "m9", text: "The department meeting has been moved to Monday.", sender: "them", timestamp: "Yesterday" },
    ],
  },
  {
    id: "4",
    contactName: "Isha Sharma",
    role: "Student",
    avatarColor: "#FCF3CF",
    lastMessage: "Thank you for the feedback on my essay!",
    timestamp: "Monday",
    unreadCount: 0,
    messages: [
      { id: "m10", text: "Great job on the essay Isha. Your analysis was deep.", sender: "me", timestamp: "Last week" },
      { id: "m11", text: "Thank you for the feedback on my essay!", sender: "them", timestamp: "Monday" },
    ],
  },
  {
    id: "5",
    contactName: "Mrs. Reddy",
    role: "Parent",
    avatarColor: "#FDEDEC",
    lastMessage: "Ananya will be absent today due to a fever.",
    timestamp: "2h ago",
    unreadCount: 0,
    messages: [
      { id: "m12", text: "Ananya will be absent today due to a fever.", sender: "them", timestamp: "2h ago" },
      { id: "m13", text: "Received. Hope she recovers soon!", sender: "me", timestamp: "1h ago" },
    ],
  },
  {
    id: "6",
    contactName: "Grade 8-A Parents",
    role: "Broadcast",
    avatarColor: "#FFF2E0",
    lastMessage: "Reminder: Science field trip forms are due tomorrow.",
    timestamp: "11:00 AM",
    unreadCount: 0,
    messages: [
      { id: "m14", text: "Reminder: Science field trip forms are due tomorrow.", sender: "me", timestamp: "11:00 AM" },
    ],
  },
  {
    id: "7",
    contactName: "Vikram Singh",
    role: "Staff",
    avatarColor: "#EBEDEF",
    lastMessage: "Can you swap your Friday lab period with me?",
    timestamp: "Wednesday",
    unreadCount: 0,
    messages: [
      { id: "m15", text: "Can you swap your Friday lab period with me?", sender: "them", timestamp: "Wednesday" },
    ],
  },
  {
    id: "8",
    contactName: "Meera Singh",
    role: "Student",
    avatarColor: "#D6EAF8",
    lastMessage: "Is the test going to be all multiple choice?",
    timestamp: "Today",
    unreadCount: 0,
    messages: [
      { id: "m16", text: "Is the test going to be all multiple choice?", sender: "them", timestamp: "Today" },
    ],
  },
];

export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>(INITIAL_CONVERSATIONS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive the active conversation
  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeId) || null
  , [conversations, activeId]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    // Mark as read
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, unreadCount: 0 } : c
    ));
  };

  const handleSendMessage = (text: string) => {
    if (!activeId) return;
    
    setConversations(prev => prev.map(c => {
      if (c.id === activeId) {
        const newMessage = {
          id: 'm' + Date.now(),
          text,
          sender: "me",
          timestamp: "Just now"
        };
        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: text,
          timestamp: "Just now"
        };
      }
      return c;
    }));
  };

  const handleNewMessageSend = (data: any) => {
    // For demo purposes, we'll just log this and add a mock toast
    console.log("Sending message data:", data);
    
    if (data.isBroadcast) {
       // Add a new broadcast conversation to the list
       const newConv = {
         id: 'b' + Date.now(),
         contactName: data.to.join(', ') + ' Broadcast',
         role: 'Broadcast',
         avatarColor: '#FFF2E0',
         lastMessage: data.message,
         timestamp: 'Just now',
         unreadCount: 0,
         messages: [{ id: 'bm1', text: data.message, sender: 'me', timestamp: 'Just now' }]
       };
       setConversations([newConv, ...conversations]);
       setActiveId(newConv.id);
    } else {
       // Individual message logic
       // check if conversation exists with the first recipient
       const recipientId = data.to[0];
       // (Simplified for demo: just create a new one or use existing)
       alert("Message sent successfully!");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFBF5] relative overflow-hidden" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <NotebookTexture />
      <ScatteredDoodles />
      <Sidebar />

      <main className="flex-1 ml-[240px] h-screen flex flex-col p-8 overflow-hidden">
        {/* Responsive Messaging Container */}
        <div className="flex-1 bg-white rounded-3xl border-4 border-[#2C2A24] overflow-hidden shadow-[12px_12px_0px_#E8E4D9] flex flex-col md:flex-row min-h-0 relative">
          
          {/* Decorative Corner Accents */}
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none z-20">
             <div className="absolute top-[-20px] right-[-20px] w-12 h-12 border-b-4 border-l-4 border-[#2C2A24] rounded-full transform rotate-12 opacity-10" />
          </div>

          {/* Left Panel: Conversation List (30% width) */}
          <div className="md:w-[32%] h-full shrink-0">
            <ConversationList 
              conversations={conversations}
              activeId={activeId}
              onSelect={handleSelect}
              onNewMessage={() => setIsModalOpen(true)}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>

          {/* Right Panel: Chat Window (70% width) */}
          <div className="flex-1 h-full min-w-0">
            <ChatWindow 
              conversation={activeConversation as any}
              onSendMessage={handleSendMessage}
            />
          </div>
        </div>
      </main>

      {/* New Message Modal */}
      <NewMessageModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleNewMessageSend}
      />
    </div>
  );
}