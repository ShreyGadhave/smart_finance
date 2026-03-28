"use client";
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Activity,
  Layers,
  Globe,
  ShieldCheck,
  ExternalLink,
  Zap
} from "lucide-react";

// TradingView Widget Component
function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Check if the script is already added to avoid duplicates
    if (container.current.querySelector('script')) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "NSE:NIFTY",
      "interval": "D",
      "timezone": "Etc/UTC",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "allow_symbol_change": true,
      "calendar": false,
      "support_host": "https://www.tradingview.com",
      "hide_top_toolbar": false,
      "save_image": false,
      "container_id": "tradingview_nifty_chart"
    });
    container.current.appendChild(script);
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full rounded-3xl overflow-hidden border border-border/40 shadow-xl" ref={container}>
      <div id="tradingview_nifty_chart" className="h-full w-full" />
    </div>
  );
}

export default function OverviewPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Dense KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { l: "Top Ticker", v: "AAPL", s: "3 PIpeline Runs", i: TrendingUp, c: "text-primary" },
          { l: "Live Signal", v: "GOOG", s: "NEUTRAL_TARGET", i: Layers, c: "text-accent" },
          { l: "Analytic Runs", v: "4", s: "PROCESSED_DATA", i: Activity, c: "text-secondary" },
          { l: "Source Volume", v: "15", s: "FACT_CHECKED", i: Globe, c: "text-primary" },
          { l: "Alert Level", v: "1%", s: "AAPL_CONCERN", i: ShieldCheck, c: "text-destructive" },
        ].map((card, i) => (
          <Card key={i} className="glass-card p-3 rounded-2xl border-white/60 bg-white/40 flex flex-col justify-between group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{card.l}</span>
              <card.i className={`w-3 h-3 ${card.c} opacity-50 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="mt-2">
              <h3 className="text-lg font-black text-foreground leading-none">{card.v}</h3>
              <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground mt-1">{card.s}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Multi-Chart Area */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Live Nifty 50 Advanced Terminal */}
        <div className="lg:col-span-3 h-[500px] flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black text-foreground uppercase tracking-widest leading-none">Market Intelligence Center</h2>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter mt-1">NIFTY 50 LIVE INDEX ARCHITECTURE</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[8px] font-black rounded-lg border-border/50 uppercase tracking-widest h-6">Live Feed</Badge>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px] font-black rounded-lg uppercase tracking-widest h-6">Market Open</Badge>
            </div>
          </div>

          <div className="flex-1">
            <TradingViewWidget />
          </div>
        </div>

        {/* Real-time Ticker Tracking */}
        <div className="space-y-4 h-[500px] flex flex-col">
          <div className="flex items-center gap-2 px-2">
            <Zap className="w-4 h-4 text-accent" />
            <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground">Active Identifiers</h2>
          </div>

          <Card className="flex-1 glass-card rounded-[2rem] p-6 border-white/50 bg-white/30 overflow-hidden flex flex-col">
            <div className="space-y-3 flex-1 overflow-y-auto no-scrollbar pr-2">
              {[
                { t: "AAPL", p: "+1.2%", s: "Bullish", c: "accent" },
                { t: "GOOGL", p: "-0.4%", s: "Neutral", c: "muted-foreground" },
                { t: "TSLA", p: "+2.8%", s: "Bullish", c: "accent" },
                { t: "MSFT", p: "+0.1%", s: "Neutral", c: "muted-foreground" },
                { t: "RELIANCE", p: "+0.9%", s: "Bullish", c: "accent" },
                { t: "TCS", p: "-1.1%", s: "Bearish", c: "destructive" },
              ].map((stock, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/40 border border-white/60 hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] font-black group-hover:bg-primary group-hover:text-white transition-all">
                      {stock.t[0]}
                    </div>
                    <span className="text-xs font-black tracking-tighter">{stock.t}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-black ${stock.p.startsWith('+') ? 'text-accent' : 'text-destructive'}`}>{stock.p}</p>
                    <p className="text-[8px] font-bold text-muted-foreground/60 uppercase">{stock.s}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4 rounded-xl border-border/50 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
              Global Scan <ExternalLink className="ml-2 w-3 h-3" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}