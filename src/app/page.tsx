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
            Nexset reads, classifies, and handles your email — so you open
            one summary in the morning and see the state of your entire
            operation.
          </p>

        </motion.div>
      </motion.div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   SOCIAL PROOF — Brand marquee
   ═══════════════════════════════════════════════════════ */

function SocialProof() {
  const names = [
    "Ridgeline",
    "Briarwood",
    "Folsom Creek",
    "Oak Park Mgmt",
    "Capitol Realty",
    "Arden Group",
    "Natomas PM",
    "Elk Grove Prop",
    "Citrus Heights",
    "Land Park Co",
  ];

  return (
    <section className="py-20 border-y border-stone-200/60 bg-white overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white z-10 pointer-events-none" />
      <div className="container mx-auto px-6 mb-10 relative z-20">
        <p className="text-center text-stone-400 text-xs font-bold uppercase tracking-[0.25em]">
          Trusted by property managers nationwide
        </p>
      </div>
      <div className="relative flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 md:gap-32 items-center pr-20"
        >
          {[...names, ...names, ...names].map((name, i) => (
            <span
              key={i}
              className="text-4xl md:text-6xl font-black text-stone-200 hover:text-stone-400 transition-colors cursor-default tracking-tighter uppercase"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   FEATURES — Asymmetric 6-col bento with visualizations
   ═══════════════════════════════════════════════════════ */

function Features() {
  return (
    <section id="services" className="py-32 bg-[#FAFAF7] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header — editorial, not aggressive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="w-8 h-[1.5px] bg-accent mb-6" />
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-stone-900 leading-[0.92]">
            One service. Complete visibility.
          </h2>
          <p className="text-lg text-stone-400 mt-4 max-w-lg font-light leading-relaxed">
            You manage the portfolio. We manage the inbox.
          </p>
        </motion.div>

        {/* Service 1 — Executive Inbox (text left, visual right) */}
        <ScrollFocus>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32"
        >
          <div>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-stone-900 mt-3 leading-[0.92]">
              Executive Inbox
            </h3>
            <p className="text-lg text-stone-400 mt-6 leading-relaxed font-light max-w-lg">
              Every inbound email — tenants, owners, vendors, insurance — read,
              classified, and handled. Routine items auto-responded. Judgment
              calls drafted in your voice. Delegable work routed to the right VA
              with context. Emergencies flagged immediately. You get a morning
              digest and full visibility across your entire operation.
            </p>
          </div>

          {/* Executive Inbox — classified inbox demo */}
          <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col" style={{ maxHeight: "720px" }}>
            {/* Header with classification tabs */}
            <div className="px-6 pt-5 pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-bold text-stone-900 tracking-tight">Today&apos;s Inbox</p>
                <span className="text-[14px] font-mono text-stone-400">342 emails processed</span>
              </div>
              <div className="flex gap-1">
                {[
                  { label: "Auto-handled", count: "287", active: false },
                  { label: "Drafted", count: "12", active: false },
                  { label: "Routed to VA", count: "38", active: false },
                  { label: "Owner", count: "5", active: true },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    className={`px-2.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                      tab.active
                        ? "bg-stone-900 text-white"
                        : "text-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1 ${tab.active ? "text-stone-400" : "text-stone-300"}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable email list */}
            <div className="overflow-y-auto flex-1">
              {/* Email rows with classification badges */}
              {[
                { from: "T. Reeves", subject: "Rent will be late this month", time: "7:42 AM", badge: "Drafted", badgeColor: "bg-blue-100 text-blue-700", preview: "Draft ready — payment plan language, references lease clause 4.2" },
                { from: "Ace Plumbing", subject: "Invoice #4821 — 2847 Freeport water heater", time: "7:38 AM", badge: "Routed to VA", badgeColor: "bg-amber-100 text-amber-700", preview: "Sent to Maria (bookkeeping VA) with AppFolio work order match" },
                { from: "M. Johnson", subject: "RE: Lease renewal — 901 Alhambra A", time: "7:31 AM", badge: "Owner", badgeColor: "bg-red-100 text-red-700", preview: "Tenant counter-offering $1,600 vs your proposed $1,700. Needs your call." },
                { from: "D. Patel", subject: "Can I install a Ring doorbell?", time: "7:24 AM", badge: "Auto-handled", badgeColor: "bg-emerald-100 text-emerald-700", preview: "Auto-replied: approved per modification policy, no drilling into stucco" },
                { from: "State Farm", subject: "Policy renewal — 5540 Sky Pkwy", time: "7:18 AM", badge: "Routed to VA", badgeColor: "bg-amber-100 text-amber-700", preview: "Sent to Jessica (admin VA) — premium comparison flagged (+12%)" },
                { from: "M. Brooks", subject: "Garage door won't close", time: "6:55 AM", badge: "Auto-handled", badgeColor: "bg-emerald-100 text-emerald-700", preview: "Auto-replied: work order created, vendor dispatched within 24hrs" },
                { from: "R. Chen", subject: "When is my March distribution?", time: "6:48 AM", badge: "Auto-handled", badgeColor: "bg-emerald-100 text-emerald-700", preview: "Auto-replied: $12,000 processed March 28, arrives in 1-2 business days" },
                { from: "2205 Northgate tenant", subject: "Water heater leaking badly", time: "6:12 AM", badge: "Emergency", badgeColor: "bg-red-100 text-red-700", preview: "Emergency detected — vendor auto-dispatched, you were texted immediately" },
              ].map((email, i) => (
                <div key={i} className={`px-6 py-3 border-b border-stone-50 ${i === 0 ? "bg-accent/[0.03]" : "hover:bg-stone-50/50"} transition-colors duration-300`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className={`text-[14px] truncate ${i === 0 ? "font-bold text-stone-900" : "font-medium text-stone-700"}`}>{email.from}</p>
                      <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${email.badgeColor}`}>{email.badge}</span>
                    </div>
                    <span className="text-[13px] text-stone-400 font-mono shrink-0 ml-2">{email.time}</span>
                  </div>
                  <p className="text-[13px] text-stone-600 truncate">{email.subject}</p>
                  <p className="text-[13px] text-stone-400 truncate mt-0.5">{email.preview}</p>
                </div>
              ))}

              {/* Morning Digest preview */}
              <div className="px-6 py-5 bg-stone-50/60">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  Morning Digest
                </p>
                <div className="grid grid-cols-4 gap-3 mb-3">
                  {[
                    { label: "Auto-handled", value: "287", color: "text-emerald-600" },
                    { label: "Drafted", value: "12", color: "text-blue-600" },
                    { label: "Routed", value: "38", color: "text-amber-600" },
                    { label: "Need you", value: "5", color: "text-red-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-lg p-2 text-center border border-stone-100">
                      <p className={`text-[15px] font-bold font-mono ${s.color}`}>{s.value}</p>
                      <p className="text-[13px] text-stone-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[13px] text-stone-600">
                    <span className="font-semibold text-red-600">Emergency:</span> Water heater at 2205 Northgate — vendor dispatched 6:14 AM
                  </p>
                  <p className="text-[13px] text-stone-600">
                    <span className="font-semibold text-stone-800">Lease renewal:</span> M. Johnson counter-offered at 901 Alhambra A — needs your decision
                  </p>
                  <p className="text-[13px] text-stone-600">
                    <span className="font-semibold text-stone-800">VA alert:</span> 3 stalled vendor threads older than 48hrs flagged for follow-up
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between shrink-0">
              <p className="text-[14px] text-stone-400">84% auto-handled today</p>
              <span className="text-[14px] text-stone-300 font-mono">Updated 7:45 AM</span>
            </div>
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
          show you how classification works on real messages, and map
          out what implementation looks like for your team.
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
   TESTIMONIALS — Draggable horizontal
   ═══════════════════════════════════════════════════════ */



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
            { title: "Services", links: ["Executive Inbox"] },
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
        <SocialProof />
        <Features />
        <BookDemo />
      </main>
      <Footer />
    </div>
  );
}
