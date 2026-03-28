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

export type SourceDistributionDatum = {
  source: string;
  count: number;
};

const COLORS = [
  "oklch(0.70 0.18 250)",
  "oklch(0.65 0.20 160)",
  "oklch(0.72 0.20 45)",
  "oklch(0.65 0.22 330)",
  "oklch(0.70 0.15 80)",
  "oklch(0.60 0.15 200)",
  "oklch(0.55 0.10 260)",
  "oklch(0.65 0.18 130)",
];

export default function SourceDistributionChart({
  data,
}: {
  data: SourceDistributionDatum[];
}) {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePieClick = (data: any) => {
    if (data?.source) {
      router.push(
        `/dashboard/articles?source=${encodeURIComponent(data.source)}`
      );
    }
  };

  return (
    <div className="w-full h-64 relative min-h-[256px]">
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="source"
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
            formatter={(value: any, name: any) => [value, `${name} Articles`]}
          />
          <Legend
            wrapperStyle={{ color: "oklch(0.60 0.02 250)", fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
