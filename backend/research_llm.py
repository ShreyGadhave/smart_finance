from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_research_report(ticker, research_text):
    prompt = f"""
You are a professional financial analyst.

Analyze the following company data for {ticker}:

{research_text}

Generate:
BUSINESS SUMMARY:
GROWTH OUTLOOK:
RISK FACTORS:
INVESTMENT RECOMMENDATION:

Keep it structured and concise.
DO NOT use markdown symbols like '##' or '**' or '*'. 
Use ALL CAPS for labels as shown above.
No list numbering.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Groq error:", e)
        return "Report generation failed."