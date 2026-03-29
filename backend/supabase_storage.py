import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv
from logger import log
from config import (
    SUPABASE_URL,
    SUPABASE_KEY,
    SUPABASE_TABLE,
    SUPABASE_ARTICLES_TABLE,
    DEFAULT_USER_ID,
)

load_dotenv()

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        log("❌ Error: SUPABASE_URL or SUPABASE_KEY not set in env", level="ERROR")
        return None
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def start_pipeline_run(ticker: str, user_id: str = None) -> dict:
    client = get_supabase_client()
    if not client:
        return {"saved": False, "reason": "No client"}

    user_id = user_id or DEFAULT_USER_ID
    try:
        data = {
            "user_id": user_id,
            "ticker": ticker.upper(),
            "status": "running",
            "payload": {},
            "created_at": datetime.utcnow().isoformat(),
        }
        res = client.table(SUPABASE_TABLE).insert(data).execute()
        if res.data:
            return {"saved": True, "run_id": res.data[0]["id"]}
        return {"saved": False, "reason": "Insert failed"}
    except Exception as e:
        log(f"❌ Supabase start error: {e}", level="ERROR")
        return {"saved": False, "reason": str(e)}

def complete_pipeline_run(run_id: int, payload: dict, user_id: str = None) -> dict:
    client = get_supabase_client()
    if not client or not run_id:
        return {"saved": False, "reason": "No run_id or client"}

    try:
        # Extract top-level metrics for easier access
        trust_data = payload.get("trust_report", {})
        risk_data = payload.get("risk_assessment", {})
        
        # 1. First, update with standard columns that we are sure exist
        basic_update = {
            "overall_sentiment": payload.get("overall_sentiment"),
            "status": "completed",
            "payload": payload,
        }
        
        try:
            client.table(SUPABASE_TABLE).update(basic_update).eq("id", run_id).execute()
        except Exception as e:
            log(f"⚠️ Basic Supabase update failed: {e}", level="WARN")
            return {"saved": False, "reason": f"Basic update failed: {str(e)}"}

        # 2. Try to update custom analytical columns (may fail if schema not updated)
        try:
            analytical_update = {
                "trust_reliability": trust_data.get("reliability"),
                "average_trust_score": trust_data.get("score"),
                "risk_level": risk_data.get("risk_level"),
            }
            client.table(SUPABASE_TABLE).update(analytical_update).eq("id", run_id).execute()
        except Exception as e:
            log(f"ℹ️ Skipping new schema columns (likely missing in DB): {e}")

        # 3. Insert individual articles for tracking
        articles = payload.get("articles", [])
        if articles:
            article_batch = []
            for art in articles:
                article_batch.append({
                    "run_id": run_id,
                    "user_id": user_id or DEFAULT_USER_ID,
                    "ticker": payload.get("ticker"),
                    "headline": art.get("headline"),
                    "source": art.get("source"),
                    "summary": art.get("summary"),
                    "url": art.get("url"),
                    "sentiment": art.get("sentiment"),
                    "confidence": art.get("confidence"),
                    # These might also be missing in older schemas
                    "trust_score": art.get("trust_score"),
                    "source_credibility": art.get("source_credibility")
                })
            
            if article_batch:
                try:
                    client.table(SUPABASE_ARTICLES_TABLE).insert(article_batch).execute()
                except Exception as e:
                    log(f"⚠️ Article batch insert failed: {e}. Retrying without new columns...", level="WARN")
                    # Fallback: remove new columns and try again
                    for a in article_batch:
                        a.pop("trust_score", None)
                        a.pop("source_credibility", None)
                    try:
                        client.table(SUPABASE_ARTICLES_TABLE).insert(article_batch).execute()
                    except Exception as e2:
                        log(f"❌ Article fallback insert failed: {e2}", level="ERROR")

        return {
            "saved": True, 
            "table": SUPABASE_TABLE, 
            "run_id": run_id, 
            "articles_saved": len(articles)
        }
    except Exception as e:
        log(f"❌ Supabase complete error: {e}", level="ERROR")
        return {"saved": False, "reason": str(e)}

def fail_pipeline_run(run_id: int, error_message: str, ticker: str = None, user_id: str = None) -> dict:
    client = get_supabase_client()
    if not client or not run_id:
        return {"saved": False, "reason": "No run_id"}

    try:
        data = {
            "status": "failed",
            "error_message": error_message,
        }
        res = client.table(SUPABASE_TABLE).update(data).eq("id", run_id).execute()
        return {"saved": True, "run_id": run_id}
    except Exception as e:
        log(f"❌ Supabase fail error: {e}", level="ERROR")
        return {"saved": False, "reason": str(e)}