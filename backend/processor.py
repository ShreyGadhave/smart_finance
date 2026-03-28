import re
from extractor import extract_full_article


FINANCE_KEYWORDS = [
    "stock", "share", "market", "earnings",
    "profit", "revenue", "loss", "ipo",
    "investment", "bank", "finance"
]


def clean(text):
    return re.sub(r"\s+", " ", text or "").strip()


# 🔹 Normalize GNews
def normalize_gnews(data):
    return [
        {
            "source": item["source"]["name"],
            "headline": clean(item["title"]),
            "summary": clean(item["description"]),
            "url": item["url"]
        }
        for item in data
    ]


# 🔹 Normalize Alpha Vantage
def normalize_alpha(data):
    normalized = []

    for item in data:
        normalized.append({
            "source": item.get("source"),
            "headline": clean(item.get("title")),
            "summary": clean(item.get("summary")),
            "url": item.get("url")
        })

    return normalized


# 🔹 Normalize Yahoo
def normalize_yahoo(data):
    normalized = []

    for item in data:
        normalized.append({
            "source": item.get("publisher"),
            "headline": clean(item.get("title")),
            "summary": clean(item.get("summary", "")),
            "url": item.get("link")
        })

    return normalized


# 🔥 RELEVANCE SCORING
def score_news(item, ticker):
    text = (item["headline"] + " " + item["summary"]).lower()

    score = 0

    if ticker.lower() in text:
        score += 5

    for kw in FINANCE_KEYWORDS:
        if kw in text:
            score += 1

    return score


# 🔥 FILTER + RANK
def rank_and_select(news_list, ticker, top_n=5):
    scored = []

    for item in news_list:
        score = score_news(item, ticker)
        if score > 0:
            item["score"] = score
            scored.append(item)

    # sort by score
    scored.sort(key=lambda x: x["score"], reverse=True)

    # deduplicate by headline
    seen = set()
    unique = []

    for item in scored:
        if item["headline"] not in seen:
            seen.add(item["headline"])
            unique.append(item)

        if len(unique) == top_n:
            break

    return unique


# 🔥 ENRICH
def enrich_news(news_list):
    enriched = []

    for item in news_list:
        content = extract_full_article(item["url"])

        item["full_text"] = content["full_text"] or item["summary"]
        item["real_url"] = content["real_url"]

        enriched.append(item)

    return enriched



from sentiment import get_sentiment


def analyze_sentiments(news_list):
    results = []

    for item in news_list:
        text = item.get("full_text") or item.get("summary")

        sentiment = get_sentiment(text)

        item["sentiment"] = sentiment["label"]
        item["confidence"] = sentiment["confidence"]

        results.append(item)

    return results


# 🔥 Aggregate stock sentiment
def aggregate_sentiment(news_list):
    score = 0

    for item in news_list:
        if item["sentiment"] == "positive":
            score += 1
        elif item["sentiment"] == "negative":
            score -= 1

    if score > 1:
        return "bullish"
    elif score < -1:
        return "bearish"
    else:
        return "neutral"