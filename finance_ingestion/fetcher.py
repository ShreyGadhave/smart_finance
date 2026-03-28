import requests
import yfinance as yf
from config import GNEWS_API_KEY, ALPHA_VANTAGE_KEY


# 🟢 GNews (BEST SOURCE)
def fetch_gnews(query, limit=10):
    url = "https://gnews.io/api/v4/search"

    params = {
        "q": query,
        "lang": "en",
        "max": limit,
        "apikey": GNEWS_API_KEY
    }

    try:
        res = requests.get(url, params=params)
        return res.json().get("articles", [])
    except:
        return []


# 🟢 Alpha Vantage News
def fetch_alpha_news(ticker):
    url = "https://www.alphavantage.co/query"

    params = {
        "function": "NEWS_SENTIMENT",
        "tickers": ticker,
        "apikey": ALPHA_VANTAGE_KEY
    }

    try:
        res = requests.get(url, params=params)
        return res.json().get("feed", [])
    except:
        return []


# 🟢 Yahoo Finance
def fetch_yfinance_news(ticker):
    try:
        stock = yf.Ticker(ticker)
        return stock.news or []
    except:
        return []


# 🟢 NSElib (no news → placeholder)
def fetch_nse_data(ticker):
    return []  # NSElib doesn't provide news


# 🔥 MASTER FETCH
def fetch_all_sources(ticker):
    query = f"{ticker} stock India"

    gnews = fetch_gnews(query)
    alpha = fetch_alpha_news(ticker)
    yahoo = fetch_yfinance_news(ticker)

    return gnews, alpha, yahoo