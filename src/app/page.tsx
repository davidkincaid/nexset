"use client";

import React, { useState, useEffect, useRef, useMemo, memo } from "react";
import {
  motion,
  AnimatePresence,
  useTransform,
  useSpring,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import {
  ArrowRight,
} from "@phosphor-icons/react";
import { Check, Clock, X as XIcon, ChevronDown } from "lucide-react";
import Wordmark from "@/components/Wordmark";

const spring = { type: "spring" as const, stiffness: 100, damping: 20 };

/* ═══════════════════════════════════════════════════════
   SCROLL FOCUS — scale + sharpen when centered in viewport
   ═══════════════════════════════════════════════════════ */

function ScrollFocus({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // 0 = top of viewport, 0.5 = centered, 1 = exited top
  // Scale: starts at 0.92, peaks at 1 when centered, back to 0.92
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.5, 0.7, 1], [0.92, 0.97, 1, 0.97, 0.92]);
  const blur = useTransform(scrollYProgress, [0, 0.25, 0.4, 0.6, 0.75, 1], [4, 1, 0, 0, 1, 4]);
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0.4, 0.85, 1, 0.85, 0.4]);

  const smoothScale = useSpring(scale, { stiffness: 120, damping: 20 });
  const smoothBlur = useSpring(blur, { stiffness: 120, damping: 20 });
  const smoothOpacity = useSpring(opacity, { stiffness: 120, damping: 20 });

  return (
    <motion.div
      ref={ref}
      style={{
        scale: smoothScale,
        opacity: smoothOpacity,
        filter: useTransform(smoothBlur, (v) => `blur(${v}px)`),
      }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════
   PARTICLE FIELD — warm-toned floating motes
   (VoltFlow pattern adapted for light background)
   ═══════════════════════════════════════════════════════ */

const ParticleField = memo(function ParticleField() {
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        size: Math.random() * 3 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 12 + Math.random() * 25,
        delay: Math.random() * -20,
        opacity: 0.08 + Math.random() * 0.15,
      })),
    []
  );

  return (
    <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-stone-400"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
          }}
          animate={{
            opacity: [p.opacity, p.opacity * 2.5, p.opacity],
            y: [0, -25, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   HERO VIDEO — Cross-fade loop (no hard cut)
   ═══════════════════════════════════════════════════════ */

const HeroVideo = memo(function HeroVideo() {
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const [activeVideo, setActiveVideo] = useState<"a" | "b">("a");

  useEffect(() => {
    const vidA = videoARef.current;
    const vidB = videoBRef.current;
    if (!vidA || !vidB) return;

    const handleTimeUpdate = () => {
      const active = activeVideo === "a" ? vidA : vidB;
      const next = activeVideo === "a" ? vidB : vidA;

      if (active.duration && active.currentTime >= active.duration - 1) {
        next.currentTime = 0;
        next.play();
        setActiveVideo(activeVideo === "a" ? "b" : "a");
      }
    };

    const active = activeVideo === "a" ? vidA : vidB;
    active.addEventListener("timeupdate", handleTimeUpdate);
    return () => active.removeEventListener("timeupdate", handleTimeUpdate);
  }, [activeVideo]);

  return (
    <div className="absolute inset-0 z-0">
      <video
        ref={videoARef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{
          filter: "brightness(1.05) saturate(0.85)",
          opacity: activeVideo === "a" ? 1 : 0,
        }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <video
        ref={videoBRef}
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        style={{
          filter: "brightness(1.05) saturate(0.85)",
          opacity: activeVideo === "b" ? 1 : 0,
        }}
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════
   NAVBAR — Morphs to floating pill on scroll
   ═══════════════════════════════════════════════════════ */

function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <Wordmark hideTagline />
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════
   HERO — Mouse-reactive parallax + massive typography
   Grid pattern + floating orbs + particle field
   ═══════════════════════════════════════════════════════ */

function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const springCfg = { damping: 20, stiffness: 100, mass: 0.5 };
  const mxSpring = useSpring(mousePos.x, springCfg);
  const mySpring = useSpring(mousePos.y, springCfg);
  const textX = useTransform(mxSpring, [-0.5, 0.5], [-15, 15]);
  const textY = useTransform(mySpring, [-0.5, 0.5], [-15, 15]);
  const rotateX = useTransform(mySpring, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(mxSpring, [-0.5, 0.5], [-3, 3]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[100dvh] flex items-center overflow-hidden bg-[#FAFAF7] pt-20"
    >
      {/* Video background — cross-fade loop */}
      <HeroVideo />
      <div className="absolute inset-0 bg-[#FAFAF7]/40 z-[0]" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,162,158,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(168,162,158,0.04)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] z-[1]" />

      <ParticleField />

      {/* Dynamic orbs — track mouse + scroll */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <motion.div
          style={{
            x: useTransform(mxSpring, [-0.5, 0.5], [-40, 40]),
            y: y1,
          }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-accent rounded-full blur-[200px] opacity-[0.06]"
        />
        <motion.div
          style={{
            x: useTransform(mxSpring, [-0.5, 0.5], [40, -40]),
            y: y2,
          }}
          className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-stone-400 rounded-full blur-[180px] opacity-[0.04]"
        />
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#FAFAF7] to-transparent z-[5] pointer-events-none" />

      {/* Hero content — mouse parallax */}
      <motion.div
        style={{ x: textX, y: textY, rotateX, rotateY, perspective: 1000 }}
        className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-[110px] lg:text-[130px] font-black leading-[0.85] tracking-tighter mb-8 text-stone-900">
            YOUR INBOX,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-stone-900 to-stone-400">
              FULLY
            </span>{" "}
            <span className="text-accent">HANDLED.</span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-12 font-light leading-relaxed tracking-tight">
            A 24/7 operations layer that reads, classifies, and handles every
            email hitting your inbox — so you open one summary in the morning
            and see the state of your entire operation.
          </p>

        </motion.div>
      </motion.div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════
   INBOX DEMO — Interactive classified inbox
   ═══════════════════════════════════════════════════════ */

type InboxEmail = {
  from: string;
  subject: string;
  time: string;
  category: string;
  preview: string;
  thread?: string;
};

const inboxEmails: InboxEmail[] = [
  { from: "D. Patel", subject: "Can I install a Ring doorbell?", time: "7:24 AM", category: "auto-handled", preview: "Auto-replied: approved per modification policy, no drilling into stucco" },
  { from: "M. Brooks", subject: "Garage door won't close", time: "6:55 AM", category: "auto-handled", preview: "Auto-replied: work order created, vendor dispatched within 24hrs" },
  { from: "R. Chen", subject: "When is my March distribution?", time: "6:48 AM", category: "auto-handled", preview: "Auto-replied: $12,000 processed March 28, arrives in 1-2 business days" },
  { from: "A. Brennan", subject: "Locked out — can someone let me in?", time: "6:30 AM", category: "auto-handled", preview: "Auto-replied: locksmith dispatched, after-hours lockout fee per lease Section 9.1" },
  { from: "S. Delgado", subject: "What's the move-out process?", time: "5:58 AM", category: "auto-handled", preview: "Auto-replied: 30-day written notice, move-out inspection checklist attached" },
  { from: "T. Reeves", subject: "Rent will be late this month", time: "7:42 AM", category: "drafted", preview: "Draft ready — payment plan language, references lease clause 4.2", thread: "Thread: 3 messages" },
  { from: "M. Johnson", subject: "RE: Lease renewal — 901 Alhambra A", time: "7:31 AM", category: "drafted", preview: "Draft ready — counter-offer response at $1,650, split the difference", thread: "Thread: 6 messages" },
  { from: "R. Chen", subject: "Why is there a $1,200 charge on my statement?", time: "7:10 AM", category: "drafted", preview: "Draft ready — explains security deposit held in trust, not part of disbursement", thread: "Thread: 2 messages" },
  { from: "K. Pham", subject: "Requesting early lease termination", time: "6:44 AM", category: "drafted", preview: "Draft ready — early termination clause 12.3, two months notice + fee", thread: "Thread: 4 messages" },
  { from: "J. Whitmore", subject: "Neighbor's dog barking all night", time: "6:20 AM", category: "drafted", preview: "Draft ready — noise complaint acknowledgment, references pet policy and next steps", thread: "Thread: 5 messages" },
  { from: "Ace Plumbing", subject: "Invoice #4821 — 2847 Freeport water heater", time: "7:38 AM", category: "routed", preview: "Sent to Maria (bookkeeping VA) with AppFolio work order match" },
  { from: "State Farm", subject: "Policy renewal — 5540 Sky Pkwy", time: "7:18 AM", category: "routed", preview: "Sent to Jessica (admin VA) — premium comparison flagged (+12%)" },
  { from: "Pro Handyman Svc", subject: "Scheduling confirmation — 3312 Stockton", time: "6:40 AM", category: "routed", preview: "Sent to Carlos (maintenance VA) — confirm tenant access window" },
  { from: "N. Udoh", subject: "Application submitted — 1088 Fulton Ave", time: "6:15 AM", category: "routed", preview: "Sent to Leasing VA — run screening, verify employment, check rental history" },
  { from: "City of Sacramento", subject: "Code compliance notice — 2847 Freeport", time: "5:45 AM", category: "routed", preview: "Sent to Jessica (admin VA) — respond by April 28, sidewalk vegetation issue" },
  { from: "2205 Northgate tenant", subject: "Water heater leaking badly", time: "6:12 AM", category: "owner", preview: "Emergency detected — vendor auto-dispatched, you were texted immediately", thread: "Thread: 7 messages — vendor + tenant" },
  { from: "R. Chen", subject: "Thinking about selling 4015 El Camino", time: "11:22 PM", category: "owner", preview: "Owner considering sale — impacts management agreement, needs your call", thread: "Thread: 2 messages" },
  { from: "M. Johnson", subject: "Why am I paying for that plumbing repair?", time: "10:48 PM", category: "owner", preview: "Owner disputing $875 expense — wants explanation of owner vs tenant responsibility", thread: "Thread: 4 messages" },
  { from: "Fresno Housing Authority", subject: "HAP contract renewal — 901 Alhambra B", time: "4:30 PM", category: "owner", preview: "Section 8 contract renewal requires your signature — deadline May 1", thread: "Thread: 3 messages" },
  { from: "D. Patel", subject: "I want to break my lease — job relocation", time: "3:15 PM", category: "owner", preview: "Tenant requesting immediate termination, needs your decision on penalty vs negotiation", thread: "Thread: 2 messages" },
];

const categoryConfig: Record<string, { label: string; badgeColor: string }> = {
  "auto-handled": { label: "Auto-handled", badgeColor: "bg-emerald-100 text-emerald-700" },
  "drafted": { label: "Drafted", badgeColor: "bg-blue-100 text-blue-700" },
  "routed": { label: "Routed to VA", badgeColor: "bg-amber-100 text-amber-700" },
  "owner": { label: "Owner", badgeColor: "bg-red-100 text-red-700" },
};

const categoryCounts: Record<string, number> = {
  "auto-handled": 24,
  "drafted": 12,
  "routed": 9,
  "owner": 5,
};

function InboxDemo() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const totalEmails = Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  const maxVisible = 5;
  const filteredEmails = activeTab === "all"
    ? inboxEmails.slice(0, maxVisible)
    : inboxEmails.filter((e) => e.category === activeTab).slice(0, maxVisible);

  const shownCount = filteredEmails.length;
  const totalForTab = activeTab === "all" ? totalEmails : categoryCounts[activeTab];

  return (
    <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-stone-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-stone-900 tracking-tight">Today&apos;s Inbox</p>
          <span className="text-[14px] font-mono text-stone-400">{totalEmails} emails processed</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
              activeTab === "all"
                ? "bg-stone-900 text-white"
                : "text-stone-400 hover:bg-stone-50"
            }`}
          >
            All
            <span className={`ml-1 ${activeTab === "all" ? "text-stone-400" : "text-stone-300"}`}>
              {totalEmails}
            </span>
          </button>
          {Object.entries(categoryCounts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === key
                  ? "bg-stone-900 text-white"
                  : "text-stone-400 hover:bg-stone-50"
              }`}
            >
              {categoryConfig[key].label}
              <span className={`ml-1 ${activeTab === key ? "text-stone-400" : "text-stone-300"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: "440px" }} className="overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            {filteredEmails.map((email, i) => (
              <div key={`${email.from}-${email.time}`} className={`px-6 py-3 border-b border-stone-50 ${i === 0 ? "bg-accent/[0.03]" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className={`text-[14px] truncate ${i === 0 ? "font-bold text-stone-900" : "font-medium text-stone-700"}`}>{email.from}</p>
                    {activeTab === "all" && (
                      <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${categoryConfig[email.category].badgeColor}`}>
                        {categoryConfig[email.category].label}
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] text-stone-400 font-mono shrink-0 ml-2">{email.time}</span>
                </div>
                <p className="text-[13px] text-stone-600 truncate">{email.subject}</p>
                <p className="text-[13px] text-stone-400 truncate mt-0.5">{email.preview}</p>
                {email.thread && (
                  <p className="text-[12px] text-stone-400 font-mono mt-1">↳ {email.thread}</p>
                )}
              </div>
            ))}
            {totalForTab > shownCount && (
              <div className="px-6 py-3 text-center">
                <p className="text-[13px] text-stone-400 font-mono">+ {totalForTab - shownCount} more</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMAIL WITH EXPANDABLE THREAD — Drafts + Owner-flagged
   ═══════════════════════════════════════════════════════ */

type PriorMessage = { from: string; time: string; body: string };

function EmailWithThread({
  badge,
  badgeMeta,
  priorMessages,
  current,
  response,
}: {
  badge: { label: string; classes: string };
  badgeMeta: string;
  priorMessages: PriorMessage[];
  current: { from: string; subject: string; body: string };
  response?: {
    tone: "draft" | "decision";
    label: string;
    body: string;
    actions?: { primary: string; secondary: string };
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const responseBg = response?.tone === "draft" ? "bg-blue-50/30" : "bg-red-50/20";
  const responseLabelColor = response?.tone === "draft" ? "text-blue-700" : "text-red-700";

  return (
    <>
      <div className="px-6 pt-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${badge.classes}`}>
            {badge.label}
          </span>
          <p className="text-[13px] text-stone-400">{badgeMeta}</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-2.5 flex items-center justify-between text-left border-b border-stone-100 hover:bg-stone-50/40 transition-colors"
      >
        <span className="text-[13px] text-stone-500 font-medium">
          {expanded ? "Hide thread" : `View full thread (${priorMessages.length} prior)`}
        </span>
        <ChevronDown
          size={14}
          className={`text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden bg-stone-50/50"
          >
            {priorMessages.map((msg, i) => (
              <div
                key={i}
                className="px-6 py-3 border-b border-stone-100 border-l-2 border-l-stone-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-semibold text-stone-700">{msg.from}</p>
                  <span className="text-[12px] font-mono text-stone-400">{msg.time}</span>
                </div>
                <p className="text-[13px] text-stone-500 leading-relaxed">{msg.body}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 py-4 border-b border-stone-100">
        <p className="text-[13px] text-stone-400 mb-1">From: {current.from}</p>
        <p className="text-[14px] font-semibold text-stone-800">{current.subject}</p>
        <p className="text-[14px] text-stone-500 mt-2 leading-relaxed">{current.body}</p>
      </div>

      {response && (
        <div className={`px-6 py-4 ${responseBg}`}>
          <p className={`text-[13px] font-semibold mb-2 ${responseLabelColor}`}>
            {response.label}
          </p>
          <p className="text-[14px] text-stone-600 leading-relaxed">{response.body}</p>
          {response.actions && (
            <div className="flex gap-2 mt-3">
              <button className="text-[14px] font-semibold text-accent">
                {response.actions.primary}
              </button>
              <button className="text-[14px] font-semibold text-stone-400">
                {response.actions.secondary}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   TASKS DEMO — Tab-filtered task list with row actions
   ═══════════════════════════════════════════════════════ */

const taskTabs = [
  { key: "today", label: "Due Today", count: 5 },
  { key: "week", label: "This Week", count: 12 },
  { key: "later", label: "Later", count: 8 },
  { key: "done", label: "Completed", count: 47 },
];

type Task = { tab: string; title: string; from: string; due: string };

const allTasks: Task[] = [
  // Due Today (spec tasks marked Today + fill-ins to reach 5)
  { tab: "today", title: "Review lease counter-offer at 901 Alhambra", from: "M. Johnson — proposed $1,600 vs your $1,700", due: "Today" },
  { tab: "today", title: "Confirm vendor ETA with tenant at 2205 Northgate", from: "Ace Plumbing — garage door follow-up", due: "Today" },
  { tab: "today", title: "Approve T. Reeves payment plan reply", from: "T. Reeves — 901 Alhambra Blvd B", due: "Today" },
  { tab: "today", title: "Decide on D. Patel early termination", from: "D. Patel — 4401 Marconi", due: "Today" },
  { tab: "today", title: "Sign State Farm renewal pre-approval", from: "State Farm — 5540 Sky Pkwy", due: "Today" },

  // This Week
  { tab: "week", title: "Follow up with State Farm on insurance quote", from: "State Farm email — 5540 Sky Pkwy renewal", due: "Friday, April 19" },
  { tab: "week", title: "Get refinancing comp for M. Johnson", from: "M. Johnson — 901 Alhambra", due: "This week" },
  { tab: "week", title: "Schedule plumber follow-up at 2847 Freeport", from: "Ace Plumbing invoice 4821", due: "Saturday, April 19" },
  { tab: "week", title: "Call R. Chen re: 4015 El Camino sale", from: "Owner inquiry — sale impacts management agreement", due: "Tuesday, April 22" },
  { tab: "week", title: "Run N. Udoh application screening", from: "Leasing pipeline — 1088 Fulton Ave", due: "Sunday, April 20" },

  // Later
  { tab: "later", title: "Prepare recertification docs for housing authority", from: "HACLA — tenant at 2847 Freeport", due: "April 28" },
  { tab: "later", title: "Sign HAP renewal at 901 Alhambra B", from: "Fresno Housing Authority", due: "May 1" },
  { tab: "later", title: "Q2 owner statement review for R. Chen", from: "Bookkeeping cycle", due: "May 5" },
  { tab: "later", title: "Annual rent increase letters batch", from: "4401 Marconi + 3 properties", due: "May 15" },
  { tab: "later", title: "Property tax review", from: "Sacramento County assessor", due: "June 1" },

  // Completed
  { tab: "done", title: "Sent A. Brennan locksmith dispatch confirmation", from: "After-hours lockout request", due: "Completed Apr 17" },
  { tab: "done", title: "Logged Pro Handyman scheduling at 3312 Stockton", from: "Vendor confirmation", due: "Completed Apr 17" },
  { tab: "done", title: "Replied to S. Delgado on move-out process", from: "Tenant inquiry", due: "Completed Apr 17" },
  { tab: "done", title: "Approved K. Pham early termination response", from: "K. Pham — 1432 Capitol Ave", due: "Completed Apr 16" },
  { tab: "done", title: "Sent J. Whitmore noise complaint acknowledgment", from: "Pet policy reference attached", due: "Completed Apr 16" },
];

function TasksDemo() {
  const [activeTab, setActiveTab] = useState("today");
  const tasksForTab = allTasks.filter((t) => t.tab === activeTab);
  const tabMeta = taskTabs.find((t) => t.key === activeTab);
  const moreCount = tabMeta ? tabMeta.count - tasksForTab.length : 0;

  return (
    <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-6 pt-5 pb-3 border-b border-stone-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[13px] font-bold text-stone-900 tracking-tight">Tasks from Your Inbox</p>
          <span className="text-[14px] font-mono text-stone-400">12 open</span>
        </div>
        <div className="flex gap-1">
          {taskTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                activeTab === t.key
                  ? "bg-stone-900 text-white"
                  : "text-stone-400 hover:bg-stone-50"
              }`}
            >
              {t.label}
              <span className={`ml-1 ${activeTab === t.key ? "text-stone-400" : "text-stone-300"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
        >
          {tasksForTab.map((task, i) => (
            <div
              key={i}
              className="px-6 py-3 border-b border-stone-50 flex items-center gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-stone-800">{task.title}</p>
                <p className="text-[13px] text-stone-500 mt-0.5">From: {task.from}</p>
                <p className="text-[12px] text-stone-400 italic mt-0.5">Due: {task.due}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  aria-label="Complete"
                  className="text-stone-300 hover:text-stone-500 transition-colors"
                >
                  <Check size={16} />
                </button>
                <button
                  aria-label="Snooze"
                  className="text-stone-300 hover:text-stone-500 transition-colors"
                >
                  <Clock size={16} />
                </button>
                <button
                  aria-label="Dismiss"
                  className="text-stone-300 hover:text-stone-500 transition-colors"
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>
          ))}
          {moreCount > 0 && (
            <div className="px-6 py-3 text-center">
              <p className="text-[13px] text-stone-400 font-mono">+ {moreCount} more</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURES — Asymmetric 6-col bento with visualizations
   ═══════════════════════════════════════════════════════ */

function Features() {
  return (
    <section id="services" className="py-32 bg-[#FAFAF7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="w-8 h-[1.5px] bg-accent mb-6" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-stone-900 leading-[0.92]">
            Every email. Classified.<br />Handled. Summarized.
          </h2>
          <p className="text-lg text-stone-400 mt-4 max-w-lg font-light leading-relaxed">
            You&apos;re managing 400+ doors and fielding 100+ emails a day.
            Even with a team, the inbox still lands on you. We handle the
            repetitive volume so you can spend your time where it counts.
          </p>
        </motion.div>

        {/* 1 — See what's handled (visual left, text right) */}
        <ScrollFocus>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32"
        >
          <div className="order-2 md:order-1">
            <InboxDemo />
          </div>

          <div className="order-1 md:order-2">
            <p className="text-[13px] text-accent uppercase tracking-[0.2em] font-semibold mb-2">Overnight</p>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-stone-900 mt-3 leading-[0.92]">
              See what&apos;s handled
            </h3>
            <p className="text-lg text-stone-400 mt-6 leading-relaxed font-light max-w-lg">
              Scan the classified inbox. 24 emails already taken care of:
              maintenance confirmations sent, rent questions answered, policy
              requests approved. Click any category to filter. Every message
              color-coded so you know what was auto-handled, what&apos;s
              drafted, what got routed, and what&apos;s flagged for you.
            </p>
          </div>
        </motion.div>
        </ScrollFocus>

        {/* 2 — Approve the drafts (text left, visual right) */}
        <ScrollFocus>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32"
        >
          <div>
            <p className="text-[13px] text-accent uppercase tracking-[0.2em] font-semibold mb-2">By 7 AM</p>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-stone-900 mt-3 leading-[0.92]">
              Approve the drafts
            </h3>
            <p className="text-lg text-stone-400 mt-6 leading-relaxed font-light max-w-lg">
              The emails that need your judgment come with drafted responses
              in your voice, with the right lease clauses, payment terms, and
              context pulled in. The system reads the full thread, not just
              the latest message, so drafts have prior context and flagged
              emails show the full conversation before you decide what to do.
              Read it, hit approve, or make a quick edit. Nothing sends
              without you.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Auto-response example */}
            <div className="px-6 pt-5 pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700">Auto-handled</span>
                <p className="text-[13px] text-stone-400">Responded in 4 seconds</p>
              </div>
            </div>
            <div className="px-6 py-4 border-b border-stone-100">
              <p className="text-[13px] text-stone-400 mb-1">From: D. Patel — 4401 Marconi Ave</p>
              <p className="text-[14px] font-semibold text-stone-800">Can I install a Ring doorbell?</p>
              <p className="text-[14px] text-stone-500 mt-2 leading-relaxed">Hey, I wanted to put up a Ring doorbell on my front door. Do I need permission for that? Thanks, Deepak</p>
            </div>
            <div className="px-6 py-4 bg-emerald-50/30">
              <p className="text-[13px] text-emerald-700 font-semibold mb-2">Auto-response sent</p>
              <p className="text-[14px] text-stone-600 leading-relaxed">Hi Deepak, you&apos;re welcome to install a Ring doorbell. Per your lease modification policy, we just ask that you avoid drilling into stucco and use the existing wiring if possible. No formal approval needed. Let us know if you need anything else!</p>
              <p className="text-[13px] text-stone-400 mt-3 font-mono">Matched: modification-policy-minor-exterior</p>
            </div>

            <div className="border-t border-stone-100" />

            {/* Draft example with expandable thread */}
            <EmailWithThread
              badge={{ label: "Drafted for review", classes: "bg-blue-100 text-blue-700" }}
              badgeMeta="Waiting on your approval"
              priorMessages={[
                {
                  from: "T. Reeves",
                  time: "Apr 15, 9:18 AM",
                  body: "Hey, just a heads up that I might be a few days late with rent this month. Had a car issue come up. I'll know more by Friday.",
                },
                {
                  from: "You",
                  time: "Apr 15, 11:42 AM",
                  body: "Thanks for the heads up Tanya. Let me know once you have a clearer picture and we can figure out next steps.",
                },
              ]}
              current={{
                from: "T. Reeves, 901 Alhambra Blvd B",
                subject: "Rent will be late this month",
                body: "Hi, I had an unexpected car repair and I won't be able to pay the full $1,600 until the 15th. Can I do a partial payment now?",
              }}
              response={{
                tone: "draft",
                label: "Draft response",
                body: "Hi Tanya, thank you for letting us know ahead of time. Per your lease (Section 4.2), partial payments can be arranged with written agreement. I can accept $800 now with the remaining $800 due by the 15th. Please confirm and I'll send over the payment plan letter. Let me know if you have any questions.",
                actions: { primary: "Approve & Send", secondary: "Edit" },
              }}
            />

            <div className="border-t border-stone-100" />

            {/* Owner-flagged example with expandable thread */}
            <EmailWithThread
              badge={{ label: "Owner-flagged", classes: "bg-red-100 text-red-700" }}
              badgeMeta="Needs your decision"
              priorMessages={[
                {
                  from: "M. Johnson",
                  time: "Apr 14, 4:12 PM",
                  body: "Hi, I see a charge on my owner statement for $875 for plumbing at 901 Alhambra A. What was this for?",
                },
                {
                  from: "You",
                  time: "Apr 15, 9:30 AM",
                  body: "Hi Marcus, that was for a kitchen sink trap replacement after the tenant reported a leak two weeks ago. I'll forward you the invoice.",
                },
                {
                  from: "Ace Plumbing (forwarded)",
                  time: "Apr 15, 10:15 AM",
                  body: "Invoice 4798: kitchen sink p-trap leak, replaced trap and valve assembly. Standard service call plus parts. $875.00.",
                },
              ]}
              current={{
                from: "M. Johnson, owner of 901 Alhambra A",
                subject: "Why am I paying for that plumbing repair?",
                body: "I thought tenant damage wasn't on me. Can you walk me through how the owner versus tenant responsibility works here? This is the third repair charge this quarter and I want to understand the pattern.",
              }}
              response={{
                tone: "decision",
                label: "Needs your decision",
                body: "Owner is disputing a $875 plumbing expense. Lease assigns normal wear-and-tear repairs to owner, tenant-caused damage to tenant. Plumber notes do not indicate tenant fault. You decide whether to absorb, recharge, or split.",
                actions: { primary: "Compose reply", secondary: "Snooze" },
              }}
            />
          </div>
        </motion.div>
        </ScrollFocus>

        {/* 3 — Open your digest (visual left, text right) */}
        <ScrollFocus>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32"
        >
          <div className="order-2 md:order-1 bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-bold text-stone-900 tracking-tight">Morning Digest</p>
                <span className="text-[14px] font-mono text-stone-400">April 16, 2026 · 7:00 AM</span>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-stone-100">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Auto-handled", value: "24", color: "text-emerald-600" },
                  { label: "Drafted", value: "12", color: "text-blue-600" },
                  { label: "Routed", value: "9", color: "text-amber-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-stone-50 rounded-lg p-2.5 text-center">
                    <p className={`text-[15px] font-bold font-mono ${s.color}`}>{s.value}</p>
                    <p className="text-[13px] text-stone-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4">
              <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-4">Overnight Summary</p>

              <div className="space-y-4">
                <div>
                  <p className="text-[13px] font-bold text-stone-800 mb-1.5">Handled (24 emails)</p>
                  <ul className="space-y-1 ml-2">
                    <li className="text-[13px] text-stone-600 leading-relaxed">12 rent receipt confirmations sent</li>
                    <li className="text-[13px] text-stone-600 leading-relaxed">8 maintenance request acknowledgments sent</li>
                    <li className="text-[13px] text-stone-600 leading-relaxed">3 application status responses sent</li>
                    <li className="text-[13px] text-stone-600 leading-relaxed">1 vendor payment confirmation sent</li>
                  </ul>
                </div>

                <div>
                  <p className="text-[13px] font-bold text-stone-800 mb-1.5">Drafted for your review (12 emails)</p>
                  <ul className="space-y-1 ml-2">
                    <li className="text-[13px] text-stone-600 leading-relaxed">Lease renewal counter-offer at 901 Alhambra (M. Johnson proposed $1,600 vs your $1,700)</li>
                    <li className="text-[13px] text-stone-600 leading-relaxed">Late rent payment plan request from T. Reeves ($800 now, $800 by 15th)</li>
                    <li className="text-[13px] text-stone-600 leading-relaxed">State Farm insurance renewal at 5540 Sky Pkwy (+12%, $220/yr increase)</li>
                    <li className="text-[13px] text-stone-600 leading-relaxed">Owner question about Q1 expenses from K. Patel</li>
                  </ul>
                </div>

                <div>
                  <p className="text-[13px] font-bold text-stone-800 mb-1.5">Routed to your team (9 emails)</p>
                  <ul className="space-y-1 ml-2">
                    <li className="text-[13px] text-stone-600 leading-relaxed">4 to Maria (bookkeeping)</li>
                    <li className="text-[13px] text-stone-600 leading-relaxed">3 to Carlos (maintenance)</li>
                    <li className="text-[13px] text-stone-600 leading-relaxed">2 to Jessica (admin)</li>
                  </ul>
                </div>

                <div>
                  <p className="text-[13px] font-bold text-stone-800 mb-1.5">Escalated overnight (1 email)</p>
                  <div className="ml-2 flex items-start gap-2 text-[13px]">
                    <span className="font-semibold shrink-0 text-red-600">Emergency:</span>
                    <span className="text-stone-600 leading-relaxed">Water heater at 2205 Northgate. Vendor dispatched 6:14 AM, tenant relocated to Unit 4 temporarily. SMS sent at 6:12 AM.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <p className="text-[13px] text-accent uppercase tracking-[0.2em] font-semibold mb-2">7:00 AM</p>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-stone-900 mt-3 leading-[0.92]">
              Open your digest
            </h3>
            <p className="text-lg text-stone-400 mt-6 leading-relaxed font-light max-w-lg">
              You sit down, open one email. The system ran 24/7 while you
              were away. Emergencies escalated via SMS the moment they came
              in. Routine emails auto-responded in real time. Everything
              else classified, drafted, or routed.
            </p>
            <p className="text-lg text-stone-400 mt-4 leading-relaxed font-light max-w-lg">
              This is the full recap. Nothing was filtered or ranked for
              you. You see everything the system did overnight so you can
              verify the work, catch any errors, and decide where to spend
              your morning.
            </p>
          </div>
        </motion.div>
        </ScrollFocus>

        {/* 4 — Never forget a follow-up (text left, visual right) */}
        <ScrollFocus>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center"
        >
          <div>
            <p className="text-[13px] text-accent uppercase tracking-[0.2em] font-semibold mb-2">Throughout the day</p>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-stone-900 mt-3 leading-[0.92]">
              Never forget a follow-up
            </h3>
            <p className="text-lg text-stone-400 mt-6 leading-relaxed font-light max-w-lg">
              Every email that creates an action item becomes a task. A
              vendor promises a quote Friday, it becomes a task. An owner
              asks about refinancing, it becomes a task. A housing
              authority sets a deadline, it becomes a task with that
              deadline.
            </p>
            <p className="text-lg text-stone-400 mt-4 leading-relaxed font-light max-w-lg">
              You see them all in one place, with the email they came
              from one click away. Mark complete as you go.
            </p>
          </div>

          <div>
            <TasksDemo />
          </div>
        </motion.div>
        </ScrollFocus>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   BOOK A DEMO
   ═══════════════════════════════════════════════════════ */

function BookDemo() {
  return (
    <section className="bg-stone-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center relative z-10"
      >
        <div className="w-8 h-[1.5px] bg-accent mx-auto mb-8" />
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white leading-[0.92]">
          See how it fits your business.
        </h2>
        <p className="text-base text-stone-400 mt-5 mx-auto max-w-md leading-relaxed font-light">
          15-minute call where we look at your current email volume,
          show you how classification works on your real messages, and
          map out what your team gets back — hours per week for you,
          more autonomy for your VAs, faster responses for your tenants and owners.
        </p>
        <div className="mt-10">
          <div className="relative group inline-block">
            <div className="absolute inset-0 bg-accent rounded-full blur-[20px] opacity-30 group-hover:opacity-50 transition-all duration-500 transform group-hover:scale-110" />
            <button className="relative px-10 py-5 bg-accent text-white font-bold text-lg rounded-full transition-all hover:scale-[1.02] active:scale-95 z-10 flex items-center gap-3">
              Book a consultation
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
        <p className="text-[14px] text-stone-500 mt-6 font-light">
          No commitment. No credit card. Just a conversation.
        </p>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════ */

function Footer() {
  return (
    <footer className="bg-stone-900 pt-24 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
          <div>
            <div className="mb-6">
              <Wordmark inverted size="small" />
            </div>
            <p className="text-stone-400 font-light leading-relaxed text-sm">
            </p>
          </div>
          {[
            { title: "Services", links: ["Executive Inbox", "Owner Reports", "Owner Pipeline (coming soon)"] },
            { title: "Company", links: ["About", "Process", "Contact"] },
            { title: "Legal", links: ["Privacy Policy", "Terms of Service"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-xs">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-stone-400 hover:text-accent transition-colors font-light text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-stone-800 text-stone-500 text-xs">
          <p className="font-semibold text-stone-400">Nexset</p>
          <p>powered by Nexset</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="relative min-h-[100dvh] bg-[#FAFAF7] text-stone-900 overflow-x-hidden">
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Features />
        <BookDemo />
      </main>
      <Footer />
    </div>
  );
}
