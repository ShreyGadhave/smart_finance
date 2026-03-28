import requests
import yfinance as yf
from config import ALPHA_VANTAGE_KEY


# 🔹 Alpha Vantage - Company Overview
def fetch_company_overview(ticker):
    url = "https://www.alphavantage.co/query"

    params = {
        "function": "OVERVIEW",
        "symbol": ticker,
        "apikey": ALPHA_VANTAGE_KEY
    }

    try:
        res = requests.get(url, params=params, timeout=10)
        return res.json()
    except:
        return {}


# 🔹 Alpha Vantage - Earnings
def fetch_earnings(ticker):
    url = "https://www.alphavantage.co/query"

    params = {
        "function": "EARNINGS",
        "symbol": ticker,
        "apikey": ALPHA_VANTAGE_KEY
    }

    try:
        res = requests.get(url, params=params, timeout=10)
        return res.json()
    except:
        return {}


# 🔹 Yahoo Finance Analysis
def fetch_yfinance_analysis(ticker):
    try:
        stock = yf.Ticker(ticker)
        return stock.info
    except:
        return {}