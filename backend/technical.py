"""
Technical Analysis Module for Smart Finance
Handles technical indicator synthesis and market state classification.
"""
from typing import Any, Dict, List
from datetime import datetime
import random

def get_technical_indicators(ticker: str) -> Dict[str, Any]:
    """
    Returns high-fidelity technical indicator data for a given ticker.
    In a real system, this would fetch from a database or use Ta-Lib.
    TEMPLATE: Based on user-provided institutional sample.
    """
    
    # This is a sample responsive mock that adapts to the ticker.
    # We use a deterministic seed based on ticker for consistency during a session.
    random.seed(ticker)
    
    indicators = [
        {
            "name": "RSI",
            "value": round(random.uniform(20, 80), 2),
            "bin_name": "Medium (Neutral Zone)",
            "market_state": "Neutral / Trending",
            "description": "An RSI value between 30 and 70 indicates balanced market momentum."
        },
        {
            "name": "ATR",
            "value": round(random.uniform(1, 8), 2),
            "bin_name": "High Volatility",
            "market_state": "High Risk / Strong Movement",
            "description": "When ATR exceeds 3% of price, volatility is elevated. Price movements are large and rapid."
        },
        {
            "name": "Stochastic Oscillator %K",
            "value": round(random.uniform(5, 95), 2),
            "bin_name": "Low (Oversold Zone)",
            "market_state": "Oversold",
            "description": "When %K falls below 20, the asset is considered oversold."
        },
        {
            "name": "Williams %R",
            "value": round(random.uniform(-100, 0), 2),
            "bin_name": "Low (Oversold Zone)",
            "market_state": "Oversold",
            "description": "When Williams %R falls below -80, the asset is considered oversold."
        },
        {
            "name": "CCI (Commodity Channel Index)",
            "value": round(random.uniform(-150, 150), 2),
            "bin_name": "Medium (Neutral Zone)",
            "market_state": "Normal Momentum / Range-Bound",
            "description": "When CCI is between -100 and +100, price is considered to be trading within its normal statistical range."
        },
        {
            "name": "MACD",
            "value": round(random.uniform(-20, 20), 2),
            "bin_name": "Bearish Momentum",
            "market_state": "Bearish Trend",
            "description": "When the MACD line is below the Signal line and also below the zero line, the market is in bearish momentum."
        },
        {
            "name": "Aroon",
            "value": {
                "Aroon Up": round(random.uniform(0, 100), 2),
                "Aroon Down": round(random.uniform(0, 100), 2)
            },
            "bin_name": "Bearish Trend",
            "market_state": "Strong Downtrend",
            "description": "When Aroon Down is significantly higher than Aroon Up and above 70, it indicates a strong bearish trend."
        }
    ]

    # Dynamically update states based on values
    for ind in indicators:
        if ind["name"] == "RSI":
            val = ind["value"]
            if val < 30: 
                ind["market_state"] = "Oversold"
                ind["bin_name"] = "Low (Oversold)"
            elif val > 70:
                ind["market_state"] = "Overbought"
                ind["bin_name"] = "High (Overbought)"
        
        if ind["name"] == "Aroon":
            up, down = ind["value"]["Aroon Up"], ind["value"]["Aroon Down"]
            if up > 70 and down < 30:
                ind["market_state"] = "Strong Uptrend"
                ind["bin_name"] = "Bullish Trend"
            elif down > 70 and up < 30:
                ind["market_state"] = "Strong Downtrend"
                ind["bin_name"] = "Bearish Trend"
            else:
                ind["market_state"] = "Neutral / Consolidation"
                ind["bin_name"] = "Sideways Market"

    summary = f"**Market Outlook Summary for {ticker}**\n\nDirectional Bias: {'Bullish' if indicators[0]['value'] > 50 else 'Bearish'}. Trend suggests {'consolidation' if indicators[1]['value'] < 4 else 'high volatility movement'}. Risk node is {'ELEVATED' if indicators[1]['value'] > 5 else 'STABLE'}."

    return {
        "ticker": ticker,
        "company_name": f"{ticker} Institutional Node",
        "company_sector": "Synced Market Node",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "indicators": indicators,
        "summary": summary
    }
