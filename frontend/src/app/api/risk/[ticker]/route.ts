import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params;
    const cleanTicker = ticker.toUpperCase();

    // In production, proxy to Python backend:
    // const res = await fetch(`http://localhost:8000/api/risk/${cleanTicker}`, { ... })

    // Demo risk data
    const vol = Math.random() * 0.35 + 0.1;
    const ret = Math.random() * 0.25 - 0.03;
    const riskLevel = vol < 0.15 ? "low" : vol < 0.30 ? "moderate" : vol < 0.50 ? "high" : "very_high";

    const result = {
      ticker: cleanTicker,
      risk_level: riskLevel,
      metrics: {
        annualized_return: Math.round(ret * 10000) / 10000,
        annualized_volatility: Math.round(vol * 10000) / 10000,
        sharpe_ratio: Math.round(((ret - 0.04) / vol) * 10000) / 10000,
        sortino_ratio: Math.round(((ret - 0.04) / (vol * 0.7)) * 10000) / 10000,
        beta: Math.round((0.8 + Math.random() * 0.8) * 10000) / 10000,
        var_95: Math.round(-vol * 1.645 / Math.sqrt(252) * 10000) / 10000,
        var_99: Math.round(-vol * 2.326 / Math.sqrt(252) * 10000) / 10000,
        cvar_95: Math.round(-vol * 2.063 / Math.sqrt(252) * 10000) / 10000,
        max_drawdown: Math.round(Math.random() * 0.35 * 10000) / 10000,
      },
      company_info: {
        name: cleanTicker,
        sector: "Technology",
        market_cap: Math.round(Math.random() * 3000) * 1e9,
        pe_ratio: Math.round((Math.random() * 35 + 12) * 10) / 10,
      },
      recommendation:
        `${riskLevel === "low" ? "Low volatility — suitable for conservative investors." : riskLevel === "moderate" ? "Moderate risk profile — suitable for balanced portfolios." : "High volatility — only for aggressive risk tolerance."} ` +
        `${ret > 0.04 ? "Returns exceed risk-free rate." : "Returns are below risk-free rate."} ` +
        "Consider portfolio diversification for optimal risk-adjusted performance.",
    };

    return NextResponse.json({ ok: true, result });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Risk assessment failed" },
      { status: 500 }
    );
  }
}
