"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import { 
  Send, Bot, User, Loader2, Sparkles, ChevronDown, 
  Terminal as TerminalIcon, ShieldCheck, Cpu, 
  BarChart3, LineChart, PieChart, Activity,
  Search, TrendingUp, TrendingDown, Info,
  ExternalLink, Layers, Globe, Zap, List
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSupabaseClient } from "@/lib/supabase";
import { useSearchParams, useRouter } from "next/navigation";

// --- Types based on USER provided structure ---
interface Indicator {
  name: string;
  value: any;
  bin_name: string;
  market_state: string;
  description: string;
}

interface TechnicalData {
  ticker: string;
  company_name: string;
  company_sector: string;
  date: string;
  summary: string;
  indicators: Indicator[];
}

// --- NEW HELPERS ---
const cleanMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\*\*/g, "")    // Remove bold
    .replace(/###/g, "")    // Remove h3
    .replace(/##/g, "")     // Remove h2
    .replace(/#/g, "")      // Remove h1
    .replace(/\* /g, "- ")  // Convert bullet * to -
    .replace(/\*/g, "");    // Remove any remaining *
};

const formatCurrency = (val: number) => {
  if (!val && val !== 0) return "N/A";
  const absVal = Math.abs(val);
  if (absVal >= 1e12) return (val / 1e12).toFixed(2) + "T";
  if (absVal >= 1e9) return (val / 1e9).toFixed(2) + "B";
  if (absVal >= 1e6) return (val / 1e6).toFixed(2) + "M";
  if (absVal >= 1e3) return (val / 1e3).toFixed(2) + "K";
  return val.toFixed(2);
};

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const isOversold = indicator.market_state.toLowerCase().includes('oversold');
  const isOverbought = indicator.market_state.toLowerCase().includes('overbought');
  const isDowntrend = indicator.market_state.toLowerCase().includes('downtrend') || indicator.bin_name.toLowerCase().includes('bearish');
  const isUptrend = indicator.market_state.toLowerCase().includes('uptrend') || indicator.bin_name.toLowerCase().includes('bullish');

  return (
    <Card className="bg-white/5 border-white/10 p-4 rounded-xl hover:bg-white/[0.08] transition-all border shadow-2xl relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-1 h-full ${
        isOversold || isDowntrend ? 'bg-red-500/40' : 
        isOverbought || isUptrend ? 'bg-emerald-500/40' : 'bg-primary/20'
      }`} />
      
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1">
          <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{indicator.name}</h5>
          <div className="text-xl font-black tracking-tighter">
            {typeof indicator.value === 'object' && indicator.value !== null 
              ? `${indicator.value['Aroon Up'] || 0}/${indicator.value['Aroon Down'] || 0}`
              : indicator.value || 'N/A'
            }
          </div>
        </div>
        <Badge className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
          isOversold || isDowntrend ? 'bg-red-500/10 text-red-500 border-red-500/20' :
          isOverbought || isUptrend ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
          'bg-primary/10 text-primary border-primary/20'
        }`}>
          {indicator.market_state}
        </Badge>
      </div>
      
      <div className="space-y-2">
         <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            <span className="text-[8px] font-black uppercase text-foreground/80">{indicator.bin_name}</span>
         </div>
         <p className="text-[9px] text-muted-foreground/60 leading-relaxed font-medium">
            {indicator.description}
         </p>
      </div>
    </Card>
  );
}

function TechnicalDashboard({ data }: { data: TechnicalData }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 p-1">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-3xl shadow-2xl">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                 <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter">{data.ticker}</h2>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">{data.company_name} {"//"} {data.company_sector}</p>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1">Node Sync</p>
           <p className="text-md font-black text-foreground">{data.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.indicators.map((ind, i) => (
          <IndicatorCard key={i} indicator={ind} />
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20 p-6 rounded-2xl relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-150 rotate-12 group-hover:scale-125 transition-transform">
            <TerminalIcon size={100} />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-4 h-4 text-primary" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Executive Intelligence Summary</h4>
            </div>
            <div className="text-[13px] font-medium text-foreground/80 leading-relaxed prose prose-invert prose-xs" dangerouslySetInnerHTML={{ __html: data.summary.replace(/\n/g, '<br/>') }} />
         </div>
      </Card>
    </div>
  );
}

function FundamentalDashboard({ data }: { data: any }) {
  // data is the result object from /api/fundamental/{ticker}
  const fundamentals = data?.fundamentals || [];
  const aiSummary = data?.ai_summary || "";
  const research = data?.payload?.research_report || data?.payload?.ai_summary || "No manuscript synced.";
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 p-1 pb-20">
      
      {/* 🏛️ EXECUTIVE SUMMARY CARD */}
      <Card className="bg-primary/5 border-primary/20 p-8 rounded-2xl relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <ShieldCheck size={180} />
         </div>
         <div className="relative z-10 max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
               <Bot className="w-5 h-5 text-primary" />
               <h3 className="text-[10px] font-black uppercase tracking-[0.6em] text-primary">Intelligence Synthesis Report</h3>
            </div>
            <div className="space-y-4">
               {cleanMarkdown(aiSummary).split('\n').filter(l => l.trim()).map((para, i) => (
                 <p key={i} className="text-[12px] font-bold text-foreground/80 leading-relaxed uppercase tracking-tight">
                    {para}
                 </p>
               ))}
            </div>
         </div>
      </Card>

      {/* 📊 FINANCIAL TELEMETRY GRID */}
      <div className="space-y-4">
         <div className="flex items-center gap-3 px-2">
            <Activity className="w-4 h-4 text-muted-foreground/40" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Core Financial Telemetry</h4>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {fundamentals.map((f: any, i: number) => {
               const classification = f.classification?.description || "";
               const isNegative = f.value < 0;
               return (
                  <Card key={i} className="bg-white/5 border-white/10 p-4 rounded-xl hover:bg-white/[0.08] transition-all border group relative overflow-hidden">
                     <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-start">
                           <h5 className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60 w-2/3">{f.name}</h5>
                           <Badge variant="outline" className="text-[7px] font-black border-white/10 px-1.5 py-0 rounded text-muted-foreground/40">{f.type === 'Income Statement' ? 'IS' : f.type === 'Per Share Metric' ? 'PS' : 'FIN'}</Badge>
                        </div>
                        <div className={`text-xl font-black tracking-tighter ${isNegative ? 'text-red-400' : 'text-foreground'}`}>
                           {typeof f.value === 'number' ? formatCurrency(f.value) : (f.value?.["$numberDouble"] === "NaN" ? "NaN" : "N/A")}
                        </div>
                        <div className="space-y-1.5">
                           <p className="text-[8px] font-black text-primary/60 uppercase leading-tight">{f.what_it_means}</p>
                           <p className="text-[8px] text-muted-foreground/40 leading-relaxed italic font-medium">
                              {f.why_traders_care}
                           </p>
                        </div>
                     </div>
                     <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Card>
               );
            })}
         </div>
      </div>

      {/* 📜 MANUSCRIPT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-2 bg-white/5 border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center text-background">
                     <Layers className="w-5 h-5" />
                  </div>
                  <h2 className="text-md font-black tracking-tight uppercase tracking-[0.2em]">Institutional Manuscript</h2>
               </div>
               <div className="prose prose-invert prose-xs max-w-none text-foreground/70 leading-relaxed font-medium columns-1 md:columns-2 gap-8">
                  {cleanMarkdown(research).split('\n').filter(l => l.trim()).map((para, i) => (
                    <p key={i} className="mb-4 text-justify">{para}</p>
                  ))}
               </div>
            </div>
         </Card>

         <div className="space-y-6">
            <Card className="bg-emerald-500/10 border-emerald-500/20 rounded-2xl p-8 shadow-xl relative overflow-hidden">
               <div className="absolute -right-4 -top-4 opacity-[0.05] rotate-12">
                  <TrendingUp size={120} className="text-emerald-500" />
               </div>
               <div className="space-y-4">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-500">Market Consensus Sync</h4>
                  <div className="text-3xl font-black tracking-tighter">
                     {data?.overall_sentiment?.toUpperCase() || "NEUTRAL"}
                  </div>
                  <p className="text-[10px] font-medium text-emerald-500/60 leading-relaxed">
                     Derived from multi-node pipeline analysis encompassing fundamental, technical, and community telemetry.
                  </p>
               </div>
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-2xl p-8 shadow-xl">
               <div className="space-y-4">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">Technical Lifecycle</h4>
                  <p className="text-[11px] font-bold text-foreground/60 italic leading-relaxed">
                     "{data?.risk_level ? `RISK NODE DETECTED: ${data.risk_level.toUpperCase()}.` : 'System state normal. No critical risk triggers detected.'}"
                  </p>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}

function TerminalContent() {
  const [tickerInput, setTickerInput] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("20MICRONS");
  const [viewMode, setViewMode] = useState<'chat' | 'technical' | 'fundamental'>('chat');
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([
    { role: "ai", text: "⚡ SECURE HUB ONLINE. Establishing high-speed synthesis link to global nodes. Consult Intelligence Core or select asset ticker for specialist mode." }
  ]);
  const [loading, setLoading] = useState(false);
  const [techData, setTechData] = useState<TechnicalData | null>(null);
  const [fundData, setFundData] = useState<any>(null);
  const [runData, setRunData] = useState<any>(null); // For chat/latest run context
  const scrollRef = useRef<HTMLDivElement>(null);

  const watchList = [
    "20MICRONS", "21STCENMGM", "360ONE", "3IINFOLTD", "3MINDIA", 
    "3PLAND", "5PAISA", "63MOONS", "A2ZINFRA", "AAATECH", 
    "AADHARHFC", "AAKASH", "AAREYDRUGS", "AARON", "AARTECH", 
    "AARTIDRUGS", "AARTIIND", "AARTIPHARM", "AARTISURF", "AARVI", 
    "AAVAS", "ABAN", "ABB", "ABBOTINDIA", "ABCAPITAL"
  ];

  useEffect(() => {
    fetchFullNodeData("20MICRONS");
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, viewMode]);

  const fetchFullNodeData = async (ticker: string) => {
     setLoading(true);
     try {
        const client = getSupabaseClient();
        const session = client ? await client.auth.getSession() : null;
        const token = session?.data?.session?.access_token;
        
        // 1. Fetch Technical Data
        const techRes = await fetch(`/api/technical/${ticker}`, {
           headers: { "Authorization": `Bearer ${token}` }
        });
        const tData = await techRes.json();
        if (tData.ok) setTechData(tData.result);

        // 2. Fetch Fundamental Data
        const fundRes = await fetch(`/api/fundamental/${ticker}`, {
           headers: { "Authorization": `Bearer ${token}` }
        });
        const fData = await fundRes.json();
        if (fData.ok) setFundData(fData.result);

        // 3. Fetch Latest Pipeline Run (for Chat context)
        const runRes = await fetch(`/api/pipeline/latest/${ticker}`, {
           headers: { "Authorization": `Bearer ${token}` }
        });
        const rData = await runRes.json();
        if (rData.ok) {
           setRunData(rData.run);
           setMessages(prev => [...prev, { role: "ai", text: `NODE SYNCED: High-fidelity report found for ${ticker}. Sentiment detected as ${rData.run.overall_sentiment.toUpperCase()}.` }]);
        } else {
           setRunData(null);
           setMessages(prev => [...prev, { role: "ai", text: `CORE WARNING: No recent analytical report found for ${ticker}. Technical mock nodes active. Suggest running global pipeline.` }]);
        }
        
     } catch (err: any) {
        setMessages(prev => [...prev, { role: "error", text: `NODE ERROR: ${err.message}` }]);
     } finally {
        setLoading(false);
     }
  };

  const handleTickerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerInput) {
      const ticker = tickerInput.toUpperCase();
      setSelectedTicker(ticker);
      setTickerInput("");
      fetchFullNodeData(ticker);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const client = getSupabaseClient();
      const session = client ? await client.auth.getSession() : null;
      const token = session?.data?.session?.access_token;
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ 
          message: input, 
          ticker: selectedTicker,
          run_id: runData?.id 
        })
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.response || "Signal loss." }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "error", text: `PROTOCOL FAILURE: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col gap-4 animate-in fade-in duration-700 selection:bg-primary/20">
      
      {/* 🔴 SYMBOL QUICK ACCESS ROW */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20 shrink-0">
             <List className="w-3 h-3 text-primary" />
             <span className="text-[9px] font-black uppercase tracking-widest text-primary">Nodes</span>
          </div>
          {watchList.map(symbol => (
            <button 
              key={symbol}
              onClick={() => { setSelectedTicker(symbol); fetchFullNodeData(symbol); }}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                selectedTicker === symbol ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/50 border-border/20 text-muted-foreground/60 hover:bg-white hover:text-primary'
              }`}
            >
              {symbol}
            </button>
          ))}
      </div>

      {/* 🟢 NAVIGATION & CONTROL HUB */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
         <div className="flex items-center gap-3 w-full xl:w-auto">
            <form onSubmit={handleTickerSubmit} className="relative flex-1 xl:w-72 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
               <input 
                 value={tickerInput}
                 onChange={(e) => setTickerInput(e.target.value)}
                 placeholder="Search Node Identifier..."
                 className="w-full h-11 bg-white/40 border border-border/10 rounded-xl pl-11 pr-4 text-[11px] font-black uppercase tracking-[0.2em] outline-none focus:border-primary/40 focus:bg-white/80 transition-all shadow-xl backdrop-blur-xl"
               />
            </form>
            <div className="h-11 px-6 bg-foreground flex items-center justify-center rounded-xl text-background shadow-xl">
               <span className="text-[12px] font-black tracking-[0.2em]">{selectedTicker}</span>
            </div>
         </div>

         <div className="flex bg-white/30 backdrop-blur-3xl p-1 rounded-2xl border border-white/40 shadow-xl">
            {[
              { id: 'chat', label: 'Consultative AI', icon: Bot },
              { id: 'technical', label: 'Technical Node', icon: LineChart },
              { id: 'fundamental', label: 'Fundamental Hub', icon: BarChart3 }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center gap-2.5 px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 ${
                  viewMode === mode.id ? 'bg-primary text-white shadow-[0_5px_15px_rgba(79,70,229,0.3)]' : 'text-muted-foreground/60 hover:text-foreground'
                }`}
              >
                <mode.icon className="w-3.5 h-3.5" />
                {mode.label}
              </button>
            ))}
         </div>
      </div>

      {/* 🔵 MAIN VIEWPORT */}
      <Card className="flex-1 glass-card rounded-2xl border-white/60 shadow-[0_32px_128px_-20px_rgba(79,70,229,0.1)] overflow-hidden flex flex-col bg-white/20 backdrop-blur-3xl border">
         {/* System Header */}
         <div className="bg-primary/95 text-white p-3 px-8 flex justify-between items-center shrink-0 border-b border-white/10">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
               <span className="text-[9px] font-black uppercase tracking-[0.4em]">Node {"//"} {selectedTicker} {"//"} MODE: {viewMode}</span>
            </div>
            <div className="flex gap-4 opacity-50 px-2">
               <Globe className="w-3.5 h-3.5" />
               <ShieldCheck className="w-3.5 h-3.5" />
            </div>
         </div>

         <div className="flex-1 overflow-hidden">
            {viewMode === 'chat' && (
              <div ref={scrollRef} className="h-full overflow-y-auto p-8 space-y-6 no-scrollbar scroll-smooth">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-700`}>
                    <div className={`max-w-[75%] space-y-1.5`}>
                       <div className={`flex items-center gap-2 mb-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'} opacity-30`}>
                          <span className="text-[8px] font-black uppercase tracking-widest">{m.role === 'user' ? 'Analyst' : 'System'}</span>
                       </div>
                       <div className={`rounded-xl p-6 shadow-xl border ${
                        m.role === 'user' ? 'bg-foreground text-background border-foreground/5 rounded-tr-none' 
                        : m.role === 'error' ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-white/80 border-white/40 text-foreground rounded-tl-none font-medium'
                      }`}>
                        <p className="text-[11px] font-black leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                      <div className="h-16 w-40 bg-white/40 border border-dashed border-primary/20 rounded-xl flex items-center justify-center gap-2 animate-pulse">
                         <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                         <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">Synthesizing...</span>
                      </div>
                   </div>
                )}
              </div>
            )}

            {viewMode === 'technical' && techData && (
               <div className="h-full overflow-y-auto p-8 no-scrollbar">
                  <TechnicalDashboard data={techData} />
               </div>
            )}

            {viewMode === 'fundamental' && fundData && (
               <div className="h-full overflow-y-auto p-8 no-scrollbar">
                  <FundamentalDashboard data={fundData} />
               </div>
            )}
         </div>

         {/* Input Hub */}
         {viewMode === 'chat' && (
            <div className="p-4 border-t border-border/10 bg-white/10 backdrop-blur-3xl shrink-0">
               <div className="max-w-6xl mx-auto flex items-center gap-4">
                  <div className="flex-1 relative group">
                     <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                     <input 
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                       placeholder="Consult Intelligence Core or Ask Anything..."
                       className="w-full h-12 bg-white border border-border/30 rounded-xl px-6 text-[11px] font-black outline-none shadow-xl group-hover:border-primary/40 transition-all uppercase tracking-widest relative z-10"
                     />
                  </div>
                  <Button onClick={handleSend} disabled={loading} className="h-12 w-12 rounded-xl bg-primary text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                     <Send className="w-5 h-5" />
                  </Button>
               </div>
            </div>
         )}
      </Card>
    </div>
  );
}

export default function TerminalPage() {
  return (
    <Suspense fallback={<div className="h-full flex flex-col gap-8 p-10 animate-pulse"><div className="h-20 bg-muted rounded-3xl"/><div className="flex-1 bg-muted rounded-[3.5rem]"/></div>}>
      <TerminalContent />
    </Suspense>
  )
}
