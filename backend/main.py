from fetcher import fetch_all_sources
from processor import (
    normalize_gnews,
    normalize_alpha,
    normalize_yahoo,
    rank_and_select,
    enrich_news,
    analyze_sentiments,
    aggregate_sentiment,
)
from groq_explainer import explain_sentiment
from research_fetcher import (
    fetch_company_overview,
    fetch_earnings,
    fetch_yfinance_analysis,
)
from research_processor import process_research_data
from research_llm import generate_research_report
from customer import fetch_reddit_posts, analyze_customer_sentiment
from trust_scoring import generate_trust_report
from risk_assessment import assess_risk
from regulatory import check_portfolio_compliance, generate_compliance_report
from storage import save_json
from supabase_storage import (
    start_pipeline_run,
    complete_pipeline_run,
    fail_pipeline_run,
)
from logger import log
from config import OUTPUT_FILE, DEFAULT_USER_ID
from utils import generate_trace_id


def run_pipeline(ticker="AAPL", user_id=None):
    resolved_user_id = user_id or DEFAULT_USER_ID
    trace_id = generate_trace_id()
    log(f"🚀 Starting pipeline for {ticker}", trace_id=trace_id)

    run_status = start_pipeline_run(ticker=ticker, user_id=resolved_user_id)
    run_id = run_status.get("run_id") if run_status.get("saved") else None
    if run_id:
        log(f"☁️ Started Supabase run: {run_id}", trace_id=trace_id)
    else:
        log(
            f"☁️ Supabase start skipped: {run_status.get('reason', 'unknown')}",
            trace_id=trace_id,
            level="WARN",
        )

    try:
        # =========================
        # 🔹 PHASE 1: NEWS PIPELINE
        # =========================
        log("📰 Fetching news...", trace_id=trace_id)

        gnews, alpha, yahoo = fetch_all_sources(ticker)

        news = normalize_gnews(gnews) + normalize_alpha(alpha) + normalize_yahoo(yahoo)

        log(f"Collected {len(news)} articles", trace_id=trace_id)

        # Select top 5 relevant
        selected = rank_and_select(news, ticker, top_n=5)
        log(f"Selected {len(selected)} relevant articles", trace_id=trace_id)

        # Extract full content
        enriched = enrich_news(selected)

        # =========================
        # 🔹 PHASE 2: SENTIMENT
        # =========================
        log("🧠 Running sentiment analysis...", trace_id=trace_id)

        analyzed = analyze_sentiments(enriched)

        stock_sentiment = aggregate_sentiment(analyzed)
        log(f"📊 Stock Sentiment: {stock_sentiment}", trace_id=trace_id)

        # =========================
        # 🔹 PHASE 3: TRUST & CREDIBILITY
        # =========================
        log("🔍 Running trust and verification scoring...", trace_id=trace_id)
        
        trust_report = generate_trust_report(analyzed)
        analyzed_with_trust = trust_report.get("scored_articles", analyzed)
        log(f"✅ Overall Trust: {trust_report['overall_reliability']} ({trust_report['average_trust_score']})", trace_id=trace_id)

        # =========================
        # 🔹 PHASE 4: LLM EXPLANATION
        # =========================
        log("🤖 Generating explanation...", trace_id=trace_id)

        explanation = explain_sentiment(ticker, stock_sentiment, analyzed_with_trust)

        # =========================
        # 🔹 PHASE 5: RISK ASSESSMENT
        # =========================
        log("📊 Performing quantitative risk assessment...", trace_id=trace_id)
        
        risk_data = assess_risk(ticker)
        log(f"⚠️ Risk Level: {risk_data.get('risk_level', 'unknown')}", trace_id=trace_id)
        
        # =========================
        # 🔹 PHASE 6: RESEARCH PIPELINE
        # =========================
        log("📊 Fetching deep research data...", trace_id=trace_id)

        overview = fetch_company_overview(ticker)
        earnings = fetch_earnings(ticker)
        yinfo = fetch_yfinance_analysis(ticker)

        research_text = process_research_data(overview, earnings, yinfo)

        log("🧠 Generating research narrative...", trace_id=trace_id)

        research_report = generate_research_report(ticker, research_text)

        # =========================
        # 🔹 PHASE 7: CUSTOMER DATA
        # =========================
        log("👥 Fetching customer discussions (Reddit)...", trace_id=trace_id)

        posts = fetch_reddit_posts(ticker)
        log(f"Fetched {len(posts)} Reddit posts", trace_id=trace_id)

        customer_data = analyze_customer_sentiment(posts)
        log(
            f"Customer Sentiment: {customer_data['customer_sentiment']}",
            trace_id=trace_id,
        )

        # =========================
        # 🔹 PHASE 8: REGULATORY COMPLIANCE
        # =========================
        log("⚖️ Running regulatory compliance scan...", trace_id=trace_id)
        
        # Initial compliance check against default rules
        regulatory_report = generate_compliance_report(ticker)

        # =========================
        # 🔹 FINAL OUTPUT
        # =========================
        output = {
            "ticker": ticker,
            "overall_sentiment": stock_sentiment,
            "explanation": explanation,
            "research_report": research_report,
            "customer_analysis": customer_data,
            "trust_report": {
                "reliability": trust_report["overall_reliability"],
                "score": trust_report["average_trust_score"],
                "consistency": trust_report["consistency"],
            },
            "risk_assessment": risk_data,
            "regulatory_compliance": {
                "report": regulatory_report
            },
            "articles": analyzed_with_trust,
        }

        save_json(output, OUTPUT_FILE)

        # Optional cloud persistence
        supabase_status = complete_pipeline_run(
            run_id=run_id,
            payload=output,
            user_id=resolved_user_id,
        )
        if supabase_status["saved"]:
            log(
                f"☁️ Saved run to {supabase_status['table']} and "
                f"{supabase_status.get('articles_saved', 0)} articles to "
                f"{supabase_status.get('articles_table', 'pipeline_articles')}",
                trace_id=trace_id,
            )
        else:
            log(
                f"☁️ Supabase update skipped: {supabase_status['reason']}",
                trace_id=trace_id,
            )

        log("✅ Pipeline completed successfully!", trace_id=trace_id)

        return {
            "run_id": supabase_status.get("run_id", run_id),
            "ticker": ticker,
            "status": "completed",
            "overall_sentiment": stock_sentiment,
            "articles_saved": supabase_status.get("articles_saved", 0),
        }

    except Exception as exc:
        fail_status = fail_pipeline_run(
            run_id=run_id,
            error_message=str(exc),
            ticker=ticker,
            user_id=resolved_user_id,
        )
        if fail_status.get("saved"):
            log(
                f"☁️ Marked Supabase run as failed: {fail_status.get('run_id')}",
                trace_id=trace_id,
            )
        else:
            log(
                f"☁️ Could not mark failed run in Supabase: {fail_status.get('reason')}",
                trace_id=trace_id,
            )
        raise


if __name__ == "__main__":
    run_pipeline("AAPL")