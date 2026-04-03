"use client";

import React from "react";
import Link from "next/link";

import {
  KawaiiBobaCup, KawaiiShiba, KawaiiStrawberry, KawaiiCloud,
  KawaiiFrog, KawaiiMushroom, KawaiiStar, KawaiiPencil, KawaiiBook,
  Sparkle, KawaiiHeart, KawaiiBow, KawaiiRainbow, WashiTape, PawPrint, SakuraPetal,
} from "./components/doodles";

import {
  StickyNoteCard, KawaiiButton, KawaiiBadge, CloudStat,
} from "./components/ui";

/* ─── Section Helper ─── */
function Section({ title, subtitle, children, id }: {
  title: string; subtitle?: string; children: React.ReactNode; id?: string;
}) {
  return (
    <section id={id} className="mb-20">
      <div className="mb-6 flex items-end gap-3">
        <div>
          <h2 className="text-2xl font-heading font-extrabold text-text">{title}</h2>
          {subtitle && <p className="text-text-muted font-body text-sm mt-0.5">{subtitle}</p>}
        </div>
        <Sparkle size={20} color="#FFEAA7" className="animate-kawaii-sparkle mb-1" />
      </div>
      <WashiTape width={220} color="#C8B6FF" pattern="dots" className="mb-6" />
      {children}
    </section>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background bg-dots relative overflow-hidden">
      {/* ━━━ Floating background doodles ━━━ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <SakuraPetal size={20} className="absolute top-[8%] left-[5%] animate-kawaii-float opacity-30" />
        <SakuraPetal size={14} className="absolute top-[15%] right-[10%] animate-kawaii-float opacity-20" />
        <SakuraPetal size={18} className="absolute top-[45%] left-[3%] animate-kawaii-float opacity-25" />
        <PawPrint size={16} className="absolute top-[25%] right-[6%] opacity-15 animate-kawaii-float" />
        <PawPrint size={12} className="absolute top-[60%] left-[8%] opacity-10 animate-kawaii-float" />
        <Sparkle size={14} className="absolute top-[35%] right-[15%] animate-kawaii-sparkle opacity-25" />
        <Sparkle size={10} className="absolute top-[70%] left-[12%] animate-kawaii-sparkle opacity-20" />
        <KawaiiHeart size={14} className="absolute top-[50%] right-[4%] animate-kawaii-float opacity-15" />
      </div>

      {/* ━━━ HERO ━━━ */}
      <header className="relative z-10 border-b-2 border-border overflow-hidden">
        {/* Decorative kawaii characters */}
        <div className="absolute top-4 right-8 animate-kawaii-bounce opacity-60">
          <KawaiiStrawberry size={36} />
        </div>
        <div className="absolute bottom-6 right-24 animate-kawaii-wiggle opacity-50">
          <KawaiiMushroom size={32} color="mint" />
        </div>
        <div className="absolute top-12 left-[70%] animate-kawaii-float opacity-40">
          <KawaiiStar size={28} color="#FFEAA7" mood="sparkle" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-14 relative">
          <div className="flex items-center gap-3 mb-2">
            <KawaiiShiba size={52} mood="excited" />
            <div>
              <span className="font-accent text-xl text-text-muted">AI-Powered Academic Management</span>
              <div className="flex items-center gap-1.5">
                <KawaiiHeart size={14} />
                <Sparkle size={12} color="#C8B6FF" />
                <PawPrint size={12} color="#A8E6CF" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-text mb-3 leading-tight">
            Reduce Teacher Workload with{" "}
            <span className="text-primary">AI-Powered</span>{" "}
            <span className="relative inline-block">
              <span className="text-accent">Automation</span>
              <Sparkle size={20} color="#FFEAA7" className="absolute -top-3 -right-5 animate-kawaii-sparkle" />
            </span>
          </h1>

          <p className="text-base text-text-muted font-body max-w-xl mb-6 leading-relaxed">
            Klasso AI simplifies academic management by automating attendance, grading, and reports — so teachers can focus on teaching, not paperwork.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <Link href="/login">
              <KawaiiButton variant="pink" size="lg">
                <KawaiiPencil size={20} /> Sign in
              </KawaiiButton>
            </Link>
            <KawaiiButton variant="mint" size="lg">
              <KawaiiBook size={20} /> Learn More
            </KawaiiButton>
          </div>

          <KawaiiRainbow size={120} className="mt-2 opacity-80" />
        </div>
      </header>

      {/* ━━━ CONTENT ━━━ */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">

        {/* ── PROBLEM ── */}
        <Section id="problem" title="Teachers Are Overloaded with Administrative Work" subtitle="The current reality in education">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StickyNoteCard color="pink" tape tilt={-1} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiFrog size={32} />
                <h3 className="font-heading font-bold text-lg">Manual Attendance</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Manual attendance consumes valuable time that could be spent on teaching and student interaction.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="mint" tape tapeColor="#C8B6FF" tilt={1} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiPencil size={32} />
                <h3 className="font-heading font-bold text-lg">Repetitive Grading</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Grading and reports are repetitive and tiring tasks that drain teacher energy and focus.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="lavender" tape tilt={-0.5} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiCloud size={32} mood="sleepy" />
                <h3 className="font-heading font-bold text-lg">Scattered Data</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Academic data is scattered across multiple systems, making it difficult to get a complete picture.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="butter" tape tapeColor="#FFB5C8" tilt={0.5} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiShiba size={32} mood="sleepy" />
                <h3 className="font-heading font-bold text-lg">Teacher Burnout</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Teachers face burnout due to administrative overload, reducing their effectiveness in the classroom.
              </p>
            </StickyNoteCard>
          </div>
        </Section>

        {/* ── SOLUTION ── */}
        <Section id="solution" title="One Smart Academic Assistant" subtitle="Bringing everything together">
          <StickyNoteCard color="sky" tape tapeColor="#A8E6CF" className="max-w-4xl mx-auto p-8">
            <div className="flex items-center gap-4 mb-6">
              <KawaiiBobaCup size={48} flavor="matcha" />
              <div>
                <h3 className="font-heading font-bold text-xl text-text">Klasso AI Solution</h3>
                <p className="font-accent text-sm text-text-muted">Intelligent automation for modern education</p>
              </div>
            </div>
            <p className="font-body text-base text-text-muted leading-relaxed mb-6">
              Klasso AI brings everything into one platform — automating routine tasks, organizing academic data, and providing intelligent insights to improve efficiency.
            </p>
            <div className="flex flex-wrap gap-3">
              <KawaiiBadge variant="pink"><Sparkle size={12} /> Automated Tasks</KawaiiBadge>
              <KawaiiBadge variant="mint"><KawaiiBook size={12} /> Organized Data</KawaiiBadge>
              <KawaiiBadge variant="lavender"><KawaiiStar size={12} /> Smart Insights</KawaiiBadge>
            </div>
          </StickyNoteCard>
        </Section>

        {/* ── FEATURES ── */}
        <Section id="features" title="Powerful Features" subtitle="Everything you need for academic excellence">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StickyNoteCard color="pink" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiPencil size={32} />
                <h3 className="font-heading font-bold text-lg">Automated Attendance</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Smart attendance tracking with minimal manual input, saving hours each week.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="mint" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiStar size={32} mood="sparkle" />
                <h3 className="font-heading font-bold text-lg">AI-Based Grading</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Intelligent grading assistance with personalized feedback suggestions.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="lavender" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiBook size={32} />
                <h3 className="font-heading font-bold text-lg">Instant Reports</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Generate comprehensive reports in seconds, not hours.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="butter" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiCloud size={32} mood="happy" />
                <h3 className="font-heading font-bold text-lg">Performance Analytics</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Deep insights into student performance trends and patterns.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="sky" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiBobaCup size={32} flavor="strawberry" />
                <h3 className="font-heading font-bold text-lg">Smart Timetable</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                AI-optimized scheduling that maximizes learning efficiency.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="peach" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiMushroom size={32} color="purple" />
                <h3 className="font-heading font-bold text-lg">Centralized Records</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                All academic data in one secure, accessible location.
              </p>
            </StickyNoteCard>
          </div>
        </Section>

        {/* ── AI SECTION ── */}
        <Section id="ai" title="Powered by Intelligent Insights" subtitle="AI that understands education">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StickyNoteCard color="pink" tape tapeColor="#FFEAA7" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiShiba size={36} mood="excited" />
                <h3 className="font-heading font-bold text-lg">Risk Identification</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Automatically identify students at risk of falling behind, enabling early intervention.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="mint" tape tapeColor="#C8B6FF" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiFrog size={36} />
                <h3 className="font-heading font-bold text-lg">Trend Prediction</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Predict academic trends and performance patterns to inform teaching strategies.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="lavender" tape tapeColor="#FFB5C8" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiStrawberry size={36} />
                <h3 className="font-heading font-bold text-lg">Instant Reports</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Generate detailed reports instantly with AI-powered analysis and insights.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="butter" tape tapeColor="#A8E6CF" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <KawaiiStar size={36} mood="wink" />
                <h3 className="font-heading font-bold text-lg">Actionable Recommendations</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Receive specific, actionable recommendations to improve student outcomes.
              </p>
            </StickyNoteCard>
          </div>
        </Section>

        {/* ── ROLES ── */}
        <Section id="roles" title="Built for Everyone in Education" subtitle="Different roles, one powerful platform">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StickyNoteCard color="pink" className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <KawaiiShiba size={48} mood="happy" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">👩‍🏫 Teachers</h3>
              <p className="font-body text-sm text-text-muted">
                Manage classes, grading, and reports with AI assistance.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="mint" className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <KawaiiBook size={48} />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">🏫 Admins</h3>
              <p className="font-body text-sm text-text-muted">
                Monitor overall academic performance and school metrics.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="lavender" className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <KawaiiPencil size={48} />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">🎓 Students</h3>
              <p className="font-body text-sm text-text-muted">
                Track progress, view assignments, and monitor grades.
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="butter" className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <KawaiiHeart size={48} />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">👨‍👩‍👧 Parents</h3>
              <p className="font-body text-sm text-text-muted">
                Stay updated with reports and student progress.
              </p>
            </StickyNoteCard>
          </div>
        </Section>

        {/* ── CTA ── */}
        <Section id="cta" title="Let Teachers Focus on What Matters Most — Teaching" subtitle="Join thousands of educators already using Klasso AI">
          <div className="text-center">
            <StickyNoteCard color="sky" tape tapeColor="#FFB5C8" className="max-w-2xl mx-auto p-8">
              <div className="flex justify-center mb-6">
                <KawaiiRainbow size={80} />
              </div>
              <h3 className="font-heading font-bold text-2xl text-text mb-4">
                Ready to Transform Your Classroom?
              </h3>
              <p className="font-body text-base text-text-muted mb-6">
                Start your free trial today and see how Klasso AI can revolutionize your teaching experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/teacher">
                  <KawaiiButton variant="pink" size="lg">
                    <Sparkle size={20} /> Start Now
                  </KawaiiButton>
                </Link>
                <KawaiiButton variant="outline" size="lg">
                  <KawaiiBook size={20} /> Schedule Demo
                </KawaiiButton>
              </div>
            </StickyNoteCard>
          </div>
        </Section>

      </div>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="relative z-10 border-t-2 border-border py-8 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KawaiiShiba size={32} mood="happy" />
            <span className="font-heading font-bold text-text">Klasso AI</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-accent text-text-muted">Made with</span>
            <KawaiiHeart size={16} />
            <span className="font-accent text-text-muted">for educators</span>
            <Sparkle size={14} color="#FFEAA7" className="animate-kawaii-sparkle" />
          </div>
        </div>
      </footer>
    </main>
  );
}
