"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useRouter } from "next/navigation";

export type SentimentTrendPoint = {
  date: string;
  sentiment: number;
};

export default function SentimentTrendChart({
  data,
}: {
  data: SentimentTrendPoint[];
}) {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChartClick = (data: any) => {
    const payload = data?.activePayload as Array<{ payload: { date: string } }> | undefined;
    if (payload?.[0]) {
      const clickedDate = payload[0].payload.date;
      router.push(`/dashboard/runs?date=${clickedDate}`);
    }
  };

  return (
    <div className="w-full h-64 relative min-h-[256px]">
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <LineChart
          data={data}
          margin={{ top: 16, right: 24, left: 0, bottom: 0 }}
          onClick={handleChartClick}
          className="cursor-pointer"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.02 260)" />
          <XAxis
            dataKey="date"
            stroke="oklch(0.50 0.02 250)"
            tick={{ fill: "oklch(0.60 0.02 250)", fontSize: 12 }}
          />
          <YAxis
            domain={[-2, 2]}
            ticks={[-2, -1, 0, 1, 2]}
            stroke="oklch(0.50 0.02 250)"
            tick={{ fill: "oklch(0.60 0.02 250)", fontSize: 12 }}
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
            formatter={(value: any) => {
              const v = Number(value);
              return [
                v > 0
                  ? `Bullish (${v.toFixed(2)})`
                  : v < 0
                  ? `Bearish (${Math.abs(v).toFixed(2)})`
                  : "Neutral",
                "Sentiment",
              ];
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="sentiment"
            stroke="oklch(0.70 0.18 250)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.70 0.18 250)", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "oklch(0.70 0.18 250)", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
