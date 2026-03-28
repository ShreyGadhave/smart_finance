"""
Risk Assessment Engine — VaR, Sharpe, Volatility, Max Drawdown Analysis
Evaluates investment risk for individual tickers and portfolios.
"""

import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
from logger import log


def fetch_returns(ticker: str, period_days: int = 365) -> list[float]:
    """Fetch daily returns for a ticker."""
    try:
        stock = yf.Ticker(ticker)
        end = datetime.now()
        start = end - timedelta(days=period_days)
        hist = stock.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
        if hist.empty:
            return []
        prices = hist["Close"].values
        return (np.diff(prices) / prices[:-1]).tolist()
    except Exception as e:
        log(f"⚠️ Could not fetch returns for {ticker}: {e}")
        return []


def calculate_var(returns: list[float], confidence: float = 0.95) -> float:
    """Calculate Value at Risk at given confidence level."""
    if not returns:
        return 0.0
    sorted_returns = sorted(returns)
    index = int((1 - confidence) * len(sorted_returns))
    return round(float(sorted_returns[max(index, 0)]), 6)


def calculate_cvar(returns: list[float], confidence: float = 0.95) -> float:
    """Calculate Conditional VaR (Expected Shortfall)."""
    if not returns:
        return 0.0
    var = calculate_var(returns, confidence)
    tail_losses = [r for r in returns if r <= var]
    return round(float(np.mean(tail_losses)) if tail_losses else var, 6)


def calculate_max_drawdown(prices: list[float]) -> dict:
    """Calculate max drawdown and the recovery period."""
    if len(prices) < 2:
        return {"max_drawdown": 0, "peak_index": 0, "trough_index": 0}

    arr = np.array(prices)
    peak = arr[0]
    max_dd = 0
    peak_idx = 0
    trough_idx = 0

    for i, price in enumerate(arr):
        if price > peak:
            peak = price
            peak_idx_candidate = i
        dd = (peak - price) / peak if peak > 0 else 0
        if dd > max_dd:
            max_dd = dd
            peak_idx = peak_idx_candidate
            trough_idx = i

    return {
        "max_drawdown": round(float(max_dd), 4),
        "peak_index": int(peak_idx),
        "trough_index": int(trough_idx),
    }


def calculate_beta(ticker_returns: list[float], market_returns: list[float]) -> float:
    """Calculate beta relative to market."""
    if len(ticker_returns) < 2 or len(market_returns) < 2:
        return 1.0
    min_len = min(len(ticker_returns), len(market_returns))
    t = np.array(ticker_returns[:min_len])
    m = np.array(market_returns[:min_len])
    covariance = np.cov(t, m)[0][1]
    market_variance = np.var(m)
    return round(float(covariance / market_variance) if market_variance > 0 else 1.0, 4)


def assess_risk(ticker: str) -> dict:
    """Full risk assessment for a single ticker."""
    log(f"📊 Assessing risk for {ticker}")

    returns = fetch_returns(ticker)
    if not returns:
        return {"error": f"No return data available for {ticker}", "ticker": ticker}

    # Fetch prices for drawdown
    try:
        stock = yf.Ticker(ticker)
        end = datetime.now()
        start = end - timedelta(days=365)
        hist = stock.history(start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"))
        prices = hist["Close"].tolist() if not hist.empty else []
        info = stock.info or {}
    except Exception:
        prices = []
        info = {}

    # Market benchmark (S&P 500)
    market_returns = fetch_returns("^GSPC")

    arr = np.array(returns)
    annualized_return = float(np.mean(arr) * 252)
    annualized_vol = float(np.std(arr) * np.sqrt(252))
    risk_free_rate = 0.04
    sharpe = (annualized_return - risk_free_rate) / annualized_vol if annualized_vol > 0 else 0

    # Sortino ratio (downside deviation)
    downside = arr[arr < 0]
    downside_std = float(np.std(downside) * np.sqrt(252)) if len(downside) > 0 else annualized_vol
    sortino = (annualized_return - risk_free_rate) / downside_std if downside_std > 0 else 0

    var_95 = calculate_var(returns, 0.95)
    var_99 = calculate_var(returns, 0.99)
    cvar_95 = calculate_cvar(returns, 0.95)
    drawdown = calculate_max_drawdown(prices) if prices else {"max_drawdown": 0}
    beta = calculate_beta(returns, market_returns) if market_returns else 1.0

    # Risk rating
    if annualized_vol < 0.15:
        risk_level = "low"
    elif annualized_vol < 0.30:
        risk_level = "moderate"
    elif annualized_vol < 0.50:
        risk_level = "high"
    else:
        risk_level = "very_high"

    return {
        "ticker": ticker,
        "risk_level": risk_level,
        "metrics": {
            "annualized_return": round(annualized_return, 4),
            "annualized_volatility": round(annualized_vol, 4),
            "sharpe_ratio": round(sharpe, 4),
            "sortino_ratio": round(sortino, 4),
            "beta": beta,
            "var_95": var_95,
            "var_99": var_99,
            "cvar_95": cvar_95,
            "max_drawdown": drawdown["max_drawdown"],
        },
        "company_info": {
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "Unknown"),
            "market_cap": info.get("marketCap"),
            "pe_ratio": info.get("trailingPE"),
        },
        "recommendation": _generate_risk_recommendation(risk_level, sharpe, beta),
    }


def _generate_risk_recommendation(risk_level: str, sharpe: float, beta: float) -> str:
    """Generate human-readable risk recommendation."""
    parts = []

    if risk_level in ("high", "very_high"):
        parts.append("This asset exhibits high volatility — suitable for aggressive investors with high risk tolerance.")
    elif risk_level == "moderate":
        parts.append("Moderate risk profile — suitable for balanced portfolios.")
    else:
        parts.append("Low volatility — good for conservative investors seeking stability.")

    if sharpe > 1:
        parts.append("Strong risk-adjusted returns (Sharpe > 1).")
    elif sharpe > 0:
        parts.append("Positive but modest risk-adjusted returns.")
    else:
        parts.append("Risk-adjusted returns are negative — returns don't compensate for the risk taken.")

    if beta > 1.3:
        parts.append("High market sensitivity (beta > 1.3) — amplifies market movements.")
    elif beta < 0.7:
        parts.append("Low market correlation — potential diversification benefit.")

    return " ".join(parts)
