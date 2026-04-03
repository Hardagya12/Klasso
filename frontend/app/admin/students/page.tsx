"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/ui/AdminSidebar";
import { apiPaginated } from "../../../lib/api";

type Row = {
  id: string;
  roll_no: string;
  user: { name: string; email: string };
  class: { name: string; section: string } | null;
};

export default function StudentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiPaginated<Row>("/api/students?page=1&limit=100");
        setRows(res.data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load students");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <AdminSidebar />
      <main className="flex-1 ml-[240px] pl-6 pr-8 py-10 max-w-none relative">
        <h1 className="text-4xl font-extrabold text-[#2C2A24] font-['Nunito',sans-serif] mb-2">
          Students
        </h1>
        <p className="text-[#7A7670] text-sm mb-6">Live roster from the database.</p>
        {err && <p className="text-red-600 mb-4">{err}</p>}
        <div className="bg-white rounded-xl border-2 border-[#E8E4D9] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F8F5] border-b-2 border-[#E8E4D9]">
              <tr>
                <th className="text-left p-3 font-bold">Name</th>
                <th className="text-left p-3 font-bold">Class</th>
                <th className="text-left p-3 font-bold">Roll</th>
                <th className="text-left p-3 font-bold">Email</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#E8E4D9]">
                  <td className="p-3">{r.user?.name}</td>
                  <td className="p-3">
                    {r.class ? `${r.class.name}-${r.class.section}` : "—"}
                  </td>
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3 text-[#7A7670]">{r.user?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
