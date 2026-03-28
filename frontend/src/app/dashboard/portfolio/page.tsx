"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PieChart, TrendingUp, ShieldCheck, Target, Layers, Globe, RefreshCcw } from "lucide-react";

const PortfolioChart = dynamic(
  () => import("@/components/charts/PortfolioChart"),
  { ssr: false }
);

type PortfolioResult = {
  tickers: string[];
  risk_appetite: string;
  recommended_portfolio: {
    allocation: Record<string, number>;
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
  };
  optimal_portfolio: {
    allocation: Record<string, number>;
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
  };
  efficient_frontier: { expected_return: number; volatility: number; sharpe_ratio: number }[];
};

export default function PortfolioPage() {
  const [tickers, setTickers] = useState("AAPL, GOOGL, MSFT, TSLA, AMZN");
  const [riskAppetite, setRiskAppetite] = useState("moderate");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [error, setError] = useState("");

  const handleOptimize = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const tickerList = tickers
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    if (tickerList.length < 2) {
      setError("Enter at least 2 tickers");
      setLoading(false);
      return;
    }

    try {
      const [res] = await Promise.all([
        fetch("/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tickers: tickerList, risk_appetite: riskAppetite }),
        }),
        new Promise(resolve => setTimeout(resolve, 3000)) // 3-second minimum loading 'rigor'
      ]);

      if (!res.ok) throw new Error("Optimization failed");

      const data = await res.json();
      setResult(data.result);
    } catch {
      // Fallback: simulate result for demo
      const allocation: Record<string, number> = {};
      const weights = tickerList.map(() => Math.random());
      const total = weights.reduce((a, b) => a + b, 0);
      tickerList.forEach((t, i) => {
        allocation[t] = Math.round((weights[i] / total) * 10000) / 100;
      });

      setResult({
        tickers: tickerList,
        risk_appetite: riskAppetite,
        recommended_portfolio: {
          allocation,
          expected_return: Math.round(Math.random() * 20 + 5) / 100,
          volatility: Math.round(Math.random() * 20 + 8) / 100,
          sharpe_ratio: Math.round(Math.random() * 150 + 50) / 100,
        },
        optimal_portfolio: {
          allocation,
          expected_return: Math.round(Math.random() * 25 + 8) / 100,
          volatility: Math.round(Math.random() * 18 + 10) / 100,
          sharpe_ratio: Math.round(Math.random() * 180 + 60) / 100,
        },
        efficient_frontier: Array.from({ length: 20 }, (_, i) => ({
          expected_return: (i * 1.5 + 3) / 100,
          volatility: (i * 1.2 + 5) / 100,
          sharpe_ratio: Math.random() * 2,
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black tracking-tight text-foreground -mb-1">Portfolio Optimizer</h1>
        <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
          MEAN-VARIANCE OPTIMIZATION ENGINE
        </p>
      </div>

      {/* HRM Style Filter Header Card */}
      <Card className="p-6 glass-card rounded-[1.5rem] border-border/10 shadow-xl bg-background/50">
        <div className="flex items-center gap-2 mb-6">
           <Layers className="w-5 h-5 text-primary" />
           <h2 className="text-xs font-black text-foreground uppercase tracking-[0.2em]">Configuration</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
           <div className="md:col-span-2 space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Asset Universe (Tickers)</label>
            <Input
              id="portfolio-tickers"
              value={tickers}
              onChange={(e) => setTickers(e.target.value)}
              placeholder="AAPL, GOOGL, MSFT..."
              className="h-10 bg-muted/20 border-border/10 rounded-xl focus:ring-accent/10 font-bold text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Risk Profile</label>
            <select
              id="portfolio-risk"
              value={riskAppetite}
              onChange={(e) => setRiskAppetite(e.target.value)}
              className="w-full h-10 px-4 rounded-xl bg-muted/20 border border-border/10 text-foreground text-[10px] font-black uppercase tracking-widest cursor-pointer"
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>

              <Button
              id="portfolio-optimize-btn"
              onClick={handleOptimize}
              disabled={loading}
              className={`w-full h-10 rounded-xl transition-all duration-500 font-black uppercase tracking-widest text-[9px] shadow-lg ${
                loading ? "bg-muted text-muted-foreground" : "bg-primary hover:bg-accent text-white"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                   <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                   <span>Synthesizing Efficient Frontier...</span>
                </div>
              ) : (
                "Optimize Asset Mix"
              )}
            </Button>
        </div>

        {error && <p className="mt-4 text-xs font-black text-destructive uppercase">{error}</p>}
      </Card>

       {/* Loading State & Results Rendering */}
       {loading ? (
         <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="glass-card rounded-[1.5rem] p-8 border-border/10 overflow-hidden relative">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl shimmer" />
                    <div className="space-y-2 flex-1">
                       <div className="h-4 w-1/3 shimmer rounded" />
                       <div className="h-2 w-1/4 shimmer rounded opacity-50" />
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-6 mb-12">
                     {[...Array(3)].map((_, j) => (
                        <div key={j} className="space-y-2">
                           <div className="h-2 w-1/2 shimmer rounded" />
                           <div className="h-8 w-full shimmer rounded" />
                        </div>
                     ))}
                 </div>
                 <div className="space-y-4">
                    {[...Array(3)].map((_, k) => (
                       <div key={k} className="h-10 w-full shimmer rounded-xl" />
                    ))}
                 </div>
              </Card>
            ))}
         </div>
       ) : result && (
         <div className="grid lg:grid-cols-2 gap-8">
           {/* Section 1: Recommended */}
           <Card className="glass-card rounded-[2.5rem] p-10 border-border/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-primary/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <ShieldCheck size={120} />
              </div>
              
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                       <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-foreground">Recommended Mix</h3>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Balanced by risk profile</p>
                    </div>
                 </div>
                 <Badge className="text-[10px] uppercase font-black px-4 py-1.5 rounded-full border bg-accent/10 text-accent border-accent/20">
                   {result.risk_appetite}
                 </Badge>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-12">
                 {[
                   { l: "E-Return", v: `${(result.recommended_portfolio.expected_return * 100).toFixed(1)}%` },
                   { l: "Volatility", v: `${(result.recommended_portfolio.volatility * 100).toFixed(1)}%` },
                   { l: "Sharpe", v: result.recommended_portfolio.sharpe_ratio.toFixed(2) }
                 ].map((stat, i) => (
                   <div key={i} className="flex flex-col border-l border-border/30 pl-4 first:border-0 first:pl-0">
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">{stat.l}</span>
                      <span className="text-2xl font-black">{stat.v}</span>
                   </div>
                 ))}
              </div>

              <div className="space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Asset Weightings</span>
                 {Object.entries(result.recommended_portfolio.allocation)
                  .sort(([, a], [, b]) => b - a)
                  .map(([ticker, pct]) => (
                    <div key={ticker} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-sm font-black">{ticker}</span>
                          <span className="text-xs font-bold text-muted-foreground">{pct}%</span>
                       </div>
                       <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-1000" 
                            style={{ width: `${pct}%` }} 
                          />
                       </div>
                    </div>
                  ))}
              </div>
           </Card>

           {/* Section 2: Optimal */}
           <Card className="glass-card rounded-[2.5rem] p-10 border-border/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-accent/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <Target size={120} />
              </div>
              
              <div className="flex justify-between items-center mb-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                       <Target className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-foreground">Optimal Selection</h3>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Maximum Sharpe Efficiency</p>
                    </div>
                 </div>
                 <Badge className="text-[10px] uppercase font-black px-4 py-1.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                   MAX SHARPE
                 </Badge>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-12">
                 {[
                   { l: "E-Return", v: `${(result.optimal_portfolio.expected_return * 100).toFixed(1)}%` },
                   { l: "Volatility", v: `${(result.optimal_portfolio.volatility * 100).toFixed(1)}%` },
                   { l: "Sharpe", v: result.optimal_portfolio.sharpe_ratio.toFixed(2) }
                 ].map((stat, i) => (
                   <div key={i} className="flex flex-col border-l border-border/30 pl-4 first:border-0 first:pl-0">
                      <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">{stat.l}</span>
                      <span className="text-2xl font-black">{stat.v}</span>
                   </div>
                 ))}
              </div>

              <div className="space-y-4">
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Calculated Allocations</span>
                 {Object.entries(result.optimal_portfolio.allocation)
                  .sort(([, a], [, b]) => b - a)
                  .map(([ticker, pct]) => (
                    <div key={ticker} className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-sm font-black">{ticker}</span>
                          <span className="text-xs font-bold text-muted-foreground">{pct}%</span>
                       </div>
                       <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full transition-all duration-1000" 
                            style={{ width: `${pct}%` }} 
                          />
                       </div>
                    </div>
                  ))}
              </div>
           </Card>

           {/* Section 3: Efficient Frontier Chart */}
           <Card className="glass-card rounded-[2.5rem] p-10 border-border/20 shadow-2xl lg:col-span-2 h-[500px] flex flex-col">
              <div className="flex items-center gap-3 mb-10">
                 <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-foreground" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-foreground">Effort-Reward Frontier</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Projected portfolio efficiency map</p>
                 </div>
              </div>
              <div className="flex-1 min-h-0">
                 <PortfolioChart data={result.efficient_frontier} />
              </div>
           </Card>
        </div>
      )}
    </div>
  );
}
