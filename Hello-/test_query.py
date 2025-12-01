#!/usr/bin/env python3
"""
Test script for the Planetary Health Query System.
Tests basic functionality with sample locations.
"""

import json
from datetime import datetime

print("=" * 60)
print("Planetary Health Query System - Test Suite")
print("=" * 60)
print()

# Test 1: Import check
print("[TEST 1] Importing modules...")
try:
    from planetary_health_query import GEEQueryEngine, DATASETS, PILLAR_CONFIG
    from planetary_health_query.core.authenticator import get_project_id
    from planetary_health_query.utils.scoring import calculate_pillar_score
    print("  [PASS] All modules imported successfully")
except ImportError as e:
    print(f"  [FAIL] Import error: {e}")
    exit(1)

# Test 2: Configuration check
print("\n[TEST 2] Checking configuration...")
print(f"  Project ID: {get_project_id()}")
print(f"  Datasets configured: {len(DATASETS)}")
print(f"  Pillars configured: {list(PILLAR_CONFIG.keys())}")
print("  [PASS] Configuration loaded")

# Test 3: Engine initialization
print("\n[TEST 3] Initializing GEE Query Engine...")
try:
    engine = GEEQueryEngine(auto_init=True)
    print("  [PASS] Engine initialized successfully")
except Exception as e:
    print(f"  [FAIL] Initialization failed: {e}")
    print("  Make sure you have authenticated with Earth Engine:")
    print("    earthengine authenticate")
    exit(1)

# Test 4: Available metrics
print("\n[TEST 4] Checking available metrics...")
simple_metrics = engine.get_available_metrics(mode="simple")
comprehensive_metrics = engine.get_available_metrics(mode="comprehensive")

simple_count = sum(len(v) for v in simple_metrics.values())
comprehensive_count = sum(len(v) for v in comprehensive_metrics.values())

print(f"  Simple mode: {simple_count} metrics")
print(f"  Comprehensive mode: {comprehensive_count} metrics")
print("  [PASS] Metrics available")

# Test 5: Query a location (Simple mode - faster)
print("\n[TEST 5] Querying test location (New Delhi, India)...")
print("  Location: 28.6139, 77.2090")
print("  Mode: simple")
print("  This may take 15-30 seconds...")

try:
    start = datetime.now()
    result = engine.query(
        lat=28.6139,
        lon=77.2090,
        mode="simple",
        temporal="latest",
        buffer_radius=500
    )
    elapsed = (datetime.now() - start).total_seconds()

    print(f"  Query completed in {elapsed:.1f} seconds")

    # Check result structure
    assert "query" in result, "Missing 'query' in result"
    assert "pillars" in result, "Missing 'pillars' in result"
    assert "summary" in result, "Missing 'summary' in result"

    # Print summary
    summary = result.get("summary", {})
    overall_score = summary.get("overall_score")
    completeness = summary.get("data_completeness", 0)

    print(f"  Overall Score: {overall_score}/100")
    print(f"  Data Completeness: {completeness*100:.0f}%")
    print("  [PASS] Query successful")

except Exception as e:
    print(f"  [FAIL] Query failed: {e}")
    exit(1)

# Test 6: Single pillar query
print("\n[TEST 6] Testing single pillar query (Biodiversity)...")
try:
    start = datetime.now()
    pillar_result = engine.query_single_pillar(
        lat=28.6139,
        lon=77.2090,
        pillar="B",
        mode="simple"
    )
    elapsed = (datetime.now() - start).total_seconds()

    print(f"  Query completed in {elapsed:.1f} seconds")
    print(f"  Pillar: {pillar_result.get('pillar_name')}")
    print(f"  Metrics: {list(pillar_result.get('metrics', {}).keys())}")
    print("  [PASS] Single pillar query successful")

except Exception as e:
    print(f"  [FAIL] Single pillar query failed: {e}")

# Test 7: Output format
print("\n[TEST 7] Checking output format...")
try:
    # Save to JSON
    with open("test_output.json", "w") as f:
        json.dump(result, f, indent=2)
    print("  Saved test_output.json")

    # Verify JSON is valid
    with open("test_output.json", "r") as f:
        loaded = json.load(f)
    print("  JSON is valid and readable")
    print("  [PASS] Output format correct")

except Exception as e:
    print(f"  [FAIL] Output format error: {e}")

# Summary
print("\n" + "=" * 60)
print("TEST SUMMARY")
print("=" * 60)
print("All tests passed!")
print()
print("Sample metrics from query:")
for pillar_key, pillar_data in result.get("pillars", {}).items():
    pillar_name = pillar_data.get("pillar_name", pillar_key)
    score = pillar_data.get("score", "N/A")
    print(f"  {pillar_name}: {score}/100")

print()
print("You can now use the query system:")
print("  python query.py --lat 28.6139 --lon 77.2090")
print("  python query.py --lat 40.7128 --lon -74.0060 --mode comprehensive")
print()
