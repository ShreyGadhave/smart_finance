import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

def check_ticker(ticker):
    res = supabase.table("pipeline_runs").select("*").eq("ticker", ticker.upper()).execute()
    print(f"📊 Runs for {ticker}: {len(res.data)}")
    for run in res.data:
        print(f"  - ID: {run['id']}, User: {run.get('user_id')}, Payload Keys: {list(run.get('payload', {}).keys())}")

if __name__ == "__main__":
    check_ticker("20MICRONS")
    check_ticker("3IINFOLTD") # The one that failed
