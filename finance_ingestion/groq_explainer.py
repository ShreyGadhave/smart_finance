from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def explain_sentiment(ticker, sentiment, news_list):
    # Combine top headlines
    headlines = "\n".join([f"- {n['headline']}" for n in news_list])

    prompt = f"""
You are a financial analyst.

Stock: {ticker}
Overall Sentiment: {sentiment}

News Headlines:
{headlines}

Explain in simple financial terms:
- Why the sentiment is {sentiment}
- What factors are influencing the stock
- Keep it concise (4-5 lines)
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # fast + free
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        return response.choices[0].message.content

    except Exception as e:
        print("Groq Error:", e)
        return "Explanation not available."