import requests
import yfinance as yf
from config import GNEWS_API_KEY, ALPHA_VANTAGE_KEY
from utils import retry_with_backoff
from logger import log


# 🟢 GNews (BEST SOURCE)
@retry_with_backoff(max_attempts=2, initial_delay=1.0, backoff_factor=2.0, jitter=0.3, exceptions=(requests.RequestException,))
def fetch_gnews(query, limit=10):
    if not GNEWS_API_KEY or GNEWS_API_KEY == "your_gnews_api_key_here":
        log("GNews API Key missing, skipping...", level="WARN")
        return []
    
    try:
        url = "https://gnews.io/api/v4/search"
        params = {
            "q": query,
            "lang": "en",
            "max": limit,
            "apikey": GNEWS_API_KEY
        }
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        return res.json().get("articles", [])
    except Exception as e:
        log(f"GNews fetch failed: {e}", level="ERROR")
        return []


# 🟢 Alpha Vantage News
@retry_with_backoff(max_attempts=2, initial_delay=1.0, backoff_factor=2.0, jitter=0.3, exceptions=(requests.RequestException,))
def fetch_alpha_news(ticker):
    if not ALPHA_VANTAGE_KEY or ALPHA_VANTAGE_KEY == "your_alphavantage_key_here":
        log("Alpha Vantage API Key missing, skipping...", level="WARN")
        return []

    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "NEWS_SENTIMENT",
            "tickers": ticker,
            "apikey": ALPHA_VANTAGE_KEY
        }
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        data = res.json()
        
        if "Information" in data:
            log(f"Alpha Vantage info: {data['Information']}", level="WARN")
            return []
            
        return data.get("feed", [])
    except Exception as e:
        log(f"Alpha Vantage fetch failed: {e}", level="ERROR")
        return []


# 🟢 Yahoo Finance
@retry_with_backoff(max_attempts=2, initial_delay=1.0, backoff_factor=2.0, jitter=0.3, exceptions=(Exception,))
def fetch_yfinance_news(ticker):
    try:
        stock = yf.Ticker(ticker)
        news = stock.news
        return news if news else []
    except Exception as e:
        log(f"Yahoo Finance fetch failed: {e}", level="ERROR")
        return []


# 🔥 MASTER FETCH
def fetch_all_sources(ticker):
    query = f"{ticker} stock news"

    gnews = fetch_gnews(query)
    alpha = fetch_alpha_news(ticker)
    yahoo = fetch_yfinance_news(ticker)

    return gnews, alpha, yahoo