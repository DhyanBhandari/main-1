"""
Unit Tests for Planetary Health API

Tests the API endpoints to verify:
1. Health endpoint returns correct structure
2. Query endpoint returns data with all 5 pillars
3. Response contains scores and metrics
4. Error handling works correctly

Run with: pytest tests/test_api.py -v
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def anyio_backend():
    return 'asyncio'


@pytest.mark.asyncio
async def test_health_endpoint():
    """Test that health endpoint returns correct structure."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "earth_engine" in data


@pytest.mark.asyncio
async def test_query_endpoint_validation():
    """Test that query endpoint validates input."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Test invalid latitude
        response = await client.post("/api/query", json={
            "lat": 200,  # Invalid: must be -90 to 90
            "lon": 77.2090,
            "mode": "simple",
            "include_scores": True
        })
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_query_endpoint_structure():
    """Test that query endpoint returns correct structure."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/query", json={
            "lat": 28.6139,
            "lon": 77.2090,
            "mode": "simple",
            "include_scores": True
        })
        assert response.status_code == 200
        data = response.json()

        # Verify wrapped response structure
        assert "success" in data
        assert data["success"] == True
        assert "data" in data

        # Verify data contains expected fields
        query_data = data["data"]
        assert "pillars" in query_data
        assert "summary" in query_data


@pytest.mark.asyncio
async def test_query_returns_all_pillars():
    """Test that query returns all 5 pillars."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/query", json={
            "lat": 28.6139,
            "lon": 77.2090,
            "mode": "comprehensive",
            "include_scores": True
        })
        assert response.status_code == 200
        data = response.json()

        pillars = data["data"]["pillars"]
        expected_pillars = [
            "A_atmospheric",
            "B_biodiversity",
            "C_carbon",
            "D_degradation",
            "E_ecosystem"
        ]

        for pillar_key in expected_pillars:
            assert pillar_key in pillars, f"Missing pillar: {pillar_key}"
            pillar = pillars[pillar_key]
            assert "score" in pillar, f"Missing score in {pillar_key}"
            assert "metrics" in pillar, f"Missing metrics in {pillar_key}"
            assert "pillar_id" in pillar, f"Missing pillar_id in {pillar_key}"
            assert "pillar_name" in pillar, f"Missing pillar_name in {pillar_key}"


@pytest.mark.asyncio
async def test_query_returns_summary():
    """Test that query returns summary with overall score."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/query", json={
            "lat": 13.1119,
            "lon": 77.6254,
            "mode": "comprehensive",
            "include_scores": True
        })
        assert response.status_code == 200
        data = response.json()

        summary = data["data"]["summary"]

        assert "overall_score" in summary
        assert "pillar_scores" in summary
        assert "data_completeness" in summary
        assert "quality_flags" in summary

        # Verify types
        assert isinstance(summary["overall_score"], (int, float))
        assert isinstance(summary["pillar_scores"], dict)
        assert isinstance(summary["data_completeness"], (int, float))
        assert isinstance(summary["quality_flags"], list)


@pytest.mark.asyncio
async def test_query_pillar_scores_range():
    """Test that pillar scores are in valid range (0-100)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/query", json={
            "lat": 28.6139,
            "lon": 77.2090,
            "mode": "simple",
            "include_scores": True
        })
        assert response.status_code == 200
        data = response.json()

        summary = data["data"]["summary"]
        pillar_scores = summary["pillar_scores"]

        for pillar_id, score in pillar_scores.items():
            assert 0 <= score <= 100, f"Score for {pillar_id} out of range: {score}"


@pytest.mark.asyncio
async def test_datasets_endpoint():
    """Test that datasets endpoint returns pillar info."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/datasets")
        assert response.status_code == 200
        data = response.json()

        assert "pillars" in data
        assert "modes" in data

        # Verify all 5 pillars are documented
        pillars = data["pillars"]
        for pillar_id in ["A", "B", "C", "D", "E"]:
            assert pillar_id in pillars
            assert "name" in pillars[pillar_id]
            assert "color" in pillars[pillar_id]
            assert "metrics" in pillars[pillar_id]
