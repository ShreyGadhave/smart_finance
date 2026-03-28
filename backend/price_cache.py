import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from supabase_storage import get_supabase_client
from logger import log
from config import SUPABASE_PRICES_TABLE as PRICE_TABLE

def fetch_and_cache_prices(tickers: list[str]) -> pd.DataFrame:
    """
    Check Supabase for prices, fetch missing from yfinance, and update Supabase.
    Returns a DataFrame: index=date, columns=tickers.
    """
    client = get_supabase_client()
    end_date = datetime.now()
    start_date = end_date - timedelta(days=365)
    
    # Target all unique tickers
    unique_tickers = list(set(tickers))
    
    all_data = []
    
    # 1. Try fetching from Supabase
    if client:
        try:
            # Note: Ticker query depends on your SQL skill, we will fetch for today's context
            # Simulating search for the last 365 days
            res = client.table(PRICE_TABLE).select("*").in_("ticker", unique_tickers).gte("date", start_date.isoformat()).execute()
            if res.data:
                all_data = res.data
                log(f"✅ Retrieved {len(all_data)} price points from Supabase Cache")
        except Exception as e:
            log(f"⚠️ Supabase price fetch error (maybe table missing?): {e}")

    # Convert to DataFrame
    if all_data:
        db_df = pd.DataFrame(all_data)
        db_df['date'] = pd.to_datetime(db_df['date'])
        # Pivot into columns=ticker format
        pivoted = db_df.pivot(index='date', columns='ticker', values='close')
    else:
        pivoted = pd.DataFrame()

    # 2. Check for missing tickers or gaps
    missing_tickers = [t for t in unique_tickers if t not in pivoted.columns]
    
    if missing_tickers or len(pivoted) < 200: # Heuristic for 'enough' data
        log(f"⬇️ Fetching {missing_tickers or 'all'} from yfinance...")
        yf_data = yf.download(unique_tickers, start=start_date.strftime("%Y-%m-%d"))
        
        if not yf_data.empty:
            # Handle multi-index columns if plural tickers
            if isinstance(yf_data.columns, pd.MultiIndex):
                yf_pivoted = yf_data['Close']
            else:
                yf_pivoted = yf_data[['Close']]
                yf_pivoted.columns = [unique_tickers[0]]
                
            # Update pivoted with fresh yf data
            pivoted = yf_pivoted.copy()
            
            # 3. Cache back to Supabase
            if client:
                try:
                    upload_batch = []
                    for ticker in pivoted.columns:
                        series = pivoted[ticker].dropna()
                        for date, price in series.items():
                            upload_batch.append({
                                "ticker": ticker,
                                "date": date.strftime("%Y-%m-%d"),
                                "close": float(price)
                            })
                    
                    if upload_batch:
                        # Use upsert to avoid duplicates if ticker/date is unique
                        client.table(PRICE_TABLE).upsert(upload_batch, on_conflict="ticker,date").execute()
                        log(f"💾 Cached {len(upload_batch)} points back to Supabase")
                except Exception as e:
                    log(f"⚠️ Cache update error: {e}")

    return pivoted.dropna()
