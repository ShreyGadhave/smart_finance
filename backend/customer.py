import requests
from sentiment import get_sentiment


def fetch_reddit_posts(ticker, limit=10):
    query = f"{ticker} stock OR {ticker} earnings OR {ticker} company"
    url = f"https://www.reddit.com/search.json?q={query}&limit={limit}&sort=relevance"

    headers = {
        "User-Agent": "FinanceBot/1.0 (by Abdul)"
    }

    try:
        res = requests.get(url, headers=headers, timeout=10)

        # 🔥 FIX: ensure valid JSON
        if res.status_code != 200:
            print("Reddit blocked request:", res.status_code)
            return []

        try:
            data = res.json()
        except:
            print("Reddit returned non-JSON response")
            return []

        posts = []
        for p in data.get("data", {}).get("children", []):
            title = p["data"].get("title", "")
            if title:
                posts.append(title)

        return posts

    except Exception as e:
        print("Reddit error:", e)
        return []


def analyze_customer_sentiment(posts):
    if not posts:
        return {
            "customer_sentiment": "neutral",
            "confidence": 0,
            "insight": "No customer discussions found"
        }

    score = 0
    details = []

    for post in posts:
        sent = get_sentiment(post)

        details.append({
            "text": post,
            "sentiment": sent["label"],
            "confidence": sent["confidence"]
        })

        if sent["label"] == "positive":
            score += sent["confidence"]
        elif sent["label"] == "negative":
            score -= sent["confidence"]

    if score > 1:
        final = "bullish"
    elif score < -1:
        final = "bearish"
    else:
        final = "neutral"

    return {
        "customer_sentiment": final,
        "confidence": score,
        "num_posts": len(posts),
        "sample_posts": details[:5],
        "insight": f"Customer sentiment is {final} based on Reddit discussions"
    }