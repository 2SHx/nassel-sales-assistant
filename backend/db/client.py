from supabase import create_client, Client
from .config import settings

class DatabaseClient:
    _instance: Client = None

    @classmethod
    def get_client(cls) -> Client:
        if cls._instance is None:
            try:
                cls._instance = create_client(
                    settings.SUPABASE_URL, 
                    settings.SUPABASE_KEY
                )
            except Exception as e:
                raise RuntimeError(f"Failed to initialize Supabase client: {e}")
        return cls._instance

    @staticmethod
    def verify_connection() -> bool:
        """
        Pings the 'projects' table to ensure connection is alive.
        """
        client = DatabaseClient.get_client()
        try:
            # Fetch 1 row, head=True implies we don't need the data, just count/metadata
            response = client.table("projects").select("count", count="exact").limit(1).execute()
            return True
        except Exception as e:
            print(f"Database Health Check Failed: {e}")
            return False
