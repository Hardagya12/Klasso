"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../providers";
import { ApiError } from "../../lib/api";

export default function LoginPage() {
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (x) {
      setErr(x instanceof ApiError ? x.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FDFBF5] px-4">
      <div className="w-full max-w-md border-2 border-[#E8E4D9] rounded-2xl bg-white p-8 shadow-[4px_4px_0_#2C2A24]">
        <h1 className="text-2xl font-extrabold text-[#2C2A24] font-['Nunito',sans-serif] mb-1">
          Klasso
        </h1>
        <p className="text-sm text-[#7A7670] mb-6 font-['DM_Sans',sans-serif]">
          Sign in with your school account
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#2C2A24] mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-[#E8E4D9] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#2C2A24] mb-1">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-[#E8E4D9] rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {err && (
            <p className="text-sm text-red-600 font-medium" role="alert">
              {err}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || authLoading}
            className="w-full py-2.5 rounded-lg bg-[#F5A623] border-2 border-[#2C2A24] font-bold text-[#2C2A24] disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[#7A7670]">
          <Link href="/" className="underline font-semibold text-[#2C2A24]">
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
