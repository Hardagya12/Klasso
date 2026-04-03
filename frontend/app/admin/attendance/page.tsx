"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/ui/AdminSidebar";
import { apiData, apiPaginated } from "../../../lib/api";

type ClassRow = { id: string; name: string; section: string };

export default function AdminAttendancePage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [classId, setClassId] = useState("");
  const [stats, setStats] = useState<{ today_attendance: number; average_marks: number; pass_rate: number } | null>(
    null
  );
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiPaginated<ClassRow>("/api/classes?page=1&limit=100");
        setClasses(res.data);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load classes");
      }
    })();
  }, []);

  useEffect(() => {
    if (!classId) {
      setStats(null);
      return;
    }
    void (async () => {
      try {
        const s = await apiData<{
          today_attendance: number;
          average_marks: number;
          pass_rate: number;
        }>(`/api/analytics/class/${classId}`);
        setStats({
          today_attendance: s.today_attendance,
          average_marks: s.average_marks,
          pass_rate: s.pass_rate,
        });
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load class analytics");
      }
    })();
  }, [classId]);

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <AdminSidebar />
      <main className="flex-1 ml-[240px] pl-6 pr-8 py-10">
        <h1 className="text-4xl font-extrabold text-[#2C2A24] font-['Nunito',sans-serif] mb-2">Attendance</h1>
        <p className="text-[#7A7670] text-sm mb-6">
          Pick a class for today&apos;s attendance % and related marks stats (live).
        </p>
        {err && <p className="text-red-600 mb-4">{err}</p>}
        <select
          className="border-2 border-[#E8E4D9] rounded-lg px-3 py-2 mb-6 bg-white"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          <option value="">Select class…</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}-{c.section}
            </option>
          ))}
        </select>
        {stats && (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border-2 border-[#E8E4D9] rounded-xl p-4">
              <p className="text-xs font-bold text-[#7A7670]">Today attendance</p>
              <p className="text-2xl font-extrabold text-[#2C2A24]">{stats.today_attendance}%</p>
            </div>
            <div className="bg-white border-2 border-[#E8E4D9] rounded-xl p-4">
              <p className="text-xs font-bold text-[#7A7670]">Avg marks %</p>
              <p className="text-2xl font-extrabold text-[#2C2A24]">{stats.average_marks}%</p>
            </div>
            <div className="bg-white border-2 border-[#E8E4D9] rounded-xl p-4">
              <p className="text-xs font-bold text-[#7A7670]">Pass rate</p>
              <p className="text-2xl font-extrabold text-[#2C2A24]">{stats.pass_rate}%</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
