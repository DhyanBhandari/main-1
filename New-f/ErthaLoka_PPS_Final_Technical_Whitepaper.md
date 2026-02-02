# ErthaLoka Planetary Performance System (PPS)
## Complete Technical Whitepaper

**Di-MRVM Framework for Natural Capital Assessment**

*Version 2.0 | December 2024*

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [PPS Framework Overview](#2-pps-framework-overview)
3. [ABCDE Pillar Definitions](#3-abcde-pillar-definitions)
4. [Mathematical Framework](#4-mathematical-framework)
5. [Complete Metric Parameters](#5-complete-metric-parameters)
6. [Normalization Methodology](#6-normalization-methodology)
7. [Scoring & Grading System](#7-scoring--grading-system)
8. [Ecosystem-Adaptive Weighting](#8-ecosystem-adaptive-weighting)
9. [Data Quality Score (DQS)](#9-data-quality-score-dqs)
10. [Economic Valuation](#10-economic-valuation)
11. [Data Sources](#11-data-sources)
12. [System Architecture](#12-system-architecture)
13. [Technology Stack](#13-technology-stack)
14. [API Specifications](#14-api-specifications)
15. [Sources & References](#15-sources--references)

---

# 1. Executive Summary

The **Planetary Performance System (PPS)** is ErthaLoka's flagship environmental intelligence platform, designed to provide standardized, quantifiable assessments of natural capital and ecosystem health at any location on Earth.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| **Real-time Assessment** | Query any coordinates for instant environmental analysis |
| **24 Environmental Indicators** | Comprehensive metrics across 5 pillars |
| **AAA-CCC Grading** | Credit rating-style scores for easy interpretation |
| **Economic Valuation** | Ecosystem Service Value (ESV) in USD/ha/year |
| **Carbon Quantification** | IPCC Tier 1 carbon credit estimation |
| **Data Quality Scoring** | Confidence-weighted quality assessment |

## Target Users

- **Development Finance Institutions (DFIs)**: ESG due diligence for project financing
- **Commercial Banks**: Nature-related risk assessment for lending portfolios
- **Corporations**: Natural capital accounting and sustainability reporting
- **Governments**: Land use planning and environmental monitoring
- **Conservation Organizations**: Biodiversity and ecosystem tracking

## Core Value Proposition

PPS transforms complex satellite data into actionable financial metrics, enabling:
- Nature-positive investment decisions
- Standardized environmental benchmarking
- Transparent, auditable ecosystem assessments
- Integration with existing ESG frameworks

---

# 2. PPS Framework Overview

## Di-MRVM: Digital Measure, Report, Verify, Monitor

PPS operates as a **Di-MRVM** (Digital Measurement, Reporting, Verification, and Monitoring) system, providing continuous environmental intelligence through satellite-derived data.

### Framework Components

| Component | Function | Output |
|-----------|----------|--------|
| **Measure** | Collect 24 environmental indicators via satellite | Raw metric values |
| **Report** | Normalize and aggregate into PPS score | AAA-CCC grade |
| **Verify** | Data Quality Score (DQS) assessment | Confidence level |
| **Monitor** | Track changes over time | Trend analysis |

## ABCDE + Q + R Framework

The PPS assessment framework consists of 5 core pillars plus 2 overlay dimensions:

### Core Pillars (ABCDE)

| Pillar | Name | Focus Area |
|--------|------|------------|
| **A** | Atmospheric Health | Air quality, aerosols, UV radiation |
| **B** | Biodiversity | Vegetation health, land cover, species habitat |
| **C** | Climate | Forest cover, biomass, carbon sequestration |
| **D** | Degradation Decrease | Soil health, water stress, drought resilience |
| **E** | Ecosystem Services | Human impact, ecosystem integrity |

### Overlay Dimensions

| Overlay | Name | Function |
|---------|------|----------|
| **Q** | Quality | Data Quality Score (DQS) for confidence assessment |
| **R** | Risk/Resilience | Temporal trends and vulnerability indicators |

---

# 3. ABCDE Pillar Definitions

## Pillar A: Atmospheric Health

**Purpose**: Assess air quality and atmospheric conditions affecting human and ecosystem health.

| Metric | Description | Unit | Source |
|--------|-------------|------|--------|
| Aerosol Optical Depth (AOD) | Atmospheric particle concentration | dimensionless | MODIS |
| Air Quality Index (AQI) | Combined air pollution measure | US EPA scale | MODIS/External |
| UV Index | Ultraviolet radiation intensity | index (0-11+) | MODIS |
| Visibility | Atmospheric clarity | km | Derived |
| Cloud Fraction | Cloud cover percentage | fraction (0-1) | MODIS |

**Interpretation**: Lower AOD and AQI values indicate cleaner air. UV Index uses sigmoid normalization for optimal mid-range values.

---

## Pillar B: Biodiversity

**Purpose**: Evaluate vegetation health, ecosystem diversity, and habitat quality.

| Metric | Description | Unit | Source |
|--------|-------------|------|--------|
| NDVI | Normalized Difference Vegetation Index | index (-1 to 1) | MODIS |
| EVI | Enhanced Vegetation Index | index (-1 to 1) | MODIS |
| LAI | Leaf Area Index | m²/m² | MODIS |
| FPAR | Fraction of Absorbed PAR | fraction (0-1) | MODIS |
| Land Cover | ESA WorldCover classification | class (10-100) | Sentinel-2 |

**Interpretation**: Higher NDVI/EVI indicates healthier, denser vegetation. NDVI > 0.6 typically represents dense forest or cropland.

---

## Pillar C: Climate

**Purpose**: Quantify carbon storage capacity and forest ecosystem health. Carbon metrics are key components of this pillar.

| Metric | Description | Unit | Source |
|--------|-------------|------|--------|
| Tree Cover | Percentage canopy cover | % (0-100) | Hansen GFC |
| Forest Loss | Cumulative loss since 2000 | % | Hansen GFC |
| Canopy Height | Average tree height | meters | GEDI/ETH |
| Biomass | Above-ground biomass density | Mg/ha | GEDI |
| Carbon Stock | Estimated carbon storage | Mg C/ha | Derived |

**Interpretation**: Higher tree cover and biomass indicate greater carbon sequestration capacity. Carbon stock is derived as 50% of biomass.

---

## Pillar D: Decrease in Land & Water Degradation

**Purpose**: Monitor soil health, water availability, and degradation indicators.

| Metric | Description | Unit | Source |
|--------|-------------|------|--------|
| Land Surface Temperature | Daytime surface temperature | °C | MODIS |
| Soil Moisture | Volumetric water content | m³/m³ | SMAP/ERA5 |
| Drought Index | Standardized drought measure | index (-3 to 3) | Derived |
| Evaporative Stress | Water-energy balance indicator | index (-2 to 2) | MODIS |
| Water Occurrence | Historical water presence | % (0-100) | JRC |

**Interpretation**: Optimal soil moisture around 30%. Drought index near zero indicates normal conditions; negative values indicate drought.

---

## Pillar E: Ecosystem Services

**Purpose**: Assess human impact and ecosystem service delivery capacity.

| Metric | Description | Unit | Source |
|--------|-------------|------|--------|
| Human Modification Index | Degree of anthropogenic change | index (0-1) | CSP |
| Population Density | People per unit area | people/km² | WorldPop |
| Nighttime Lights | Artificial light intensity | nW/cm²/sr | VIIRS |
| Elevation | Terrain altitude | meters | SRTM |
| Distance to Water | Proximity to water bodies | km | Derived |

**Interpretation**: Lower human modification indicates more pristine ecosystems. This pillar balances natural integrity against human presence.

---

# 4. Mathematical Framework

## 4.1 Overall PPS Score Calculation

The Planetary Performance Score is calculated as a weighted sum of normalized pillar scores:

```
PPS = W_A × S_A + W_B × S_B + W_C × S_C + W_D × S_D + W_E × S_E
```

**Where:**
- S_X = Normalized score for pillar X (0-100)
- W_X = Ecosystem-adaptive weight for pillar X
- ΣW = 1.0 (weights sum to 100%)

---

## 4.2 Pillar Score Calculation

Each pillar score is computed from its constituent metrics:

```
S_pillar = Σ(w_i × N_i) / Σw_i
```

**Where:**
- w_i = Weight assigned to metric i within the pillar
- N_i = Normalized value of metric i (0-100)
- Only metrics with valid data are included

---

## 4.3 PHI-ESV Multiplier

The ESV adjustment multiplier based on PPS score:

```
M_PHI = [(PPS − 50) / 100] × k × [1 + α × ln(PPS / 50)]
```

**Where:**
- PPS = Overall Planetary Performance Score (0-100)
- k = 0.6 (base sensitivity factor)
- α = 0.15 (logarithmic acceleration factor)

**Result Range:** -0.30 (PPS=0) to +0.36 (PPS=100)

---

## 4.4 Carbon Credit Calculation

Based on IPCC Tier 1 methodology:

```
Carbon Stock (Mg C/ha) = Biomass × 0.5

CO₂ Equivalent (tonnes) = Carbon Stock × Area (ha) × 3.67

Verified Credits = CO₂ Equivalent × Confidence Factor
```

**Where:**
- 0.5 = Carbon fraction of biomass
- 3.67 = Molecular weight ratio (CO₂/C = 44/12)
- Confidence Factor = DQS / 100

---

## 4.5 Data Quality Score (DQS)

Criticality-weighted data quality assessment:

```
DQS = [Σ(w_i × a_i × q_i) / Σw_i] × 100
```

**Where:**
- w_i = Criticality weight for metric i
- a_i = Availability (1 if present, 0 if missing)
- q_i = Quality factor (good=1.0, moderate=0.8, poor=0.5)

---

## 4.6 Polygon Land Parcel Calculation

PPS supports polygon-based queries for land parcel analysis using 4 corner points. This enables precise ESV and carbon credit calculations for specific land areas.

### 4.6.1 Input: Four Corner Points

A polygon query requires exactly 4 geographic coordinates defining the land parcel corners:

| Point | Position | Format |
|-------|----------|--------|
| Point 1 | Northwest (NW) | {lat: number, lng: number} |
| Point 2 | Northeast (NE) | {lat: number, lng: number} |
| Point 3 | Southeast (SE) | {lat: number, lng: number} |
| Point 4 | Southwest (SW) | {lat: number, lng: number} |

**Constraints:**
- Latitude: -90° to +90°
- Longitude: -180° to +180°
- Points should form a valid, non-self-intersecting polygon

---

### 4.6.2 Polygon Geometry Construction

**Step 1: Create Closed Polygon**

The 4 points are connected in order, with the first point repeated to close the polygon:

```
Polygon Coordinates = [P1, P2, P3, P4, P1]

Where each P = [longitude, latitude]  (GEE format)
```

**Step 2: Calculate Centroid**

The centroid serves as the reference point for the polygon:

```
Centroid_lat = (lat₁ + lat₂ + lat₃ + lat₄) / 4
Centroid_lng = (lng₁ + lng₂ + lng₃ + lng₄) / 4
```

---

### 4.6.3 Area Calculation

**Method: Geodesic Area via Earth Engine**

For accurate area calculation on Earth's curved surface:

```
Area (m²) = ee.Geometry.Polygon(coordinates).area().getInfo()
Area (hectares) = Area (m²) / 10,000
Area (acres) = Area (hectares) × 2.47105
```

**Approximate Method (Shoelace Formula)**

For quick estimation using planar approximation:

```
Area (degrees²) = |Σ(xᵢ × yᵢ₊₁ - xᵢ₊₁ × yᵢ)| / 2

Converting to hectares:
- Latitude scale: 111.32 km per degree
- Longitude scale: 111.32 × cos(avg_latitude) km per degree
- Area (km²) = Area (degrees²) × lat_scale × lng_scale
- Area (hectares) = Area (km²) × 100
```

---

### 4.6.4 Polygon Query Processing

**Step 1: Geometry Validation**
- Verify exactly 4 points provided
- Validate all coordinates within bounds
- Check polygon is non-self-intersecting

**Step 2: Satellite Data Extraction**
- Create Earth Engine polygon geometry
- Query all 5 pillars over the polygon region
- Use `reduceRegion` with mean reducer for spatial averaging

**Step 3: Metric Aggregation**
- Extract mean values for each metric within polygon
- Apply same normalization as point queries
- Calculate pillar scores using polygon-averaged values

**Step 4: Area-Based Calculations**
- Calculate total area in hectares
- Compute ESV based on area and ecosystem type
- Estimate carbon credits using biomass and area

---

### 4.6.5 ESV Calculation for Polygon

```
Total Annual ESV = Adjusted ESV per hectare × Area (hectares)

Where:
- Adjusted ESV = Base ESV × (1 + M_PHI)
- Base ESV = Ecosystem-specific value ($/ha/year)
- M_PHI = PPS-based multiplier
```

**Projection Calculations:**

```
10-Year ESV = Σ (Annual ESV × 1.02^i) for i = 0 to 9
30-Year ESV = Σ (Annual ESV × 1.02^i) for i = 0 to 29

Where 1.02 = 2% annual appreciation factor
```

---

### 4.6.6 Carbon Credits for Polygon

```
Total Carbon Stock (Mg C) = Carbon Stock (Mg C/ha) × Area (hectares)

Total CO₂ Equivalent = Total Carbon Stock × 3.67

Verified Credits = Total CO₂ × Confidence Factor

Confidence Factor = DQS / 100
```

**Value Estimation:**

```
Low Value  = Verified Credits × $15/tonne
Mid Value  = Verified Credits × $25/tonne
High Value = Verified Credits × $50/tonne
```

---

### 4.6.7 Polygon Query Response Structure

| Field | Description |
|-------|-------------|
| geometry.type | "Polygon" |
| geometry.points | Array of 4 input points |
| geometry.centroid | Calculated center point |
| geometry.area_m2 | Area in square meters |
| geometry.area_ha | Area in hectares |
| geometry.area_acres | Area in acres |
| carbon_credits.co2_equivalent_tonnes | Total CO₂ equivalent |
| carbon_credits.verified_co2_tonnes | DQS-adjusted credits |
| carbon_credits.estimated_value | Low/mid/high USD values |
| ecosystem_service_value.total_annual_esv_usd | Annual ESV for parcel |
| ecosystem_service_value.projections | 10-year and 30-year values |

---

### 4.6.8 Example: 100-Hectare Forest Parcel

**Input Points:**
| Point | Latitude | Longitude |
|-------|----------|-----------|
| NW | 28.6200 | 77.2000 |
| NE | 28.6200 | 77.2200 |
| SE | 28.6000 | 77.2200 |
| SW | 28.6000 | 77.2000 |

**Calculated Results:**

| Parameter | Value |
|-----------|-------|
| Area | 100 hectares |
| Ecosystem Type | Tropical Forest |
| PPS Score | 72 (Grade AA) |
| DQS | 85% |
| Biomass | 200 Mg/ha |
| Carbon Stock | 100 Mg C/ha |
| Total Carbon | 10,000 Mg C |
| CO₂ Equivalent | 36,700 tonnes |
| Verified Credits | 31,195 tonnes |
| Carbon Value (Mid) | $779,875 |
| Base ESV | $5,382/ha/year |
| PPS Multiplier | +0.15 |
| Adjusted ESV | $6,189/ha/year |
| Total Annual ESV | $618,900/year |
| 10-Year ESV | $6,783,542 |
| 30-Year ESV | $25,043,789 |

---

# 5. Complete Metric Parameters

## 5.1 Category A: Atmospheric Health

| Metric | v_min | v_max | v_mid/v_opt | Normalization | Weight | Criticality |
|--------|-------|-------|-------------|---------------|--------|-------------|
| aod | 0.0 | 1.5 | - | Inverse Linear | 0.40 | Important |
| aqi | 0 | 300 | - | Inverse Linear | 0.40 | Important |
| uv_index | 0 | 11 | 5.5 | Sigmoid (k=0.5) | 0.10 | Auxiliary |
| visibility | 1 | 50 | - | Linear | 0.10 | Auxiliary |
| cloud_fraction | 0.0 | 1.0 | - | Inverse Linear | 0.00 | Auxiliary |

---

## 5.2 Category B: Biodiversity

| Metric | v_min | v_max | v_mid/v_opt | Normalization | Weight | Criticality |
|--------|-------|-------|-------------|---------------|--------|-------------|
| ndvi | -0.1 | 0.9 | - | Linear | 0.35 | **Critical** |
| evi | 0.0 | 1.0 | - | Linear | 0.35 | Important |
| lai | 0.0 | 7.0 | 3.5 | Sigmoid (k=0.5) | 0.15 | Supporting |
| fpar | 0.0 | 0.95 | - | Linear | 0.15 | Supporting |
| land_cover | 10 | 100 | - | Linear | 0.00 | Auxiliary |

---

## 5.3 Category C: Climate

| Metric | v_min | v_max | v_mid/v_opt | Normalization | Weight | Criticality |
|--------|-------|-------|-------------|---------------|--------|-------------|
| tree_cover | 0 | 100 | - | Linear | 0.35 | **Critical** |
| biomass | 0 | 400 | 200 | Sigmoid (k=0.5) | 0.35 | Important |
| canopy_height | 0 | 40 | 20 | Sigmoid (k=0.5) | 0.15 | Important |
| forest_loss | 0 | 10 | - | Inverse Linear | 0.15 | Supporting |
| carbon_stock | 0 | 200 | 100 | Sigmoid (k=0.5) | 0.00 | Important |

---

## 5.4 Category D: Degradation Decrease

| Metric | v_min | v_max | v_opt/sigma | Normalization | Weight | Criticality |
|--------|-------|-------|-------------|---------------|--------|-------------|
| soil_moisture | 0.05 | 0.45 | 0.30 (σ=0.12) | Gaussian | 0.35 | **Critical** |
| drought_index | -2.0 | 2.0 | 0 | Centered | 0.35 | Important |
| lst | 15 | 45 | 25 (σ=8) | Gaussian | 0.15 | Supporting |
| evaporative_stress | -1.0 | 1.0 | 0 | Centered | 0.15 | Supporting |
| water_occurrence | 0 | 100 | - | Linear | 0.00 | Auxiliary |

---

## 5.5 Category E: Ecosystem Services

| Metric | v_min | v_max | v_mid/k | Normalization | Weight | Criticality |
|--------|-------|-------|---------|---------------|--------|-------------|
| human_modification | 0.0 | 1.0 | - | Inverse Linear | 0.50 | **Critical** |
| population | 0 | 5000 | 500 | Inv. Sigmoid (k=0.3) | 0.17 | Supporting |
| nightlights | 0 | 63 | 20 | Inv. Sigmoid (k=0.3) | 0.17 | Supporting |
| distance_to_water | 0 | 50 | - | Inverse Linear | 0.16 | Auxiliary |
| elevation | 0 | 5000 | - | Linear | 0.00 | Auxiliary |

---

# 6. Normalization Methodology

## 6.1 Normalization Function Types

PPS uses 6 distinct normalization functions to transform raw metric values into standardized 0-100 scores:

### Linear Normalization
**Use Case**: Metrics where higher values are always better (e.g., NDVI, tree cover)

```
Score = [(Value − v_min) / (v_max − v_min)] × 100
```

**Metrics**: ndvi, evi, fpar, tree_cover, visibility, water_occurrence

---

### Inverse Linear Normalization
**Use Case**: Metrics where lower values are better (e.g., pollution, degradation)

```
Score = [1 − (Value − v_min) / (v_max − v_min)] × 100
```

**Metrics**: aod, aqi, forest_loss, human_modification, distance_to_water

---

### Sigmoid Normalization
**Use Case**: Metrics with diminishing returns at high values

```
Score = [1 / (1 + e^(−k × (x − x_mid) × 10))] × 100

Where: x = (Value − v_min) / (v_max − v_min)
       x_mid = (v_mid − v_min) / (v_max − v_min)
```

**Metrics**: uv_index, lai, biomass, canopy_height, carbon_stock

---

### Inverse Sigmoid Normalization
**Use Case**: Metrics where lower values are better with saturation effects

```
Score = [1 / (1 + e^(k × (x − x_mid) × 10))] × 100
```

**Metrics**: population, nightlights

---

### Gaussian Normalization
**Use Case**: Metrics with an optimal value (not at extremes)

```
Score = e^[−0.5 × ((Value − v_opt) / σ)²] × 100
```

**Metrics**: lst (optimal ~25°C), soil_moisture (optimal ~0.30)

---

### Centered Normalization
**Use Case**: Metrics where zero is optimal (deviation in either direction is negative)

```
Score = [1 − |Value| / max(|v_min|, |v_max|)] × 100
```

**Metrics**: drought_index, evaporative_stress

---

## 6.2 Normalization Selection Guide

| Condition | Normalization Type |
|-----------|-------------------|
| Higher is always better | Linear |
| Lower is always better | Inverse Linear |
| Optimal at specific value | Gaussian |
| Optimal at zero | Centered |
| Higher better with saturation | Sigmoid |
| Lower better with saturation | Inverse Sigmoid |

---

# 7. Scoring & Grading System

## 7.1 AAA-CCC Grading Scale

PPS uses a credit rating-style grading system for intuitive interpretation:

| Grade | Score Range | Interpretation | Color Code |
|-------|-------------|----------------|------------|
| **AAA** | 86 - 100 | Excellent | #22c55e (Green) |
| **AA** | 72 - 85 | Very Good | #4ade80 (Light Green) |
| **A** | 58 - 71 | Good | #84cc16 (Lime) |
| **BBB** | 44 - 57 | Above Average | #facc15 (Yellow) |
| **BB** | 30 - 43 | Average | #f59e0b (Amber) |
| **B** | 16 - 29 | Below Average | #f97316 (Orange) |
| **CCC** | 0 - 15 | Poor | #ef4444 (Red) |

---

## 7.2 Grade Interpretation Guide

| Grade | Ecosystem Status | Investment Implication |
|-------|-----------------|----------------------|
| **AAA** | Pristine, high-functioning ecosystem | Premium natural capital asset |
| **AA** | Healthy ecosystem with minor pressures | Strong investment candidate |
| **A** | Good condition, some management needed | Positive outlook |
| **BBB** | Moderate health, improvement potential | Investment grade threshold |
| **BB** | Average condition, notable pressures | Requires due diligence |
| **B** | Degraded, significant intervention needed | High-risk, high-reward potential |
| **CCC** | Severely degraded ecosystem | Restoration project candidate |

---

## 7.3 Comparison with Financial Ratings

| PPS Grade | Equivalent Credit Rating | Risk Level |
|-----------|-------------------------|------------|
| AAA | S&P AAA / Moody's Aaa | Minimal |
| AA | S&P AA / Moody's Aa | Very Low |
| A | S&P A / Moody's A | Low |
| BBB | S&P BBB / Moody's Baa | Moderate |
| BB | S&P BB / Moody's Ba | Elevated |
| B | S&P B / Moody's B | High |
| CCC | S&P CCC / Moody's Caa | Very High |

---

# 8. Ecosystem-Adaptive Weighting

## 8.1 Weight Distribution by Ecosystem Type

PPS automatically detects ecosystem type from land cover and adjusts pillar weights accordingly:

| Ecosystem Type | A (Atm) | B (Bio) | C (Carbon) | D (Degrad) | E (Eco) | Priority Focus |
|----------------|---------|---------|------------|------------|---------|----------------|
| **Tropical Forest** | 0.10 | 0.25 | **0.35** | 0.15 | 0.15 | Carbon storage |
| **Mangrove** | 0.10 | 0.20 | **0.30** | **0.25** | 0.15 | Carbon + water |
| **Grassland/Savanna** | 0.15 | **0.30** | 0.15 | **0.25** | 0.15 | Biodiversity |
| **Wetland** | 0.10 | 0.25 | 0.20 | **0.30** | 0.15 | Water conditions |
| **Agricultural** | 0.20 | 0.25 | 0.10 | 0.25 | 0.20 | Balanced |
| **Urban Green** | **0.30** | 0.25 | 0.10 | 0.15 | 0.20 | Air quality |
| **Default/Mixed** | 0.20 | 0.20 | 0.20 | 0.20 | 0.20 | Equal weights |

---

## 8.2 Land Cover to Ecosystem Mapping

| WorldCover Class | Code | Ecosystem Type Assigned |
|-----------------|------|------------------------|
| Tree cover | 10 | Tropical Forest |
| Shrubland | 20 | Grassland/Savanna |
| Grassland | 30 | Grassland/Savanna |
| Cropland | 40 | Agricultural |
| Built-up | 50 | Urban Green |
| Bare/sparse vegetation | 60 | Default |
| Snow and ice | 70 | Default |
| Permanent water | 80 | Wetland |
| Herbaceous wetland | 90 | Wetland |
| Mangroves | 95 | Mangrove |
| Moss and lichen | 100 | Default |

---

## 8.3 Rationale for Adaptive Weighting

| Ecosystem | Weight Emphasis | Scientific Rationale |
|-----------|----------------|---------------------|
| Tropical Forest | Carbon (35%) | Highest carbon density ecosystems globally |
| Mangrove | Carbon + Degradation | Blue carbon + coastal vulnerability |
| Grassland | Biodiversity + Degradation | Species richness + fire/grazing pressure |
| Wetland | Degradation (30%) | Water-dependent, drought-sensitive |
| Agricultural | Balanced | Multiple ecosystem services provided |
| Urban Green | Atmospheric (30%) | Air quality critical for human health |

---

# 9. Data Quality Score (DQS)

## 9.1 Criticality Weights

Metrics are assigned criticality levels that determine their weight in DQS calculation:

| Criticality Level | Weight | Metrics Included |
|-------------------|--------|------------------|
| **Critical** | 1.0 | ndvi, tree_cover, soil_moisture, human_modification |
| **Important** | 0.7 | aod, aqi, evi, biomass, canopy_height, drought_index, carbon_stock |
| **Supporting** | 0.4 | lai, fpar, forest_loss, lst, population, nightlights, evaporative_stress |
| **Auxiliary** | 0.2 | uv_index, visibility, cloud_fraction, land_cover, water_occurrence, elevation, distance_to_water |

---

## 9.2 Quality Factor Adjustments

| Data Quality | Factor | Condition |
|--------------|--------|-----------|
| Good | 1.0 | Fresh data, high resolution, no artifacts |
| Moderate | 0.8 | Slightly dated or lower resolution |
| Poor | 0.5 | Significant gaps or quality issues |
| Unavailable | 0.0 | No data available |

---

## 9.3 DQS Threshold Interpretation

| DQS Range | Level | Recommendation |
|-----------|-------|----------------|
| 85 - 100 | High Confidence | Suitable for all applications |
| 70 - 84 | Investment Grade | Acceptable for financial decisions |
| 50 - 69 | Acceptable | Consider supplementing with ground data |
| 40 - 49 | Marginal | Interpret with caution |
| 0 - 39 | Low Confidence | Insufficient for decision-making |

---

## 9.4 Missing Critical Metrics Impact

If critical metrics are unavailable, DQS is significantly impacted:

| Missing Critical Metric | DQS Impact |
|------------------------|------------|
| NDVI | -25 points approx. |
| Tree Cover | -25 points approx. |
| Soil Moisture | -25 points approx. |
| Human Modification | -25 points approx. |
| All 4 critical metrics | DQS ≈ 30-40 |

---

# 10. Economic Valuation

## 10.1 Ecosystem Service Value (ESV)

### Base ESV by Ecosystem Type

| Ecosystem Type | Base ESV ($/ha/year) | Primary Services |
|----------------|---------------------|------------------|
| Wetland | $25,682 | Water regulation, habitat, nutrient cycling |
| Mangrove | $9,990 | Coastal protection, carbon, nursery habitat |
| Tropical Forest | $5,382 | Carbon sequestration, biodiversity, water |
| Urban Green | $3,212 | Air quality, recreation, temperature regulation |
| Grassland/Savanna | $2,871 | Grazing, carbon, biodiversity |
| Agricultural | $1,532 | Food provisioning, pollination |
| Default/Mixed | $3,000 | Global average |

*Source: Costanza et al. (2014), de Groot et al. (2012)*

---

### ESV Adjustment Formula

```
Adjusted ESV = Base ESV × (1 + M_PHI)

Where M_PHI = [(PPS − 50) / 100] × 0.6 × [1 + 0.15 × ln(PPS / 50)]
```

### ESV Multiplier Examples

| PPS Score | Grade | Multiplier | Effect on ESV |
|-----------|-------|------------|---------------|
| 90 | AAA | +0.29 | +29% premium |
| 75 | AA | +0.18 | +18% premium |
| 60 | A | +0.07 | +7% premium |
| 50 | BBB | 0.00 | Baseline |
| 40 | BB | -0.07 | -7% discount |
| 25 | B | -0.18 | -18% discount |
| 10 | CCC | -0.30 | -30% discount |

---

### ESV Service Breakdown

| Service Category | Allocation | Examples |
|-----------------|------------|----------|
| Provisioning | 20% | Food, water, timber, fiber |
| Regulating | 35% | Climate, flood control, pollination |
| Cultural | 15% | Recreation, aesthetic, spiritual |
| Supporting | 30% | Nutrient cycling, soil formation |

---

## 10.2 Carbon Credit Valuation

### Calculation Methodology

**Step 1: Carbon Stock Estimation**
```
Carbon Stock (Mg C/ha) = Above-ground Biomass × 0.5
```

**Step 2: Total Carbon**
```
Total Carbon (Mg C) = Carbon Stock × Area (hectares)
```

**Step 3: CO₂ Equivalent**
```
CO₂ Equivalent (tonnes) = Total Carbon × 3.67
```

**Step 4: Verified Credits**
```
Verified Credits = CO₂ Equivalent × (DQS / 100)
```

---

### Carbon Price Scenarios

| Price Scenario | $/tonne CO₂ | Market Reference |
|----------------|-------------|------------------|
| Low | $15 | Voluntary market floor |
| Mid | $25 | Average voluntary credit |
| High | $50 | Premium/Compliance markets |

---

### Example Calculation

For a 100-hectare tropical forest with:
- Biomass: 250 Mg/ha
- DQS: 80%

| Step | Calculation | Result |
|------|-------------|--------|
| Carbon Stock | 250 × 0.5 | 125 Mg C/ha |
| Total Carbon | 125 × 100 | 12,500 Mg C |
| CO₂ Equivalent | 12,500 × 3.67 | 45,875 tonnes CO₂ |
| Verified Credits | 45,875 × 0.80 | 36,700 tCO₂ |
| Value (Mid) | 36,700 × $25 | **$917,500** |

---

# 11. Data Sources

## 11.1 Primary Satellite Constellations

| Constellation | Agency | Sensors | Resolution | Revisit | Primary Use |
|--------------|--------|---------|------------|---------|-------------|
| **MODIS** | NASA | Terra/Aqua | 250m-1km | Daily | Vegetation, atmosphere, temperature |
| **Sentinel-2** | ESA | MSI | 10-60m | 5 days | High-res optical, land cover |
| **Landsat 8/9** | USGS | OLI/TIRS | 30m | 16 days | Historical analysis, thermal |
| **GEDI** | NASA | LiDAR | 25m | - | Canopy height, biomass |
| **SMAP** | NASA | Radar | 9km | 2-3 days | Soil moisture |
| **VIIRS** | NOAA | DNB | 500m | Daily | Nighttime lights |

---

## 11.2 Derived Products

| Product | Provider | Resolution | Update | Metrics Derived |
|---------|----------|------------|--------|-----------------|
| Hansen Global Forest Change | U. Maryland | 30m | Annual | Tree cover, forest loss |
| ESA WorldCover | ESA | 10m | Annual | Land cover classification |
| Global Human Modification | CSP | 1km | Static | Human modification index |
| JRC Global Surface Water | JRC | 30m | Monthly | Water occurrence |
| WorldPop | U. Southampton | 100m | Annual | Population density |
| SRTM DEM | NASA/NGA | 30m | Static | Elevation |

---

## 11.3 External APIs (Supplementary Data)

| API | Provider | Data Type | Update Frequency |
|-----|----------|-----------|------------------|
| Open-Meteo | Open-Meteo | Weather, soil moisture | Hourly |
| OpenAQ | OpenAQ | Air quality (ground stations) | Real-time |

---

## 11.4 Complete GEE Dataset Catalog

| Dataset ID | Metrics | Scale | Temporal |
|------------|---------|-------|----------|
| MODIS/061/MCD19A2_GRANULES | AOD | 1km | Daily |
| MODIS/061/MOD13A2 | NDVI, EVI | 1km | 16-day |
| MODIS/061/MOD15A2H | LAI, FPAR | 500m | 8-day |
| MODIS/061/MOD11A2 | LST | 1km | 8-day |
| MODIS/061/MOD16A2 | ET, PET | 500m | 8-day |
| ESA/WorldCover/v200 | Land Cover | 10m | Annual |
| UMD/hansen/global_forest_change_2023_v1_11 | Tree Cover, Loss | 30m | Annual |
| LARSE/GEDI/GEDI04_A_002_MONTHLY | Biomass | 1km | Monthly |
| NASA/SMAP/SPL4SMGP/007 | Soil Moisture | 11km | 3-hourly |
| CSP/HM/GlobalHumanModification | HMI | 1km | Static |
| WorldPop/GP/100m/pop_age_sex_cons_unadj | Population | 100m | Annual |
| NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG | Nightlights | 500m | Monthly |
| JRC/GSW1_4/GlobalSurfaceWater | Water | 30m | Static |
| USGS/SRTMGL1_003 | Elevation | 30m | Static |

---

# 12. System Architecture

## 12.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│   Web Application (React) + Mobile (Future)                 │
│   - Interactive Maps    - Report Generation                 │
│   - Data Visualization  - User Authentication               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                        REST API (HTTPS)
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                    API GATEWAY LAYER                        │
│   FastAPI Server                                            │
│   - Query Orchestration  - Request Validation               │
│   - Rate Limiting        - CORS Management                  │
└─────────────────────────────┬───────────────────────────────┘
                              │
      ┌───────────┬───────────┼───────────┬───────────┐
      ▼           ▼           ▼           ▼           ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Pillar A │ │Pillar B │ │Pillar C │ │Pillar D │ │Pillar E │
│ Atmos.  │ │ Biodiv. │ │ Carbon  │ │ Degrad. │ │ Ecosys. │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     └───────────┴───────────┼───────────┴───────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                 DATA PROCESSING LAYER                       │
│   - Normalization Engine  - Scoring Aggregation             │
│   - DQS Calculation       - ESV/Carbon Computation          │
└─────────────────────────────┬───────────────────────────────┘
                              │
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Google Earth  │   │  External APIs  │   │  IoT Sensors    │
│ Engine        │   │  (Weather, AQI) │   │  (Real-time)    │
│ 50+ PB Data   │   │                 │   │                 │
└───────────────┘   └─────────────────┘   └─────────────────┘
```

---

## 12.2 Query Processing Flow

| Step | Process | Duration |
|------|---------|----------|
| 1 | Request validation | <100ms |
| 2 | Geometry creation | <100ms |
| 3 | Parallel pillar queries (5) | 10-25s |
| 4 | Metric extraction & normalization | <500ms |
| 5 | Score aggregation | <100ms |
| 6 | DQS calculation | <100ms |
| 7 | ESV/Carbon computation | <100ms |
| 8 | Response assembly | <100ms |
| **Total** | **End-to-end** | **12-30s** |

---

## 12.3 Query Modes

| Mode | Metrics Queried | Typical Duration | Use Case |
|------|-----------------|------------------|----------|
| Simple | 10 core metrics | 8-15 seconds | Quick assessment |
| Comprehensive | 24 full metrics | 20-35 seconds | Detailed analysis |

---

# 13. Technology Stack

## 13.1 Frontend Technologies

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | React 18 | User interface |
| Language | TypeScript 5 | Type safety |
| Build Tool | Vite | Fast development |
| Styling | TailwindCSS | Utility-first CSS |
| State Management | TanStack Query | Server state |
| Maps | Leaflet + React-Leaflet | Interactive mapping |
| Charts | Recharts + Chart.js | Data visualization |
| UI Components | Radix UI + shadcn/ui | Accessible components |
| Forms | React Hook Form + Zod | Validation |
| PDF Export | jsPDF + html2canvas | Report generation |

---

## 13.2 Backend Technologies

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | FastAPI | REST API |
| Language | Python 3.10+ | Server logic |
| Satellite Data | Google Earth Engine API | Geospatial processing |
| Validation | Pydantic | Request/response models |
| Data Processing | Pandas + NumPy | Numerical operations |
| Geospatial | GeoPandas + Shapely | Geometry handling |
| HTTP Client | aiohttp | Async API calls |
| Database | Supabase (PostgreSQL) | Persistent storage |
| Real-time DB | Firebase Firestore | Sensor data |
| Authentication | Firebase Auth | User management |

---

## 13.3 Infrastructure

| Component | Service | Purpose |
|-----------|---------|---------|
| Frontend Hosting | Vercel / Netlify | Static deployment |
| Backend Hosting | Cloud Run / Railway | Container deployment |
| Database | Supabase | PostgreSQL + Auth |
| Satellite Processing | Google Earth Engine | Cloud computing |
| CDN | CloudFlare | Content delivery |
| Monitoring | Cloud Logging | Observability |

---

# 14. API Specifications

## 14.1 REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/query` | Point-based PPS query | Optional |
| POST | `/api/query/polygon` | Polygon-based query with ESV & Carbon | Optional |
| GET | `/api/health` | API health check | No |
| GET | `/api/datasets` | Available metrics list | No |
| GET | `/api/imagery` | Satellite imagery tiles | No |
| POST | `/api/pdf` | Generate PDF report | Yes |
| GET | `/api/history` | User query history | Yes |
| GET | `/api/external/weather` | Weather forecast | No |
| GET | `/api/external/air-quality` | Real-time AQI | No |
| GET | `/api/external/soil` | Soil moisture data | No |

---

## 14.2 Point Query Request

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| latitude | float | Yes | Latitude (-90 to 90) |
| longitude | float | Yes | Longitude (-180 to 180) |
| mode | string | No | "simple" or "comprehensive" (default) |
| temporal | string | No | "latest", "monthly", "annual" |
| buffer_radius | int | No | Buffer in meters (100-10000, default 500) |
| pillars | array | No | Specific pillars ["A","B","C","D","E"] |

---

## 14.3 Polygon Query Request

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| points | array | Yes | 4 corner points [{lat, lng}, ...] |
| mode | string | No | "simple" or "comprehensive" |
| include_scores | bool | No | Include ESV and carbon (default true) |

---

## 14.4 Response Structure

| Field | Type | Description |
|-------|------|-------------|
| query | object | Query metadata (coordinates, timestamp, mode) |
| pillars | object | Per-pillar data with metrics and scores |
| summary | object | Aggregated scores, DQS, ESV multiplier |
| time_series | object | Temporal mode information |

---

## 14.5 Summary Response Fields

| Field | Type | Description |
|-------|------|-------------|
| overall_score | int | PPS score (0-100) |
| overall_interpretation | string | Grade (AAA-CCC) |
| pillar_scores | object | Individual pillar scores |
| ecosystem_type | string | Detected ecosystem |
| ecosystem_weights | object | Applied pillar weights |
| data_quality_score | float | DQS (0-100) |
| data_completeness | float | Percentage of available metrics |
| missing_critical_metrics | array | List of missing critical metrics |
| esv_multiplier | float | PHI-ESV adjustment factor |

---

# 15. Sources & References

## 15.1 Scientific Literature

### Ecosystem Service Valuation

1. **Costanza, R., de Groot, R., Sutton, P., et al. (2014)**
   - "Changes in the global value of ecosystem services"
   - *Global Environmental Change*, 26, 152-158
   - DOI: 10.1016/j.gloenvcha.2014.04.002

2. **de Groot, R., Brander, L., van der Ploeg, S., et al. (2012)**
   - "Global estimates of the value of ecosystems and their services in monetary units"
   - *Ecosystem Services*, 1(1), 50-61
   - DOI: 10.1016/j.ecoser.2012.07.005

3. **TEEB (2010)**
   - "The Economics of Ecosystems and Biodiversity: Mainstreaming the Economics of Nature"
   - UNEP, Geneva

### Forest & Carbon

4. **Hansen, M.C., Potapov, P.V., Moore, R., et al. (2013)**
   - "High-Resolution Global Maps of 21st-Century Forest Cover Change"
   - *Science*, 342(6160), 850-853
   - DOI: 10.1126/science.1244693

5. **IPCC (2019)**
   - "2019 Refinement to the 2006 IPCC Guidelines for National Greenhouse Gas Inventories"
   - Intergovernmental Panel on Climate Change

6. **Dubayah, R., et al. (2020)**
   - "The Global Ecosystem Dynamics Investigation: High-resolution laser ranging of the Earth's forests and topography"
   - *Science of Remote Sensing*, 1, 100002

### Remote Sensing

7. **Vermote, E. (2015)**
   - "MOD09A1 MODIS/Terra Surface Reflectance 8-Day L3 Global 500m SIN Grid V006"
   - NASA EOSDIS Land Processes DAAC
   - DOI: 10.5067/MODIS/MOD09A1.006

8. **Drusch, M., Del Bello, U., Carlier, S., et al. (2012)**
   - "Sentinel-2: ESA's Optical High-Resolution Mission for GMES Operational Services"
   - *Remote Sensing of Environment*, 120, 25-36

9. **Farr, T.G., et al. (2007)**
   - "The Shuttle Radar Topography Mission"
   - *Reviews of Geophysics*, 45(2)

---

## 15.2 Data Source Documentation

| Source | Documentation URL |
|--------|-------------------|
| Google Earth Engine | developers.google.com/earth-engine |
| MODIS Products | modis.gsfc.nasa.gov |
| Sentinel-2 | sentinel.esa.int/web/sentinel/missions/sentinel-2 |
| Hansen GFC | earthenginepartners.appspot.com/science-2013-global-forest |
| ESA WorldCover | esa-worldcover.org |
| GEDI | gedi.umd.edu |

---

## 15.3 Standards & Frameworks

| Standard | Organization | Application |
|----------|--------------|-------------|
| US AQI | US EPA | Air Quality Index scale |
| IPCC Tier 1 | IPCC | Carbon accounting methodology |
| Verra VCS | Verra | Verified Carbon Standard |
| Gold Standard | Gold Standard | Premium carbon credits |
| TNFD | TNFD | Nature-related financial disclosures |
| SBTN | SBTN | Science-based targets for nature |

---

## 15.4 Technology Documentation

| Technology | Documentation |
|------------|---------------|
| FastAPI | fastapi.tiangolo.com |
| React | react.dev |
| TypeScript | typescriptlang.org |
| TailwindCSS | tailwindcss.com |
| Supabase | supabase.com/docs |
| Firebase | firebase.google.com/docs |
| Open-Meteo | open-meteo.com/en/docs |
| OpenAQ | docs.openaq.org |

---

# Appendix: Quick Reference Cards

## A. Normalization Quick Reference

| Function | Formula | Use When |
|----------|---------|----------|
| Linear | (v - min) / (max - min) | Higher = better |
| Inverse Linear | 1 - (v - min) / (max - min) | Lower = better |
| Sigmoid | 1 / (1 + e^-x) | Diminishing returns |
| Gaussian | e^(-0.5 × z²) | Optimal at specific value |
| Centered | 1 - \|v\| / max | Optimal at zero |

---

## B. Grade Quick Reference

| Grade | Range | Meaning |
|-------|-------|---------|
| AAA | 86-100 | Excellent |
| AA | 72-85 | Very Good |
| A | 58-71 | Good |
| BBB | 44-57 | Above Average |
| BB | 30-43 | Average |
| B | 16-29 | Below Average |
| CCC | 0-15 | Poor |

---

## C. ESV Quick Reference

| Ecosystem | Base ESV ($/ha/yr) |
|-----------|-------------------|
| Wetland | $25,682 |
| Mangrove | $9,990 |
| Tropical Forest | $5,382 |
| Urban Green | $3,212 |
| Grassland | $2,871 |
| Agricultural | $1,532 |

---

## D. Critical Metrics Quick Reference

| Criticality | Weight | Metrics |
|-------------|--------|---------|
| Critical (1.0) | Highest | NDVI, Tree Cover, Soil Moisture, Human Modification |
| Important (0.7) | High | AOD, AQI, EVI, Biomass, Drought Index |
| Supporting (0.4) | Medium | LAI, FPAR, LST, Population |
| Auxiliary (0.2) | Low | UV, Elevation, Cloud Cover |

---

*Document Version: 2.0*
*Published: December 2024*
*ErthaLoka Technologies*

**Contact**: info@erthaloka.com
**Website**: www.erthaloka.com

---

*This technical whitepaper is intended for institutional investors, development finance institutions, corporate sustainability teams, and environmental professionals seeking to understand the technical foundations of the ErthaLoka Planetary Performance System.*
