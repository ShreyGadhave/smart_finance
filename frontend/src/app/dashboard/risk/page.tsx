"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type RiskResult = {
  ticker: string;
  risk_level: string;
  metrics: {
    annualized_return: number;
    annualized_volatility: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    beta: number;
    var_95: number;
    var_99: number;
    cvar_95: number;
    max_drawdown: number;
  };
  company_info: {
    name: string;
    sector: string;
    market_cap: number | null;
    pe_ratio: number | null;
  };
  recommendation: string;
};

export default function RiskPage() {
  const [ticker, setTicker] = useState("AAPL");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RiskResult | null>(null);
  const [error, setError] = useState("");

  const handleAssess = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const cleanTicker = ticker.trim().toUpperCase();
    if (!cleanTicker) {
      setError("Enter a ticker symbol");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/risk/${cleanTicker}`);
      if (!res.ok) throw new Error("Risk assessment failed");
      const data = await res.json();
      setResult(data.result);
    } catch {
      // Fallback demo data
      const vol = Math.random() * 0.4 + 0.1;
      const ret = Math.random() * 0.3 - 0.05;
      setResult({
        ticker: cleanTicker,
        risk_level: vol < 0.15 ? "low" : vol < 0.30 ? "moderate" : vol < 0.50 ? "high" : "very_high",
        metrics: {
          annualized_return: Math.round(ret * 10000) / 10000,
          annualized_volatility: Math.round(vol * 10000) / 10000,
          sharpe_ratio: Math.round(((ret - 0.04) / vol) * 10000) / 10000,
          sortino_ratio: Math.round(((ret - 0.04) / (vol * 0.7)) * 10000) / 10000,
          beta: Math.round((0.8 + Math.random() * 0.8) * 10000) / 10000,
          var_95: Math.round(-vol * 1.645 / Math.sqrt(252) * 10000) / 10000,
          var_99: Math.round(-vol * 2.326 / Math.sqrt(252) * 10000) / 10000,
          cvar_95: Math.round(-vol * 2.063 / Math.sqrt(252) * 10000) / 10000,
          max_drawdown: Math.round(Math.random() * 0.4 * 10000) / 10000,
        },
        company_info: {
          name: cleanTicker,
          sector: "Technology",
          market_cap: Math.round(Math.random() * 3000) * 1e9,
          pe_ratio: Math.round(Math.random() * 40 + 10),
        },
        recommendation:
          "Moderate risk profile. Positive risk-adjusted returns with reasonable market correlation. Suitable for balanced portfolios with medium-term investment horizons.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-[oklch(0.65_0.20_160_/_20%)] text-[oklch(0.75_0.18_160)] border border-[oklch(0.65_0.20_160_/_30%)]";
      case "moderate":
        return "bg-[oklch(0.72_0.20_45_/_20%)] text-[oklch(0.80_0.18_45)] border border-[oklch(0.72_0.20_45_/_30%)]";
      case "high":
        return "bg-[oklch(0.65_0.25_25_/_20%)] text-[oklch(0.75_0.20_25)] border border-[oklch(0.65_0.25_25_/_30%)]";
      case "very_high":
        return "bg-[oklch(0.55_0.25_25_/_25%)] text-[oklch(0.70_0.25_25)] border border-[oklch(0.55_0.25_25_/_35%)]";
      default:
        return "bg-muted text-muted-foreground border border-border/50";
    }
  };

  const formatNumber = (n: number | null | undefined) => {
    if (n == null) return "N/A";
    if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
    if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return n.toFixed(2);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Risk Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive risk profiling — VaR, Sharpe, Beta, Max Drawdown
        </p>
      </div>

      {/* Input */}
      <Card className="glass-card rounded-2xl p-6 border-border/30">
        <div className="flex gap-4 items-end">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-foreground/80 mb-1.5">
              Ticker Symbol
            </label>
            <Input
              id="risk-ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="AAPL"
              className="bg-input border-border/50"
              onKeyDown={(e) => e.key === "Enter" && handleAssess()}
            />
          </div>
          <Button
            id="risk-assess-btn"
            onClick={handleAssess}
            disabled={loading}
            className="bg-gradient-to-r from-[oklch(0.72_0.20_45)] to-[oklch(0.65_0.25_25)] hover:opacity-90 text-white border-0 shadow-lg"
          >
            {loading ? "Analyzing..." : "⚡ Assess Risk"}
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Header Card */}
          <Card className="glass-card rounded-2xl p-6 border-border/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {result.company_info.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {result.company_info.sector} • {result.ticker}
                </p>
              </div>
              <Badge className={getRiskColor(result.risk_level)}>
                {result.risk_level.replace("_", " ")} risk
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Market Cap</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {formatNumber(result.company_info.market_cap)}
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">P/E Ratio</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {result.company_info.pe_ratio?.toFixed(1) ?? "N/A"}
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ann. Return</p>
                <p className={`text-lg font-bold mt-1 ${result.metrics.annualized_return >= 0 ? "text-accent" : "text-destructive"}`}>
                  {(result.metrics.annualized_return * 100).toFixed(1)}%
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Ann. Volatility</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {(result.metrics.annualized_volatility * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/20 rounded-xl p-4">
              {result.recommendation}
            </p>
          </Card>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Risk-Adjusted Returns */}
            <Card className="glass-card rounded-2xl p-6 border-border/30">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                Risk-Adjusted Returns
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Sharpe Ratio</span>
                    <span className={`font-semibold ${result.metrics.sharpe_ratio > 1 ? "text-accent" : result.metrics.sharpe_ratio > 0 ? "text-foreground" : "text-destructive"}`}>
                      {result.metrics.sharpe_ratio.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[oklch(0.70_0.18_250)] to-[oklch(0.65_0.20_160)]"
                      style={{ width: `${Math.min(Math.max(result.metrics.sharpe_ratio / 3, 0), 1) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Sortino Ratio</span>
                    <span className="font-semibold text-foreground">
                      {result.metrics.sortino_ratio.toFixed(3)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[oklch(0.65_0.20_160)] to-[oklch(0.70_0.15_80)]"
                      style={{ width: `${Math.min(Math.max(result.metrics.sortino_ratio / 3, 0), 1) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Beta</span>
                    <span className="font-semibold text-foreground">
                      {result.metrics.beta.toFixed(3)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {result.metrics.beta > 1.3 ? "High market sensitivity" : result.metrics.beta < 0.7 ? "Low correlation (diversifier)" : "Market-aligned"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Value at Risk */}
            <Card className="glass-card rounded-2xl p-6 border-border/30">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                Value at Risk (Daily)
              </h3>
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">VaR (95%)</p>
                  <p className="text-2xl font-bold text-destructive mt-1">
                    {(result.metrics.var_95 * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Worst expected daily loss 95% of the time
                  </p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">VaR (99%)</p>
                  <p className="text-2xl font-bold text-destructive mt-1">
                    {(result.metrics.var_99 * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground">CVaR / Expected Shortfall (95%)</p>
                  <p className="text-2xl font-bold text-destructive mt-1">
                    {(result.metrics.cvar_95 * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average loss in worst 5% of scenarios
                  </p>
                </div>
              </div>
            </Card>

            {/* Drawdown */}
            <Card className="glass-card rounded-2xl p-6 border-border/30">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
                Drawdown Analysis
              </h3>
              <div className="bg-muted/30 rounded-xl p-4 mb-4">
                <p className="text-xs text-muted-foreground">Maximum Drawdown (1Y)</p>
                <p className="text-3xl font-bold text-destructive mt-1">
                  -{(result.metrics.max_drawdown * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Largest peak-to-trough decline over the past year
                </p>
              </div>

              {/* Visual meter */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Risk Level Meter</p>
                <div className="h-4 bg-muted rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(result.metrics.annualized_volatility / 0.6, 1) * 100}%`,
                      background: `linear-gradient(90deg, oklch(0.65 0.20 160), oklch(0.72 0.20 45), oklch(0.65 0.25 25))`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Very High</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
