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
  ArrowUpRight,
  ChatCircleText,
  FileText,
  Funnel,
  Check,
  Star,
  Lightning,
  List,
  X,
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
            LESS ADMIN.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-stone-900 to-stone-400">
              MORE
            </span>{" "}
            <span className="text-accent">DOORS.</span>
          </h1>

          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto mb-12 font-light leading-relaxed tracking-tight">
            Nexset runs leasing, reporting, and acquisition for independent
            property managers. So you can grow your portfolio, not your
            to-do list.
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
            Three services, one platform.
          </h2>
          <p className="text-lg text-stone-400 mt-4 max-w-lg font-light leading-relaxed">
            You manage the properties. We manage the busywork.
          </p>
        </motion.div>

        {/* Service 1 — Leasing Bot (text left, visual right) */}
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
              Leasing Agent
            </h3>
            <p className="text-lg text-stone-400 mt-6 leading-relaxed font-light max-w-lg">
              Multichannel leasing qualification across SMS, Facebook
              Marketplace, Instagram DMs, and more. Prospects get instant
              replies, income screening, and showing booking 24/7. Unclear
              leads go to your team — never auto-rejected.
            </p>
          </div>

          {/* Leasing Agent — multichannel inbox demo */}
          <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Inbox header with channel tabs */}
            <div className="px-6 pt-5 pb-3 border-b border-stone-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-bold text-stone-900 tracking-tight">Inbox</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[14px] text-emerald-600 font-medium">Active</span>
                </div>
              </div>
              <div className="flex gap-1">
                {[
                  { label: "SMS", count: "1", active: true },
                  { label: "FB Marketplace", count: "3", active: false },
                  { label: "Instagram", count: "2", active: false },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    className={`px-3 py-1.5 rounded-lg text-[14px] font-semibold transition-colors ${
                      tab.active
                        ? "bg-stone-900 text-white"
                        : "text-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-1.5 ${tab.active ? "text-stone-400" : "text-stone-300"}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Thread list — segmented by funnel stage */}
            <div className="border-b border-stone-100">
              {[
                { name: "Marcelina Torres", preview: "Showing confirmed — Sat Apr 5 at 2pm", time: "2m", channel: "SMS", stage: "Showing booked", dot: "bg-emerald-400", active: true },
              ].map((thread) => (
                <div
                  key={thread.name}
                  className={`px-6 py-3.5 flex items-start gap-3 border-b border-stone-50 last:border-0 ${
                    thread.active ? "bg-accent/[0.03]" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[13px] font-bold text-stone-500">
                      {thread.name.split(" ").map(n => n[0]).join("")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-[14px] truncate ${thread.active ? "font-bold text-stone-900" : "font-medium text-stone-700"}`}>
                        {thread.name}
                      </p>
                      <span className="text-[13px] text-stone-400 font-mono shrink-0 ml-2">{thread.time}</span>
                    </div>
                    <p className="text-[13px] text-stone-400 truncate mt-0.5">{thread.preview}</p>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full ${thread.dot} shrink-0 mt-2`} />
                </div>
              ))}
            </div>

            {/* Active conversation */}
            <div className="px-5 py-4 space-y-2.5 bg-stone-50/30">
              <p className="text-[13px] text-stone-400 text-center font-medium uppercase tracking-wider mb-3">
                SMS — Marcelina Torres
              </p>
              <div className="flex justify-end">
                <div className="bg-stone-900 rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[82%]">
                  <p className="text-[14px] text-stone-100 leading-relaxed">
                    Hey I saw the 2bd on J street, is it still open?
                  </p>
                  <p className="text-[13px] text-stone-600 mt-1 font-mono">10:08 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[82%] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <p className="text-[14px] text-stone-600 leading-relaxed">
                    Hi Marcelina! Yes, the 2BR/1BA at 1847 J St is still available — $1,850/mo, water and trash included. When are you looking to move in?
                  </p>
                  <p className="text-[13px] text-stone-300 mt-1 font-mono">10:08 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-stone-900 rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[82%]">
                  <p className="text-[14px] text-stone-100 leading-relaxed">
                    Prob around june 1. Its just me and my boyfriend, we both work. Is there parking?
                  </p>
                  <p className="text-[13px] text-stone-600 mt-1 font-mono">10:11 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[82%] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <p className="text-[14px] text-stone-600 leading-relaxed">
                    There is — one covered spot included, second spot is $50/mo. June 1 works. A couple quick questions so I can get you set up for a showing: what is your combined monthly income before taxes?
                  </p>
                  <p className="text-[13px] text-stone-300 mt-1 font-mono">10:11 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-stone-900 rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[82%]">
                  <p className="text-[14px] text-stone-100 leading-relaxed">
                    Like 5800 together. Also we have a cat is that ok
                  </p>
                  <p className="text-[13px] text-stone-600 mt-1 font-mono">10:14 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[82%] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <p className="text-[14px] text-stone-600 leading-relaxed">
                    Cats are fine — there is a $300 pet deposit and $25/mo pet rent. Your income qualifies. I have openings Saturday at 10am or 2pm, or Monday at 5:30pm. Which works?
                  </p>
                  <p className="text-[13px] text-stone-300 mt-1 font-mono">10:14 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-stone-900 rounded-2xl rounded-br-md px-3.5 py-2.5 max-w-[82%]">
                  <p className="text-[14px] text-stone-100 leading-relaxed">
                    Sat at 2 works
                  </p>
                  <p className="text-[13px] text-stone-600 mt-1 font-mono">10:18 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[82%] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <p className="text-[14px] text-stone-600 leading-relaxed">
                    You are all set — Saturday April 5th at 2pm, 1847 J Street Unit B. Please bring a photo ID. See you there!
                  </p>
                  <p className="text-[13px] text-stone-300 mt-1 font-mono">10:18 AM</p>
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="px-6 py-3 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[14px] text-stone-400">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Qualified</span>
                <span>Showing booked</span>
              </div>
              <span className="text-[14px] text-stone-300 font-mono">Auto-handled</span>
            </div>
          </div>
        </motion.div>
        </ScrollFocus>

        {/* Service 2 — Owner Reports (visual left, text right — zigzag) */}
        <ScrollFocus>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center mb-32"
        >
          {/* Report document preview — scrollable full report */}
          <div className="order-2 md:order-1 bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col" style={{ maxHeight: "680px" }}>
            {/* Sticky document header */}
            <div className="px-7 pt-7 pb-4 border-b border-stone-100 shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-stone-400 uppercase tracking-[0.2em] font-semibold">
                    Monthly Owner Report
                  </p>
                  <p className="text-[15px] font-bold text-stone-900 mt-1 tracking-tight">
                    Halloran Portfolio
                  </p>
                  <p className="text-[13px] text-stone-400 mt-0.5">
                    1847 J Street (4 units) and 2215 Capitol Ave (6 units)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-stone-700">March 2026</p>
                  <p className="text-[14px] text-stone-400 font-mono mt-0.5">10 units total</p>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">

              {/* Portfolio KPIs */}
              <div className="px-7 py-4 border-b border-stone-100 grid grid-cols-4 gap-3">
                {[
                  { label: "Occupancy", value: "91%", prev: "83.3%", good: true },
                  { label: "Collection", value: "97.2%", prev: "94.8%", good: true },
                  { label: "NOI", value: "$14,820", prev: "$14,375", good: true },
                  { label: "Maint/unit", value: "$142", prev: "$173", good: true },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className="text-[13px] text-stone-400 uppercase tracking-wider">{m.label}</p>
                    <p className="text-[15px] font-bold font-mono text-stone-900 mt-0.5">{m.value}</p>
                    <p className="text-[13px] font-mono text-emerald-500 mt-0.5">vs {m.prev}</p>
                  </div>
                ))}
              </div>

              {/* Executive Summary */}
              <div className="px-7 py-5 border-b border-stone-100">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  Executive Summary
                </p>
                <p className="text-[14px] text-stone-600 leading-relaxed mb-2">
                  Your properties maintained <span className="font-semibold text-stone-800">91% occupancy</span> this
                  month across 10 managed units. The vacancy at 2215 Capitol Ave Unit 3 has been
                  actively marketed since March 8, generating 14 inquiries and two qualified showings.
                  We expect a signed lease by mid-April.
                </p>
                <p className="text-[14px] text-stone-600 leading-relaxed">
                  Net operating income increased <span className="font-semibold text-stone-800">3.1% to $14,820</span>,
                  driven by improved collection rates and lower maintenance spend following the HVAC
                  overhaul at 2215 Capitol Ave.
                </p>
              </div>

              {/* Property-by-Property Breakdown */}
              <div className="px-7 py-5 border-b border-stone-100">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  Property Breakdown
                </p>

                {/* Property 1 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-semibold text-stone-800">1847 J Street — Fourplex</p>
                    <span className="text-[13px] font-mono text-emerald-500">100% occupied</span>
                  </div>
                  <div className="bg-stone-50 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 px-3 py-1.5 text-[14px] text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-100">
                      <span>Unit</span><span>Tenant</span><span>Rent</span><span>Lease ends</span>
                    </div>
                    {[
                      { unit: "A", tenant: "R. Castillo", rent: "$1,850", end: "Nov 2026" },
                      { unit: "B", tenant: "M. Torres", rent: "$1,850", end: "Pending" },
                      { unit: "C", tenant: "J. Whitmore", rent: "$1,750", end: "Aug 2026" },
                      { unit: "D", tenant: "K. Pham", rent: "$1,800", end: "May 2026" },
                    ].map((u) => (
                      <div key={u.unit} className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 px-3 py-2 text-[13px] border-b border-stone-100/60 last:border-0">
                        <span className="font-mono text-stone-500">{u.unit}</span>
                        <span className="text-stone-700">{u.tenant}</span>
                        <span className="font-mono text-stone-700">{u.rent}</span>
                        <span className={`font-mono ${u.end === "May 2026" ? "text-amber-600" : "text-stone-400"}`}>{u.end}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Property 2 */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[14px] font-semibold text-stone-800">2215 Capitol Ave — 6 Units</p>
                    <span className="text-[13px] font-mono text-amber-500">83% occupied (1 vacant)</span>
                  </div>
                  <div className="bg-stone-50 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 px-3 py-1.5 text-[14px] text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-100">
                      <span>Unit</span><span>Tenant</span><span>Rent</span><span>Lease ends</span>
                    </div>
                    {[
                      { unit: "1", tenant: "A. Brennan", rent: "$1,475", end: "Jun 2026" },
                      { unit: "2", tenant: "T. Nguyen", rent: "$1,500", end: "Sep 2026" },
                      { unit: "3", tenant: "— Vacant —", rent: "$1,475", end: "Listed Mar 8" },
                      { unit: "4", tenant: "S. Delgado", rent: "$1,450", end: "Dec 2026" },
                      { unit: "5", tenant: "M. Okafor", rent: "$1,500", end: "Jun 2026" },
                      { unit: "6", tenant: "L. Petrovic", rent: "$1,525", end: "Oct 2026" },
                    ].map((u) => (
                      <div key={u.unit} className={`grid grid-cols-[1fr_2fr_1fr_1fr] gap-2 px-3 py-2 text-[13px] border-b border-stone-100/60 last:border-0 ${u.tenant.includes("Vacant") ? "bg-amber-50/50" : ""}`}>
                        <span className="font-mono text-stone-500">{u.unit}</span>
                        <span className={u.tenant.includes("Vacant") ? "text-amber-600 font-medium" : "text-stone-700"}>{u.tenant}</span>
                        <span className="font-mono text-stone-700">{u.rent}</span>
                        <span className={`font-mono ${u.tenant.includes("Vacant") ? "text-amber-500" : u.end === "Jun 2026" ? "text-amber-600" : "text-stone-400"}`}>{u.end}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delinquency */}
              <div className="px-7 py-5 border-b border-stone-100">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  Delinquency Report
                </p>
                <div className="bg-stone-50 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-2 px-3 py-1.5 text-[14px] text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-100">
                    <span>Tenant</span><span>Property</span><span>Owed</span><span>Days late</span>
                  </div>
                  {[
                    { tenant: "K. Pham", prop: "1847 J St, Unit D", owed: "$1,800", days: "12", resolved: true },
                    { tenant: "A. Brennan", prop: "2215 Capitol, Unit 1", owed: "$1,475", days: "3", resolved: false },
                  ].map((d) => (
                    <div key={d.tenant} className="grid grid-cols-[2fr_2fr_1fr_1fr] gap-2 px-3 py-2 text-[13px] border-b border-stone-100/60 last:border-0">
                      <span className="text-stone-700">{d.tenant}</span>
                      <span className="text-stone-500">{d.prop}</span>
                      <span className="font-mono text-stone-700">{d.owed}</span>
                      <span className="font-mono">
                        {d.resolved
                          ? <span className="text-emerald-500">Resolved</span>
                          : <span className="text-amber-600">{d.days} days</span>
                        }
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[14px] text-stone-400 mt-2">
                  Collection rate: <span className="font-mono font-semibold text-stone-700">97.2%</span> — up from 94.8% in February
                </p>
              </div>

              {/* Maintenance / Work Orders */}
              <div className="px-7 py-5 border-b border-stone-100">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  Maintenance Summary
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: "Completed", value: "7", color: "text-emerald-600" },
                    { label: "In progress", value: "2", color: "text-amber-600" },
                    { label: "Pending", value: "1", color: "text-stone-500" },
                  ].map((s) => (
                    <div key={s.label} className="bg-stone-50 rounded-lg p-2.5 text-center">
                      <p className={`text-[15px] font-bold font-mono ${s.color}`}>{s.value}</p>
                      <p className="text-[13px] text-stone-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { desc: "HVAC overhaul — 2215 Capitol Ave", cost: "$2,340", status: "Completed", statusColor: "text-emerald-500" },
                    { desc: "Garbage disposal replacement — 1847 J, Unit C", cost: "$185", status: "Completed", statusColor: "text-emerald-500" },
                    { desc: "Exterior paint touch-up — 1847 J St", cost: "$620", status: "In progress", statusColor: "text-amber-500" },
                    { desc: "Leaking faucet — 2215 Capitol, Unit 5", cost: "Est. $90", status: "Pending", statusColor: "text-stone-400" },
                  ].map((w) => (
                    <div key={w.desc} className="flex items-center justify-between text-[13px] py-1.5">
                      <span className="text-stone-600 flex-1">{w.desc}</span>
                      <span className="font-mono text-stone-500 mx-3">{w.cost}</span>
                      <span className={`font-medium ${w.statusColor}`}>{w.status}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[14px] text-stone-400 mt-3">
                  Total spend: <span className="font-mono font-semibold text-stone-700">$1,426</span> ($142/unit) — down 18% from February
                </p>
              </div>

              {/* Lease Expirations */}
              <div className="px-7 py-5 border-b border-stone-100">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  Upcoming Lease Expirations
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { window: "30 days", count: "1", units: "1847 J, Unit D" },
                    { window: "60 days", count: "2", units: "2215 Capitol, Units 1 & 5" },
                    { window: "90 days", count: "1", units: "1847 J, Unit C" },
                  ].map((e) => (
                    <div key={e.window} className="bg-stone-50 rounded-lg p-2.5">
                      <p className="text-[13px] text-stone-400 font-medium">{e.window}</p>
                      <p className="text-[14px] font-bold font-mono text-stone-900">{e.count}</p>
                      <p className="text-[13px] text-stone-400 mt-0.5">{e.units}</p>
                    </div>
                  ))}
                </div>
                <p className="text-[14px] text-stone-400">
                  Renewal notice sent to K. Pham (Unit D, May 31) with proposed 2.8% increase.
                  Awaiting response.
                </p>
              </div>

              {/* Recommendations */}
              <div className="px-7 py-5 border-b border-stone-100">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  Recommendations
                </p>
                <div className="space-y-3">
                  {[
                    { title: "Rent increase — 2215 Capitol, Unit 2", desc: "Current rent $1,500 is 6% below comparable units in the area. Recommend increasing to $1,575 at September renewal." },
                    { title: "Vacancy — 2215 Capitol, Unit 3", desc: "34 days on market. Two qualified showings this week. If no signed lease by April 15, recommend reducing asking rent from $1,475 to $1,425." },
                    { title: "Preventive maintenance", desc: "Water heater at 1847 J St is 11 years old. Recommend budgeting $1,200 for replacement within the next 6 months to avoid emergency costs." },
                  ].map((r) => (
                    <div key={r.title} className="bg-accent/[0.04] border border-accent/[0.08] rounded-xl p-3.5">
                      <p className="text-[13px] font-semibold text-stone-800">{r.title}</p>
                      <p className="text-[13px] text-stone-500 leading-relaxed mt-1">{r.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year-over-Year */}
              <div className="px-7 py-5">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  Year-over-Year Comparison
                </p>
                <div className="bg-stone-50 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-3 py-1.5 text-[14px] text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-100">
                    <span>Metric</span><span>Mar 2025</span><span>Mar 2026</span><span>Change</span>
                  </div>
                  {[
                    { metric: "Occupancy", prev: "87%", curr: "91%", change: "+4%", good: true },
                    { metric: "Avg rent", prev: "$1,672", curr: "$1,718", change: "+2.7%", good: true },
                    { metric: "Collection rate", prev: "93.1%", curr: "97.2%", change: "+4.1%", good: true },
                    { metric: "NOI", prev: "$13,240", curr: "$14,820", change: "+11.9%", good: true },
                    { metric: "Maintenance/unit", prev: "$128", curr: "$142", change: "+10.9%", good: false },
                    { metric: "Avg days vacant", prev: "24.3", curr: "18.4", change: "-24.3%", good: true },
                  ].map((r) => (
                    <div key={r.metric} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-3 py-2 text-[13px] border-b border-stone-100/60 last:border-0">
                      <span className="text-stone-700">{r.metric}</span>
                      <span className="font-mono text-stone-400">{r.prev}</span>
                      <span className="font-mono text-stone-700">{r.curr}</span>
                      <span className={`font-mono font-medium ${r.good ? "text-emerald-500" : "text-amber-500"}`}>{r.change}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Sticky document footer */}
            <div className="px-7 py-3 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between shrink-0">
              <p className="text-[14px] text-stone-400">Generated by Nexset</p>
              <div className="flex items-center gap-3">
                <button className="text-[14px] font-semibold text-accent">Download PDF</button>
                <button className="text-[14px] font-semibold text-stone-400">Email to owner</button>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-stone-900 mt-3 leading-[0.92]">
              Owner Reports
            </h3>
            <p className="text-lg text-stone-400 mt-6 leading-relaxed font-light max-w-lg">
              Upload your AppFolio or Buildium export, pick the owner, and get a
              plain-language narrative with occupancy, collection, maintenance,
              NOI, and lease expiration data — ready to send or download as PDF.
            </p>
          </div>
        </motion.div>
        </ScrollFocus>

        {/* Service 3 — Pipeline (text left, visual right) */}
        <ScrollFocus>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center"
        >
          <div>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-stone-900 mt-3 leading-[0.92]">
              Owner Pipeline
            </h3>
            <p className="text-lg text-stone-400 mt-6 leading-relaxed font-light max-w-lg">
              Every week, we scan county records, Zillow listings, and LinkedIn
              to find self-managing landlords in your market. Each lead gets a
              personalized outreach email drafted and ready to send — written
              from context we pull about their property, vacancy history, and
              management situation.
            </p>
          </div>

          {/* Pipeline — scrollable CRM with outreach preview */}
          <div className="bg-white rounded-[2rem] border border-stone-200/60 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col" style={{ maxHeight: "720px" }}>
            {/* Header with filters */}
            <div className="px-6 pt-5 pb-3 border-b border-stone-100 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-bold text-stone-900 tracking-tight">Lead Pipeline</p>
                <span className="text-[14px] font-mono text-stone-400">23 total leads</span>
              </div>
              <div className="flex gap-1">
                {[
                  { label: "All", count: "23", active: true },
                  { label: "New", count: "7", active: false },
                  { label: "Contacted", count: "6", active: false },
                  { label: "Responded", count: "4", active: false },
                  { label: "Booked", count: "3", active: false },
                ].map((f) => (
                  <button
                    key={f.label}
                    className={`px-2.5 py-1 rounded-md text-[13px] font-semibold ${
                      f.active ? "bg-stone-900 text-white" : "text-stone-400 hover:bg-stone-50"
                    }`}
                  >
                    {f.label} <span className="opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1">

              {/* Lead table with inline expandable row */}
              <div className="border-b border-stone-100">
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-6 py-2.5 border-b border-stone-100 text-[13px] text-stone-400 uppercase tracking-wider font-semibold">
                  <span>Owner</span>
                  <span>Property</span>
                  <span>Units</span>
                  <span>Source</span>
                  <span>Status</span>
                </div>

                {/* Elena Stavros — collapsed */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-6 py-3 border-b border-stone-50 hover:bg-stone-50/50 transition-colors duration-300 cursor-pointer">
                  <p className="text-[14px] font-medium text-stone-800 self-center">Elena Stavros</p>
                  <p className="text-[13px] text-stone-500 self-center">7841 Greenback Ln</p>
                  <p className="text-[13px] font-mono text-stone-600 self-center">8</p>
                  <p className="text-[14px] text-stone-400 self-center">Referral</p>
                  <span className="inline-flex items-center gap-1.5 self-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[14px] text-stone-500">Meeting booked</span>
                  </span>
                </div>

                {/* Constance Okafor — EXPANDED with detail + email */}
                <div className="border-b border-stone-50">
                  <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-6 py-3 bg-accent/[0.03] cursor-pointer">
                    <p className="text-[14px] font-bold text-stone-900 self-center">Constance Okafor</p>
                    <p className="text-[13px] text-stone-500 self-center">4920 Madison Ave</p>
                    <p className="text-[13px] font-mono text-stone-600 self-center">12</p>
                    <p className="text-[14px] text-stone-400 self-center">LinkedIn</p>
                    <span className="inline-flex items-center gap-1.5 self-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-[14px] text-stone-500">New</span>
                    </span>
                  </div>

                  {/* Expanded detail */}
                  <div className="px-6 py-4 bg-stone-50/40 border-t border-stone-100/60">
                    <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-2.5">
                      Lead Detail
                    </p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-4">
                      {[
                        { label: "Property", value: "4920 Madison Ave, Carmichael" },
                        { label: "Estimated units", value: "12" },
                        { label: "Owner since", value: "2018" },
                        { label: "Property manager", value: "None on file" },
                        { label: "Current vacancies", value: "2 (per Zillow)" },
                        { label: "Last assessed value", value: "$1.84M" },
                        { label: "Days on market", value: "45+ days (2 units)" },
                        { label: "Annual tax", value: "$18,420" },
                      ].map((d) => (
                        <div key={d.label} className="flex justify-between text-[13px] py-0.5">
                          <span className="text-stone-400">{d.label}</span>
                          <span className="font-medium text-stone-700 text-right">{d.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Outreach email */}
                    <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-2.5 mt-4">
                      Generated Outreach Email
                    </p>
                    <div className="bg-white rounded-xl border border-stone-200/40 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-stone-200/40">
                        <div className="space-y-1">
                          <div className="flex gap-2 text-[14px]">
                            <span className="text-stone-400 w-8">To:</span>
                            <span className="text-stone-700">constance.okafor@gmail.com</span>
                          </div>
                          <div className="flex gap-2 text-[14px]">
                            <span className="text-stone-400 w-8">Subj:</span>
                            <span className="text-stone-700">Your 12-unit on Madison Ave — quick question</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3">
                        <div className="text-[13px] text-stone-600 leading-relaxed space-y-2.5">
                          <p>Hi Constance,</p>
                          <p>
                            I noticed your 12-unit at 4920 Madison Ave has two vacancies
                            that have been on Zillow for about six weeks. Managing a
                            building that size without a property manager is a lot of work,
                            especially when units are sitting empty.
                          </p>
                          <p>
                            We work with independent landlords in the area who are in a
                            similar situation — good properties, just stretched thin on the
                            operational side. Our clients typically fill vacancies 40% faster
                            and spend about 15 hours less per month on admin.
                          </p>
                          <p>
                            Would a 15-minute call this week make sense? Happy to share
                            what we have done for a similar 10-unit portfolio nearby.
                          </p>
                          <p className="text-stone-500">
                            Best,<br />
                            Ridgeline Property Group
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-stone-50/80 border-t border-stone-200/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-[13px] text-stone-500">Personalized from lead data</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-[14px] font-semibold text-accent">Send</button>
                          <button className="text-[14px] font-semibold text-stone-400">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Martin Fleischer — collapsed */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-6 py-3 border-b border-stone-50 hover:bg-stone-50/50 transition-colors duration-300 cursor-pointer">
                  <p className="text-[14px] font-medium text-stone-800 self-center">Martin Fleischer</p>
                  <p className="text-[13px] text-stone-500 self-center">2290 Fulton Ave</p>
                  <p className="text-[13px] font-mono text-stone-600 self-center">4</p>
                  <p className="text-[14px] text-stone-400 self-center">Zillow</p>
                  <span className="inline-flex items-center gap-1.5 self-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[14px] text-stone-500">Contacted</span>
                  </span>
                </div>

                {/* Nkechi Udoh — collapsed */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-6 py-3 border-b border-stone-50 hover:bg-stone-50/50 transition-colors duration-300 cursor-pointer">
                  <p className="text-[14px] font-medium text-stone-800 self-center">Nkechi Udoh</p>
                  <p className="text-[13px] text-stone-500 self-center">3418 Broadway</p>
                  <p className="text-[13px] font-mono text-stone-600 self-center">6</p>
                  <p className="text-[14px] text-stone-400 self-center">County</p>
                  <span className="inline-flex items-center gap-1.5 self-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-[14px] text-stone-500">New</span>
                  </span>
                </div>

                {/* Haruki Tanabe — collapsed */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-6 py-3 border-b border-stone-50 hover:bg-stone-50/50 transition-colors duration-300 cursor-pointer">
                  <p className="text-[14px] font-medium text-stone-800 self-center">Haruki Tanabe</p>
                  <p className="text-[13px] text-stone-500 self-center">1556 Meadowview Rd</p>
                  <p className="text-[13px] font-mono text-stone-600 self-center">3</p>
                  <p className="text-[14px] text-stone-400 self-center">County</p>
                  <span className="inline-flex items-center gap-1.5 self-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-[14px] text-stone-500">New</span>
                  </span>
                </div>

                {/* Piotr Zelenko — collapsed */}
                <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-2 px-6 py-3 border-b border-stone-50 last:border-0 hover:bg-stone-50/50 transition-colors duration-300 cursor-pointer">
                  <p className="text-[14px] font-medium text-stone-800 self-center">Piotr Zelenko</p>
                  <p className="text-[13px] text-stone-500 self-center">910 El Camino Ave</p>
                  <p className="text-[13px] font-mono text-stone-600 self-center">5</p>
                  <p className="text-[14px] text-stone-400 self-center">County</p>
                  <span className="inline-flex items-center gap-1.5 self-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[14px] text-stone-500">Contacted</span>
                  </span>
                </div>
              </div>

              {/* Weekly scan summary */}
              <div className="px-6 py-5">
                <p className="text-[13px] text-stone-400 uppercase tracking-[0.15em] font-semibold mb-3">
                  This Week&apos;s Scan Results
                </p>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[
                    { label: "New leads found", value: "4", color: "text-blue-600" },
                    { label: "Emails drafted", value: "4", color: "text-accent" },
                    { label: "Replies received", value: "1", color: "text-emerald-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-stone-50 rounded-lg p-2.5 text-center">
                      <p className={`text-[15px] font-bold font-mono ${s.color}`}>{s.value}</p>
                      <p className="text-[13px] text-stone-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] text-stone-400">
                    Sources scanned: <span className="text-stone-600">County assessor records, Zillow FSBO listings, LinkedIn property groups</span>
                  </p>
                  <p className="text-[14px] text-stone-400">
                    Filters: <span className="text-stone-600">Self-managing, 3+ units, no PM on file, within 25mi radius</span>
                  </p>
                </div>
              </div>

            </div>

            {/* Sticky footer */}
            <div className="px-6 py-3 bg-stone-50/60 border-t border-stone-100 flex items-center justify-between shrink-0">
              <p className="text-[14px] text-stone-400">Updated weekly</p>
              <p className="text-[14px] text-stone-400 font-mono">Next scan: Monday 6am</p>
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
          15-minute call where we walk through your current portfolio,
          identify where these services plug in, and map out what
          implementation looks like for your team.
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

const testimonials = [
  {
    name: "Ridgeline Property Group",
    role: "147 doors under management",
    content:
      "Dropped our leasing response time from 4 hours to 4 seconds. Three showings booked before I checked my phone Monday morning.",
    avatar: "https://picsum.photos/100/100?random=10",
  },
  {
    name: "Briarwood Management Co.",
    role: "Elk Grove — 92 doors",
    content:
      "Owner reports took two full days every month. Now they take thirty seconds and the owners actually read them.",
    avatar: "https://picsum.photos/100/100?random=11",
  },
  {
    name: "Folsom Creek Properties",
    role: "Folsom — 118 doors",
    content:
      "Found 23 self-managing landlords in our first week. Two signed management contracts within the month.",
    avatar: "https://picsum.photos/100/100?random=12",
  },
  {
    name: "Capitol Realty Group",
    role: "Midtown — 203 doors",
    content:
      "The bot handles the tire-kickers so my team only talks to qualified prospects. Our showing-to-lease ratio went from 5:1 to 2:1.",
    avatar: "https://picsum.photos/100/100?random=13",
  },
];

function Testimonials() {
  return (
    <section className="py-32 bg-[#FAFAF7] overflow-hidden">
      <div className="container mx-auto px-6 mb-14">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black tracking-tighter text-stone-900"
        >
          FROM THE <span className="text-accent">FIELD.</span>
        </motion.h2>
      </div>

      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#FAFAF7] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#FAFAF7] to-transparent z-10 pointer-events-none" />

        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6 px-6 md:px-20 py-4"
            drag="x"
            dragConstraints={{ left: -1200, right: 0 }}
            dragElastic={0.1}
          >
            {testimonials.concat(testimonials).map((t, i) => (
              <div
                key={i}
                className="w-[340px] md:w-[460px] flex-shrink-0 bg-white border border-stone-200/60 p-9 rounded-[40px] hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.06)] transition-shadow duration-700 group cursor-grab active:cursor-grabbing"
              >
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} weight="fill" className="text-accent" />
                  ))}
                </div>
                <blockquote className="text-xl font-light leading-relaxed mb-7 text-stone-700">
                  &ldquo;{t.content}&rdquo;
                </blockquote>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full border-2 border-accent/20"
                  />
                  <div>
                    <div className="font-bold text-stone-900 text-sm">{t.name}</div>
                    <div className="text-accent text-xs uppercase tracking-widest font-semibold">
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════
   STICKY CTA
   ═══════════════════════════════════════════════════════ */

function StickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-8 left-0 right-0 z-[60] flex justify-center pointer-events-none"
        >
          <div className="bg-stone-900 pointer-events-auto border border-stone-700 rounded-full p-2 pl-8 flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
            <div className="hidden md:block">
              <div className="text-white font-bold text-sm">Ready to run leaner?</div>
              <div className="text-stone-400 text-xs">Independent PMs are already onboard</div>
            </div>
            <button className="px-8 py-3 bg-accent text-white font-black rounded-full hover:bg-accent-light transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
              Book a Demo <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
            { title: "Services", links: ["Leasing Agent", "Owner Reports", "Owner Pipeline"] },
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
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
