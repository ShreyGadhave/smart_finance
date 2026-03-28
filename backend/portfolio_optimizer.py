"""
Portfolio Optimizer — Powered by Riskfolio-lib
High-fidelity Mean-Variance Optimization and Frontier Analysis.
"""

import numpy as np
import pandas as pd
import riskfolio as rp
from datetime import datetime, timedelta
from logger import log
from price_cache import fetch_and_cache_prices

def fix_cov_matrix(returns: pd.DataFrame) -> pd.DataFrame:
    """Make the covariance matrix positive definite by adding small noise."""
    cov = returns.cov()
    cov += np.eye(len(cov)) * 1e-6
    return cov

def fallback_weights(tickers: list[str]) -> dict:
    """Equally weighted fallback for missing/error data."""
    if not tickers: return {"allocation": {}}
    n = len(tickers)
    return {
        "allocation": {t: round(100/n, 2) for t in tickers},
        "expected_return": 0,
        "volatility": 0,
        "sharpe_ratio": 0
    }

def optimize_portfolio(
    tickers: list[str],
    risk_appetite: str = "moderate",
) -> dict:
    """
    Run professional optimization using Riskfolio-lib.
    Retrieves data from Supabase cache via price_cache module.
    """
    log(f"📊 Riskfolio Optimization starting for {tickers} (risk: {risk_appetite})")

    # 1. Fetch data (Supabase Cache -> yfinance)
    prices = fetch_and_cache_prices(tickers)

    if prices.empty or len(prices.columns) < 2:
        log("⚠️ Insufficient price data for optimization", level="ERROR")
        return {"error": "Insufficient data"}

    # 2. Daily Returns
    returns = prices.pct_change().dropna()
    if returns.empty:
        return {"error": "Returns empty"}

    try:
        # 3. Riskfolio Setup
        port = rp.Portfolio(returns=returns)
        port.cov = fix_cov_matrix(returns)
        port.mu = returns.mean()
        
        # Risk thresholds map to Riskfolio objectives
        # low -> MinRisk, high -> MaxRet, else -> Sharpe
        obj = "Sharpe"
        if risk_appetite == "conservative":
            obj = "MinRisk"
        elif risk_appetite == "aggressive":
            obj = "MaxRet"

        # 4. Find Recommended (Risk-Filtered)
        w_rec = port.optimization(
            model="Classic",
            rm="MV",
            obj=obj,
            rf=0,
            l=0
        )
        # Convert weight DF (single col) to dict
        rec_allocation = w_rec.iloc[:, 0].to_dict()
        rec_allocation = {k: round(v * 100, 2) for k, v in rec_allocation.items() if v > 0.005}
        
        # Calculate stats for Recommended
        rec_weights = w_rec.values.T[0]
        rec_ret = np.dot(rec_weights, port.mu) * 252 # Annualized
        rec_vol = np.sqrt(np.dot(rec_weights.T, np.dot(port.cov * 252, rec_weights)))
        rec_sharpe = rec_ret / rec_vol if rec_vol > 0 else 0

        # 5. Find Optimal (Always Max Sharpe)
        w_opt = port.optimization(model="Classic", rm="MV", obj="Sharpe", rf=0, l=0)
        opt_allocation = w_opt.iloc[:, 0].to_dict()
        opt_allocation = {k: round(v * 100, 2) for k, v in opt_allocation.items() if v > 0.005}
        
        opt_weights = w_opt.values.T[0]
        opt_ret = np.dot(opt_weights, port.mu) * 252
        opt_vol = np.sqrt(np.dot(opt_weights.T, np.dot(port.cov * 252, opt_weights)))
        opt_sharpe = opt_ret / opt_vol if opt_vol > 0 else 0

        # 6. Calculate Efficient Frontier points for chart
        w_ef = port.efficient_frontier(model="Classic", rm="MV", points=30, rf=0)
        frontier_points = []
        for i in range(w_ef.shape[1]):
            w = w_ef.iloc[:, i].values
            e_ret = np.dot(w, port.mu) * 252
            vola = np.sqrt(np.dot(w.T, np.dot(port.cov * 252, w)))
            frontier_points.append({
                "expected_return": round(float(e_ret), 4),
                "volatility": round(float(vola), 4),
                "sharpe_ratio": round(float(e_ret / vola), 4) if vola > 0 else 0
            })

        return {
            "tickers": list(prices.columns),
            "risk_appetite": risk_appetite,
            "recommended_portfolio": {
                "allocation": rec_allocation,
                "expected_return": round(float(rec_ret), 4),
                "volatility": round(float(rec_vol), 4),
                "sharpe_ratio": round(float(rec_sharpe), 4),
            },
            "optimal_portfolio": {
                "allocation": opt_allocation,
                "expected_return": round(float(opt_ret), 4),
                "volatility": round(float(opt_vol), 4),
                "sharpe_ratio": round(float(opt_sharpe), 4),
            },
            "efficient_frontier": frontier_points
        }

    except Exception as e:
        log(f"⚠️ Riskfolio failed: {e}", level="ERROR")
        # Return fallback with tickers it tried
        return {
            "tickers": tickers,
            "risk_appetite": risk_appetite,
            "recommended_portfolio": fallback_weights(tickers),
            "optimal_portfolio": fallback_weights(tickers),
            "efficient_frontier": []
        }
