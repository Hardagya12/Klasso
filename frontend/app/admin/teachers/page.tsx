"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/ui/AdminSidebar";
import { apiData } from "../../../lib/api";

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  class_subjects: unknown[] | null;
};

export default function TeachersPage() {
  const [rows, setRows] = useState<Teacher[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const d = await apiData<Teacher[]>("/api/users/teachers");
        setRows(d);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load teachers");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <AdminSidebar />
      <main className="flex-1 ml-[240px] pl-6 pr-8 py-10 max-w-none relative">
        <h1 className="text-4xl font-extrabold text-[#2C2A24] font-['Nunito',sans-serif] mb-2">
          Teachers
        </h1>
        <p className="text-[#7A7670] text-sm mb-6">Live staff list.</p>
        {err && <p className="text-red-600 mb-4">{err}</p>}
        <div className="bg-white rounded-xl border-2 border-[#E8E4D9] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F8F5] border-b-2 border-[#E8E4D9]">
              <tr>
                <th className="text-left p-3 font-bold">Name</th>
                <th className="text-left p-3 font-bold">Email</th>
                <th className="text-left p-3 font-bold">Phone</th>
                <th className="text-left p-3 font-bold">Active</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#E8E4D9]">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.phone || "—"}</td>
                  <td className="p-3">{r.is_active ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
