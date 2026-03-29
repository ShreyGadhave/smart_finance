import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# SUPABASE SETUP
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY") # Fixed name
user_id: str = os.getenv("DEFAULT_USER_ID") # Use default user if available
supabase: Client = create_client(url, key)

def seed_fund_data():
    try:
        with open("fund_data_seed.json", "r") as f:
            data = json.load(f)
        
        for entry in data:
            ticker = entry["ticker"].upper()
            
            # Construct a flat payload that the API and dashboard can consume
            payload = {
                "fundamentals": entry.get("fundamentals", []),
                "ai_summary": entry.get("ai_summary", ""),
                "company_name": entry.get("company_name", ticker),
                "company_sector": entry.get("company_sector", "General"),
                "quarter": entry.get("quarter"),
                "research_report": entry.get("ai_summary", ""),
                "overall_sentiment": "Neutral",
                "customer_analysis": {
                    "explanation": entry.get("ai_summary", "")[:500] if entry.get("ai_summary") else "No community narrative indexed."
                }
            }

            supabase.table("pipeline_runs").insert({
                "ticker": ticker,
                "user_id": user_id,
                "overall_sentiment": "Fundamental Sync",
                "status": "completed",
                "payload": payload
            }).execute()
            print(f"✅ Indexed Fundamental node for {ticker}")
    except Exception as e:
        print(f"❌ Fundamental seeding error: {e}")

def seed_tech_data():
    try:
        with open("tech_data_seed.json", "r") as f:
            data = json.load(f)
        
        for entry in data:
            ticker = entry["ticker"].replace(".NS", "").upper()
            payload = {
                "tech_indicators": entry.get("indicators", []),
                "summary": entry.get("summary", ""),
                "company_name": entry.get("company_name", ticker),
                "company_sector": entry.get("company_sector", "Institutional")
            }
            
            supabase.table("pipeline_runs").insert({
                "ticker": ticker,
                "user_id": user_id,
                "overall_sentiment": "Technical Sync",
                "status": "completed",
                "payload": payload
            }).execute()
            print(f"✅ Indexed Technical node for {ticker}")
    except Exception as e:
        print(f"❌ Technical seeding error: {e}")

if __name__ == "__main__":
    print("🚀 INITIALIZING DATALINK SEEDING...")
    seed_fund_data()
    seed_tech_data()
    print("🏁 SEEDING COMPLETE.")
