"use client";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type DataPoint = {
  expected_return: number;
  volatility: number;
  sharpe_ratio: number;
};

export default function PortfolioChart({ data }: { data: DataPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    expected_return_pct: +(d.expected_return * 100).toFixed(2),
    volatility_pct: +(d.volatility * 100).toFixed(2),
  }));

  return (
    <div className="w-full h-72 relative min-h-[288px]">
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <ScatterChart margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 260)" />
          <XAxis
            dataKey="volatility_pct"
            name="Volatility"
            unit="%"
            stroke="oklch(0.50 0.02 250)"
            tick={{ fill: "oklch(0.60 0.02 250)", fontSize: 12 }}
            label={{
              value: "Volatility (%)",
              position: "bottom",
              fill: "oklch(0.50 0.02 250)",
              fontSize: 12,
            }}
          />
          <YAxis
            dataKey="expected_return_pct"
            name="Return"
            unit="%"
            stroke="oklch(0.50 0.02 250)"
            tick={{ fill: "oklch(0.60 0.02 250)", fontSize: 12 }}
            label={{
              value: "Return (%)",
              angle: -90,
              position: "insideLeft",
              fill: "oklch(0.50 0.02 250)",
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.13 0.015 260)",
              border: "1px solid oklch(0.25 0.02 260)",
              borderRadius: "12px",
              color: "oklch(0.90 0.01 250)",
              fontSize: 12,
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              if (name === "Return") return [`${value}%`, "Expected Return"];
              if (name === "Volatility") return [`${value}%`, "Volatility"];
              return [value, String(name ?? "")];
            }}
          />
          <Scatter
            data={chartData}
            fill="oklch(0.70 0.18 250)"
            fillOpacity={0.7}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
