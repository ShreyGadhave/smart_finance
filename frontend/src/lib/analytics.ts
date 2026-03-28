import { getSupabaseClient } from "@/lib/supabase";
import type { PipelineRunRow } from "@/lib/types";

export async function fetchSentimentTrend(): Promise<{ date: string; sentiment: number }[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  // Fetch last 30 runs, group by day, average sentiment
  const { data } = await client
    .from("pipeline_runs")
    .select("created_at,overall_sentiment")
    .order("created_at", { ascending: true })
    .limit(100);
  if (!data) return [];
  // Map sentiment to numeric
  const sentimentMap: Record<string, number> = { bullish: 2, neutral: 0, bearish: -2 };
  const trend: Record<string, { sum: number; count: number }> = {};
  for (const row of data as PipelineRunRow[]) {
    const date = row.created_at?.slice(0, 10) ?? "";
    const s = sentimentMap[(row.overall_sentiment ?? "neutral").toLowerCase()] ?? 0;
    if (!trend[date]) trend[date] = { sum: 0, count: 0 };
    trend[date].sum += s;
    trend[date].count += 1;
  }
  return Object.entries(trend).map(([date, { sum, count }]) => ({ date, sentiment: sum / count }));
}

export async function fetchSourceDistribution(): Promise<{ source: string; count: number }[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  // Fetch recent runs and flatten articles
  const { data } = await client
    .from("pipeline_runs")
    .select("payload")
    .order("created_at", { ascending: false })
    .limit(50);
  if (!data) return [];
  const sourceCounts: Record<string, number> = {};
  for (const row of data) {
    const articles = row.payload?.articles || [];
    for (const article of articles) {
      const src = (article.source || "Unknown").trim();
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    }
  }
  return Object.entries(sourceCounts).map(([source, count]) => ({ source, count }));
}

export async function fetchBullishBearishMix(): Promise<{ label: string; value: number }[]> {
  const client = getSupabaseClient();
  if (!client) return [];
  // Fetch recent runs and count sentiment
  const { data } = await client
    .from("pipeline_runs")
    .select("overall_sentiment")
    .order("created_at", { ascending: false })
    .limit(50);
  if (!data) return [];
  let bullish = 0, bearish = 0, neutral = 0;
  for (const row of data) {
    const s = (row.overall_sentiment || "neutral").toLowerCase();
    if (s === "bullish") bullish++;
    else if (s === "bearish") bearish++;
    else neutral++;
  }
  return [
    { label: "Bullish", value: bullish },
    { label: "Bearish", value: bearish },
    { label: "Neutral", value: neutral },
  ];
}
