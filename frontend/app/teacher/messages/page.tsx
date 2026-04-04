"use client";

import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { NotebookTexture, ScatteredDoodles } from "../../components/dashboard/DashboardComponents";
import ConversationList from "./components/ConversationList";
import ChatWindow from "./components/ChatWindow";
import NewMessageModal from "./components/NewMessageModal";

import { apiData, apiPaginated, apiFetch } from "../../../lib/api";
export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  const fetchMessages = React.useCallback(async () => {
    try {
      const dbInbox = await apiPaginated<any>("/api/messages/inbox");
      const dbSent = await apiPaginated<any>("/api/messages/sent");
      
      const inboxList = dbInbox.data || [];
      const sentList = dbSent.data || [];
      
      const convMap = new Map();

      const COLORS = ["#D6EAF8", "#D1F2EB", "#F5EEF8", "#FCF3CF", "#FDEDEC", "#FFF2E0", "#EBEDEF"];

      inboxList.forEach((m: any) => {
        const cId = m.sender_id;
        if (!convMap.has(cId)) {
          convMap.set(cId, {
            id: cId,
            contactName: m.sender_name,
            role: m.sender_role || "User",
            avatarColor: COLORS[parseInt(cId) % COLORS.length] || "#D6EAF8",
            lastMessage: m.body,
            timestamp: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            unreadCount: 0,
            messages: []
          });
        }
        const c = convMap.get(cId);
        c.messages.push({
          id: m.id,
          text: m.body || m.subject,
          sender: "them",
          timestamp: new Date(m.created_at).toLocaleString()
        });
        if (!m.is_read) c.unreadCount++;
      });

      sentList.forEach((m: any) => {
        const cId = m.recipient_id;
        if (!convMap.has(cId)) {
          convMap.set(cId, {
            id: cId,
            contactName: m.recipient_name,
            role: m.recipient_role || "User",
            avatarColor: COLORS[parseInt(cId) % COLORS.length] || "#D1F2EB",
            lastMessage: m.body,
            timestamp: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            unreadCount: 0,
            messages: []
          });
        }
        const c = convMap.get(cId);
        c.messages.push({
          id: m.id,
          text: m.body || m.subject,
          sender: "me",
          timestamp: new Date(m.created_at).toLocaleString()
        });
      });

      const convArray = Array.from(convMap.values());
      convArray.forEach(c => {
        c.messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        if (c.messages.length > 0) {
           c.lastMessage = c.messages[c.messages.length-1].text;
           c.timestamp = c.messages[c.messages.length-1].timestamp;
        }
      });
      convArray.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setConversations(convArray);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    fetchMessages();
  }, [fetchMessages]);

  // Derive the active conversation
  const activeConversation = useMemo(() => 
    conversations.find(c => c.id === activeId) || null
  , [conversations, activeId]);

  if (!isMounted) return null;

  const handleSelect = async (id: string) => {
    setActiveId(id);
    const conv = conversations.find(c => c.id === id);
    if (conv && conv.unreadCount > 0) {
      setConversations(prev => prev.map(c => 
        c.id === id ? { ...c, unreadCount: 0 } : c
      ));
      
      const unreadMsgs = conv.messages.filter((m: any) => m.sender === 'them');
      for (const msg of unreadMsgs) {
         try {
           await apiFetch(`/api/messages/${msg.id}/read`, { method: "PUT" });
         } catch(e) {}
      }
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeId) return;
    try {
      await apiData<any>("/api/messages", {
        method: "POST",
        body: JSON.stringify({ recipient_id: activeId, body: text })
      });
      fetchMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewMessageSend = async (data: any) => {
    try {
      if (data.isBroadcast) {
          for (const recipientId of data.to) {
              await apiData<any>("/api/messages", {
                method: "POST",
                body: JSON.stringify({ recipient_id: recipientId, body: data.message })
              });
          }
      } else {
          const recipient_id = data.to[0]; 
          await apiData<any>("/api/messages", {
            method: "POST",
            body: JSON.stringify({ recipient_id, body: data.message })
          });
      }
      fetchMessages();
      setIsModalOpen(false);
    } catch(err) {
      console.error(err);
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