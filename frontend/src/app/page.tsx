"use client";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, Variants } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  Activity, 
  Globe, 
  Search,
  LineChart,
  Target,
  Terminal,
  Server,
  Database,
  Lock,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Scale,
  History,
  Workflow,
  CheckCircle2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { AuthModal } from "@/components/auth-modal";

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');

  // Trigger modal from query params (Middleware redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authType = params.get('auth');
    if (authType === 'login' || authType === 'signup') {
      setAuthInitialMode(authType);
      setIsAuthOpen(true);
    }
  }, []);

  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
  const rotateX = useTransform(scrollYProgress, [0, 0.2], [0, 5]);
  const springScale = useSpring(scale, { stiffness: 100, damping: 30 });

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.94 },
    visible: { 
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring" as any, stiffness: 100, damping: 20, duration: 0.8 } 
    }
  };

  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1, y: 0, filter: "blur(0px)",
      transition: { delay: i * 0.15, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] as any }
    })
  };

  const signals = [
    { t: "TSLA", s: 0.82, v: "+2.4%", d: "BULLISH_CONV" },
    { t: "AAPL", s: 0.45, v: "-0.8%", d: "NEUTRAL_SYNC" },
    { t: "NVDA", s: 0.98, v: "+8.1%", d: "ALPHA_SIGNAL" },
    { t: "BTC", s: 0.72, v: "+1.2%", d: "TRUST_HIGH" },
    { t: "ETH", s: 0.61, v: "+0.5%", d: "LIQUIDITY_FLOAT" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDFDFD] relative overflow-x-hidden selection:bg-primary/20 font-sans">
      <SiteHeader 
        onLoginClick={() => { setAuthInitialMode('login'); setIsAuthOpen(true); }}
        onSignupClick={() => { setAuthInitialMode('signup'); setIsAuthOpen(true); }}
      />

      {/* 🚀 TICKER SYSTEM */}
      <div className="bg-white border-b border-border/5 h-12 flex items-center overflow-hidden whitespace-nowrap relative z-[60]">
         <motion.div 
           animate={{ x: [0, -1000] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
           className="flex gap-20 items-center px-10"
         >
            {[...signals, ...signals, ...signals].map((s, i) => (
              <div key={i} className="flex items-center gap-4 group cursor-default">
                 <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{s.t}</span>
                 <div className="flex items-center gap-2">
                    <div className="h-1 w-8 bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{ width: `${s.s * 100}%` }} />
                    </div>
                    <span className={`text-[9px] font-black ${s.v.startsWith('+') ? 'text-accent' : 'text-destructive'}`}>{s.v}</span>
                 </div>
                 <span className="text-[8px] font-black opacity-20 uppercase tracking-widest">{s.d}</span>
              </div>
            ))}
         </motion.div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.06]" 
        style={{ backgroundImage: 'radial-gradient(circle, #4F46E5 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      <div className="absolute inset-x-0 top-0 h-[1000px] pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360, x: [0, 50, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[15%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-primary/20 via-indigo-500/10 to-transparent blur-[140px] opacity-60" 
        />
        <motion.div 
          animate={{ rotate: -360, x: [0, -50, 0] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[5%] -right-[15%] w-[60%] h-[60%] rounded-full bg-gradient-to-l from-accent/20 via-teal-400/10 to-transparent blur-[140px] opacity-60" 
        />
      </div>

      <main className="relative z-10">
        <section className="relative px-6 pt-24 pb-40 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="px-6 py-2 rounded-full border border-primary/20 bg-white/80 backdrop-blur-xl mb-12 flex items-center gap-3 shadow-[0_8px_32px_rgba(79,70,229,0.08)]"
          >
            <Zap className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">Consolidated Analyst Core v4.5</span>
          </motion.div>
          <motion.div initial="hidden" animate="visible" className="text-6xl md:text-[7.5rem] font-black tracking-[-0.04em] text-foreground leading-[0.9] flex flex-col items-center mb-12">
            <motion.div custom={0} variants={wordVariants}>Autonomous</motion.div>
            <motion.div custom={1} variants={wordVariants} className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-600 to-accent italic relative pb-4">
               Intelligence.
            </motion.div>
          </motion.div>
          <p className="text-base md:text-2xl text-muted-foreground/50 font-medium tracking-tight leading-relaxed max-w-xl mx-auto px-4 mb-16 italic">Aggregating global sentiment, liquidity flows, and SEC compliance into one unified node.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
               onClick={() => { setAuthInitialMode('signup'); setIsAuthOpen(true); }}
               className="h-16 px-14 text-[11px] rounded-[1.4rem] bg-foreground text-background font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex gap-4"
            >
               Launch Workstation <ChevronRight className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-6 px-8 py-3 bg-white/40 border border-white/10 rounded-2xl">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Active Nodes</span>
                  <span className="text-sm font-black text-foreground">12.8k+</span>
               </div>
               <div className="w-px h-6 bg-border/20" />
               <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Latency</span>
                  <span className="text-sm font-black text-primary">24ms</span>
               </div>
            </div>
          </div>
        </section>

        {/* 🧬 PREVIEW MODULE */}
        <section className="px-6 pb-48">
           <div className="max-w-6xl mx-auto">
              <motion.div style={{ scale: springScale, rotateX: rotateX }} className="relative rounded-[3rem] border border-white/80 bg-white/40 shadow-[0_64px_160px_-32px_rgba(79,70,229,0.15)] p-1 backdrop-blur-3xl group">
                 <div className="overflow-hidden rounded-[2.8rem] border border-white/20 aspect-[16/9] relative bg-[#010618] shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                        <Cpu className="w-20 h-20 text-primary mb-8 mx-auto animate-pulse shadow-primary/20 shadow-2xl" />
                        <h4 className="text-4xl font-black text-white italic tracking-tighter">Synthesizing...</h4>
                    </div>
                 </div>
              </motion.div>
           </div>
        </section>

        {/* ⛓️ THE ROADMAP */}
        <section className="py-24 px-6 overflow-hidden">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-32">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-primary mb-6">Workflow Sync</h2>
                 <h3 className="text-4xl md:text-5xl font-black tracking-tighter">Establish Connection in 3 Steps.</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-12 relative">
                 <div className="absolute top-1/2 left-0 w-full h-px bg-border/20 hidden md:block" />
                 {[
                   { t: "01. Initialize Node", d: "Connect your portfolio via Alpha Vantage API for real-time asset synchronization.", i: Server },
                   { t: "02. AI Synthesis", d: "FinBERT and Groq models audit 500+ daily sentiment nodes across all sectors.", i: Workflow },
                   { t: "03. Optimize Frontier", d: "Riskfolio MVO engine establishes your efficient frontier with high precision.", i: Target }
                 ].map((step, i) => (
                   <div key={i} className="relative z-10 flex flex-col items-center text-center p-8 bg-white/40 border border-white/60 rounded-[2.5rem] backdrop-blur-xl shadow-xl hover:-translate-y-2 transition-transform h-full">
                      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white mb-8 shadow-xl shadow-primary/20">
                         <step.i className="w-7 h-7" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter mb-4 uppercase text-[15px]">{step.t}</h4>
                      <p className="text-sm text-muted-foreground/60 font-medium leading-relaxed uppercase tracking-widest text-[9.5px]">{step.d}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 🧱 FEATURE ARCHITECTURE */}
        <section className="py-48 bg-primary/[0.04] border-y border-border/10">
           <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-10">
                 <motion.div variants={cardVariants} initial="hidden" whileInView="visible" className="md:col-span-2 glass-card bg-white/40 p-12 overflow-hidden flex flex-col justify-between group rounded-[3rem] border-white/60 min-h-[500px]">
                    <LineChart className="w-12 h-12 text-primary mb-12" />
                    <h4 className="text-5xl font-black tracking-tighter">Quant-Node Pipeline.</h4>
                    <p className="text-lg text-muted-foreground/60 font-bold max-w-lg mt-6">Modern Portfolio Theory optimized nodes ensuring your frontier is perfectly efficient.</p>
                 </motion.div>
                 <motion.div variants={cardVariants} initial="hidden" whileInView="visible" className="glass-card bg-primary text-white p-12 flex flex-col justify-between group overflow-hidden relative rounded-[3rem] shadow-[0_32px_80px_-10px_rgba(79,70,229,0.3)]">
                    <Search className="w-14 h-14 mb-20 shadow-2xl relative z-10" />
                    <h4 className="text-4xl font-black tracking-tighter">Terminal Hub.</h4>
                    <p className="text-[11px] font-bold opacity-70 uppercase tracking-[0.4em] italic leading-loose">Access Groq-powered Llama-3.1 Synthesis on core nodes.</p>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* 🧾 PRICING Tiers */}
        <section className="py-48 px-6 bg-white">
           <div className="max-w-7xl mx-auto">
              <div className="text-center mb-24">
                 <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-primary mb-6">Network Tiers</h2>
                 <h3 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">Access the Institutional Hub.</h3>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                 {[
                   { t: "ANALYST", p: "$0", f: ["Live News Sync", "Basic Sentiment", "5 optimization nodes"], b: "Join Free", a: false },
                   { t: "QUANT", p: "$49", f: ["Groq Terminal", "Historical Backtesting", "Unlimited Optimization", "Compliance Hub"], b: "Upgrade Now", a: true },
                   { t: "ELITE", p: "CUSTOM", f: ["Direct API Feed", "Custom LLM Node", "Security Auditor", "24/7 Concierge"], b: "Contact Ops", a: false }
                 ].map((tier, i) => (
                   <div key={i} className={`p-10 rounded-[2.5rem] border ${tier.a ? 'border-primary bg-primary/5 shadow-2xl' : 'border-border/5 bg-white shadow-xl'} flex flex-col justify-between h-full hover:scale-105 transition-all`}>
                      <div className="space-y-8">
                         <span className="text-[9px] font-black uppercase tracking-[0.5em] text-primary">{tier.t}</span>
                         <h4 className="text-5xl font-black tracking-tighter">{tier.p}<span className="text-xs opacity-30 font-bold ml-2">/mo</span></h4>
                         <div className="space-y-4 pt-8">
                            {tier.f.map(f => (
                              <div key={f} className="flex items-center gap-3">
                                 <CheckCircle2 className="w-4 h-4 text-primary" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">{f}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                      <Button onClick={() => setIsAuthOpen(true)} className={`w-full h-12 rounded-xl mt-12 bg-foreground text-background font-black uppercase tracking-widest text-[9px] ${tier.a ? 'bg-primary text-white shadow-xl shadow-primary/20' : ''}`}>
                         {tier.b}
                      </Button>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* 🚀 FINAL CTA */}
        <section className="py-60 px-6 text-center relative overflow-hidden bg-primary/5">
           <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/20 blur-[150px] pointer-events-none" />
           <motion.div className="max-w-4xl mx-auto space-y-24 relative z-10">
              <h2 className="text-7xl md:text-[10rem] font-black tracking-tighter leading-none italic uppercase">Master the <br /> <span className="text-primary NOT-italic">Signals.</span></h2>
              <Button onClick={() => { setAuthInitialMode('signup'); setIsAuthOpen(true); }} className="h-20 px-32 text-[12px] rounded-full bg-primary text-white font-black uppercase tracking-[0.3em] shadow-[0_24px_80px_-10px_rgba(79,70,229,0.5)]">Establish Node</Button>
           </motion.div>
        </section>
      </main>

      <footer className="py-16 border-t border-border/5 bg-white">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-[11px] font-black">SF</div>
               <span className="text-xl font-black uppercase tracking-tighter text-foreground">Smart Finance</span>
            </div>
            <p className="text-[10px] font-black text-muted-foreground/15 uppercase tracking-[0.6em]">Consolidated intelligence core v4.5.7</p>
         </div>
      </footer>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authInitialMode} 
      />
    </div>
  );
}