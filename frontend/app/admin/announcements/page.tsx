"use client";

import React from "react";
import Sidebar from "../../components/Sidebar";

export default function AnnouncementsPage() {
  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Sidebar />

      <main className="flex-1 ml-[240px] pl-10 pr-8 py-10 max-w-none relative">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#2C2A24]"
              style={{ fontFamily: '"Nunito", sans-serif' }}>
              Announcements
            </h1>
            <p className="text-[#7A7670] font-body mt-2 text-sm">
              Create and manage school announcements
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-[#E8E4D9] p-8 shadow-sm">
          <p className="text-[#7A7670]">Announcements management interface coming soon...</p>
        </div>
      </main>
    </div>
  );
}