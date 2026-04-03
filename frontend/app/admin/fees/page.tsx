"use client";

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/ui/AdminSidebar";
import { apiData } from "../../../lib/api";

type SummaryRow = { fee_type: string; paid_count: number; total_collected: string | number };
type PendingRow = {
  student_name: string;
  class_name: string;
  fee_name: string;
  amount: string | number;
  balance: string | number;
};

export default function AdminFeesPage() {
  const [summary, setSummary] = useState<SummaryRow[]>([]);
  const [pending, setPending] = useState<PendingRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const [s, p] = await Promise.all([
          apiData<SummaryRow[]>("/api/fees/summary"),
          apiData<PendingRow[]>("/api/fees/pending"),
        ]);
        setSummary(s);
        setPending(p.slice(0, 50));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Failed to load fees");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <AdminSidebar />
      <main className="flex-1 ml-[240px] pl-6 pr-8 py-10">
        <h1 className="text-4xl font-extrabold text-[#2C2A24] font-['Nunito',sans-serif] mb-2">Fees</h1>
        <p className="text-[#7A7670] text-sm mb-6">Collection summary and outstanding balances.</p>
        {err && <p className="text-red-600 mb-4">{err}</p>}
        <h2 className="font-bold mb-2">Summary</h2>
        <div className="bg-white border-2 border-[#E8E4D9] rounded-xl overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F8F5]">
              <tr>
                <th className="text-left p-3">Fee type</th>
                <th className="text-left p-3">Paid students</th>
                <th className="text-left p-3">Collected</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((r, i) => (
                <tr key={i} className="border-t border-[#E8E4D9]">
                  <td className="p-3">{r.fee_type}</td>
                  <td className="p-3">{r.paid_count}</td>
                  <td className="p-3">₹{Number(r.total_collected || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h2 className="font-bold mb-2">Outstanding (sample)</h2>
        <div className="bg-white border-2 border-[#E8E4D9] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F9F8F5]">
              <tr>
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Class</th>
                <th className="text-left p-3">Fee</th>
                <th className="text-left p-3">Balance</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((r, i) => (
                <tr key={i} className="border-t border-[#E8E4D9]">
                  <td className="p-3">{r.student_name}</td>
                  <td className="p-3">{r.class_name}</td>
                  <td className="p-3">{r.fee_name}</td>
                  <td className="p-3">₹{Number(r.balance || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
