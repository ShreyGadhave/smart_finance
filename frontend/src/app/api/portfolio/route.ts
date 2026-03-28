import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tickers, risk_appetite = "moderate" } = body;

    if (!tickers || tickers.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Need at least 2 tickers" },
        { status: 400 }
      );
    }

    // In production, this would proxy to the Python backend:
    // const res = await fetch('http://localhost:8000/api/portfolio/optimize', { ... })

    // For demo, generate simulated portfolio data
    const allocation: Record<string, number> = {};
    const weights = tickers.map(() => Math.random());
    const total = weights.reduce((a: number, b: number) => a + b, 0);
    tickers.forEach((t: string, i: number) => {
      allocation[t] = Math.round((weights[i] / total) * 10000) / 100;
    });

    const optWeights = tickers.map(() => Math.random());
    const optTotal = optWeights.reduce((a: number, b: number) => a + b, 0);
    const optAllocation: Record<string, number> = {};
    tickers.forEach((t: string, i: number) => {
      optAllocation[t] = Math.round((optWeights[i] / optTotal) * 10000) / 100;
    });

    const result = {
      tickers,
      risk_appetite,
      recommended_portfolio: {
        allocation,
        expected_return: Math.round((Math.random() * 15 + 5)) / 100,
        volatility: Math.round((Math.random() * 15 + 8)) / 100,
        sharpe_ratio: Math.round((Math.random() * 120 + 50)) / 100,
      },
      optimal_portfolio: {
        allocation: optAllocation,
        expected_return: Math.round((Math.random() * 20 + 8)) / 100,
        volatility: Math.round((Math.random() * 12 + 10)) / 100,
        sharpe_ratio: Math.round((Math.random() * 150 + 70)) / 100,
      },
      simulations_run: 5000,
      efficient_frontier: Array.from({ length: 30 }, (_, i) => ({
        expected_return: (i * 1.0 + 3) / 100,
        volatility: (i * 0.8 + 5 + Math.random() * 3) / 100,
        sharpe_ratio: Math.random() * 2.5,
      })),
    };

    return NextResponse.json({ ok: true, result });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Portfolio optimization failed" },
      { status: 500 }
    );
  }
}
