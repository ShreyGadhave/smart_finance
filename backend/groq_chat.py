import os
from groq import Groq
from logger import log
from dotenv import load_dotenv

load_dotenv()

# Pre-configured model for the Terminal
GROQ_MODEL = "llama-3.3-70b-versatile"

def get_groq_analysis(prompt: str, context: dict) -> str:
    """
    Sends a prompt to Groq Cloud API with specialized financial context.
    Uses llama-3.3-70b-versatile for high-speed, high-fidelity reasoning.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        log("❌ Groq API Key missing in environment!", level="ERROR")
        return "Internal Error: System AI credentials not configured."

    log(f"⚡ Interfacing with Groq Cloud ({GROQ_MODEL}) for high-speed analysis...")

    # Crafting the specialized financial persona (Consistent with Ollama but optimized for Groq)
    system_instruction = f"""
You are the Smart Finance Solutions AI, a top-tier quantitative analyst and fund manager. 
Your goal is to provide deep Technical and Fundamental analysis based on the provided data.

DATA PROFILE:
- Identifier (Ticker): {context.get('ticker') or 'Global Market Node'}
- Node Conviction: {context.get('overall_sentiment', 'UNSYNCED')}
- Technical Benchmarks: {context.get('risk_metrics') or 'No local risk data synced. Referring to general MPT principles.'}
- Fundamental Narrative: {context.get('research_summary') or 'Research node inactive. Analyzing current market trends.'}
- Reddit/Community Signal: {context.get('customer_analysis') or 'Community sentiment unindexed.'}

GUIDELINES:
1. BLOOMBERG STYLE: Be dense, professional, and data-driven.
2. NO HALLUCINATION: If context is empty, respond as a high-level general quantitative analyst.
3. STRUCTURE: Use markdown bullet points for complex breakdowns.
4. QUANTS: Refer to Sharpe ratio and volatility if asked about risk.
5. FUNDAMENTALS: Refer to market narrative/earnings if asked about value.
6. PERSPECTIVE: Your perspective is institutional. No fluff.
"""

    try:
        client = Groq(api_key=api_key)
        
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            model=GROQ_MODEL,
            temperature=0.3,
            max_tokens=1024,
            top_p=0.9
        )
        
        return chat_completion.choices[0].message.content or "Signal loss: AI returned empty response."
    
    except Exception as e:
        log(f"❌ Groq API Error: {e}", level="ERROR")
        return f"Intelligence Terminal Error: {str(e)}"
