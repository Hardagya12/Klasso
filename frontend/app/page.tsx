"use client";

import React from "react";

import {
  KawaiiBobaCup, KawaiiShiba, KawaiiStrawberry, KawaiiCloud,
  KawaiiFrog, KawaiiMushroom, KawaiiStar, KawaiiPencil, KawaiiBook,
  Sparkle, KawaiiHeart, KawaiiBow, KawaiiRainbow, WashiTape, PawPrint, SakuraPetal,
} from "./components/doodles";

import {
  StickyNoteCard, KawaiiButton, KawaiiBadge, KawaiiInput, CloudStat, KawaiiAvatar,
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

export default function KawaiiShowcase() {
  return (
    <main className="min-h-screen bg-background bg-dots relative overflow-hidden">
      {/* ━━━ Floating background doodles ━━━ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <SakuraPetal size={20} className="absolute top-[8%] left-[5%] animate-kawaii-float opacity-30" />
        <SakuraPetal size={14} className="absolute top-[15%] right-[10%] animate-kawaii-float opacity-20" style={{ animationDelay: "1s" }} />
        <SakuraPetal size={18} className="absolute top-[45%] left-[3%] animate-kawaii-float opacity-25" style={{ animationDelay: "2s" }} />
        <PawPrint size={16} className="absolute top-[25%] right-[6%] opacity-15 animate-kawaii-float" style={{ animationDelay: "0.5s" }} />
        <PawPrint size={12} className="absolute top-[60%] left-[8%] opacity-10 animate-kawaii-float" style={{ animationDelay: "1.5s" }} />
        <Sparkle size={14} className="absolute top-[35%] right-[15%] animate-kawaii-sparkle opacity-25" />
        <Sparkle size={10} className="absolute top-[70%] left-[12%] animate-kawaii-sparkle opacity-20" style={{ animationDelay: "0.7s" }} />
        <KawaiiHeart size={14} className="absolute top-[50%] right-[4%] animate-kawaii-float opacity-15" style={{ animationDelay: "2.5s" }} />
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
              <span className="font-accent text-xl text-text-muted">Kawaii Stationery Shop</span>
              <div className="flex items-center gap-1.5">
                <KawaiiHeart size={14} />
                <Sparkle size={12} color="#C8B6FF" />
                <PawPrint size={12} color="#A8E6CF" />
              </div>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-text mb-3 leading-tight">
            Klasso{" "}
            <span className="text-primary">Design</span>{" "}
            <span className="relative inline-block">
              <span className="text-accent">System</span>
              <Sparkle size={20} color="#FFEAA7" className="absolute -top-3 -right-5 animate-kawaii-sparkle" />
            </span>
          </h1>

          <p className="text-base text-text-muted font-body max-w-xl mb-6 leading-relaxed">
            A hyper-cute pastel design system inspired by Japanese stationery shops.
            Every component is sprinkled with kawaii charm ✨🍓🐸
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <KawaiiButton variant="pink" size="lg">
              <KawaiiPencil size={20} /> Get Started
            </KawaiiButton>
            <KawaiiButton variant="mint" size="lg">
              <KawaiiBook size={20} /> Components
            </KawaiiButton>
            <KawaiiButton variant="outline" size="lg">
              View Docs
            </KawaiiButton>
          </div>

          <KawaiiRainbow size={120} className="mt-2 opacity-80" />
        </div>
      </header>

      {/* ━━━ CONTENT ━━━ */}
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">

        {/* ── COLOR PALETTE ── */}
        <Section id="colors" title="Pastel Palette" subtitle="Candy shop colors for every surface & accent">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {[
              { name: "Sakura Pink", color: "#FFB5C8",  bg: "bg-primary" },
              { name: "Mint Green",  color: "#A8E6CF",  bg: "bg-secondary" },
              { name: "Lavender",    color: "#C8B6FF",  bg: "bg-accent" },
              { name: "Butter",      color: "#FFEAA7",  bg: "bg-butter" },
              { name: "Baby Blue",   color: "#B8E8FC",  bg: "bg-sky" },
              { name: "Peach",       color: "#FFCBA4",  bg: "bg-peach" },
              { name: "Background",  color: "#FFF5F7",  bg: "bg-background" },
              { name: "Surface",     color: "#FFFFFF",  bg: "bg-surface" },
              { name: "Text",        color: "#4A4458",  bg: "bg-text" },
              { name: "Muted",       color: "#9B95A8",  bg: "bg-text-muted" },
            ].map(({ name, color }) => (
              <StickyNoteCard key={name} color="white" className="text-center p-3">
                <div className="w-full h-14 rounded-xl mb-2 border border-border" style={{ backgroundColor: color }} />
                <p className="font-heading font-bold text-xs">{name}</p>
                <p className="font-accent text-sm text-text-muted">{color}</p>
              </StickyNoteCard>
            ))}
          </div>
        </Section>

        {/* ── TYPOGRAPHY ── */}
        <Section id="typography" title="Typography" subtitle="Rounded fonts for maximum cuteness">
          <StickyNoteCard color="lavender" tape tapeColor="#FFB5C8" className="space-y-5 mb-6 max-w-2xl">
            <div>
              <KawaiiBadge variant="pink" className="mb-2">Nunito — Headings</KawaiiBadge>
              <h1 className="text-4xl font-heading font-extrabold">Hello, Sensei! 🌸</h1>
              <h2 className="text-2xl font-heading font-bold text-text-muted">Welcome to Klasso ✨</h2>
            </div>
            <WashiTape width={300} color="#A8E6CF" pattern="stripes" />
            <div>
              <KawaiiBadge variant="mint" className="mb-2">DM Sans — Body</KawaiiBadge>
              <p className="text-base font-body">
                Every great classroom starts with clear communication. Our typography is
                friendly, readable, and designed to feel like a warm hug. 🤗
              </p>
            </div>
            <WashiTape width={300} color="#FFEAA7" pattern="dots" />
            <div>
              <KawaiiBadge variant="lavender" className="mb-2">Caveat — Handwritten</KawaiiBadge>
              <p className="font-accent text-3xl text-accent-dark">
                &ldquo;You did amazing today!&rdquo;
              </p>
              <p className="font-accent text-lg text-text-muted mt-1">
                — Teacher&apos;s note 🍓
              </p>
            </div>
          </StickyNoteCard>
        </Section>

        {/* ── KAWAII SVG GALLERY ── */}
        <Section id="mascots" title="Kawaii Mascots" subtitle="Adorable friends that live throughout the UI">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { label: "Shiba (happy)", el: <KawaiiShiba size={56} mood="happy" /> },
              { label: "Shiba (sleepy)", el: <KawaiiShiba size={56} mood="sleepy" /> },
              { label: "Shiba (excited)", el: <KawaiiShiba size={56} mood="excited" /> },
              { label: "Cloud (happy)", el: <KawaiiCloud size={72} mood="happy" /> },
              { label: "Cloud (blushy)", el: <KawaiiCloud size={72} mood="blushy" color="#FFE0EA" /> },
              { label: "Boba (strawberry)", el: <KawaiiBobaCup size={52} flavor="strawberry" /> },
              { label: "Boba (taro)", el: <KawaiiBobaCup size={52} flavor="taro" /> },
              { label: "Boba (matcha)", el: <KawaiiBobaCup size={52} flavor="matcha" /> },
              { label: "Strawberry", el: <KawaiiStrawberry size={48} /> },
              { label: "Frog", el: <KawaiiFrog size={52} /> },
              { label: "Mushroom (pink)", el: <KawaiiMushroom size={48} color="pink" /> },
              { label: "Mushroom (mint)", el: <KawaiiMushroom size={48} color="mint" /> },
              { label: "Star (happy)", el: <KawaiiStar size={48} mood="happy" /> },
              { label: "Star (wink)", el: <KawaiiStar size={48} mood="wink" /> },
              { label: "Pencil", el: <KawaiiPencil size={48} /> },
              { label: "Book", el: <KawaiiBook size={48} /> },
              { label: "Mushroom (purple)", el: <KawaiiMushroom size={48} color="purple" /> },
              { label: "Cloud (sleepy)", el: <KawaiiCloud size={72} mood="sleepy" color="#E8DEFF" /> },
              { label: "Boba (classic)", el: <KawaiiBobaCup size={52} flavor="classic" /> },
              { label: "Strawberry (oo)", el: <KawaiiStrawberry size={48} happy={false} /> },
            ].map(({ label, el }) => (
              <StickyNoteCard
                key={label}
                color="white"
                className="flex flex-col items-center justify-center gap-2 p-4 min-h-[120px]"
              >
                {el}
                <span className="font-accent text-sm text-text-muted text-center">{label}</span>
              </StickyNoteCard>
            ))}
          </div>
        </Section>

        {/* ── DECORATIONS ── */}
        <Section id="decoratives" title="Decorations" subtitle="Sparkles, hearts, washi tape, paw prints & more">
          <div className="flex flex-wrap gap-6 items-center">
            <StickyNoteCard color="pink" className="flex flex-col items-center gap-2 p-4">
              <div className="flex gap-2">
                <Sparkle size={24} color="#FFEAA7" className="animate-kawaii-sparkle" />
                <Sparkle size={16} color="#FFB5C8" className="animate-kawaii-sparkle" style={{ animationDelay: "0.3s" }} />
                <Sparkle size={20} color="#C8B6FF" className="animate-kawaii-sparkle" style={{ animationDelay: "0.6s" }} />
              </div>
              <span className="font-accent text-sm text-text-muted">Sparkles</span>
            </StickyNoteCard>

            <StickyNoteCard color="mint" className="flex flex-col items-center gap-2 p-4">
              <div className="flex gap-2 items-center">
                <KawaiiHeart size={24} color="#FFB5C8" />
                <KawaiiHeart size={18} color="#C8B6FF" />
                <KawaiiHeart size={14} color="#FFEAA7" />
              </div>
              <span className="font-accent text-sm text-text-muted">Hearts</span>
            </StickyNoteCard>

            <StickyNoteCard color="lavender" className="flex flex-col items-center gap-2 p-4">
              <KawaiiBow size={36} color="#FFB5C8" />
              <span className="font-accent text-sm text-text-muted">Bow</span>
            </StickyNoteCard>

            <StickyNoteCard color="butter" className="flex flex-col items-center gap-2 p-4">
              <div className="flex gap-1.5">
                <PawPrint size={20} color="#FFB5C8" />
                <PawPrint size={20} color="#A8E6CF" />
                <PawPrint size={20} color="#C8B6FF" />
              </div>
              <span className="font-accent text-sm text-text-muted">Paw Prints</span>
            </StickyNoteCard>

            <StickyNoteCard color="sky" className="flex flex-col items-center gap-2 p-4">
              <KawaiiRainbow size={80} />
              <span className="font-accent text-sm text-text-muted">Rainbow</span>
            </StickyNoteCard>
          </div>

          <div className="mt-6 space-y-3">
            <p className="font-heading font-bold text-sm text-text">Washi Tape Strips</p>
            <div className="flex flex-col gap-3">
              <WashiTape width={280} color="#FFB5C8" pattern="stripes" />
              <WashiTape width={240} color="#A8E6CF" pattern="dots" />
              <WashiTape width={200} color="#C8B6FF" pattern="plain" />
              <WashiTape width={260} color="#FFEAA7" pattern="stripes" />
              <WashiTape width={220} color="#B8E8FC" pattern="dots" />
            </div>
          </div>
        </Section>

        {/* ── BUTTONS ── */}
        <Section id="buttons" title="Buttons" subtitle="Pill-shaped & bouncy with mascot icons">
          <div className="flex flex-wrap gap-3 mb-6">
            <KawaiiButton variant="pink"><KawaiiHeart size={14} /> Pink</KawaiiButton>
            <KawaiiButton variant="mint"><KawaiiStrawberry size={18} /> Mint</KawaiiButton>
            <KawaiiButton variant="lavender"><KawaiiStar size={18} mood="wink" /> Lavender</KawaiiButton>
            <KawaiiButton variant="butter"><Sparkle size={14} /> Butter</KawaiiButton>
            <KawaiiButton variant="outline">Outline</KawaiiButton>
            <KawaiiButton variant="ghost">Ghost</KawaiiButton>
          </div>
          <div className="flex flex-wrap gap-3">
            <KawaiiButton variant="pink" size="sm">Small</KawaiiButton>
            <KawaiiButton variant="pink" size="md">Medium</KawaiiButton>
            <KawaiiButton variant="pink" size="lg">Large</KawaiiButton>
          </div>
        </Section>

        {/* ── STICKY NOTE CARDS ── */}
        <Section id="cards" title="Sticky Note Cards" subtitle="Every card is a cute sticky note">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StickyNoteCard color="pink" tape tilt={-1}>
              <div className="flex items-center gap-2 mb-2">
                <KawaiiStrawberry size={28} />
                <h3 className="font-heading font-bold text-lg">Pink Note</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                A sakura pink sticky note! With washi tape on top. 🌸
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="mint" tape tapeColor="#C8B6FF" tilt={1}>
              <div className="flex items-center gap-2 mb-2">
                <KawaiiFrog size={28} />
                <h3 className="font-heading font-bold text-lg">Mint Note</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                A refreshing mint note with a friendly frog. 🐸
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="butter" tape tilt={-0.5}>
              <div className="flex items-center gap-2 mb-2">
                <KawaiiStar size={28} mood="sparkle" />
                <h3 className="font-heading font-bold text-lg">Butter Note</h3>
              </div>
              <p className="font-body text-sm text-text-muted">
                Warm and sunny like a butter cookie! ⭐
              </p>
            </StickyNoteCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <StickyNoteCard color="lavender">
              <div className="flex items-center gap-3 mb-3">
                <KawaiiBook size={32} />
                <div>
                  <h3 className="font-heading font-bold">Lavender Dreams</h3>
                  <p className="font-accent text-sm text-text-muted">No tilt, no tape — simple and sweet</p>
                </div>
              </div>
              <p className="font-body text-sm text-text-muted">
                Sometimes simplicity is the cutest thing of all. 💜
              </p>
            </StickyNoteCard>

            <StickyNoteCard color="sky" tape tapeColor="#FFCBA4" onClick={() => alert("Clicked! ✨")}>
              <div className="flex items-center gap-3 mb-3">
                <KawaiiBobaCup size={32} flavor="matcha" />
                <div>
                  <h3 className="font-heading font-bold">Interactive Card</h3>
                  <p className="font-accent text-sm text-text-muted">Click me! I bounce! 🧋</p>
                </div>
              </div>
            </StickyNoteCard>
          </div>
        </Section>

        {/* ── CLOUD STATS ── */}
        <Section id="stats" title="Cloud Stats" subtitle="Stats float inside happy cloud containers">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <CloudStat
              label="Students"
              value="1,247"
              subtitle="Across all classes"
              cloudColor="#B8E8FC"
            />
            <CloudStat
              label="Assignments"
              value="89"
              subtitle="Due this week"
              cloudColor="#FFE0EA"
            />
            <CloudStat
              label="Attendance"
              value="94%"
              subtitle="This month"
              cloudColor="#D4F5E6"
            />
            <CloudStat
              label="Gold Stars"
              value="312"
              subtitle="Awarded today"
              cloudColor="#FFF5D0"
              icon={<KawaiiStar size={18} mood="wink" />}
            />
          </div>
        </Section>

        {/* ── BADGES ── */}
        <Section id="badges" title="Badges" subtitle="Candy-colored pill tags">
          <div className="flex flex-wrap gap-3">
            <KawaiiBadge variant="pink"><KawaiiHeart size={10} /> Favorite</KawaiiBadge>
            <KawaiiBadge variant="mint"><Sparkle size={10} color="#7BCBA5" /> Completed</KawaiiBadge>
            <KawaiiBadge variant="lavender">Art Class</KawaiiBadge>
            <KawaiiBadge variant="butter">⭐ Top Student</KawaiiBadge>
            <KawaiiBadge variant="sky">📚 Reading</KawaiiBadge>
            <KawaiiBadge variant="peach">🎨 Creative</KawaiiBadge>
          </div>
        </Section>

        {/* ── AVATARS ── */}
        <Section id="avatars" title="Avatars" subtitle="Soft pastel initial rings">
          <div className="flex items-end gap-4 flex-wrap">
            <KawaiiAvatar name="Priya Sharma" size="lg" />
            <KawaiiAvatar name="Rahul Verma" size="md" />
            <KawaiiAvatar name="Anita Singh" size="sm" />
            <KawaiiAvatar name="David Wilson" size="lg" />
            <KawaiiAvatar name="Mary Johnson" size="md" />
            <KawaiiAvatar name="Kenji Tanaka" size="lg" />
          </div>
        </Section>

        {/* ── INPUTS ── */}
        <Section id="inputs" title="Form Inputs" subtitle="Rounded pill inputs with pastel focus glow">
          <div className="max-w-md space-y-4">
            <KawaiiInput
              label="Student Name 🌸"
              placeholder="Enter student name..."
              helperText="Full name as it appears in records"
              icon={<KawaiiPencil size={16} />}
            />
            <KawaiiInput
              label="Email 💌"
              placeholder="teacher@school.edu"
              type="email"
            />
            <KawaiiInput
              label="Grade ⭐"
              placeholder="e.g. 8th Grade"
              error="Oopsie! This field is required 🥺"
            />
          </div>
        </Section>

        {/* ── ANIMATIONS ── */}
        <Section id="animations" title="Animations" subtitle="Bouncy, wiggly, sparkly micro-interactions">
          <div className="flex flex-wrap gap-4 items-center">
            <StickyNoteCard color="pink" className="flex flex-col items-center gap-2 p-4">
              <KawaiiStrawberry size={40} className="animate-kawaii-bounce" />
              <span className="font-accent text-sm text-text-muted">Bounce</span>
            </StickyNoteCard>
            <StickyNoteCard color="mint" className="flex flex-col items-center gap-2 p-4">
              <KawaiiShiba size={48} className="animate-kawaii-wiggle" />
              <span className="font-accent text-sm text-text-muted">Wiggle</span>
            </StickyNoteCard>
            <StickyNoteCard color="lavender" className="flex flex-col items-center gap-2 p-4">
              <KawaiiBobaCup size={44} className="animate-kawaii-float" />
              <span className="font-accent text-sm text-text-muted">Float</span>
            </StickyNoteCard>
            <StickyNoteCard color="butter" className="flex flex-col items-center gap-2 p-4">
              <KawaiiMushroom size={40} className="animate-kawaii-pop" />
              <span className="font-accent text-sm text-text-muted">Pop</span>
            </StickyNoteCard>
            <StickyNoteCard color="sky" className="flex flex-col items-center gap-2 p-4">
              <Sparkle size={32} color="#FFEAA7" className="animate-kawaii-sparkle" />
              <span className="font-accent text-sm text-text-muted">Sparkle</span>
            </StickyNoteCard>
            <StickyNoteCard color="peach" className="flex flex-col items-center gap-2 p-4">
              <KawaiiStar size={40} className="animate-kawaii-spin" />
              <span className="font-accent text-sm text-text-muted">Spin</span>
            </StickyNoteCard>
          </div>
        </Section>

        {/* ── COMPOSITION ── */}
        <Section id="composition" title="Full Composition" subtitle="How it all comes together in a teacher profile card">
          <StickyNoteCard color="white" tape tapeColor="#C8B6FF" className="max-w-lg relative">
            {/* Floating doodles */}
            <div className="absolute top-2 right-3 animate-kawaii-float">
              <KawaiiStrawberry size={24} />
            </div>
            <div className="absolute bottom-3 right-4 opacity-60">
              <PawPrint size={14} color="#C8B6FF" />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <KawaiiAvatar name="Priya Sharma" size="lg" />
              <div>
                <h3 className="font-heading font-bold">Priya Sharma</h3>
                <p className="font-accent text-sm text-text-muted">
                  Class 8-B · Math Teacher 📐
                </p>
              </div>
              <KawaiiBadge variant="mint" className="ml-auto">
                <Sparkle size={10} color="#7BCBA5" /> Active
              </KawaiiBadge>
            </div>

            <WashiTape width={380} color="#FFB5C8" pattern="stripes" className="mb-4" />

            <div className="grid grid-cols-3 gap-3 mb-4">
              <CloudStat label="Students" value="32" cloudColor="#FFE0EA" />
              <CloudStat label="Attend %" value="96" cloudColor="#D4F5E6" />
              <CloudStat label="Rating" value="4.8" cloudColor="#E8DEFF" icon={<KawaiiStar size={14} mood="wink" />} />
            </div>

            <StickyNoteCard color="butter" className="text-sm mb-4">
              <div className="flex items-start gap-2">
                <KawaiiStar size={20} mood="sparkle" className="shrink-0 mt-0.5" />
                <p className="font-body text-text-muted">
                  Priya&apos;s class has the highest engagement score this week! ✨
                </p>
              </div>
            </StickyNoteCard>

            <div className="flex gap-3">
              <KawaiiButton variant="pink" size="sm">
                <KawaiiPencil size={14} /> View Profile
              </KawaiiButton>
              <KawaiiButton variant="ghost" size="sm">
                Send Message 💌
              </KawaiiButton>
            </div>
          </StickyNoteCard>
        </Section>

      </div>

      {/* ━━━ FOOTER ━━━ */}
      <footer className="relative z-10 border-t-2 border-border py-8 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KawaiiShiba size={32} mood="happy" />
            <span className="font-heading font-bold text-text">Klasso Design System</span>
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
