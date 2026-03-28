"""
Trust & Credibility Scoring — Source Reliability and Information Verification
Scores news sources and cross-references data for consistency.
"""

from collections import defaultdict
from logger import log


# Known source tiers based on financial journalism standards
SOURCE_TIERS = {
    # Tier 1: Major financial outlets
    "Reuters": 0.95,
    "Bloomberg": 0.95,
    "Financial Times": 0.93,
    "The Wall Street Journal": 0.93,
    "CNBC": 0.88,
    "MarketWatch": 0.85,
    "Forbes": 0.82,
    "The Economist": 0.90,
    "Barron's": 0.88,
    "Investor's Business Daily": 0.85,
    "AP News": 0.92,
    "Yahoo Finance": 0.80,

    # Tier 2: General news with finance sections
    "The New York Times": 0.88,
    "BBC News": 0.87,
    "The Guardian": 0.84,
    "The Times of India": 0.72,
    "Economic Times": 0.78,
    "Business Standard": 0.76,
    "Business Today": 0.74,
    "Livemint": 0.75,
    "Moneycontrol": 0.73,
    "NDTV Profit": 0.72,

    # Tier 3: Aggregators and blogs
    "Seeking Alpha": 0.68,
    "Motley Fool": 0.65,
    "Benzinga": 0.70,
    "Zacks": 0.72,
    "InvestorPlace": 0.60,
}

DEFAULT_SCORE = 0.50


def score_source(source_name: str) -> float:
    """Score a news source based on known reliability tiers."""
    if not source_name:
        return DEFAULT_SCORE

    # Try exact match first
    name = source_name.strip()
    if name in SOURCE_TIERS:
        return SOURCE_TIERS[name]

    # Try case-insensitive partial match
    name_lower = name.lower()
    for known, score in SOURCE_TIERS.items():
        if known.lower() in name_lower or name_lower in known.lower():
            return score

    return DEFAULT_SCORE


def cross_reference_articles(articles: list[dict]) -> dict:
    """
    Cross-reference articles to detect consistency in reporting.
    If multiple sources report the same event, trust is higher.
    """
    if not articles:
        return {"consistency_score": 0, "cross_referenced": []}

    # Group by sentiment
    sentiment_groups = defaultdict(list)
    for article in articles:
        sentiment = (article.get("sentiment") or "neutral").lower()
        sentiment_groups[sentiment].append(article)

    # Calculate agreement ratio
    total = len(articles)
    majority_sentiment = max(sentiment_groups, key=lambda k: len(sentiment_groups[k]))
    majority_count = len(sentiment_groups[majority_sentiment])
    agreement_ratio = majority_count / total if total > 0 else 0

    # Identify conflicting reports
    conflicts = []
    if len(sentiment_groups) > 1:
        for sentiment, group in sentiment_groups.items():
            if sentiment != majority_sentiment:
                for article in group:
                    conflicts.append({
                        "headline": article.get("headline"),
                        "source": article.get("source"),
                        "sentiment": sentiment,
                        "note": f"Conflicts with majority ({majority_sentiment})",
                    })

    return {
        "consistency_score": round(agreement_ratio, 2),
        "majority_sentiment": majority_sentiment,
        "agreement_count": majority_count,
        "total_articles": total,
        "conflicts": conflicts,
    }


def score_articles(articles: list[dict]) -> list[dict]:
    """Add trust scores to each article based on source and cross-referencing."""
    log("🔍 Computing trust scores for articles...")

    cross_ref = cross_reference_articles(articles)

    scored = []
    for article in articles:
        source = article.get("source", "")
        source_score = score_source(source)

        # Bonus if article aligns with consensus
        consensus_bonus = 0.05 if (
            article.get("sentiment", "").lower() == cross_ref["majority_sentiment"]
        ) else -0.05

        # Confidence-weighted trust
        confidence = article.get("confidence", 0.5)
        trust_score = min(1.0, max(0.0, source_score * 0.6 + confidence * 0.3 + consensus_bonus + 0.05))

        article_copy = dict(article)
        article_copy["trust_score"] = round(trust_score, 2)
        article_copy["source_credibility"] = round(source_score, 2)
        scored.append(article_copy)

    return scored


def generate_trust_report(articles: list[dict]) -> dict:
    """Generate a full trust/credibility report."""
    scored = score_articles(articles)
    cross_ref = cross_reference_articles(articles)

    # Source breakdown
    source_scores = {}
    for article in scored:
        src = article.get("source", "Unknown")
        source_scores[src] = article.get("source_credibility", DEFAULT_SCORE)

    avg_trust = (
        sum(a.get("trust_score", 0) for a in scored) / len(scored) if scored else 0
    )

    if avg_trust >= 0.80:
        overall_reliability = "high"
    elif avg_trust >= 0.60:
        overall_reliability = "moderate"
    else:
        overall_reliability = "low"

    return {
        "overall_reliability": overall_reliability,
        "average_trust_score": round(avg_trust, 2),
        "consistency": cross_ref,
        "source_credibility_scores": source_scores,
        "flagged_articles": [
            {
                "headline": a.get("headline"),
                "source": a.get("source"),
                "trust_score": a.get("trust_score"),
                "reason": "Low trust score" if a.get("trust_score", 1) < 0.5 else "Conflicts with consensus",
            }
            for a in scored
            if a.get("trust_score", 1) < 0.5
        ],
        "scored_articles": scored,
    }
