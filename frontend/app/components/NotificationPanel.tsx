"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiData, apiPaginated } from "../../lib/api";

type Row = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  entity_type?: string | null;
};

export default function NotificationPanel({
  isOpen = true,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiPaginated<Row>("/api/notifications?page=1&limit=50");
      setRows(res.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) void load();
  }, [isOpen, load]);

  async function markAllRead() {
    try {
      await apiData("/api/notifications/read-all", { method: "PUT" });
      await load();
    } catch (_) {
      /* noop */
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-[380px] bg-[#FDFBF5] border-l-2 border-[#E8E4D9] shadow-[-8px_0_15px_rgba(0,0,0,0.05)] z-50 flex flex-col font-sans transition-transform duration-300 transform translate-x-0">
      <div className="p-6 pb-4 border-b-2 border-[#E8E4D9] shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-[#2C2A24] font-['Nunito']">Notifications</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#A39E93] hover:text-[#4A473F] transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => void markAllRead()}
          className="text-sm font-bold text-amber-500 hover:text-amber-600 underline decoration-amber-300 decoration-wavy underline-offset-2"
        >
          Mark all read
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2 space-y-4">
        {loading && <p className="text-sm text-[#7A7670]">Loading…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}
        {!loading &&
          !err &&
          rows.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl p-4 border-2 border-[#E8E4D9] bg-white shadow-[2px_2px_0_#E5E7EB] ${!n.is_read ? "border-l-4 border-l-amber-400" : ""}`}
            >
              <h4 className="font-bold text-[#2C2A24] text-[15px] mb-1">{n.title}</h4>
              <p className="text-sm text-[#4A473F] leading-snug whitespace-pre-wrap">{n.message}</p>
              <p className="text-xs text-[#A39E93] mt-2 font-['Caveat',cursive] text-base font-bold">
                {new Date(n.created_at).toLocaleString()}
              </p>
              <span className="text-[10px] uppercase tracking-wide text-[#7A7670]">{n.type}</span>
            </div>
          ))}
        {!loading && !err && rows.length === 0 && (
          <p className="text-[#7A7670] text-sm">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}
