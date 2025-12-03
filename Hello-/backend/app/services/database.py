"""
Database Service - Supabase integration for user query tracking.

Features:
- User query logging with user_id tracking
- Reverse geocoding for location names
- Query history per user
- PDF generation and download tracking
- Analytics and statistics
"""

import os
from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path
import httpx


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


async def reverse_geocode(lat: float, lon: float) -> Optional[str]:
    """
    Reverse geocode coordinates to location name using Nominatim (OpenStreetMap).

    Free service - no API key required.
    Rate limit: 1 request/second (we're okay for our use case).

    Args:
        lat: Latitude
        lon: Longitude

    Returns:
        Location name or None if failed
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "lat": lat,
                    "lon": lon,
                    "format": "json",
                    "zoom": 10,  # City-level detail
                    "addressdetails": 1
                },
                headers={"User-Agent": "ErthalokaPHI/1.0 (contact@erthaloka.com)"},
                timeout=5.0
            )

            if response.status_code == 200:
                data = response.json()

                # Try to build a readable location name
                address = data.get("address", {})

                # Priority: city -> town -> village -> county -> state
                city = (
                    address.get("city") or
                    address.get("town") or
                    address.get("village") or
                    address.get("municipality") or
                    address.get("county")
                )
                state = address.get("state") or address.get("region")
                country = address.get("country")

                parts = [p for p in [city, state, country] if p]
                if parts:
                    return ", ".join(parts)

                # Fallback to display_name
                return data.get("display_name")

    except Exception as e:
        print(f"Reverse geocoding failed: {e}")

    return None


async def log_query(
    lat: float,
    lon: float,
    result: dict,
    user_id: str,
    user_email: Optional[str] = None,
    report_generated: bool = False,
    user_agent: str = "web",
    ip_address: Optional[str] = None,
    mode: str = "comprehensive"
) -> Optional[str]:
    """
    Log a query to Supabase with user tracking.

    Args:
        lat: Query latitude
        lon: Query longitude
        result: Query result data
        user_id: Firebase user ID
        user_email: User email (optional)
        report_generated: Whether a PDF report was generated
        user_agent: Client identifier
        ip_address: Client IP address
        mode: Query mode (simple/comprehensive)

    Returns:
        Query ID (UUID) or None if failed
    """
    supabase = get_supabase()

    if supabase is None:
        # Logging disabled, just print
        score = result.get('summary', {}).get('overall_score')
        print(f"Query: ({lat}, {lon}) by {user_id} - Score: {score}")
        return None

    try:
        summary = result.get("summary", {})

        # Get location name asynchronously
        location_name = await reverse_geocode(lat, lon)

        data = {
            # User identification
            "user_id": user_id,
            "user_email": user_email,

            # Location
            "latitude": lat,
            "longitude": lon,
            "location_name": location_name,

            # Query metadata
            "query_mode": mode,
            "ip_address": ip_address,
            "user_agent": user_agent,

            # PHI data
            "phi_response": result,
            "overall_score": summary.get("overall_score"),
            "pillar_scores": summary.get("pillar_scores", {}),
            "data_completeness": summary.get("data_completeness"),
            "quality_flags": summary.get("quality_flags", []),

            # PDF tracking
            "pdf_generated": report_generated
        }

        response = supabase.table("phi_queries").insert(data).execute()

        if response.data and len(response.data) > 0:
            query_id = response.data[0].get("id")
            print(f"Logged query {query_id}: ({lat}, {lon}) by {user_id}")
            return query_id

        return None

    except Exception as e:
        # Don't fail the request if logging fails
        print(f"Failed to log query: {e}")
        return None


async def get_user_query_history(
    user_id: str,
    page: int = 1,
    per_page: int = 10
) -> Dict[str, Any]:
    """
    Get paginated query history for a user.

    Args:
        user_id: Firebase user ID
        page: Page number (1-indexed)
        per_page: Items per page (max 50)

    Returns:
        Dict with queries, total count, pagination info
    """
    supabase = get_supabase()

    if supabase is None:
        return {
            "queries": [],
            "total": 0,
            "page": page,
            "per_page": per_page,
            "has_more": False
        }

    try:
        # Clamp per_page
        per_page = min(per_page, 50)
        offset = (page - 1) * per_page

        # Get total count
        count_response = supabase.table("phi_queries") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .execute()
        total = count_response.count if hasattr(count_response, 'count') else 0

        # Get paginated results
        response = supabase.table("phi_queries") \
            .select("id, latitude, longitude, location_name, overall_score, pillar_scores, query_mode, pdf_generated, pdf_url, pdf_downloaded, created_at") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .range(offset, offset + per_page - 1) \
            .execute()

        queries = response.data if response.data else []

        return {
            "queries": queries,
            "total": total,
            "page": page,
            "per_page": per_page,
            "has_more": offset + len(queries) < total
        }

    except Exception as e:
        print(f"Failed to get query history: {e}")
        return {
            "queries": [],
            "total": 0,
            "page": page,
            "per_page": per_page,
            "has_more": False,
            "error": str(e)
        }


async def get_query_by_id(query_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a specific query by ID.

    Args:
        query_id: Query UUID

    Returns:
        Query data or None
    """
    supabase = get_supabase()

    if supabase is None:
        return None

    try:
        response = supabase.table("phi_queries") \
            .select("*") \
            .eq("id", query_id) \
            .single() \
            .execute()

        return response.data if response.data else None

    except Exception as e:
        print(f"Failed to get query: {e}")
        return None


async def update_pdf_status(
    query_id: str,
    pdf_url: str,
    pdf_filename: str
) -> bool:
    """
    Update query record with PDF information.

    Args:
        query_id: Query UUID
        pdf_url: Public URL to download PDF
        pdf_filename: Original filename

    Returns:
        True if successful
    """
    supabase = get_supabase()

    if supabase is None:
        return False

    try:
        supabase.table("phi_queries").update({
            "pdf_generated": True,
            "pdf_url": pdf_url,
            "pdf_filename": pdf_filename,
            "pdf_generated_at": datetime.now().isoformat()
        }).eq("id", query_id).execute()

        print(f"Updated PDF status for query {query_id}")
        return True

    except Exception as e:
        print(f"Failed to update PDF status: {e}")
        return False


async def mark_pdf_downloaded(query_id: str) -> bool:
    """
    Mark PDF as downloaded and increment download count.

    Args:
        query_id: Query UUID

    Returns:
        True if successful
    """
    supabase = get_supabase()

    if supabase is None:
        return False

    try:
        # Get current download count
        current = await get_query_by_id(query_id)
        if not current:
            return False

        current_count = current.get("pdf_download_count", 0) or 0

        supabase.table("phi_queries").update({
            "pdf_downloaded": True,
            "pdf_download_count": current_count + 1
        }).eq("id", query_id).execute()

        return True

    except Exception as e:
        print(f"Failed to mark PDF downloaded: {e}")
        return False


async def upload_pdf_to_storage(
    file_path: Path,
    user_id: str,
    filename: str
) -> Optional[str]:
    """
    Upload PDF to Supabase Storage.

    Args:
        file_path: Local path to PDF file
        user_id: User ID for organizing storage
        filename: Desired filename

    Returns:
        Public URL or None if failed
    """
    supabase = get_supabase()

    if supabase is None:
        return None

    try:
        bucket_name = os.environ.get("SUPABASE_STORAGE_BUCKET", "phi-reports")
        storage_path = f"reports/{user_id}/{filename}"

        with open(file_path, 'rb') as f:
            file_data = f.read()

        # Upload to storage
        supabase.storage.from_(bucket_name).upload(
            path=storage_path,
            file=file_data,
            file_options={"content-type": "application/pdf"}
        )

        # Get public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)

        print(f"Uploaded PDF to storage: {storage_path}")
        return public_url

    except Exception as e:
        print(f"Failed to upload PDF: {e}")
        return None


async def get_query_stats() -> dict:
    """Get query statistics for analytics."""
    supabase = get_supabase()

    if supabase is None:
        return {"error": "Logging not configured"}

    try:
        # Get total queries
        response = supabase.table("phi_queries").select("*", count="exact").execute()
        total = response.count if hasattr(response, 'count') else len(response.data)

        # Get queries today
        today = datetime.now().strftime("%Y-%m-%d")
        today_response = supabase.table("phi_queries") \
            .select("*", count="exact") \
            .gte("created_at", today) \
            .execute()
        today_count = today_response.count if hasattr(today_response, 'count') else len(today_response.data)

        # Get unique users
        users_response = supabase.table("phi_queries") \
            .select("user_id") \
            .execute()
        unique_users = len(set(q["user_id"] for q in users_response.data)) if users_response.data else 0

        # Get PDF stats
        pdf_response = supabase.table("phi_queries") \
            .select("*", count="exact") \
            .eq("pdf_generated", True) \
            .execute()
        pdf_count = pdf_response.count if hasattr(pdf_response, 'count') else 0

        return {
            "total_queries": total,
            "queries_today": today_count,
            "unique_users": unique_users,
            "pdfs_generated": pdf_count
        }

    except Exception as e:
        return {"error": str(e)}


async def get_user_stats(user_id: str) -> Dict[str, Any]:
    """
    Get statistics for a specific user.

    Args:
        user_id: Firebase user ID

    Returns:
        Dict with user's query stats
    """
    supabase = get_supabase()

    if supabase is None:
        return {"error": "Database not configured"}

    try:
        # Get user's total queries
        response = supabase.table("phi_queries") \
            .select("*", count="exact") \
            .eq("user_id", user_id) \
            .execute()
        total = response.count if hasattr(response, 'count') else len(response.data)

        # Get PDFs generated
        pdf_response = supabase.table("phi_queries") \
            .select("*", count="exact") \
            .eq("user_id", user_id) \
            .eq("pdf_generated", True) \
            .execute()
        pdfs = pdf_response.count if hasattr(pdf_response, 'count') else 0

        # Get recent queries
        recent = supabase.table("phi_queries") \
            .select("id, location_name, overall_score, created_at") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(5) \
            .execute()

        return {
            "total_queries": total,
            "pdfs_generated": pdfs,
            "recent_queries": recent.data if recent.data else []
        }

    except Exception as e:
        return {"error": str(e)}
