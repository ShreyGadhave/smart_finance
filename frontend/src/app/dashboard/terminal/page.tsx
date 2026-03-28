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

function IndicatorCard({ indicator }: { indicator: Indicator }) {
  const isOversold = indicator.market_state.toLowerCase().includes('oversold');
  const isOverbought = indicator.market_state.toLowerCase().includes('overbought');
  const isDowntrend = indicator.market_state.toLowerCase().includes('downtrend') || indicator.bin_name.toLowerCase().includes('bearish');
  const isUptrend = indicator.market_state.toLowerCase().includes('uptrend') || indicator.bin_name.toLowerCase().includes('bullish');

  return (
    <Card className="bg-white/5 border-white/10 p-5 rounded-[1.5rem] hover:bg-white/[0.08] transition-all border shadow-2xl relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-1 h-full ${
        isOversold || isDowntrend ? 'bg-red-500/40' : 
        isOverbought || isUptrend ? 'bg-emerald-500/40' : 'bg-primary/20'
      }`} />
      
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{indicator.name}</h5>
          <div className="text-2xl font-black tracking-tighter">
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
      
      <div className="space-y-3">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[9px] font-black uppercase text-foreground/80">{indicator.bin_name}</span>
         </div>
         <p className="text-[10px] text-muted-foreground/60 leading-relaxed font-medium">
            {indicator.description}
         </p>
      </div>
    </Card>
  );
}

function TechnicalDashboard({ data }: { data: TechnicalData }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 p-2">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white/10 p-8 rounded-[2.5rem] border border-white/20 backdrop-blur-3xl shadow-2xl">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                 <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">{data.ticker}</h2>
           </div>
           <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">{data.company_name} // {data.company_sector}</p>
        </div>
        <div className="text-right">
           <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Last Node Sync</p>
           <p className="text-xl font-black text-foreground">{data.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.indicators.map((ind, i) => (
          <IndicatorCard key={i} indicator={ind} />
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20 p-10 rounded-[3rem] relative overflow-hidden group shadow-2xl">
         <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 rotate-12 group-hover:scale-125 transition-transform">
            <TerminalIcon size={120} />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-6 h-6 text-primary" />
              <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-primary">Executive Intelligence Summary</h4>
            </div>
            <div className="text-lg font-bold text-foreground/90 leading-relaxed prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: data.summary.replace(/\n/g, '<br/>') }} />
         </div>
      </Card>
    </div>
  );
}

function TerminalContent() {
  const [tickerInput, setTickerInput] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("AAPL");
  const [viewMode, setViewMode] = useState<'chat' | 'technical' | 'fundamental'>('chat');
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([
    { role: "ai", text: "⚡ SECURE HUB ONLINE. Establishing high-speed synthesis link to global nodes. Select asset ticker to initiate protocol." }
  ]);
  const [loading, setLoading] = useState(false);
  const [techData, setTechData] = useState<TechnicalData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const watchList = ["AAPL", "TSLA", "NVDA", "BTC", "ETH", "MSFT", "RELIANCE.NS", "TCS.NS"];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, viewMode]);

  const fetchTechnicalData = async (ticker: string) => {
     setLoading(true);
     try {
        const client = getSupabaseClient();
        const session = client ? await client.auth.getSession() : null;
        const token = session?.data?.session?.access_token;
        const res = await fetch(`/api/technical/${ticker}`, {
           headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.ok) {
           setTechData(data.result);
           setViewMode('technical');
        } else {
           throw new Error("Ticker Node Not Found");
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
      fetchTechnicalData(ticker);
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
        body: JSON.stringify({ message: input, ticker: selectedTicker })
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
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-700 selection:bg-primary/20">
      
      {/* 🔴 SYMBOL QUICK ACCESS ROW */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 shrink-0">
             <List className="w-3.5 h-3.5 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-widest text-primary">Network Nodes</span>
          </div>
          {watchList.map(symbol => (
            <button 
              key={symbol}
              onClick={() => { setSelectedTicker(symbol); fetchTechnicalData(symbol); }}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${
                selectedTicker === symbol ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/50 border-border/20 text-muted-foreground/60 hover:bg-white hover:text-primary'
              }`}
            >
              {symbol}
            </button>
          ))}
      </div>

      {/* 🟢 NAVIGATION & CONTROL HUB */}
      <div className="flex flex-col xl:flex-row gap-6 items-center justify-between">
         <div className="flex items-center gap-4 w-full xl:w-auto">
            <form onSubmit={handleTickerSubmit} className="relative flex-1 xl:w-80 group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
               <input 
                 value={tickerInput}
                 onChange={(e) => setTickerInput(e.target.value)}
                 placeholder="Search Node Identifier..."
                 className="w-full h-14 bg-white/40 border-2 border-border/10 rounded-[1.4rem] pl-14 pr-6 text-[12px] font-black uppercase tracking-[0.3em] outline-none focus:border-primary/40 focus:bg-white/80 transition-all shadow-2xl backdrop-blur-xl"
               />
            </form>
            <div className="h-14 px-8 bg-foreground flex items-center justify-center rounded-[1.4rem] text-background shadow-2xl">
               <span className="text-[13px] font-black tracking-[0.3em]">{selectedTicker}</span>
            </div>
         </div>

         <div className="flex bg-white/30 backdrop-blur-3xl p-1.5 rounded-[1.6rem] border border-white/40 shadow-2xl">
            {[
              { id: 'chat', label: 'Consultative AI', icon: Bot },
              { id: 'technical', label: 'Technical Node', icon: LineChart },
              { id: 'fundamental', label: 'Fundamental Hub', icon: BarChart3 }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center gap-3 px-8 py-3 rounded-[1.3rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 ${
                  viewMode === mode.id ? 'bg-primary text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]' : 'text-muted-foreground/60 hover:text-foreground'
                }`}
              >
                <mode.icon className="w-4 h-4" />
                {mode.label}
              </button>
            ))}
         </div>
      </div>

      {/* 🔵 MAIN VIEWPORT */}
      <Card className="flex-1 glass-card rounded-[3.5rem] border-white/60 shadow-[0_64px_160px_-32px_rgba(79,70,229,0.1)] overflow-hidden flex flex-col bg-white/20 backdrop-blur-3xl border-2">
         {/* System Header */}
         <div className="bg-primary/95 text-white p-4 px-10 flex justify-between items-center shrink-0 border-b border-white/10">
            <div className="flex items-center gap-4">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_#10b981]" />
               <span className="text-[10px] font-black uppercase tracking-[0.5em]">System Node Alpha // {selectedTicker} // MODE: {viewMode}</span>
            </div>
            <div className="flex gap-4 opacity-50 px-4">
               <Globe className="w-4 h-4" />
               <ShieldCheck className="w-4 h-4" />
            </div>
         </div>

         <div className="flex-1 overflow-hidden">
            {viewMode === 'chat' && (
              <div ref={scrollRef} className="h-full overflow-y-auto p-10 space-y-8 no-scrollbar scroll-smooth">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-5 duration-700`}>
                    <div className={`max-w-[70%] space-y-2`}>
                       <div className={`flex items-center gap-2 mb-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'} opacity-30`}>
                          <span className="text-[9px] font-black uppercase tracking-widest">{m.role === 'user' ? 'Analyst User' : 'Core System'}</span>
                       </div>
                       <div className={`rounded-[2rem] p-8 shadow-2xl border-2 ${
                        m.role === 'user' ? 'bg-foreground text-background border-foreground/5 rounded-tr-none' 
                        : m.role === 'error' ? 'bg-red-500/10 text-red-600 border-red-500/20'
                        : 'bg-white/80 border-white/40 text-foreground rounded-tl-none font-medium'
                      }`}>
                        <p className="text-[12px] font-black leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                      <div className="h-20 w-48 bg-white/40 border-2 border-dashed border-primary/20 rounded-[2rem] flex items-center justify-center gap-3 animate-pulse">
                         <Loader2 className="w-4 h-4 animate-spin text-primary" />
                         <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">Thinking...</span>
                      </div>
                   </div>
                )}
              </div>
            )}

            {viewMode === 'technical' && techData && (
               <div className="h-full overflow-y-auto p-10 no-scrollbar">
                  <TechnicalDashboard data={techData} />
               </div>
            )}

            {viewMode === 'fundamental' && (
               <div className="h-full flex flex-col items-center justify-center text-center p-20 gap-8 animate-pulse grayscale opacity-10">
                  <PieChart className="w-32 h-32 text-primary" />
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-[0.4em]">Fundamental Core Offline</h3>
                    <p className="max-w-md text-xs font-bold leading-relaxed opacity-60">Uplinking to SEC EDGAR for real-time 10-K and 10-Q synthesis. Expected latency: 6.8s.</p>
                  </div>
               </div>
            )}
         </div>

         {/* Input Hub */}
         {viewMode === 'chat' && (
            <div className="p-8 border-t border-border/10 bg-white/10 backdrop-blur-3xl">
               <div className="max-w-6xl mx-auto flex items-center gap-6">
                  <div className="flex-1 relative group">
                     <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                     <input 
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                       placeholder="Consult Intelligence Core..."
                       className="w-full h-16 bg-white border-2 border-border/30 rounded-[1.6rem] px-8 text-[12px] font-black outline-none shadow-2xl group-hover:border-primary/40 transition-all uppercase tracking-widest"
                     />
                  </div>
                  <Button onClick={handleSend} disabled={loading} className="h-16 w-16 rounded-[1.6rem] bg-primary text-white shadow-2xl hover:scale-105 active:scale-95 transition-all">
                     <Send className="w-6 h-6" />
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
