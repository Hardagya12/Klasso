'use client';

import React, { useState, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface PTMSlot {
  id: string;
  ptmEventId: string;
  scheduledAt: string;
  duration: number;
  status: 'CONFIRMED' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  talkingPoints: any;
  notes: string | null;
  summary: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    rollNo: string;
  };
  parent: {
    id: string;
    name: string;
  };
}

// ── API helper ────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('klasso_token') : null;
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({ success: false, message: res.statusText }));
  if (!res.ok || json.success === false) throw new Error(json.message || 'Request failed');
  return json.data as T;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PTMDashboard() {
  const [slots, setSlots] = useState<PTMSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      // In a real app we'd decode to get teacher ID from JWT; here we might query the endpoint using a dummy or hardcoded teacher for demo
      // The current backend allows using /api/ptm/teacher/:teacherId. We will use a fallback or the logged in user's ID
      // For this demo, let's assume we have a user in localstorage
      const userRaw = localStorage.getItem('klasso_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (!user) return; // Wait for auth
      
      const res = await apiFetch<PTMSlot[]>(`/api/ptm/teacher/${user.id}`);
      setSlots(res);
      if (res.length > 0 && !activeSlotId) setActiveSlotId(res[0].id);
    } catch (e) {
      console.error('Failed to load slots:', e);
    } finally {
      setLoading(false);
    }
  };

  const activeSlot = slots.find((s) => s.id === activeSlotId);

  const handleComplete = async () => {
    if (!activeSlot) return;
    setCompleting(true);
    try {
      const res = await apiFetch<PTMSlot>(`/api/ptm/${activeSlot.id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: notesInput })
      });
      setSlots(slots.map(s => s.id === activeSlot.id ? { ...s, status: 'COMPLETED', summary: res.summary, notes: notesInput } : s));
      alert('PTM Slot marked as completed! AI Summary has been sent to the parent.');
    } catch (e: any) {
      alert(`Error completing slot: ${e.message}`);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontFamily: 'Nunito', color: '#6B8C82' }}>
        Loading PTM schedule...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 24, padding: '24px 32px', height: 'calc(100vh - 80px)' }}>
      
      {/* ── LEFT SIDEBAR: Schedule ────────────────────────────────────────── */}
      <div style={{
        width: 380,
        background: '#fff',
        border: '1.5px solid #D4EDE8',
        borderRadius: 20,
        boxShadow: '4px 4px 0px #1C2B27',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #D4EDE8' }}>
          <h1 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 24, color: '#1C2B27', margin: 0 }}>
            Today's Meetings
          </h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#6B8C82', margin: '4px 0 0' }}>
            {slots.length} appointments scheduled
          </p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {slots.length === 0 ? (
            <p style={{ textAlign: 'center', fontFamily: 'DM Sans', color: '#A3C4BC', marginTop: 32 }}>No meetings today</p>
          ) : slots.map((s) => {
            const isActive = s.id === activeSlotId;
            const timeStr = new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={s.id}
                onClick={() => {
                  setActiveSlotId(s.id);
                  setNotesInput(s.notes || '');
                }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `2px solid ${isActive ? '#3ECFB2' : '#D4EDE8'}`,
                  background: isActive ? '#EDFBF8' : '#fff',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, color: '#1C2B27' }}>
                    {timeStr}
                  </span>
                  {s.status === 'COMPLETED' && (
                    <span style={{ background: '#E6FBD9', color: '#2B8A3E', padding: '2px 8px', borderRadius: 100, fontSize: 11, fontFamily: 'Nunito', fontWeight: 700 }}>
                      DONE
                    </span>
                  )}
                </div>
                <p style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, color: '#1C2B27', margin: 0 }}>
                  {s.student.firstName} {s.student.lastName}
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#6B8C82', margin: 0 }}>
                  Parent: {s.parent.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT MAIN PANEL: Active Meeting ──────────────────────────────── */}
      <div style={{
        flex: 1,
        background: '#fff',
        border: '1.5px solid #D4EDE8',
        borderRadius: 20,
        boxShadow: '4px 4px 0px #1C2B27',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {activeSlot ? (
          <>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #D4EDE8', background: '#F7FBF9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 26, color: '#1C2B27', margin: 0 }}>
                  {activeSlot.student.firstName} {activeSlot.student.lastName}
                </h2>
                <span style={{ fontFamily: 'Caveat', fontSize: 22, color: '#FF6B6B' }}>
                  Roll No {activeSlot.student.rollNo}
                </span>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#6B8C82', margin: '4px 0 0' }}>
                Meeting with {activeSlot.parent.name}
              </p>
            </div>

            <div style={{ flex: 1, padding: 32, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* AI Talking Points */}
              <div>
                <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: '#1C2B27', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3ECFB2" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  AI Talking Points
                </h3>
                
                {activeSlot.talkingPoints ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {activeSlot.talkingPoints.map((tp: any, i: number) => {
                      const colors = tp.type === 'positive' ? { bg: '#E6FBD9', border: '#B2F2BB', color: '#2B8A3E' } :
                                     tp.type === 'concern' ? { bg: '#FFE3E3', border: '#FFC9C9', color: '#C92A2A' } :
                                     { bg: '#F1F3F5', border: '#DEE2E6', color: '#495057' };
                      
                      return (
                        <div key={i} style={{
                          padding: 12, borderRadius: 12, border: `1px solid ${colors.border}`, background: colors.bg
                        }}>
                          <span style={{ fontFamily: 'DM Sans', fontSize: 14, color: colors.color }}>
                            • {tp.point}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#6B8C82', fontStyle: 'italic' }}>
                    Talking points not yet generated for this slot.
                  </p>
                )}
              </div>

              {/* Teacher Notes */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: '#1C2B27', margin: '0 0 12px' }}>
                  Meeting Notes
                </h3>
                <textarea 
                  value={notesInput}
                  onChange={e => setNotesInput(e.target.value)}
                  placeholder="Record what was discussed with the parent..."
                  style={{
                    flex: 1, width: '100%', padding: 16, borderRadius: 12, border: '1.5px solid #D4EDE8',
                    fontFamily: 'DM Sans', fontSize: 14, color: '#1C2B27', outline: 'none', resize: 'none'
                  }}
                  disabled={activeSlot.status === 'COMPLETED'}
                />
              </div>

              {/* Summary if completed */}
              {activeSlot.status === 'COMPLETED' && activeSlot.summary && (
                <div style={{ padding: 16, background: '#F7FBF9', borderLeft: '4px solid #3ECFB2', borderRadius: '0 12px 12px 0' }}>
                  <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#3ECFB2', margin: '0 0 4px', textTransform: 'uppercase' }}>Parent Summary Sent</p>
                  <p style={{ fontFamily: 'Caveat', fontSize: 19, color: '#1C2B27', margin: 0, lineHeight: 1.4 }}>
                    "{activeSlot.summary}"
                  </p>
                </div>
              )}

            </div>

            {/* Bottom Action Footer */}
            {activeSlot.status !== 'COMPLETED' && (
              <div style={{ padding: '20px 32px', borderTop: '1px solid #D4EDE8', background: '#F7FBF9', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  onClick={handleComplete}
                  disabled={completing || !notesInput.trim()}
                  style={{
                    background: completing ? '#A3C4BC' : '#3ECFB2', color: '#fff', border: 'none', borderRadius: 100,
                    padding: '12px 24px', fontFamily: 'Nunito', fontWeight: 800, fontSize: 15, cursor: completing ? 'not-allowed' : 'pointer',
                    boxShadow: completing ? 'none' : '2px 2px 0px #1C2B27'
                  }}
                >
                  {completing ? 'Completing...' : 'Mark Complete & Send Summary'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans', color: '#A3C4BC' }}>
            Select a meeting slot to view details
          </div>
        )}
      </div>

    </div>
  );
}
