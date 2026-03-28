"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabase";
import type { Article } from "@/lib/types";
import { Search, Filter, ExternalLink, RefreshCw, Layers } from "lucide-react";

type ArticleWithMeta = Article & {
  run_id?: number;
  ticker?: string;
  created_at?: string;
  trust_score?: number;
  source_credibility?: number;
};

function ArticlesContent() {
  const [articles, setArticles] = useState<ArticleWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const searchParams = useSearchParams();

  useEffect(() => {
    fetchArticles();
    const sourceParam = searchParams.get("source");
    if (sourceParam) {
      setSearchTerm(sourceParam);
    }
  }, [searchParams]);

  const fetchArticles = async () => {
    const client = getSupabaseClient();
    if (!client) {
      setError("Supabase client not configured");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await client
        .from("pipeline_articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setError(error.message);
      } else {
        setArticles(data || []);
      }
    } catch {
      setError("Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case "positive":
      case "bullish":
        return "bg-accent/10 text-accent border-accent/20";
      case "negative":
      case "bearish":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border/50";
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !searchTerm ||
      article.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.ticker?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.source?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSentiment =
      sentimentFilter === "all" ||
      article.sentiment?.toLowerCase() === sentimentFilter.toLowerCase();

    return matchesSearch && matchesSentiment;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-xl font-black tracking-tight">Intelligence Feed</h1>
            <div className="h-4 w-48 shimmer rounded-md" />
          </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card rounded-[2rem] p-8">
              <div className="h-4 shimmer rounded w-3/4 mb-4" />
              <div className="h-3 shimmer rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight text-foreground -mb-1">Intelligence Feed</h1>
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
             CONSOLIDATED ANALYTICS STREAM
          </p>
        </div>
        <Button 
          onClick={fetchArticles} 
          variant="outline" 
          className="rounded-2xl border-border/50 bg-background/50 flex items-center gap-2 group hover:bg-accent hover:border-accent"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
          Refresh Feed
        </Button>
      </div>

      {/* HRM Style Filter Bar */}
       <Card className="p-3 glass-card rounded-2xl border-border/20 flex flex-col md:flex-row gap-3 items-center bg-muted/10">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
            id="articles-search"
            placeholder="Search Intelligence Feed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-10 bg-background/50 border-border/10 rounded-xl focus:ring-accent/10 text-xs font-bold"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground ml-2 hidden md:block" />
          <select
            id="articles-sentiment-filter"
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="flex-1 md:w-48 h-12 px-4 rounded-2xl bg-background/50 border border-border/30 text-foreground text-sm font-bold uppercase tracking-widest cursor-pointer focus:outline-none focus:border-accent"
          >
            <option value="all">Global Sentiment</option>
            <option value="positive">Bullish Only</option>
            <option value="neutral">Neutral Only</option>
            <option value="negative">Bearish Only</option>
          </select>
        </div>
      </Card>

      <div className="flex items-center justify-between px-2">
         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
           Audit Trail: {filteredArticles.length} results
         </span>
      </div>

      {filteredArticles.length === 0 ? (
        <Card className="glass-card rounded-[3rem] p-24 text-center border-border/20 shadow-xl opacity-60">
          <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-6" />
          <p className="text-xl font-bold text-muted-foreground italic">No intelligence points match your current filter parameters.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article, index) => (
             <Card
              key={`${article.run_id}-${index}`}
              className="glass-card rounded-xl p-4 border-border/10 group hover:border-accent/30 hover:translate-x-1 transition-all duration-300 bg-white/30"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={`text-[10px] font-black uppercase px-3 py-0.5 rounded-full border-2 ${getSentimentColor(article.sentiment || "")}`}>
                      {article.sentiment || "Neutral"}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{article.source}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-[10px] font-black text-primary uppercase">{article.ticker}</span>
                  </div>

                   <h3 className="text-base font-black text-foreground leading-tight group-hover:text-primary transition-colors pr-10">
                    {article.headline || "Publication Title Unindexed"}
                  </h3>

                  {article.summary && (
                    <p className="text-[11px] font-bold text-muted-foreground/80 leading-relaxed line-clamp-2 md:line-clamp-none pr-10">
                      {article.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-6 pt-2">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">Confidence</span>
                        <span className="text-sm font-bold">{(article.confidence ?? 0 * 100).toFixed(0)}%</span>
                     </div>
                     <div className="flex flex-col border-l border-border/30 pl-6">
                        <span className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-widest">Publication Date</span>
                        <span className="text-sm font-bold">{new Date(article.created_at || "").toLocaleDateString()}</span>
                     </div>
                  </div>
                </div>

                <div className="shrink-0 pt-2">
                   {article.url && (
                    <Button 
                      asChild 
                      variant="ghost" 
                      className="rounded-2xl border border-border/30 bg-background/50 hover:bg-accent hover:text-white transition-all gap-2 uppercase text-[10px] font-black tracking-widest"
                    >
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        Access Source <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 p-8">
          <div className="h-10 shimmer rounded w-1/4 mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-8">
                <div className="h-4 shimmer rounded w-3/4 mb-3" />
                <div className="h-3 shimmer rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <ArticlesContent />
    </Suspense>
  );
}