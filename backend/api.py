from typing import Any
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client

from config import (
    SUPABASE_ARTICLES_TABLE,
    SUPABASE_KEY,
    SUPABASE_TABLE,
    SUPABASE_URL,
)
from main import run_pipeline
from portfolio_optimizer import optimize_portfolio
from risk_assessment import assess_risk
from trust_scoring import generate_trust_report
from regulatory import check_portfolio_compliance, generate_compliance_report
from groq_chat import get_groq_analysis

app = FastAPI(title="Smart Finance Backend API", version="0.4.0")

# ── Global Error Handling ───────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"❌ GLOBAL ERROR: {exc}") # Print to console for debugging
    return JSONResponse(
        status_code=500,
        content={"ok": False, "error": str(exc), "detail": "Internal Server Error"},
    )

# ── CORS ────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──────────────────────────────────────────────────────────
class RunRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=20)


class PortfolioRequest(BaseModel):
    tickers: list[str] = Field(min_length=2, max_length=20)
    risk_appetite: str = Field(default="moderate")


class ComplianceRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=20)
    allocation: dict[str, float] | None = None

class ChatRequest(BaseModel):
    message: str
    run_id: int | None = None # context for a specific run


# ── Helpers ─────────────────────────────────────────────────────────
def _supabase_client():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="Supabase server config missing")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def _bearer_token(authorization: str = Header(default="")) -> str:
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Empty bearer token")
    return token


def _current_user_id(token: str = Depends(_bearer_token)) -> str:
    client = _supabase_client()
    try:
        user_response = client.auth.get_user(token)
        user = getattr(user_response, "user", None)
        user_id = getattr(user, "id", None)
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc

    if not user_id:
        raise HTTPException(status_code=401, detail="Token has no user")

    return user_id


# ── Health ──────────────────────────────────────────────────────────
@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# ── Chat Endpoint ───────────────────────────────────────────────────
@app.post("/api/chat")
async def api_chat(
    req: ChatRequest,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    context = {}
    client = _supabase_client()

    if req.run_id:
        res = client.table(SUPABASE_TABLE).select("*").eq("id", req.run_id).eq("user_id", user_id).limit(1).execute()
        if res.data:
            run = res.data[0]
            ticker = run.get("ticker")
            payload = run.get("payload", {})
            context = {
                "ticker": ticker,
                "overall_sentiment": run.get("overall_sentiment"),
                "risk_metrics": payload.get("risk_assessment", {}).get("metrics"),
                "research_summary": payload.get("research_report", "")[:1000],
                "customer_analysis": payload.get("customer_analysis", {}).get("explanation"),
            }

    analysis = get_groq_analysis(prompt=req.message, context=context)
    return {"ok": True, "response": analysis}


# ── Pipeline Endpoints ──────────────────────────────────────────────
@app.post("/api/pipeline/run")
def api_run_pipeline(
    payload: RunRequest,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    try:
        result = run_pipeline(ticker=payload.ticker.upper(), user_id=user_id)
        return {"ok": True, "result": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {exc}") from exc


@app.get("/api/pipeline/runs")
def api_list_runs(user_id: str = Depends(_current_user_id)) -> dict[str, Any]:
    client = _supabase_client()
    try:
        # Use * to avoid crashing on missing custom columns
        response = (
            client.table(SUPABASE_TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Runs fetch failed: {exc}") from exc

    return {
        "ok": True,
        "count": len(response.data or []),
        "runs": response.data or [],
    }


@app.get("/api/pipeline/runs/{run_id}")
def api_get_run(
    run_id: int,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    client = _supabase_client()
    try:
        # Use * to avoid crashing on missing custom columns
        response = (
            client.table(SUPABASE_TABLE)
            .select("*")
            .eq("id", run_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Run fetch failed: {exc}") from exc

    data = response.data or []
    if not data:
        raise HTTPException(status_code=404, detail="Run not found")

    return {"ok": True, "run": data[0]}


@app.get("/api/pipeline/runs/{run_id}/articles")
def api_get_run_articles(
    run_id: int,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    client = _supabase_client()
    try:
        response = (
            client.table(SUPABASE_ARTICLES_TABLE)
            .select("*")
            .eq("run_id", run_id)
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Articles fetch failed: {exc}"
        ) from exc

    return {
        "ok": True,
        "count": len(response.data or []),
        "articles": response.data or [],
    }


# ── Portfolio Endpoints ─────────────────────────────────────────────
@app.post("/api/portfolio")
def api_optimize_portfolio(
    payload: PortfolioRequest,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    try:
        tickers = [t.upper() for t in payload.tickers]
        result = optimize_portfolio(
            tickers=tickers,
            risk_appetite=payload.risk_appetite,
        )
        return {"ok": True, "result": result}
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Portfolio optimization failed: {exc}"
        ) from exc


from technical import get_technical_indicators

# ... existing code ...

# ── Risk Assessment Endpoints ───────────────────────────────────────
@app.get("/api/risk/{ticker}")
def api_assess_risk(
    ticker: str,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    try:
        result = assess_risk(ticker.upper())
        return {"ok": True, "result": result}
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Risk assessment failed: {exc}"
        ) from exc


# ── Technical Analysis Endpoints ────────────────────────────────────
@app.get("/api/technical/{ticker}")
def api_get_technical(
    ticker: str,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    try:
        result = get_technical_indicators(ticker.upper())
        return {"ok": True, "result": result}
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Technical synthesis failed: {exc}"
        ) from exc


# ── Trust Scoring Endpoints ─────────────────────────────────────────
@app.get("/api/trust/{run_id}")
def api_trust_report(
    run_id: int,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    client = _supabase_client()
    try:
        response = (
            client.table(SUPABASE_TABLE)
            .select("payload")
            .eq("id", run_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Run fetch failed: {exc}"
        ) from exc

    data = response.data or []
    if not data:
        raise HTTPException(status_code=404, detail="Run not found")

    articles = data[0].get("payload", {}).get("articles", [])
    report = generate_trust_report(articles)
    return {"ok": True, "result": report}


# ── Regulatory Endpoints ───────────────────────────────────────────
@app.post("/api/regulatory/check")
def api_regulatory_check(
    payload: ComplianceRequest,
    user_id: str = Depends(_current_user_id),
) -> dict[str, Any]:
    try:
        result = {}
        if payload.allocation:
            result["compliance"] = check_portfolio_compliance(payload.allocation)
        result["report"] = generate_compliance_report(
            payload.ticker.upper(),
            result.get("compliance"),
        )
        return {"ok": True, "result": result}
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail=f"Compliance check failed: {exc}"
        ) from exc


# ── Server entrypoint ──────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
