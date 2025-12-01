#!/usr/bin/env python3
"""
Planetary Health Query - Main Entry Point

Query real satellite data for any lat/lon worldwide.
Supports 5 pillars: Atmospheric, Biodiversity, Carbon, Degradation, Ecosystem

Usage:
    python query.py --lat 28.6139 --lon 77.2090
    python query.py --lat 28.6139 --lon 77.2090 --mode simple
    python query.py --lat 28.6139 --lon 77.2090 --mode comprehensive --output result.json
"""

import argparse
import json
import sys
from datetime import datetime

from planetary_health_query import GEEQueryEngine


def main():
    parser = argparse.ArgumentParser(
        description="Query planetary health data for any location",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python query.py --lat 28.6139 --lon 77.2090
  python query.py --lat -33.8688 --lon 151.2093 --mode simple
  python query.py --lat 40.7128 --lon -74.0060 --output nyc_health.json

Pillars:
  A - Atmospheric: Air quality, AOD, UV Index
  B - Biodiversity: NDVI, EVI, LAI, Land Cover
  C - Carbon: Forest Cover, Biomass, Carbon Stock
  D - Degradation: LST, Soil Moisture, Drought
  E - Ecosystem: Population, Nightlights, Human Modification
        """
    )

    parser.add_argument("--lat", type=float, required=True,
                       help="Latitude (-90 to 90)")
    parser.add_argument("--lon", type=float, required=True,
                       help="Longitude (-180 to 180)")
    parser.add_argument("--mode", choices=["simple", "comprehensive"],
                       default="comprehensive",
                       help="Query mode: simple (10 metrics) or comprehensive (24 metrics)")
    parser.add_argument("--temporal", choices=["latest", "monthly", "annual"],
                       default="latest",
                       help="Temporal mode: latest, monthly (12 months), or annual (5 years)")
    parser.add_argument("--buffer", type=int, default=500,
                       help="Buffer radius in meters (default: 500)")
    parser.add_argument("--pillars", type=str, default=None,
                       help="Comma-separated pillar IDs to query (e.g., 'A,B,C')")
    parser.add_argument("--no-scores", action="store_true",
                       help="Exclude pillar scores from output")
    parser.add_argument("--no-raw", action="store_true",
                       help="Exclude raw values from output (scores only)")
    parser.add_argument("--output", "-o", type=str,
                       help="Output file path (JSON)")
    parser.add_argument("--project", type=str,
                       help="Google Cloud Project ID for Earth Engine")
    parser.add_argument("--quiet", "-q", action="store_true",
                       help="Suppress progress messages")

    args = parser.parse_args()

    # Validate coordinates
    if not -90 <= args.lat <= 90:
        print(f"Error: Latitude must be between -90 and 90, got {args.lat}")
        sys.exit(1)
    if not -180 <= args.lon <= 180:
        print(f"Error: Longitude must be between -180 and 180, got {args.lon}")
        sys.exit(1)

    # Parse pillars
    pillar_list = None
    if args.pillars:
        pillar_list = [p.strip().upper() for p in args.pillars.split(",")]
        valid_pillars = {"A", "B", "C", "D", "E"}
        invalid = set(pillar_list) - valid_pillars
        if invalid:
            print(f"Error: Invalid pillars: {invalid}. Must be A, B, C, D, or E")
            sys.exit(1)

    if not args.quiet:
        print(f"\nPlanetary Health Query")
        print(f"=" * 50)
        print(f"Location: {args.lat}, {args.lon}")
        print(f"Mode: {args.mode} ({10 if args.mode == 'simple' else 24} metrics)")
        print(f"Temporal: {args.temporal}")
        print(f"Buffer: {args.buffer}m")
        print(f"=" * 50)
        print(f"\nInitializing Earth Engine...")

    try:
        # Initialize engine
        engine = GEEQueryEngine(project_id=args.project)

        if not args.quiet:
            print(f"Querying satellite data...")
            start_time = datetime.now()

        # Run query
        result = engine.query(
            lat=args.lat,
            lon=args.lon,
            mode=args.mode,
            include_scores=not args.no_scores,
            include_raw=not args.no_raw,
            temporal=args.temporal,
            buffer_radius=args.buffer,
            pillars=pillar_list
        )

        if not args.quiet:
            elapsed = (datetime.now() - start_time).total_seconds()
            print(f"Query completed in {elapsed:.1f} seconds\n")

        # Output results
        if args.output:
            with open(args.output, "w") as f:
                json.dump(result, f, indent=2)
            if not args.quiet:
                print(f"Results saved to: {args.output}")
        else:
            # Print summary to console
            print_summary(result, args.quiet)

    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)


def print_summary(result: dict, quiet: bool = False):
    """Print a formatted summary of results."""

    summary = result.get("summary", {})

    print("\n" + "=" * 60)
    print("PLANETARY HEALTH SUMMARY")
    print("=" * 60)

    # Overall score
    overall = summary.get("overall_score")
    if overall is not None:
        bar = create_score_bar(overall)
        print(f"\nOverall Score: {overall}/100 {bar}")

    # Pillar scores
    pillar_scores = summary.get("pillar_scores", {})
    if pillar_scores:
        print("\nPillar Scores:")
        pillar_names = {
            "A": "Atmospheric",
            "B": "Biodiversity",
            "C": "Carbon",
            "D": "Degradation",
            "E": "Ecosystem"
        }
        for pid, score in sorted(pillar_scores.items()):
            name = pillar_names.get(pid, pid)
            bar = create_score_bar(score)
            print(f"  {pid} - {name:12}: {score:3}/100 {bar}")

    # Data completeness
    completeness = summary.get("data_completeness", 0)
    print(f"\nData Completeness: {completeness*100:.0f}%")

    # Quality flags
    flags = summary.get("quality_flags", [])
    if flags:
        print(f"\nQuality Issues: {', '.join(flags)}")

    # Key metrics
    print("\n" + "-" * 60)
    print("KEY METRICS:")
    print("-" * 60)

    for pillar_key, pillar_data in result.get("pillars", {}).items():
        metrics = pillar_data.get("metrics", {})
        pillar_name = pillar_data.get("pillar_name", pillar_key)
        print(f"\n{pillar_name}:")

        for metric_name, metric_data in metrics.items():
            value = metric_data.get("value")
            unit = metric_data.get("unit", "")
            quality = metric_data.get("quality", "")

            if value is not None:
                quality_symbol = {"good": "+", "moderate": "~", "poor": "!", "unavailable": "-"}.get(quality, "?")
                print(f"  [{quality_symbol}] {metric_name}: {value:.4g} {unit}")
            else:
                print(f"  [-] {metric_name}: N/A")

    print("\n" + "=" * 60)


def create_score_bar(score: int, width: int = 20) -> str:
    """Create a visual score bar."""
    if score is None:
        return "[" + "?" * width + "]"

    filled = int(score / 100 * width)
    empty = width - filled

    if score >= 80:
        char = "="
    elif score >= 60:
        char = "="
    elif score >= 40:
        char = "="
    else:
        char = "="

    return "[" + char * filled + "-" * empty + "]"


if __name__ == "__main__":
    main()
