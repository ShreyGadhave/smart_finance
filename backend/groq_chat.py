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

    # Crafting the specialized yet versatile financial persona
    system_instruction = f"""
You are the Smart Finance Solutions AI Node, a highly advanced digital intelligence specialized in quantitative finance, market theory, and global economics. 

Operational Protocol:
- Identifier Sync: {context.get('ticker') or 'Global Data Node'}
- Node Conviction: {context.get('overall_sentiment', 'SYNCHRONIZED')}
- Knowledge Access: Unrestricted (General Intelligence + Specialist Financial Knowledge)

Guidelines:
1. PERSPECTIVE: Your perspective is consistently professional, data-centric, and institutional.
2. VERSATILITY: While your core is financial, you are capable of discussing any topic with elite precision.
3. FORMATTING: **CRITICAL: DO NOT use markdown symbols like '##' for headers or '*' for bullets.** 
   - Use ALL CAPS for section headers (e.g., FINANCIAL PERFORMANCE:).
   - Use clear double paragraph breaks between sections.
   - For lists, use simple numbering (1., 2., 3.) or just leading dashes (-).
4. BLOOMBERG STYLE: Be dense and professional. Avoid fluff or excessive enthusiasm.
5. CONTEXT: If financial context is present (ticker: {context.get('ticker')}), prioritize using it.
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
