import os
from dotenv import load_dotenv

load_dotenv()

GNEWS_API_KEY = os.getenv("GNEWS_API_KEY")
ALPHA_VANTAGE_KEY = os.getenv("ALPHA_VANTAGE_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_TABLE = os.getenv("SUPABASE_TABLE", "pipeline_runs")
SUPABASE_ARTICLES_TABLE = os.getenv("SUPABASE_ARTICLES_TABLE", "pipeline_articles")
SUPABASE_PRICES_TABLE = os.getenv("SUPABASE_PRICES_TABLE", "historical_prices")
DEFAULT_USER_ID = os.getenv("DEFAULT_USER_ID")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")

OUTPUT_FILE = "data/final_news.json"