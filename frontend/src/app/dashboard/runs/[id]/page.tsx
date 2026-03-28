"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  TrendingDown, 
  TrendingUp, 
  BookOpen, 
  MessageSquare,
  AlertTriangle,
  Scale,
  Zap,
  BarChart3,
  Search,
  CheckCircle2,
  Info,
  ChevronRight,
  Target,
  Briefcase,
  Loader2
} from "lucide-react";

type RunDetail = {
  run: any;
  articles: any[];
};

export default function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("intelligence");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchDetail();

    // Polling logic for 'Synthesizing' runs
    const pollInterval = setInterval(() => {
      if (id && detail?.run?.status === "running") {
        fetchDetail();
      }
    }, 4000); // 4-second refresh for live data

    return () => clearInterval(pollInterval);
  }, [id, detail?.run?.status]);

  const fetchDetail = async () => {
    try {
      const client = getSupabaseClient();
      const session = client ? await client.auth.getSession() : null;
      const accessToken = session?.data?.session?.access_token || "";

      // Fetch Run
      const res = await fetch(`/api/pipeline/runs/${id}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Run not found");
      const runData = await res.json();

      // Fetch Articles
      const artRes = await fetch(`/api/pipeline/runs/${id}/articles`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
      });
      const artData = await artRes.json();

      setDetail({
        run: runData.run,
        articles: artData.articles || [],
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch run details");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "bullish": 
      case "positive": 
        return "bg-accent/10 text-accent border-accent/20";
      case "bearish": 
      case "negative": 
        return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border/50";
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="h-6 shimmer rounded w-1/4" />
      <div className="h-[600px] shimmer rounded-[2rem]" />
    </div>
  );

  if (error || !detail) return (
    <div className="p-8 text-center flex items-center justify-center min-h-[60vh]">
      <Card className="glass-card rounded-[2.5rem] p-16 inline-block shadow-2xl bg-white/40 border-white/80">
        <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-6" />
        <h2 className="text-xl font-black uppercase tracking-[0.2em] text-foreground mb-2">Run Not Found</h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8">The requested intelligence identifier is not indexed.</p>
        <Button onClick={() => router.push("/dashboard/runs")} variant="outline" className="rounded-xl text-[10px] font-black h-12 px-10 uppercase tracking-widest border-border/40 hover:bg-primary hover:text-white transition-all">Return to Terminal</Button>
      </Card>
    </div>
  );

  const { run, articles } = detail;
  const payload = run.payload || {};
  
  // Dynamic Data Extraction with Fallback to Payload
  const trustScore = run.average_trust_score ?? payload.trust_report?.score ?? 0;
  const trustReliability = run.trust_reliability ?? payload.trust_report?.reliability ?? "Unknown";
  
  const riskAssessment = payload.risk_assessment || {};
  const riskLevel = run.risk_level ?? riskAssessment.risk_level ?? "N/A";
  
  const customerAnalysis = payload.customer_analysis || {};
  // Fix: use 'insight' from backend if 'explanation' is missing
  const customerInsight = customerAnalysis.explanation || customerAnalysis.insight || "";
  
  const regulatoryCompliance = payload.regulatory_compliance || null;
  const researchReport = payload.research_report || "";

  const tabs = [
    { id: "intelligence", label: "Intelligence Sync", icon: Zap },
    { id: "research", label: "Research Vault", icon: BookOpen },
    { id: "risk", label: "Risk & Regulatory", icon: ShieldCheck },
    { id: "articles", label: "Evidence Audit", icon: Search },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" size="icon" 
            onClick={() => router.push("/dashboard/runs")}
            className="w-10 h-10 rounded-xl border border-border/20 bg-white/50 hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-black text-foreground tracking-tighter">{run.ticker}</h1>
               <Badge className={`text-[9.5px] px-3 py-0.5 rounded-lg font-black border uppercase tracking-widest ${getSentimentColor(run.overall_sentiment)} shadow-sm`}>
                 {run.overall_sentiment || "Neutral"}
               </Badge>
            </div>
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">
               Ref: {run.id} • Terminal Time: {new Date(run.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
           {[
             { l: "Intel Nodes", v: articles.length },
             { l: "Trust Rating", v: trustReliability.toUpperCase(), c: "text-primary" },
             { l: "Risk Grade", v: riskLevel.toUpperCase(), c: riskLevel.toLowerCase() === 'high' ? 'text-destructive' : 'text-accent' }
           ].map((stat, i) => (
             <div key={i} className="px-5 py-2 rounded-xl bg-white/40 border border-white/60 flex flex-col items-center min-w-[110px] shadow-inner">
                <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 mb-0.5">{stat.l}</span>
                <span className={`text-xs font-black uppercase ${stat.c || 'text-foreground'}`}>{stat.v}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Modern High-End Tab Bar */}
      <div className="bg-white/30 p-1.5 rounded-2xl border border-white/50 flex gap-1 w-fit">
         {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-lg" 
                  : "text-muted-foreground hover:bg-white/50 hover:text-foreground"
              }`}
            >
             <tab.icon className="w-3.5 h-3.5" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Status Banner when Running */}
      {run.status === "running" && (
        <Card className="p-4 bg-primary/[0.03] border-primary/20 backdrop-blur-sm rounded-[1.2rem] flex items-center justify-between group overflow-hidden relative animate-in fade-in duration-700">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary animate-pulse" />
             </div>
             <div>
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-widest leading-none">Intelligence Synthesis Active</h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight mt-1 opacity-60">Phase: Multi-Node Technical and Social Analysis in progress...</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <Loader2 className="w-3 h-3 animate-spin text-primary" />
             <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Live Syncing</span>
          </div>
        </Card>
      )}

      <div className="min-h-[500px]">
        {/* TAB 1: Intelligence Sync */}
        {activeTab === "intelligence" && (
           <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
              <div className="lg:col-span-2 space-y-6">
                 <Card className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl bg-white/40 border-white/80">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl -z-10" />
                    <div className="flex items-center gap-3 mb-6">
                       <Zap className="w-5 h-5 text-primary" />
                       <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">AI Narrative Architecture</h3>
                    </div>
                    <div className="text-sm font-bold leading-relaxed text-foreground/80 space-y-4 pr-4">
                      {payload.explanation?.split('\n').map((para: string, i: number) => (
                        <p key={i}>{para}</p>
                      )) || "Generating narrative sync..."}
                    </div>
                 </Card>

                 <Card className="glass-card rounded-[2.5rem] p-8 border-white/80 bg-white/30">
                    <div className="flex items-center gap-3 mb-8">
                       <MessageSquare className="w-5 h-5 text-accent" />
                       <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-foreground">Community Consensus</h3>
                    </div>
                    {customerInsight ? (
                    <div className="flex items-center gap-10">
                       <div className="text-center p-6 bg-white/60 rounded-[1.5rem] border border-white min-w-[140px] shadow-sm">
                          <p className="text-[8px] font-black text-muted-foreground uppercase mb-3 pr-1">Social Signal</p>
                          <Badge className={`text-[10px] font-black uppercase px-6 py-1 rounded-full ${getSentimentColor(customerAnalysis.customer_sentiment)}`}>
                             {customerAnalysis.customer_sentiment || "Neutral"}
                          </Badge>
                       </div>
                       <div className="relative">
                          <span className="absolute -top-4 -left-2 text-4xl font-serif text-accent opacity-20 group-hover:opacity-40 transition-opacity">"</span>
                          <p className="text-sm font-bold italic text-muted-foreground leading-relaxed pr-6">
                            {customerInsight}
                          </p>
                       </div>
                    </div>
                    ) : (
                       <p className="text-xs text-muted-foreground/60 p-4">Awaiting social consensus indexing...</p>
                    )}
                 </Card>
              </div>

              <div className="space-y-6">
                 <Card className="glass-card rounded-[2.5rem] p-10 border-white/80 bg-white/40 shadow-xl text-center flex flex-col items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-muted-foreground">Trust Reliability Index</h3>
                    <div className="relative flex items-center justify-center mb-10">
                       <svg className="w-36 h-36">
                          <circle cx="72" cy="72" r="64" className="stroke-muted/5 fill-none" strokeWidth="10" />
                          <circle cx="72" cy="72" r="64" className="stroke-primary fill-none transition-all duration-[2000ms]" strokeWidth="10" strokeDasharray={2*Math.PI*64} strokeDashoffset={2*Math.PI*64*(1-(trustScore||0))} strokeLinecap="round" transform="rotate(-90 72 72)" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-foreground">{Math.round((trustScore || 0) * 100)}%</span>
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Consistency</span>
                       </div>
                    </div>
                    <div className="space-y-4 w-full">
                       <div className="p-4 rounded-2xl bg-white/60 border border-white/80 shadow-inner">
                          <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1.5 opacity-60">Node Logic Status</p>
                          <Badge className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-6 rounded-lg uppercase tracking-widest">{trustReliability}</Badge>
                       </div>
                    </div>
                 </Card>
              </div>
           </div>
        )}

        {/* TAB 2: Research Vault */}
        {activeTab === "research" && (
           <div className="grid lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
              <Card className="lg:col-span-3 glass-card rounded-[2.5rem] p-10 border-white/80 bg-white/40 shadow-2xl overflow-hidden relative">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/5 blur-[50px] rounded-full" />
                 <div className="flex items-center gap-3 mb-10 border-b border-border/10 pb-6">
                    <BookOpen className="w-6 h-6 text-secondary" />
                    <div>
                       <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-foreground">Deep Research Intelligence</h3>
                       <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mt-1">Cross-domain fundamental synthesis</p>
                    </div>
                 </div>
                 
                 <div className="grid gap-8">
                    {researchReport ? researchReport.split('###').filter(Boolean).map((section: string, idx: number) => {
                       const lines: string[] = section.trim().split('\n').filter((l: string) => l.trim().length > 0);
                       const title: string = lines[0] || "Section " + (idx + 1);
                       const content: string = lines.slice(1).join('\n');
                       
                       return (
                          <div key={idx} className="group">
                             <div className="flex items-center gap-3 mb-4">
                                <div className="w-1.5 h-6 bg-secondary/20 rounded-full group-hover:bg-secondary transition-all" />
                                <h4 className="text-sm font-black uppercase tracking-widest text-foreground/80">{title.replace(/\*\*/g, '').trim()}</h4>
                             </div>
                             {content && (
                               <p className="text-sm font-medium leading-relaxed text-muted-foreground font-sans pl-4 whitespace-pre-line border-l border-border/10">
                                  {content.trim()}
                               </p>
                             )}
                          </div>
                       )
                    }) : (
                       <div className="py-20 text-center grayscale opacity-50">
                          <p className="text-sm font-black text-muted-foreground uppercase">Awaiting Indexing...</p>
                       </div>
                    )}
                 </div>
              </Card>
              
              <div className="space-y-6">
                 <Card className="glass-card rounded-[2.2rem] p-8 border-white/80 bg-white/40 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                       <Target className="w-5 h-5 text-secondary" />
                       <h3 className="text-[10px] font-black uppercase tracking-widest">Key Pillars</h3>
                    </div>
                    <div className="space-y-3">
                       {["Price Action", "Core Revenue", "Market Cap", "Volatility"].map((pillar, i) => (
                         <div key={i} className="flex items-center gap-4 p-3.5 rounded-xl bg-white/50 border border-white/80 hover:bg-white/70 transition-all cursor-crosshair group">
                            <div className="w-2 h-2 rounded-full bg-secondary opacity-30 group-hover:opacity-100 transition-opacity" />
                            <span className="text-[11px] font-black text-foreground/70 uppercase tracking-tight">{pillar}</span>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
           </div>
        )}

        {/* TAB 3: Risk & Regulatory */}
        {activeTab === "risk" && (
           <div className="grid lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
              <Card className="glass-card rounded-3xl p-8 border-white/80 bg-white/40 shadow-xl overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-destructive/60 to-transparent" />
                 <div className="flex items-center gap-3 mb-8">
                    <BarChart3 className="w-5 h-5 text-destructive" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Quantitative Risk Engine</h3>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { l: "Analytic Grade", v: riskLevel.toUpperCase(), c: riskLevel.toLowerCase() === 'high' ? 'text-destructive' : 'text-accent' },
                      { 
                        l: "Volatility", 
                        v: riskAssessment.metrics?.annualized_volatility ? `${Math.round(riskAssessment.metrics?.annualized_volatility * 100)}%` : 'N/A' 
                      },
                      { l: "Market Beta", v: riskAssessment.metrics?.beta?.toFixed(2) || 'N/A' },
                      { l: "Sharpe Ratio", v: riskAssessment.metrics?.sharpe_ratio !== undefined ? riskAssessment.metrics.sharpe_ratio.toFixed(2) : 'N/A' }
                    ].map((m, i) => (
                      <div key={i} className="p-4 bg-white/60 rounded-2xl border border-white shadow-inner flex flex-col justify-center">
                         <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1.5">{m.l}</p>
                         <p className={`text-xl font-black ${m.c || 'text-foreground'} tracking-tight`}>{m.v}</p>
                      </div>
                    ))}
                 </div>
                 
                 <div className="p-6 rounded-2xl bg-destructive/5 border border-destructive/10 flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] font-black text-destructive uppercase tracking-widest mb-1">Algorithmic Advisory</p>
                      <p className="text-xs font-bold leading-relaxed text-muted-foreground italic">
                        {riskAssessment.recommendation || "System scan complete. No critical anomalies detected outside of standard volatility bounds."}
                      </p>
                    </div>
                 </div>
              </Card>

              <Card className="glass-card rounded-3xl p-8 border-white/80 bg-white/40 shadow-xl overflow-hidden relative">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500/60 to-transparent" />
                 <div className="flex items-center gap-3 mb-8">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Compliance Protocol</h3>
                 </div>
                 
                 {regulatoryCompliance ? (
                    <div className="space-y-6">
                       <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-5">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                          <div>
                             <p className="text-sm font-black text-emerald-600 uppercase tracking-tighter">REGULATORY PASS</p>
                             <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Validated against multi-region financial constraints.</p>
                          </div>
                       </div>
                       <div className="relative pl-6 space-y-4">
                          <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500/20 rounded-full" />
                          <p className="text-xs font-bold text-muted-foreground leading-relaxed italic pr-6">
                             {regulatoryCompliance.report}
                          </p>
                       </div>
                    </div>
                 ) : (
                    <div className="py-20 text-center grayscale opacity-40">
                       <p className="text-xs font-black uppercase tracking-widest">Awaiting Compliance Sweep...</p>
                    </div>
                 )}
              </Card>
           </div>
        )}

        {/* TAB 4: Evidence Audit */}
        {activeTab === "articles" && (
           <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex items-center justify-between mb-2 p-2">
                 <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-primary" />
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Evidence Audit Vault</h3>
                 </div>
                 <span className="text-[10px] font-black text-muted-foreground bg-white/50 px-5 py-1.5 rounded-full border border-border/20 uppercase tracking-widest leading-none">Records Index: {articles.length}</span>
              </div>
              <div className="grid gap-4">
                 {articles.map((art, idx) => (
                    <Card key={idx} className="glass-card p-6 rounded-[2rem] border-white/80 bg-white/40 hover:bg-white/60 transition-all flex items-center justify-between group shadow-sm">
                       <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-2">
                                <Briefcase className="w-3.5 h-3.5 text-primary/40" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{art.source}</span>
                             </div>
                             <Badge variant="outline" className={`text-[8px] font-black px-4 py-0.5 rounded-lg border-2 ${getSentimentColor(art.sentiment)}`}>
                                {art.sentiment}
                             </Badge>
                             {art.trust_score && (
                                <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest border-l border-border/30 pl-4 flex items-center gap-2 leading-none">
                                   <ShieldCheck className="w-3 h-3 text-secondary" />
                                   Score: {Math.round(art.trust_score * 100)}%
                                </span>
                             )}
                          </div>
                          <h4 className="text-[15px] font-black text-foreground tracking-tight leading-snug pr-12 group-hover:text-primary transition-colors">{art.headline}</h4>
                       </div>
                       <Button asChild variant="ghost" className="rounded-xl border border-border/20 text-[10px] font-black h-10 px-8 uppercase tracking-[0.2em] gap-3 active:scale-95 transition-all">
                          <a href={art.url} target="_blank" rel="noopener noreferrer">Source <ExternalLink className="w-4 h-4" /></a>
                       </Button>
                    </Card>
                 ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
