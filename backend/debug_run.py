import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

def check_run(run_id):
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    res = client.table("pipeline_runs").select("*").eq("id", run_id).execute()
    if res.data:
        run = res.data[0]
        print(f"Run ID: {run['id']}")
        print(f"Ticker: {run['ticker']}")
        print(f"Status: {run['status']}")
        print(f"Error: {run.get('error_message')}")
        print(f"Payload keys: {run.get('payload', {}).keys()}")
    else:
        print("Run not found")

if __name__ == "__main__":
    check_run(12) # Based on user's screenshot
