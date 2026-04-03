"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/ui/AdminSidebar";
import { apiPaginated } from "../../../lib/api";

type Ann = {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
};

export default function AdminAnnouncementsPage() {
  const [rows, setRows] = useState<Ann[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiPaginated<Ann>("/api/announcements?page=1&limit=50");
        setRows(res.data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <AdminSidebar />
      <main className="flex-1 ml-[240px] pl-6 pr-8 py-10">
        <h1 className="text-4xl font-extrabold text-[#2C2A24] font-['Nunito',sans-serif] mb-2">
          Announcements
        </h1>
        <p className="text-[#7A7670] text-sm mb-6">Published school announcements (live).</p>
        {err && <p className="text-red-600 mb-4">{err}</p>}
        <div className="space-y-4">
          {rows.map((a) => (
            <article key={a.id} className="bg-white border-2 border-[#E8E4D9] rounded-xl p-5">
              <h2 className="font-bold text-lg text-[#2C2A24]">{a.title}</h2>
              <p className="text-xs text-[#7A7670] mb-2">
                {a.audience} · {new Date(a.created_at).toLocaleString()}
              </p>
              <p className="text-sm text-[#4A473F] whitespace-pre-wrap">{a.body}</p>
            </article>
          ))}
          {rows.length === 0 && !err && <p className="text-[#7A7670]">No announcements yet.</p>}
        </div>
      </main>
    </div>
  );
}
