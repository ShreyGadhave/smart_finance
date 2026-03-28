

# from fetcher import fetch_all_sources
# from processor import (
#     normalize_gnews,
#     normalize_alpha,
#     normalize_yahoo,
#     rank_and_select,
#     enrich_news,
#     analyze_sentiments,
#     aggregate_sentiment
# )
# from groq_explainer import explain_sentiment
# from research_fetcher import (
#     fetch_company_overview,
#     fetch_earnings,
#     fetch_yfinance_analysis
# )
# from research_processor import process_research_data
# from research_llm import generate_research_report
# from storage import save_json
# from logger import log
# from config import OUTPUT_FILE


# def run_pipeline(ticker="AAPL"):
#     log(f"🚀 Starting pipeline for {ticker}")

#     # =========================
#     # 🔹 PHASE 1: NEWS PIPELINE
#     # =========================
#     log("📰 Fetching news...")

#     gnews, alpha, yahoo = fetch_all_sources(ticker)

#     news = (
#         normalize_gnews(gnews)
#         + normalize_alpha(alpha)
#         + normalize_yahoo(yahoo)
#     )

#     log(f"Collected {len(news)} articles")

#     # Select top 5 relevant
#     selected = rank_and_select(news, ticker, top_n=5)
#     log(f"Selected {len(selected)} relevant articles")

#     # Extract full content
#     enriched = enrich_news(selected)

#     # =========================
#     # 🔹 PHASE 2: SENTIMENT
#     # =========================
#     log("🧠 Running sentiment analysis...")

#     analyzed = analyze_sentiments(enriched)

#     stock_sentiment = aggregate_sentiment(analyzed)
#     log(f"📊 Stock Sentiment: {stock_sentiment}")

#     # =========================
#     # 🔹 PHASE 3: LLM EXPLANATION
#     # =========================
#     log("🤖 Generating explanation...")

#     explanation = explain_sentiment(ticker, stock_sentiment, analyzed)

#     # =========================
#     # 🔹 PHASE 4: RESEARCH PIPELINE
#     # =========================
#     log("📊 Fetching research data...")

#     overview = fetch_company_overview(ticker)
#     earnings = fetch_earnings(ticker)
#     yinfo = fetch_yfinance_analysis(ticker)

#     research_text = process_research_data(overview, earnings, yinfo)

#     log("🧠 Generating research report...")

#     research_report = generate_research_report(ticker, research_text)

#     # =========================
#     # 🔹 FINAL OUTPUT
#     # =========================
#     output = {
#         "ticker": ticker,
#         "overall_sentiment": stock_sentiment,
#         "explanation": explanation,
#         "research_report": research_report,
#         "articles": analyzed
#     }

#     save_json(output, OUTPUT_FILE)

#     log("✅ Pipeline completed successfully!")


# if __name__ == "__main__":
#     run_pipeline("AAPL")





from fetcher import fetch_all_sources
from processor import (
    normalize_gnews,
    normalize_alpha,
    normalize_yahoo,
    rank_and_select,
    enrich_news,
    analyze_sentiments,
    aggregate_sentiment
)
from groq_explainer import explain_sentiment
from research_fetcher import (
    fetch_company_overview,
    fetch_earnings,
    fetch_yfinance_analysis
)
from research_processor import process_research_data
from research_llm import generate_research_report
from customer import fetch_reddit_posts, analyze_customer_sentiment  # ✅ NEW
from storage import save_json
from logger import log
from config import OUTPUT_FILE


def run_pipeline(ticker="AAPL"):
    log(f"🚀 Starting pipeline for {ticker}")

    # =========================
    # 🔹 PHASE 1: NEWS PIPELINE
    # =========================
    log("📰 Fetching news...")

    gnews, alpha, yahoo = fetch_all_sources(ticker)

    news = (
        normalize_gnews(gnews)
        + normalize_alpha(alpha)
        + normalize_yahoo(yahoo)
    )

    log(f"Collected {len(news)} articles")

    # Select top 5 relevant
    selected = rank_and_select(news, ticker, top_n=5)
    log(f"Selected {len(selected)} relevant articles")

    # Extract full content
    enriched = enrich_news(selected)

    # =========================
    # 🔹 PHASE 2: SENTIMENT
    # =========================
    log("🧠 Running sentiment analysis...")

    analyzed = analyze_sentiments(enriched)

    stock_sentiment = aggregate_sentiment(analyzed)
    log(f"📊 Stock Sentiment: {stock_sentiment}")

    # =========================
    # 🔹 PHASE 3: LLM EXPLANATION
    # =========================
    log("🤖 Generating explanation...")

    explanation = explain_sentiment(ticker, stock_sentiment, analyzed)

    # =========================
    # 🔹 PHASE 4: RESEARCH PIPELINE
    # =========================
    log("📊 Fetching research data...")

    overview = fetch_company_overview(ticker)
    earnings = fetch_earnings(ticker)
    yinfo = fetch_yfinance_analysis(ticker)

    research_text = process_research_data(overview, earnings, yinfo)

    log("🧠 Generating research report...")

    research_report = generate_research_report(ticker, research_text)

    # =========================
    # 🔹 PHASE 5: CUSTOMER DATA (NEW 🔥)
    # =========================
    log("👥 Fetching customer discussions (Reddit)...")

    posts = fetch_reddit_posts(ticker)
    log(f"Fetched {len(posts)} Reddit posts")

    customer_data = analyze_customer_sentiment(posts)
    log(f"Customer Sentiment: {customer_data['customer_sentiment']}")

    # =========================
    # 🔹 FINAL OUTPUT
    # =========================
    output = {
        "ticker": ticker,
        "overall_sentiment": stock_sentiment,
        "explanation": explanation,
        "research_report": research_report,

        # ✅ ONLY ADD THIS (no structure change)
        "customer_analysis": customer_data,

        "articles": analyzed
    }

    save_json(output, OUTPUT_FILE)

    log("✅ Pipeline completed successfully!")


if __name__ == "__main__":
    run_pipeline("AAPL")