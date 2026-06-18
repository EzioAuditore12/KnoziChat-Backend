import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

# Database Config
DB_HOST = os.environ.get("DB_HOST")
DB_USERNAME = os.environ.get("DB_USERNAME")
DB_PASSWORD = quote_plus(os.environ.get("DB_PASSWORD", ""))
DB_DATABASE_NAME = os.environ.get("DB_DATABASE_NAME")
DB_PORT = os.environ.get("DB_PORT")
REDIS_URL = os.environ.get("REDIS_URL")
DROP_ALL_TABLES = os.environ.get("DROP_ALL_TABLES", "").lower() == "true"

# Gemini AI Config
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_LLM_MODEL_ONE = os.environ.get("GEMINI_LLM_MODEL_ONE")
GEMINI_LLM_MODEL_TWO = os.environ.get("GEMINI_LLM_MODEL_TWO")
GEMINI_LLM_MODEL_THREE = os.environ.get("GEMINI_LLM_MODEL_THREE")
GEMINI_EMBEDDING_MODEL = os.environ.get("GEMINI_EMBEDDING_MODEL")
