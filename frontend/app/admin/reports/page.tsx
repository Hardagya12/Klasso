"use client";

import React from "react";
import AdminSidebar from "../../components/ui/AdminSidebar";
import Link from "next/link";

export default function AdminReportsPage() {
  return (
    <div className="flex min-h-screen bg-[#FDFBF5]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <AdminSidebar />
      <main className="flex-1 ml-[240px] pl-6 pr-8 py-10">
        <h1 className="text-4xl font-extrabold text-[#2C2A24] font-['Nunito',sans-serif] mb-2">Reports</h1>
        <p className="text-[#7A7670] text-sm mb-6 max-w-xl">
          AI progress reports are generated per student via the API{" "}
          <code className="text-xs bg-[#F3F4F6] px-1 rounded">POST /api/reports/generate/:student_id</code> (teacher
          or admin). Pending approvals count appears on the admin dashboard.
        </p>
        <p className="text-sm text-[#2C2A24]">
          Use the{" "}
          <Link href="/teacher/reports" className="underline font-bold">
            teacher reports
          </Link>{" "}
          workspace to create and review reports for students you teach.
        </p>
      </main>
    </div>
  );
}
