"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronRight, Rocket, RefreshCcw } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import type { PipelineRunRow } from "@/lib/types";

export default function RunsPage() {
  const [runs, setRuns] = useState<PipelineRunRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [runTicker, setRunTicker] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setError("Supabase client not configured");
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await client.auth.getSession();
      const user = session?.user;

      if (!user) {
        setError("Unauthorized node connection.");
        setLoading(false);
        return;
      }

      const { data, error } = await client
        .from("pipeline_runs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setError(error.message);
      } else {
        setRuns(data || []);
      }
    } catch {
      setError("Failed to fetch runs");
    } finally {
      setLoading(false);
    }
  };

  const handleRunPipeline = async () => {
    if (!runTicker.trim()) return;
    setRunLoading(true);
    setError("");

    try {
      const client = getSupabaseClient();
      const session = client ? await client.auth.getSession() : null;
      const accessToken = session?.data?.session?.access_token || "";

      logAction("Triggering pipeline for " + runTicker);

      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ticker: runTicker.toUpperCase() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to trigger pipeline");
      }

      setRunTicker("");
      // Wait for backend to start processing
      setTimeout(() => {
        fetchRuns();
        setRunLoading(false);
      }, 2000);
    } catch (err: any) {
      console.error("Pipeline trigger error:", err);
      setError(err.message || "Pipeline failed. Is the backend running?");
      setRunLoading(false);
    }
  };

  const logAction = (msg: string) => {
    console.log("[Pipeline]", msg);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "bullish":
        return "bg-[oklch(0.65_0.20_160_/_20%)] text-[oklch(0.75_0.18_160)] border border-[oklch(0.65_0.20_160_/_30%)]";
      case "bearish":
        return "bg-[oklch(0.65_0.25_25_/_20%)] text-[oklch(0.75_0.20_25)] border border-[oklch(0.65_0.25_25_/_30%)]";
      default:
        return "bg-muted text-muted-foreground border border-border/50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-[oklch(0.65_0.20_160_/_20%)] text-[oklch(0.75_0.18_160)] border border-[oklch(0.65_0.20_160_/_30%)]";
      case "running":
        return "bg-[oklch(0.70_0.18_250_/_20%)] text-[oklch(0.80_0.15_250)] border border-[oklch(0.70_0.18_250_/_30%)]";
      case "failed":
        return "bg-[oklch(0.65_0.25_25_/_20%)] text-[oklch(0.75_0.20_25)] border border-[oklch(0.65_0.25_25_/_30%)]";
      default:
        return "bg-muted text-muted-foreground border border-border/50";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Pipeline Runs</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5">
              <div className="h-4 shimmer rounded w-1/4 mb-3" />
              <div className="h-3 shimmer rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-foreground tracking-tight uppercase">Pipeline Runs</h1>
          <p className="text-[11px] font-bold text-muted-foreground mt-0.5 opacity-60 uppercase tracking-widest">
            Execute and monitor real-time sentiment extraction
          </p>
        </div>
        <Button onClick={fetchRuns} variant="outline" className="h-8 text-[11px] font-bold border-border/40 rounded-xl px-4 hover:bg-primary/5">
          Refresh List
        </Button>
      </div>

      <Card className="glass-card rounded-2xl p-5 border-border/20">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">Execute New Analysis</h2>
        <div className="flex gap-3">
          <Input
            id="run-ticker-input"
            value={runTicker}
            onChange={(e) => setRunTicker(e.target.value)}
            placeholder="Search Ticker (e.g. BTC, NVDA, AAPL)"
            className="max-w-[240px] h-9 bg-primary/5 border-border/30 text-xs font-bold rounded-xl focus:ring-1 focus:ring-primary/30"
            onKeyDown={(e) => e.key === "Enter" && handleRunPipeline()}
          />
          <Button
            id="run-pipeline-btn"
            onClick={handleRunPipeline}
            disabled={runLoading || !runTicker.trim()}
            className="h-9 bg-primary hover:opacity-90 text-white border-0 text-[11px] font-black uppercase tracking-widest rounded-xl px-6 min-w-[140px] shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {runLoading ? "⚡ In Progress" : "🚀 Run Pipeline"}
          </Button>
        </div>
        {error && <p className="text-destructive text-[10px] font-bold mt-2 uppercase tracking-tighter">{error}</p>}
      </Card>

      {runs.length === 0 ? (
        <Card className="glass-card rounded-2xl p-12 text-center border-border/30">
          <p className="text-muted-foreground">No pipeline runs found. Start your first analysis above.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {runs.map((run) => (
            <Card
              key={run.id}
              className="glass-card rounded-2xl p-4 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer group"
              onClick={() => router.push(`/dashboard/runs/${run.id}`)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                    {run.ticker?.[0] || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="font-black text-sm text-foreground tracking-tight uppercase">
                        {run.ticker || "UNKNOWN"}
                      </h3>
                      <Badge className={`${getSentimentColor(run.overall_sentiment || "")} text-[8px] px-1.5 py-0 font-black uppercase tracking-tighter rounded-md`}>
                        {run.overall_sentiment || "neutral"}
                      </Badge>
                      <Badge className={`${getStatusColor(run.payload?.status || "completed")} text-[8px] px-1.5 py-0 font-black uppercase tracking-tighter rounded-md`}>
                        {run.payload?.status || "completed"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] font-medium mb-1.5 line-clamp-1 opacity-70">
                      {run.payload?.explanation || "Pipeline run completed successfully"}
                    </p>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                       <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary/30" /> {run.payload?.articles?.length || 0} Reports</span>
                       <span className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-primary/30" /> {new Date(run.created_at || "").toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                   <span className="text-[9px] font-black text-muted-foreground/40 group-hover:text-primary/50 transition-colors">ID #{run.id}</span>
                   <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}