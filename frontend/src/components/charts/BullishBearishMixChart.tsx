"use client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";

export type BullishBearishDatum = {
  label: string;
  value: number;
};

const COLORS = [
  "oklch(0.65 0.20 160)",
  "oklch(0.65 0.25 25)",
  "oklch(0.72 0.20 45)",
];

export default function BullishBearishMixChart({
  data,
}: {
  data: BullishBearishDatum[];
}) {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePieClick = (data: any) => {
    if (data?.label) {
      const sentimentMap: Record<string, string> = {
        Bullish: "bullish",
        Bearish: "bearish",
        Neutral: "neutral",
      };
      const sentiment = sentimentMap[data.label] || data.label.toLowerCase();
      router.push(`/dashboard/runs?sentiment=${sentiment}`);
    }
  };

  return (
    <div className="w-full h-64 relative min-h-[256px]">
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
            onClick={handlePieClick}
            className="cursor-pointer"
          >
            {data.map((_, idx) => (
              <Cell
                key={`cell-${idx}`}
                fill={COLORS[idx % COLORS.length]}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.13 0.015 260)",
              border: "1px solid oklch(0.25 0.02 260)",
              borderRadius: "12px",
              color: "oklch(0.90 0.01 250)",
              fontSize: 12,
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [value, `${name} Runs`]}
          />
          <Legend
            wrapperStyle={{ color: "oklch(0.60 0.02 250)", fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
