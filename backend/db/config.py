from pathlib import Path
from pydantic_settings import BaseSettings

# Compute the path to .env in the project root (parent of backend)
ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    DB_TIMEOUT: int = 10

    class Config:
        env_file = str(ENV_PATH)
        extra = "ignore"  # Allow other env vars to exist without error

settings = Settings()
