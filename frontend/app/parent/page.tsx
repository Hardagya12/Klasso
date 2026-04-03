"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiData } from "../../lib/api";
type ChildDash = {
  student: { name: string; class: string; roll_no: string };
  attendance: { percentage: number; days_absent_this_month: number };
  latest_marks: { exam_name: string; pct: number; grade: string } | null;
  pending_assignments: number;
  fee_due: number;
  recent_notifications: Array<{ title: string; message: string; created_at: string }>;
};

export default function ParentWebDashboard() {
  const [data, setData] = useState<{ children: ChildDash[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const d = await apiData<{ children: ChildDash[] }>("/api/analytics/parent");
        setData(d);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <header className="border-b-2 border-[#E8E4D9] bg-white px-6 py-4 flex gap-4 items-center">
        <span className="font-extrabold text-[#2C2A24] font-['Nunito',sans-serif]">Klasso Parent</span>
        <Link href="/login" className="text-sm font-semibold text-[#7A7670] hover:text-[#2C2A24]">
          Account
        </Link>
        <Link href="/" className="text-sm font-semibold text-[#7A7670] hover:text-[#2C2A24]">
          Home
        </Link>
      </header>
      <main className="pl-6 pr-8 py-10 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-[#2C2A24] font-['Nunito',sans-serif] mb-2">
          Parent dashboard
        </h1>
        <p className="text-[#7A7670] text-sm mb-8">
          Linked children and live stats from your school account.{" "}
          <Link href="/login" className="underline font-semibold text-[#2C2A24]">
            Sign in
          </Link>
        </p>
        {err && <p className="text-red-600 font-semibold mb-4">{err}</p>}
        <div className="grid gap-6">
          {(data?.children ?? []).map((ch, i) => (
            <div
              key={i}
              className="bg-white border-2 border-[#E8E4D9] rounded-xl p-6 shadow-[2px_2px_0_#2C2A24]"
            >
              <h2 className="text-xl font-bold text-[#2C2A24] mb-1">{ch.student.name}</h2>
              <p className="text-sm text-[#7A7670] mb-4">
                {ch.student.class} · Roll {ch.student.roll_no}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="font-bold text-[#2C2A24]">Attendance</p>
                  <p>{ch.attendance.percentage}%</p>
                  <p className="text-xs text-[#7A7670]">Absent this month: {ch.attendance.days_absent_this_month}</p>
                </div>
                <div>
                  <p className="font-bold text-[#2C2A24]">Latest exam</p>
                  {ch.latest_marks ? (
                    <p>
                      {ch.latest_marks.exam_name}: {ch.latest_marks.pct}% ({ch.latest_marks.grade})
                    </p>
                  ) : (
                    <p className="text-[#7A7670]">No marks yet</p>
                  )}
                </div>
                <div>
                  <p className="font-bold text-[#2C2A24]">Pending homework</p>
                  <p>{ch.pending_assignments}</p>
                </div>
                <div>
                  <p className="font-bold text-[#2C2A24]">Fee due</p>
                  <p>₹{Math.round(ch.fee_due).toLocaleString()}</p>
                </div>
              </div>
              {ch.recent_notifications?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#E8E4D9]">
                  <p className="font-bold text-[#2C2A24] text-sm mb-2">Your notifications</p>
                  <ul className="space-y-2 text-sm">
                    {ch.recent_notifications.map((n, j) => (
                      <li key={j}>
                        <span className="font-semibold">{n.title}</span> — {n.message}{" "}
                        <span className="text-xs text-[#7A7670]">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {data && data.children.length === 0 && (
            <p className="text-[#7A7670]">No linked children found for this parent account.</p>
          )}
        </div>
      </main>
    </div>
  );
}
