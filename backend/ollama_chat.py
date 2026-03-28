import requests
import json
from logger import log

from config import OLLAMA_URL, OLLAMA_MODEL

def get_ollama_analysis(prompt: str, context: dict) -> str:
    """
    Sends a prompt to local Ollama instance with financial context.
    
    context: Expects news, risk metrics, and fundamental research data.
    """
    log(f"🤖 Interfacing with Ollama ({DEFAULT_MODEL}) for analysis...")

    # Crafting the specialized financial persona
    system_instruction = f"""
You are the Smart Finance Solutions AI, a top-tier quantitative analyst and fundamental researcher.
Your goal is to provide deep Technical and Fundamental analysis based ONLY on the provided data.

CONTEXT DATA:
- Ticker: {context.get('ticker')}
- Sentiment Signal: {context.get('overall_sentiment')}
- Technical Stats: {context.get('risk_metrics', 'No technical data available')}
- Fundamental Research: {context.get('research_summary', 'No fundamental data available')}
- Community Pulse: {context.get('customer_analysis', 'No social data available')}

GUIDELINES:
1. Be concise and institutional (Bloomberg Terminal style).
2. Avoid generic financial advice; use the specific metrics provided.
3. If asked about technicals, refer to Volatility, Beta, and Sharpe.
4. If asked about fundamentals, refer to Research Reports and P/E data.
5. Do not hallucinate data that isn't provided.
"""

    full_prompt = f"{system_instruction}\n\nUSER QUERY: {prompt}\n\nANALYSIS:"

    payload = {
        "model": DEFAULT_MODEL,
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "temperature": 0.4,
            "top_p": 0.9,
        }
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "No response from AI terminal.")
    
    except requests.exceptions.ConnectionError:
        log("❌ Error: Ollama is not running on http://localhost:11434", level="ERROR")
        return "ERROR: Local AI Engine (Ollama) is not detected. Please ensure Ollama is running."
    
    except Exception as e:
        log(f"❌ Ollama Error: {e}", level="ERROR")
        return f"AI system error: {str(e)}"
