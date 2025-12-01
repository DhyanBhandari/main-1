"""
Database Service - Supabase logging for query analytics.

Logs all user queries for:
- Usage analytics
- Performance monitoring
- Popular locations tracking
"""

import os
from datetime import datetime
from typing import Optional


# Supabase client (initialized lazily)
_supabase = None


def get_supabase():
    """Get or initialize Supabase client."""
    global _supabase

    if _supabase is not None:
        return _supabase

    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")

    if not url or not key:
        print("Warning: Supabase not configured. Logging disabled.")
        return None

    try:
        from supabase import create_client
        _supabase = create_client(url, key)
        return _supabase
    except ImportError:
        print("Warning: supabase package not installed. Logging disabled.")
        return None
    except Exception as e:
        print(f"Warning: Failed to initialize Supabase: {e}")
        return None


async def log_query(
    lat: float,
    lon: float,
    result: dict,
    report_generated: bool = False,
    user_agent: str = "web"
):
    """
    Log a query to Supabase.

    Args:
        lat: Query latitude
        lon: Query longitude
        result: Query result data
        report_generated: Whether a PDF report was generated
        user_agent: Client identifier
    """
    supabase = get_supabase()

    if supabase is None:
        # Logging disabled, just print
        print(f"Query: ({lat}, {lon}) - Score: {result.get('summary', {}).get('overall_score')}")
        return

    try:
        summary = result.get("summary", {})

        data = {
            "latitude": lat,
            "longitude": lon,
            "overall_score": summary.get("overall_score"),
            "mode": result.get("query", {}).get("mode", "simple"),
            "data_completeness": summary.get("data_completeness"),
            "report_generated": report_generated,
            "user_agent": user_agent,
            "timestamp": datetime.now().isoformat(),
            "pillar_scores": summary.get("pillar_scores", {})
        }

        supabase.table("query_logs").insert(data).execute()
        print(f"Logged query: ({lat}, {lon})")

    except Exception as e:
        # Don't fail the request if logging fails
        print(f"Failed to log query: {e}")


async def get_query_stats() -> dict:
    """Get query statistics for analytics."""
    supabase = get_supabase()

    if supabase is None:
        return {"error": "Logging not configured"}

    try:
        # Get total queries
        response = supabase.table("query_logs").select("*", count="exact").execute()
        total = response.count if hasattr(response, 'count') else len(response.data)

        # Get queries today
        today = datetime.now().strftime("%Y-%m-%d")
        today_response = supabase.table("query_logs") \
            .select("*", count="exact") \
            .gte("timestamp", today) \
            .execute()
        today_count = today_response.count if hasattr(today_response, 'count') else len(today_response.data)

        return {
            "total_queries": total,
            "queries_today": today_count,
            "reports_generated": 0  # Would need aggregation
        }

    except Exception as e:
        return {"error": str(e)}
