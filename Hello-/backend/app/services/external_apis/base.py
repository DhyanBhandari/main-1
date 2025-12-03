"""
Base class for external API integrations.

Provides common functionality for all external API clients:
- Async HTTP requests with aiohttp
- Rate limiting
- Error handling
- Response normalization
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import aiohttp
import asyncio


class BaseExternalAPI(ABC):
    """Base class for all external API integrations."""

    API_NAME: str = ""
    BASE_URL: str = ""
    REQUIRES_AUTH: bool = False
    RATE_LIMIT_PER_DAY: Optional[int] = None
    CACHE_TTL_SECONDS: int = 300  # 5 minutes default
    REQUEST_TIMEOUT: int = 10  # seconds

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self._session: Optional[aiohttp.ClientSession] = None
        self._request_count = 0
        self._last_reset = datetime.now()

    @abstractmethod
    async def fetch_data(self, lat: float, lon: float, **kwargs) -> Dict[str, Any]:
        """
        Fetch data from the API.

        Args:
            lat: Latitude
            lon: Longitude
            **kwargs: Additional parameters

        Returns:
            Raw API response data
        """
        pass

    @abstractmethod
    def normalize_response(self, raw_data: Dict) -> Dict[str, Any]:
        """
        Normalize response to standard format.

        Args:
            raw_data: Raw API response

        Returns:
            Normalized data dict with standard fields
        """
        pass

    async def get_data(self, lat: float, lon: float, **kwargs) -> Dict[str, Any]:
        """
        Main entry point with error handling and rate limiting.

        Args:
            lat: Latitude
            lon: Longitude
            **kwargs: Additional parameters

        Returns:
            Normalized data or error response
        """
        try:
            # Check rate limit
            if not self._check_rate_limit():
                return {
                    "error": "rate_limit_exceeded",
                    "source": self.API_NAME,
                    "available": False,
                    "message": f"Rate limit exceeded for {self.API_NAME}"
                }

            # Increment request count
            self._request_count += 1

            # Fetch data
            raw = await self.fetch_data(lat, lon, **kwargs)

            # Normalize response
            return self.normalize_response(raw)

        except asyncio.TimeoutError:
            return {
                "error": "timeout",
                "source": self.API_NAME,
                "available": False,
                "message": f"Request to {self.API_NAME} timed out"
            }
        except aiohttp.ClientError as e:
            return {
                "error": "connection_error",
                "source": self.API_NAME,
                "available": False,
                "message": f"Connection error for {self.API_NAME}: {str(e)}"
            }
        except Exception as e:
            return {
                "error": str(e),
                "source": self.API_NAME,
                "available": False,
                "message": f"Error fetching from {self.API_NAME}: {str(e)}"
            }

    def _check_rate_limit(self) -> bool:
        """
        Check if rate limit allows another request.

        Returns:
            True if request is allowed, False otherwise
        """
        if self.RATE_LIMIT_PER_DAY is None:
            return True

        now = datetime.now()

        # Reset counter if new day
        if (now - self._last_reset).days >= 1:
            self._request_count = 0
            self._last_reset = now

        return self._request_count < self.RATE_LIMIT_PER_DAY

    def get_stats(self) -> Dict[str, Any]:
        """
        Get API client statistics.

        Returns:
            Dict with request counts and rate limit info
        """
        return {
            "api_name": self.API_NAME,
            "requests_today": self._request_count,
            "rate_limit": self.RATE_LIMIT_PER_DAY,
            "requires_auth": self.REQUIRES_AUTH,
            "cache_ttl": self.CACHE_TTL_SECONDS
        }
