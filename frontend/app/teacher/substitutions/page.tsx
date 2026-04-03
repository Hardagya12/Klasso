'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Briefing {
  id: string;
  aiSummary: string;
  isViewed: boolean;
  generatedAt: string;
  content: any;
}

interface SubstitutionRow {
  substitution_id: string;
  date: string;
  class_name: string;
  section: string;
  subject_name: string;
  period_number: number;
  start_time: string;
  end_time: string;
  room?: string;
  reason?: string;
  briefing_id?: string;
  ai_summary?: string;
  is_viewed?: boolean;
  generated_at?: string;
  content?: any;
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

// ──────────────────────────────────────────────────────────────────────────────
// Detail Modal — shows full briefing for admins
// ──────────────────────────────────────────────────────────────────────────────
function BriefingModal({
  sub,
  onClose,
  onRegenerate,
}: {
  sub: SubstitutionRow;
  onClose: () => void;
  onRegenerate: (id: string) => void;
}) {
  const content = sub.content;
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      await apiFetch(`/api/substitution/${sub.substitution_id}/briefing/regenerate`, { method: 'POST' });
      onRegenerate(sub.substitution_id);
      onClose();
    } catch (e: any) {
      alert('Failed to regenerate: ' + e.message);
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(28,43,39,0.55)' }}>
      <div style={{
        background: '#F7FBF9', borderRadius: 20, border: '2px solid #D4EDE8',
        boxShadow: '6px 6px 0px #1C2B27', maxWidth: 600, width: '100%',
        maxHeight: '90vh', overflowY: 'auto', padding: 32, position: 'relative',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 20, color: '#1C2B27', margin: 0 }}>
              Class Briefing Preview
            </h2>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#6B8C82', margin: '4px 0 0' }}>
              {sub.class_name} {sub.section} · {sub.subject_name} · {new Date(sub.date).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1.5px solid #D4EDE8', borderRadius: 8,
            padding: '4px 12px', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 700, color: '#6B8C82',
          }}>✕</button>
        </div>

        {sub.briefing_id ? (
          <>
            {/* AI Summary */}
            <div style={{
              background: '#D4F5EE', borderRadius: 16, padding: 20, marginBottom: 20,
              border: '1.5px solid #3ECFB2', boxShadow: '4px 4px 0px #28A990',
            }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#28A990', margin: '0 0 8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                💡 AI Summary
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#1C2B27', lineHeight: 1.6, margin: 0 }}>
                {sub.ai_summary}
              </p>
            </div>

            {/* Content Sections */}
            {content && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Class Info */}
                <InfoSection title="Class Overview">
                  <StatGrid items={[
                    { label: 'Students', value: String(content.classInfo?.studentCount ?? '—') },
                    { label: 'Avg Attendance', value: `${content.avgAttendance ?? '—'}%` },
                    { label: 'Room', value: content.classInfo?.room || 'TBD' },
                    { label: 'XP Level', value: `Lv.${content.classXP?.level} — ${content.classXP?.title}` },
                  ]} />
                </InfoSection>

                {/* Top Students */}
                {content.topStudents?.length > 0 && (
                  <InfoSection title="⭐ Top Students">
                    {content.topStudents.map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #D4EDE8' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: '#D4F5EE',
                          border: '1.5px solid #3ECFB2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: '#28A990',
                        }}>
                          {s.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#1C2B27', flex: 1 }}>{s.name}</span>
                        <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: '#28A990' }}>Avg {s.avgScore}%</span>
                      </div>
                    ))}
                  </InfoSection>
                )}

                {/* Needs Attention */}
                {content.needsAttention?.length > 0 && (
                  <InfoSection title="🔔 Check In With">
                    {content.needsAttention.map((s: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #D4EDE8' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: '#FFF8C2',
                          border: '1.5px solid #FFE566', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: '#C9AF00',
                        }}>
                          {s.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#1C2B27' }}>{s.name}</div>
                          <div style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#6B8C82' }}>{s.reason}</div>
                        </div>
                      </div>
                    ))}
                  </InfoSection>
                )}

                {/* Subject Progress */}
                <InfoSection title="📚 Subject Progress">
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#1C2B27', margin: '0 0 8px' }}>
                    <b>Recent topic:</b> {content.subjectProgress?.recentTopic || 'N/A'}
                  </p>
                  {content.recentAssessments?.map((a: any, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#6B8C82' }}>{a.examName}</span>
                      <span style={{
                        fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
                        background: a.classAvgPct >= 70 ? '#D4F5EE' : '#FFE5E5',
                        color: a.classAvgPct >= 70 ? '#28A990' : '#D94848',
                        padding: '2px 10px', borderRadius: 100,
                      }}>{a.classAvgPct}% avg</span>
                    </div>
                  ))}
                </InfoSection>

                {/* Today's Assignments */}
                {content.todayAssignments?.length > 0 && (
                  <InfoSection title="📋 Due Today">
                    {content.todayAssignments.map((a: any, i: number) => (
                      <p key={i} style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#1C2B27', margin: '0 0 4px' }}>
                        • {a.title}
                      </p>
                    ))}
                  </InfoSection>
                )}
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                style={{
                  flex: 1, background: regenerating ? '#e5e7eb' : '#1C2B27',
                  color: '#fff', border: 'none', borderRadius: 100,
                  padding: '12px 0', fontFamily: 'Nunito', fontWeight: 700, fontSize: 14,
                  cursor: regenerating ? 'not-allowed' : 'pointer',
                  boxShadow: '3px 3px 0px #6B8C82',
                }}
              >
                {regenerating ? 'Regenerating…' : '↺ Regenerate Briefing'}
              </button>
            </div>

            <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#A5C4BC', textAlign: 'center', marginTop: 12 }}>
              Generated {sub.generated_at ? new Date(sub.generated_at).toLocaleString() : 'recently'} · Klasso AI
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 16, color: '#6B8C82' }}>
              No briefing generated yet.
            </p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              style={{
                marginTop: 16, background: '#3ECFB2', color: '#fff',
                border: 'none', borderRadius: 100, padding: '12px 32px',
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: '3px 3px 0px #1C2B27',
              }}
            >
              {regenerating ? 'Generating…' : 'Generate Briefing'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────────
function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, border: '1.5px solid #D4EDE8',
      padding: 16,
    }}>
      <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: '#1C2B27', margin: '0 0 12px' }}>{title}</p>
      {children}
    </div>
  );
}

function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ background: '#F7FBF9', borderRadius: 10, padding: '10px 12px', border: '1px solid #D4EDE8' }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 16, color: '#3ECFB2' }}>{item.value}</div>
          <div style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#6B8C82' }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────────────────────
export default function SubstitutionsBriefingsPage() {
  const [subs, setSubs] = useState<SubstitutionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<SubstitutionRow | null>(null);
  const [filterUpcoming, setFilterUpcoming] = useState(false);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<SubstitutionRow[]>(
        `/api/substitution/my-briefings${filterUpcoming ? '?upcoming=true' : ''}`
      );
      setSubs(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load substitutions');
    } finally {
      setLoading(false);
    }
  }, [filterUpcoming]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handleRegenerate = (id: string) => {
    setSubs((prev) =>
      prev.map((s) =>
        s.substitution_id === id
          ? { ...s, briefing_id: undefined, ai_summary: undefined }
          : s
      )
    );
    setTimeout(fetchSubs, 2000);
  };

  const briefingStatus = (row: SubstitutionRow) => {
    if (!row.briefing_id) {
      return (
        <span style={{
          background: '#F3F4F6', color: '#6B7280', borderRadius: 100,
          padding: '3px 12px', fontSize: 12, fontFamily: 'Nunito', fontWeight: 700,
        }}>Not yet</span>
      );
    }
    return (
      <span style={{
        background: '#D4F5EE', color: '#28A990', borderRadius: 100,
        padding: '3px 12px', fontSize: 12, fontFamily: 'Nunito', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        ✓ Generated {row.is_viewed ? '· Viewed' : '· Unread'}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F7FBF9', fontFamily: 'DM Sans, sans-serif', padding: 32 }}>

      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Clipboard doodle SVG */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="3" width="14" height="18" rx="2" stroke="#3ECFB2" strokeWidth="2" />
            <rect x="9" y="1" width="6" height="4" rx="1" fill="#3ECFB2" />
            <path d="M8 10h8M8 14h5" stroke="#3ECFB2" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <h1 style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 28, color: '#1C2B27', margin: 0 }}>
              Substitution Briefings
            </h1>
            <p style={{ fontSize: 14, color: '#6B8C82', margin: '4px 0 0' }}>
              AI-powered class briefings — so subs walk in prepared, not blind.
            </p>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: '#1C2B27',
        }}>
          <input
            type="checkbox"
            checked={filterUpcoming}
            onChange={(e) => setFilterUpcoming(e.target.checked)}
            style={{ accentColor: '#3ECFB2', width: 16, height: 16 }}
          />
          Show upcoming only
        </label>
        <button
          onClick={fetchSubs}
          style={{
            background: '#3ECFB2', color: '#fff', border: 'none', borderRadius: 100,
            padding: '8px 20px', fontFamily: 'Nunito', fontWeight: 700, fontSize: 13,
            cursor: 'pointer', boxShadow: '3px 3px 0px #1C2B27',
          }}
        >
          ↺ Refresh
        </button>
      </div>

      {/* Error / Loading */}
      {error && (
        <div style={{ background: '#FFE5E5', border: '1.5px solid #FF6B6B', borderRadius: 12, padding: 16, marginBottom: 20, color: '#D94848', fontFamily: 'DM Sans', fontSize: 14 }}>
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6B8C82', fontFamily: 'Nunito', fontWeight: 700 }}>
          Loading substitutions…
        </div>
      ) : subs.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: 60, background: '#fff', borderRadius: 20,
          border: '1.5px solid #D4EDE8', boxShadow: '4px 4px 0px #1C2B27',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <p style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 18, color: '#1C2B27', margin: 0 }}>
            No substitutions found
          </p>
          <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#6B8C82', marginTop: 8 }}>
            When you are assigned as a substitute, your briefings will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {subs.map((row) => (
            <div
              key={row.substitution_id}
              style={{
                background: '#fff', borderRadius: 16, border: '1.5px solid #D4EDE8',
                boxShadow: '4px 4px 0px #1C2B27', padding: '16px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 12,
              }}
            >
              {/* Left: class info */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    background: '#3ECFB2', color: '#fff', borderRadius: 100,
                    padding: '2px 10px', fontFamily: 'Nunito', fontWeight: 700, fontSize: 12,
                  }}>
                    {row.subject_name}
                  </span>
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: '#1C2B27' }}>
                    {row.class_name} {row.section}
                  </span>
                </div>
                <div style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#6B8C82' }}>
                  {new Date(row.date).toLocaleDateString()} · Period {row.period_number}
                  {row.room ? ` · Room ${row.room}` : ''}
                </div>
              </div>

              {/* Middle: briefing status */}
              <div>{briefingStatus(row)}</div>

              {/* Right: action */}
              <button
                onClick={() => setSelected(row)}
                style={{
                  background: row.briefing_id ? '#1C2B27' : '#FF6B6B',
                  color: '#fff', border: 'none', borderRadius: 100,
                  padding: '8px 20px', fontFamily: 'Nunito', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', boxShadow: '3px 3px 0px #6B8C82', whiteSpace: 'nowrap',
                }}
              >
                {row.briefing_id ? 'View Briefing' : 'Preview / Generate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <BriefingModal
          sub={selected}
          onClose={() => setSelected(null)}
          onRegenerate={handleRegenerate}
        />
      )}
    </div>
  );
}
