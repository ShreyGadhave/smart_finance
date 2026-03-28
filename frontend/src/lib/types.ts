export type Article = {
  headline?: string;
  source?: string;
  sentiment?: "positive" | "neutral" | "negative" | string;
  confidence?: number;
  summary?: string;
  url?: string;
  trust_score?: number;
  source_credibility?: number;
};

export type CustomerAnalysis = {
  customer_sentiment?: "bullish" | "neutral" | "bearish" | string;
  confidence?: number;
  num_posts?: number;
  insight?: string;
  explanation?: string; // Sync with intelligence engine
};

export type TrustReport = {
  score?: number;
  reliability?: string;
  reasoning?: string[];
}

export type RiskAssessment = {
  risk_level?: string;
  recommendation?: string;
  metrics?: {
    annualized_volatility?: number;
    beta?: number;
    sharpe_ratio?: number;
  }
}

export type PipelinePayload = {
  ticker?: string;
  overall_sentiment?: "bullish" | "neutral" | "bearish" | string;
  explanation?: string;
  research_report?: string;
  customer_analysis?: CustomerAnalysis;
  trust_report?: TrustReport;
  risk_assessment?: RiskAssessment;
  regulatory_compliance?: any; // Generic for now
  articles?: Article[];
  status?: "queued" | "running" | "completed" | "failed" | string;
};

export type PipelineRunRow = {
  id?: string | number;
  ticker?: string;
  overall_sentiment?: string;
  payload: PipelinePayload; // Make payload required for safer access
  created_at?: string;
  trust_reliability?: string;
  average_trust_score?: number;
  risk_level?: string;
};