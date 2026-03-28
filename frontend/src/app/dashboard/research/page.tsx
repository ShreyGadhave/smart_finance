"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSupabaseClient } from "@/lib/supabase";
import type { PipelineRunRow } from "@/lib/types";
import { BookOpen, RefreshCcw, FileText, Search, UserCheck, MessageCircle, ArrowRight } from "lucide-react";

export default function ResearchPage() {
  const [reports, setReports] = useState<PipelineRunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<PipelineRunRow | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await client
        .from("pipeline_runs")
        .select("*")
        .not("payload->research_report", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Supabase error:", error.message);
      } else {
        setReports(data || []);
        if (data && data.length > 0 && !selectedReport) {
           setSelectedReport(data[0]);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "bullish":
        return "bg-accent/10 text-accent border-accent/20";
      case "bearish":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
         <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-black tracking-tight">Research Vault</h1>
            <div className="h-4 w-48 shimmer rounded-md" />
         </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 h-24 flex flex-col justify-between">
                <div className="h-3 shimmer rounded w-1/4" />
                <div className="h-8 shimmer rounded w-3/4" />
              </div>
            ))}
          </div>
          <div className="md:col-span-2 glass-card rounded-[2.5rem] p-10 h-[600px] flex flex-col">
            <div className="h-10 shimmer rounded w-1/3 mb-10" />
            <div className="space-y-4">
               {[...Array(12)].map((_, i) => (
                 <div key={i} className="h-4 shimmer rounded" />
               ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight text-foreground -mb-1">Research Vault</h1>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
            AI-GENERATED EQUITY ANALYSIS
          </p>
        </div>
        <Button 
          onClick={fetchReports} 
          variant="outline" 
          className="h-8 rounded-lg border-border/50 bg-background/50 flex items-center gap-2 hover:bg-accent hover:border-accent group px-3 text-[10px] font-black uppercase tracking-widest"
        >
          <RefreshCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
          Synchronize
        </Button>
      </div>

       <div className="grid md:grid-cols-3 gap-6 items-start">
        {/* Left List */}
         <div className="md:col-span-1 space-y-2">
           <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Recent Entries</span>
              <span className="text-[10px] font-black text-primary uppercase">{reports.length} Reports</span>
           </div>
          {reports.length === 0 ? (
            <Card className="glass-card rounded-2xl p-12 text-center border-border/30">
              <p className="text-muted-foreground">No research results found</p>
            </Card>
          ) : (
            reports.map((report) => (
               <Card
                key={report.id}
                className={`glass-card rounded-xl p-3 cursor-pointer transition-all duration-300 overflow-hidden relative group ${
                  selectedReport?.id === report.id
                    ? "border-primary/50 shadow-md translate-x-1 bg-primary/5"
                    : "border-border/20 hover:border-border/40"
                }`}
                onClick={() => setSelectedReport(report)}
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-primary transition-transform duration-500 ${selectedReport?.id === report.id ? 'scale-y-100' : 'scale-y-0'}`} />
                
                <div className="flex justify-between items-center mb-1">
                   <h3 className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
                    {report.ticker}
                  </h3>
                  <Badge className={`text-[9px] uppercase font-black px-2 py-0 border ${getSentimentColor(report.overall_sentiment || "")}`}>
                    {report.overall_sentiment || "Neutral"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-black uppercase tracking-tighter mt-1 opacity-70">
                   <span>{new Date(report.created_at || "").toLocaleDateString()}</span>
                   <span className="w-1 h-1 rounded-full bg-border" />
                   <span>#{report.id}</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Right Detail - Document Style */}
        <div className="md:col-span-2">
          {selectedReport ? (
             <Card className="glass-card rounded-[1.5rem] p-5 border-border/10 shadow-xl relative bg-background/30 backdrop-blur-xl">
              {/* Report Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border/30 pb-10">
                <div className="flex items-center gap-5">
                   <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                   </div>
                    <div>
                       <h2 className="text-lg font-black text-foreground tracking-tight">
                        {selectedReport.ticker} Narrative
                      </h2>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.1em]">EQUITY RESEARCH ANALYTICS</p>
                   </div>
                </div>
                 <Badge className={`text-[9px] px-3 py-0.5 rounded-lg font-black border ${getSentimentColor(selectedReport.overall_sentiment || "")}`}>
                  {selectedReport.overall_sentiment || "Neutral"}
                </Badge>
              </div>

              {/* Sections Scrollable Area */}
              <div className="space-y-12 max-h-[800px] overflow-y-auto pr-4 no-scrollbar">
                
                {/* 1. Executive Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Search className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-black text-foreground uppercase tracking-widest">Executive Summary</h4>
                  </div>
                   <p className="text-sm font-bold leading-relaxed text-foreground/90 py-5 border-l-4 border-primary/20 pl-8 bg-primary/5 rounded-r-2xl italic">
                    {selectedReport.payload?.explanation || "No narrative summary generated for this run."}
                  </p>
                </div>

                {/* 2. Intelligence Body */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-accent" />
                    <h4 className="text-lg font-black text-foreground uppercase tracking-widest">Deep Analysis body</h4>
                  </div>
                   <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-medium">
                    {selectedReport.payload?.research_report || "Full-text equity analysis is being synthesized for this ticker."}
                  </div>
                </div>

                {/* 3. Social Consensus */}
                {selectedReport.payload?.customer_analysis && (
                  <div className="space-y-4 pt-10 border-t border-border/30">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <h4 className="text-lg font-black text-foreground uppercase tracking-widest">Community Consensus</h4>
                    </div>
                    <Card className="bg-muted/30 p-8 rounded-3xl border border-border/30">
                       <div className="flex items-center gap-4 mb-6">
                         <Badge className={`px-4 py-1 rounded-full uppercase font-black text-xs ${getSentimentColor(selectedReport.payload.customer_analysis.customer_sentiment ?? "neutral")}`}>
                            {selectedReport.payload.customer_analysis.customer_sentiment || "Neutral"}
                         </Badge>
                         <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            Source: Reddit Aggregator
                         </span>
                       </div>
                        <p className="text-sm font-bold text-foreground italic leading-relaxed">
                           "{selectedReport.payload.customer_analysis.explanation || "No significant community shift detected for this period."}"
                        </p>
                    </Card>
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className="mt-12 pt-8 border-t border-border/30 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                 <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verified By AI Agent</span>
                 </div>
                 <span>Sync: {new Date(selectedReport.created_at || "").toLocaleString()}</span>
              </div>
            </Card>
          ) : (
            <Card className="glass-card rounded-[2.5rem] p-24 text-center border-border/20 shadow-xl opacity-60">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-6" />
              <p className="text-xl font-bold text-muted-foreground">Select an intelligence report from the archive to view detailed analysis.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}