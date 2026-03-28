"""
Regulatory Compliance Module — Checks investment decisions against
regulatory constraints and flags potential violations.
"""

from groq import Groq
import os
from dotenv import load_dotenv
from logger import log

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# Known regulatory frameworks
REGULATORY_RULES = {
    "concentration_limit": {
        "description": "No single asset should exceed 25% of portfolio",
        "threshold": 0.25,
    },
    "sector_diversification": {
        "description": "No single sector should exceed 40% of portfolio",
        "threshold": 0.40,
    },
    "minimum_holdings": {
        "description": "Portfolio should hold at least 5 different assets",
        "threshold": 5,
    },
    "insider_trading_window": {
        "description": "Avoid trading during blackout periods around earnings",
    },
}


def check_portfolio_compliance(allocation: dict, sector_map: dict | None = None) -> dict:
    """
    Check a portfolio allocation against regulatory rules.

    allocation: dict like {"AAPL": 30.5, "GOOGL": 25.0, ...} (percentages)
    sector_map: dict like {"AAPL": "Technology", "GOOGL": "Technology", ...}
    """
    log("📋 Running regulatory compliance checks...")

    violations = []
    warnings = []
    passed = []

    # Rule 1: Concentration limit
    for ticker, pct in allocation.items():
        if pct > REGULATORY_RULES["concentration_limit"]["threshold"] * 100:
            violations.append({
                "rule": "concentration_limit",
                "ticker": ticker,
                "value": pct,
                "threshold": REGULATORY_RULES["concentration_limit"]["threshold"] * 100,
                "description": REGULATORY_RULES["concentration_limit"]["description"],
                "severity": "high",
            })
        elif pct > 20:
            warnings.append({
                "rule": "near_concentration_limit",
                "ticker": ticker,
                "value": pct,
                "description": f"{ticker} at {pct}% — approaching concentration limit",
                "severity": "medium",
            })

    passed.append({
        "rule": "concentration_limit",
        "status": "pass" if not any(v["rule"] == "concentration_limit" for v in violations) else "fail",
    })

    # Rule 2: Minimum holdings
    num_holdings = len(allocation)
    if num_holdings < REGULATORY_RULES["minimum_holdings"]["threshold"]:
        violations.append({
            "rule": "minimum_holdings",
            "value": num_holdings,
            "threshold": REGULATORY_RULES["minimum_holdings"]["threshold"],
            "description": REGULATORY_RULES["minimum_holdings"]["description"],
            "severity": "medium",
        })

    passed.append({
        "rule": "minimum_holdings",
        "status": "pass" if num_holdings >= REGULATORY_RULES["minimum_holdings"]["threshold"] else "fail",
    })

    # Rule 3: Sector diversification
    if sector_map:
        sector_weights = {}
        for ticker, pct in allocation.items():
            sector = sector_map.get(ticker, "Unknown")
            sector_weights[sector] = sector_weights.get(sector, 0) + pct

        for sector, weight in sector_weights.items():
            if weight > REGULATORY_RULES["sector_diversification"]["threshold"] * 100:
                violations.append({
                    "rule": "sector_diversification",
                    "sector": sector,
                    "value": weight,
                    "threshold": REGULATORY_RULES["sector_diversification"]["threshold"] * 100,
                    "description": REGULATORY_RULES["sector_diversification"]["description"],
                    "severity": "high",
                })

    passed.append({
        "rule": "sector_diversification",
        "status": "pass" if not any(v["rule"] == "sector_diversification" for v in violations) else "fail",
    })

    # Overall status
    is_compliant = len(violations) == 0

    return {
        "compliant": is_compliant,
        "status": "compliant" if is_compliant else "non_compliant",
        "violations": violations,
        "warnings": warnings,
        "checks_passed": passed,
        "total_checks": len(passed),
        "violations_count": len(violations),
        "warnings_count": len(warnings),
    }


def generate_compliance_report(ticker: str, portfolio_data: dict | None = None) -> str:
    """Use LLM to generate a regulatory compliance summary."""
    log(f"📋 Generating compliance report for {ticker}")

    context = f"Ticker: {ticker}"
    if portfolio_data:
        context += f"\nPortfolio allocation: {portfolio_data.get('allocation', {})}"
        context += f"\nCompliance status: {portfolio_data.get('status', 'unknown')}"
        if portfolio_data.get("violations"):
            context += f"\nViolations: {portfolio_data['violations']}"

    prompt = f"""
You are a regulatory compliance analyst for investments.

{context}

Generate a brief compliance assessment covering:
1. Key regulatory considerations for this investment
2. Any potential compliance concerns
3. Recommended actions to maintain compliance
4. Relevant regulatory frameworks (e.g., SEBI for India, SEC for US)

Keep it concise and actionable (6-8 lines).
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception as e:
        log(f"Groq error in compliance report: {e}")
        return "Compliance report generation failed."
