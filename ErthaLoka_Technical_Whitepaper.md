# ErthaLoka Technical Whitepaper

## Planetary Health Index (PHI): A Comprehensive Framework for Ecosystem Health Assessment, Carbon Credit Quantification, and Ecosystem Service Valuation

**Version 1.0**
**December 2025**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Introduction](#introduction)
3. [The Planetary Health Index (PHI)](#the-planetary-health-index-phi)
4. [ABCDE Framework](#abcde-framework)
5. [Data Acquisition Architecture](#data-acquisition-architecture)
6. [Mathematical Foundations](#mathematical-foundations)
7. [Machine Learning Models](#machine-learning-models)
8. [Carbon Credit Methodology](#carbon-credit-methodology)
9. [Ecosystem Service Valuation](#ecosystem-service-valuation)
10. [Data Quality and Uncertainty](#data-quality-and-uncertainty)
11. [Validation Framework](#validation-framework)
12. [Technical Implementation](#technical-implementation)
13. [Conclusion](#conclusion)
14. [References](#references)

---

## Executive Summary

ErthaLoka presents a revolutionary natural capital platform that quantifies ecosystem health through the **Planetary Health Index (PHI)**—a scientifically rigorous, composite score ranging from 0 to 100. This whitepaper details the technical architecture, mathematical foundations, and methodological framework that powers ErthaLoka's ecosystem assessment capabilities.

The platform integrates three primary data sources:
- **Satellite Remote Sensing**: Multi-spectral imagery from Sentinel-2, Landsat, MODIS, and GEDI LiDAR
- **IoT Sensor Networks**: Ground-truth measurements of CO₂, temperature, humidity, and soil conditions
- **Machine Learning Models**: XGBoost and Random Forest algorithms for biomass estimation and gap-filling

Key capabilities include:
- Real-time ecosystem health monitoring via the ABCDE framework
- VCS-compliant carbon credit quantification
- TEEB-based ecosystem service valuation
- Uncertainty quantification with 95% confidence intervals

---

## Introduction

### The Challenge of Ecosystem Quantification

Traditional approaches to environmental assessment suffer from fragmented methodologies, inconsistent metrics, and lack of transparency. Stakeholders—from conservation organizations to carbon credit buyers—require standardized, scientifically defensible metrics that accurately reflect ecosystem conditions.

### ErthaLoka's Solution

ErthaLoka addresses these challenges through:

1. **Unified Scoring System**: The PHI provides a single, interpretable metric for ecosystem health
2. **Multi-Source Data Fusion**: Combining satellite, IoT, and ML-derived data for comprehensive coverage
3. **Transparent Methodology**: Open, peer-reviewable algorithms based on established ecological science
4. **Monetization Pathways**: Direct linkage to carbon credits and ecosystem service valuations

### Theoretical Foundations

The PHI methodology builds upon established composite index frameworks:

| Index | Focus | Key Innovation |
|-------|-------|----------------|
| Ocean Health Index (OHI) | Marine ecosystems | Goal-weighted aggregation |
| Environmental Performance Index (EPI) | National environmental health | Policy-relevant indicators |
| Living Planet Index (LPI) | Biodiversity trends | Geometric mean of population changes |
| Biodiversity Intactness Index (BII) | Anthropogenic impact | Pressure-state modeling |

ErthaLoka synthesizes the strengths of these approaches while introducing novel capabilities for real-time monitoring and economic valuation.

---

## The Planetary Health Index (PHI)

### Definition

The **Planetary Health Index (PHI)** is a composite score from 0 to 100 that represents the overall health status of a defined ecosystem or land parcel. The score integrates multiple environmental indicators across five thematic categories.

### Scoring Interpretation

| PHI Range | Health Status | Description |
|-----------|---------------|-------------|
| 80-100 | Excellent | Pristine or near-pristine ecosystem with high biodiversity and carbon storage |
| 60-79 | Good | Healthy ecosystem with minor stress indicators |
| 40-59 | Moderate | Ecosystem showing signs of degradation requiring intervention |
| 20-39 | Poor | Significantly degraded ecosystem with limited ecosystem services |
| 0-19 | Critical | Severely compromised ecosystem requiring immediate restoration |

### Core Formula

The PHI is calculated as a weighted aggregation of category scores:

```
PHI = Σ(wᵢ × Cᵢ)
```

Where:
- `wᵢ` = Weight for category i (ecosystem-specific)
- `Cᵢ` = Normalized score for category i (0-100)
- `Σwᵢ = 1` (weights sum to unity)

---

## ABCDE Framework

The ABCDE Framework organizes environmental indicators into five thematic categories, each capturing a distinct dimension of ecosystem health.

### A - Atmospheric Quality

**Purpose**: Assess air quality and atmospheric conditions affecting ecosystem function.

| Indicator | Data Source | Optimal Range | Weight |
|-----------|-------------|---------------|--------|
| Aerosol Optical Depth (AOD) | MODIS | 0.0-0.2 | 0.30 |
| CO₂ Concentration | IoT Sensors | 350-420 ppm | 0.25 |
| Temperature Anomaly | Satellite LST | ±2°C from baseline | 0.25 |
| Humidity Index | IoT/Satellite | 40-80% RH | 0.20 |

**Normalization**: Inverse linear for pollutants (lower is better); Gaussian for temperature.

### B - Biodiversity & Vegetation

**Purpose**: Quantify vegetation health, structure, and biodiversity indicators.

| Indicator | Data Source | Calculation | Weight |
|-----------|-------------|-------------|--------|
| NDVI | Sentinel-2 | (NIR - Red)/(NIR + Red) | 0.25 |
| EVI | Sentinel-2 | 2.5 × (NIR-Red)/(NIR + 6×Red - 7.5×Blue + 1) | 0.20 |
| LAI | MODIS | Leaf Area Index product | 0.20 |
| FPAR | MODIS | Fraction of PAR absorbed | 0.15 |
| Species Richness Index | Field/ML | Estimated from habitat heterogeneity | 0.20 |

**Normalization**: Linear scaling with ecosystem-specific reference values.

### C - Carbon Storage

**Purpose**: Estimate above-ground and below-ground carbon stocks.

| Indicator | Data Source | Unit | Weight |
|-----------|-------------|------|--------|
| Above-Ground Biomass (AGB) | GEDI LiDAR + ML | tC/ha | 0.40 |
| Below-Ground Biomass (BGB) | Allometric models | tC/ha | 0.25 |
| Soil Organic Carbon (SOC) | IoT + Remote Sensing | tC/ha | 0.35 |

**Key Allometric Equation** (Chave et al., 2014):
```
AGB = 0.0673 × (ρ × DBH² × H)^0.976
```

Where:
- `ρ` = Wood density (g/cm³)
- `DBH` = Diameter at breast height (cm)
- `H` = Tree height (m)

**Carbon Conversion**:
```
Carbon (tC) = Biomass × 0.47
CO₂e = Carbon × 3.67
```

### D - Degradation Status

**Purpose**: Detect and quantify ecosystem degradation and disturbance.

| Indicator | Data Source | Detection Method | Weight |
|-----------|-------------|------------------|--------|
| Deforestation Rate | Landsat Time Series | Change detection | 0.30 |
| Burn Scar Index | Sentinel-2 NBR | (NIR - SWIR)/(NIR + SWIR) | 0.25 |
| Erosion Risk | DEM + Precipitation | RUSLE model | 0.25 |
| Fragmentation Index | Land Cover Maps | Patch connectivity analysis | 0.20 |

**Normalization**: Inverse scaling (lower degradation = higher score).

### E - Ecosystem Services

**Purpose**: Assess the functional capacity of ecosystem service provision.

| Service Category | Indicators | Valuation Basis |
|------------------|------------|-----------------|
| Provisioning | Timber volume, water yield | Market prices |
| Regulating | Carbon sequestration, flood control | Replacement cost |
| Cultural | Recreation potential, aesthetic value | Travel cost / WTP |
| Supporting | Nutrient cycling, pollination | Benefit transfer |

---

## Data Acquisition Architecture

### Satellite Remote Sensing

ErthaLoka leverages multiple satellite platforms for comprehensive Earth observation:

| Platform | Resolution | Revisit | Key Products |
|----------|------------|---------|--------------|
| Sentinel-2 | 10-20m | 5 days | NDVI, EVI, Land Cover |
| Sentinel-1 SAR | 10m | 6 days | Soil moisture, flood mapping |
| MODIS | 250m-1km | Daily | AOD, LST, LAI, FPAR |
| Landsat 8/9 | 30m | 16 days | Historical baselines, change detection |
| GEDI LiDAR | 25m footprint | Variable | Canopy height, biomass |
| SMAP | 9km | 2-3 days | Soil moisture |

**Processing Pipeline**:
1. Atmospheric correction (Sen2Cor for Sentinel-2)
2. Cloud masking and quality filtering
3. Index calculation (NDVI, EVI, etc.)
4. Temporal compositing (maximum value composites)
5. Spatial aggregation to parcel boundaries

### IoT Sensor Network

Ground-based sensors provide high-frequency, point-accurate measurements:

| Sensor Type | Parameters | Accuracy | Sampling Rate |
|-------------|------------|----------|---------------|
| CO₂ Sensor (NDIR) | CO₂ concentration | ±30 ppm | 1 minute |
| Temp/Humidity | Temperature, RH | ±0.3°C, ±2% RH | 5 minutes |
| Soil Moisture Probe | VWC, EC | ±3% VWC | 15 minutes |
| NDVI Sensor | Red/NIR reflectance | ±0.02 NDVI | 1 hour |
| Rain Gauge | Precipitation | ±0.2mm | Event-based |

**Data Transmission**: LoRaWAN or cellular (4G/5G) to cloud infrastructure.

### Hybrid Architecture

The platform employs a **complementary fusion strategy**:

```
┌─────────────────────────────────────────────────────────────┐
│                    ErthaLoka Data Pipeline                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Satellite Data          IoT Sensors         Field Surveys │
│   (Regional Scale)        (Point Scale)       (Validation)  │
│         │                      │                    │        │
│         ▼                      ▼                    ▼        │
│   ┌───────────┐          ┌───────────┐        ┌──────────┐  │
│   │ Sentinel-2│          │ CO₂, Temp │        │ Biomass  │  │
│   │ MODIS     │          │ Soil, NDVI│        │ Plots    │  │
│   │ GEDI      │          │           │        │          │  │
│   └─────┬─────┘          └─────┬─────┘        └────┬─────┘  │
│         │                      │                   │         │
│         └──────────┬───────────┴───────────────────┘         │
│                    │                                          │
│                    ▼                                          │
│         ┌─────────────────────┐                              │
│         │   Data Fusion &     │                              │
│         │   ML Processing     │                              │
│         └──────────┬──────────┘                              │
│                    │                                          │
│                    ▼                                          │
│         ┌─────────────────────┐                              │
│         │   PHI Calculation   │                              │
│         │   Engine            │                              │
│         └──────────┬──────────┘                              │
│                    │                                          │
│                    ▼                                          │
│    ┌───────────────┴───────────────┐                         │
│    │                               │                         │
│    ▼                               ▼                         │
│ ┌──────────┐                 ┌───────────┐                   │
│ │ Carbon   │                 │ ESV       │                   │
│ │ Credits  │                 │ Assessment│                   │
│ └──────────┘                 └───────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Mathematical Foundations

### Normalization Methods

Raw indicator values must be normalized to a 0-100 scale for aggregation. ErthaLoka employs five normalization functions based on indicator characteristics:

#### 1. Linear Normalization
For indicators where higher values indicate better health:
```
S = [(X - Xmin) / (Xmax - Xmin)] × 100
```

#### 2. Inverse Linear Normalization
For indicators where lower values indicate better health (e.g., pollution):
```
S = [(Xmax - X) / (Xmax - Xmin)] × 100
```

#### 3. Sigmoid Normalization
For indicators with threshold effects:
```
S = 100 / [1 + e^(-k(X - X₀))]
```
Where `k` controls steepness and `X₀` is the inflection point.

#### 4. Gaussian/Optimal Range Normalization
For indicators with an optimal range (e.g., temperature):
```
S = 100 × e^[-(X - Xopt)² / (2σ²)]
```
Where `Xopt` is the optimal value and `σ` controls tolerance width.

#### 5. Centered Normalization
For indicators with a neutral reference point:
```
S = 50 + [(X - Xref) / (Xmax - Xmin)] × 50
```

### Aggregation Methods

#### Within-Category Aggregation
Weighted arithmetic mean:
```
Cᵢ = Σ(wⱼ × Sⱼ) / Σwⱼ
```

#### Cross-Category Aggregation
Ecosystem-specific weighted mean:
```
PHI = Σ(Wᵢ × Cᵢ)
```

### Ecosystem-Specific Weights

| Ecosystem Type | A (Atmos) | B (Bio) | C (Carbon) | D (Degrad) | E (ESV) |
|----------------|-----------|---------|------------|------------|---------|
| Tropical Forest | 0.15 | 0.25 | 0.30 | 0.15 | 0.15 |
| Temperate Forest | 0.15 | 0.25 | 0.25 | 0.20 | 0.15 |
| Grassland/Savanna | 0.20 | 0.25 | 0.20 | 0.20 | 0.15 |
| Wetland | 0.15 | 0.20 | 0.30 | 0.15 | 0.20 |
| Mangrove | 0.10 | 0.20 | 0.35 | 0.15 | 0.20 |
| Agricultural | 0.20 | 0.20 | 0.15 | 0.25 | 0.20 |

---

## Machine Learning Models

### Biomass Estimation

ErthaLoka employs ensemble ML models for above-ground biomass estimation:

#### Model Architecture

| Model | Input Features | R² Score | RMSE |
|-------|----------------|----------|------|
| XGBoost | NDVI, EVI, Canopy Height, Backscatter | 0.82 | 28 tC/ha |
| Random Forest | NDVI, LAI, FPAR, Elevation | 0.78 | 35 tC/ha |
| Ensemble (Weighted) | Combined | 0.85 | 24 tC/ha |

#### Feature Importance

```
Canopy Height (GEDI)     ████████████████████ 32%
NDVI (Sentinel-2)        ██████████████       22%
SAR Backscatter (S1)     ████████████         18%
Elevation (DEM)          ████████             12%
LAI (MODIS)              ██████               10%
Precipitation            ████                  6%
```

### Gap-Filling Algorithm

For missing satellite observations (cloud cover):
1. Temporal interpolation using Savitzky-Golay filter
2. Spatial interpolation using kriging
3. ML-based prediction using correlated variables

### Model Validation

- **Cross-validation**: 5-fold spatial CV to avoid autocorrelation
- **Independent test set**: 20% holdout from different regions
- **Field validation**: Comparison with permanent sample plots

---

## Carbon Credit Methodology

### VCS Compliance

ErthaLoka's carbon quantification follows **Verified Carbon Standard (VCS)** methodology:

1. **VM0007**: REDD+ Methodology for peat and forest degradation
2. **VM0010**: Improved forest management on degraded lands
3. **VM0047**: Afforestation, reforestation, and revegetation

### Carbon Pool Accounting

| Pool | Estimation Method | Uncertainty |
|------|-------------------|-------------|
| Above-ground tree biomass | Allometric + LiDAR | ±15% |
| Below-ground biomass | Root:shoot ratios | ±25% |
| Dead wood | Decay class sampling | ±30% |
| Litter | Plot sampling | ±40% |
| Soil organic carbon | Core sampling + modeling | ±20% |

### Additionality Assessment

Credits are issued only for carbon sequestration **additional** to baseline:
```
Net Credits = (Project Scenario - Baseline Scenario) × (1 - Buffer Pool %)
```

**Buffer Pool**: 10-30% of credits withheld for permanence risk.

### Leakage Accounting

Activity-shifting leakage assessed through:
- Regional land-use change monitoring
- Socioeconomic surveys
- Leakage belt analysis (10km buffer)

### Crediting Calculations

```
Annual Sequestration (tCO₂e/yr) = ΔCarbon × 3.67

Where:
ΔCarbon = Carbon(t₁) - Carbon(t₀)
        = [AGB + BGB + DW + Litter + SOC](t₁) - [AGB + BGB + DW + Litter + SOC](t₀)
```

### Verification Requirements

| Verification Type | Frequency | Standard |
|-------------------|-----------|----------|
| Desk review | Annual | Internal |
| Field audit | Every 5 years | Third-party VVB |
| Remote sensing verification | Continuous | Automated |

---

## Ecosystem Service Valuation

### TEEB Framework

ErthaLoka's ESV methodology follows **The Economics of Ecosystems and Biodiversity (TEEB)** framework:

#### Service Categories and Valuation Methods

| Category | Service | Valuation Method | Unit |
|----------|---------|------------------|------|
| Provisioning | Timber | Market price | $/m³ |
| Provisioning | Non-timber forest products | Market price | $/ha/yr |
| Provisioning | Water supply | Replacement cost | $/m³ |
| Regulating | Carbon sequestration | Social cost of carbon | $/tCO₂ |
| Regulating | Air quality regulation | Health damage avoided | $/ha/yr |
| Regulating | Flood protection | Damage avoided | $/ha/yr |
| Regulating | Pollination | Production value | $/ha/yr |
| Cultural | Recreation | Travel cost | $/visit |
| Cultural | Aesthetic value | Hedonic pricing | $/ha |
| Supporting | Nutrient cycling | Replacement cost | $/ha/yr |
| Supporting | Habitat provision | Benefit transfer | $/ha/yr |

### ESV Baseline Values by Ecosystem

| Ecosystem | Min ESV | Median ESV | Max ESV | Unit |
|-----------|---------|------------|---------|------|
| Tropical rainforest | 2,500 | 5,382 | 12,000 | $/ha/yr |
| Temperate forest | 1,200 | 3,013 | 6,500 | $/ha/yr |
| Mangrove | 4,000 | 9,990 | 25,000 | $/ha/yr |
| Wetland (freshwater) | 3,500 | 12,512 | 35,000 | $/ha/yr |
| Grassland | 300 | 1,588 | 4,000 | $/ha/yr |
| Coral reef | 5,000 | 18,000 | 50,000 | $/ha/yr |

### PHI-ESV Integration

Ecosystem service delivery is modulated by ecosystem health:

```
ESV_adjusted = ESV_baseline × M_PHI

Where:
M_PHI = (PHI - 50) / 100 × k × (1 + α × ln(PHI/50))
```

Parameters:
- `k` = Ecosystem-specific sensitivity coefficient (0.5-1.5)
- `α` = Non-linearity adjustment (0.1-0.3)

**Interpretation**:
- PHI = 50 → M_PHI ≈ 1.0 (baseline ESV)
- PHI = 80 → M_PHI ≈ 1.4 (40% above baseline)
- PHI = 30 → M_PHI ≈ 0.6 (40% below baseline)

---

## Data Quality and Uncertainty

### Uncertainty Sources

| Source | Type | Magnitude | Mitigation |
|--------|------|-----------|------------|
| Satellite sensor noise | Random | ±5% | Temporal averaging |
| Atmospheric correction | Systematic | ±3% | Validated algorithms |
| Cloud contamination | Data gap | Variable | ML gap-filling |
| IoT sensor drift | Systematic | ±2%/year | Calibration schedule |
| Allometric model error | Structural | ±15-25% | Multi-model ensemble |
| Spatial extrapolation | Random | ±10-20% | Kriging with variance |

### Confidence Interval Calculation

PHI is reported with 95% confidence intervals:

```
PHI = μ ± 1.96 × σ_combined

Where:
σ_combined = √(Σσᵢ²)  [for independent errors]
```

### Quality Flags

Each PHI score includes quality metadata:

| Flag | Meaning | Threshold |
|------|---------|-----------|
| GREEN | High confidence | σ < 5 |
| YELLOW | Moderate confidence | 5 ≤ σ < 10 |
| ORANGE | Low confidence | 10 ≤ σ < 15 |
| RED | Very low confidence | σ ≥ 15 |

---

## Validation Framework

### Multi-Scale Validation

| Scale | Method | Data Source | Frequency |
|-------|--------|-------------|-----------|
| Plot (0.1 ha) | Direct measurement | Field teams | Annual |
| Stand (1-10 ha) | Stratified sampling | Drone + field | Bi-annual |
| Landscape (100+ ha) | Statistical comparison | Satellite + IoT | Continuous |
| Regional | Cross-validation | Published datasets | Initial + updates |

### Validation Metrics

| Metric | Target | Acceptable |
|--------|--------|------------|
| R² (PHI vs. field) | > 0.85 | > 0.75 |
| RMSE (biomass) | < 25 tC/ha | < 40 tC/ha |
| Bias | < 5% | < 10% |
| Spatial accuracy | < 1 pixel | < 2 pixels |

### Peer Review Process

1. **Internal review**: Algorithm documentation and code review
2. **External review**: Academic partnerships for methodology validation
3. **Public disclosure**: Open methodology documents for stakeholder scrutiny

---

## Technical Implementation

### System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                     ErthaLoka Platform                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Data Ingest │  │ Processing  │  │ Analytics   │             │
│  │ Layer       │  │ Layer       │  │ Layer       │             │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤             │
│  │ - Sentinel  │  │ - Index     │  │ - PHI Calc  │             │
│  │ - MODIS     │  │   Compute   │  │ - Trend     │             │
│  │ - IoT MQTT  │  │ - ML Infer  │  │ - Forecast  │             │
│  │ - GEDI      │  │ - Fusion    │  │ - Reporting │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│         │                │                │                     │
│         └────────────────┼────────────────┘                     │
│                          │                                      │
│                          ▼                                      │
│              ┌───────────────────────┐                         │
│              │    Data Lake          │                         │
│              │    (Cloud Storage)    │                         │
│              └───────────────────────┘                         │
│                          │                                      │
│                          ▼                                      │
│              ┌───────────────────────┐                         │
│              │    API Gateway        │                         │
│              └───────────────────────┘                         │
│                          │                                      │
│         ┌────────────────┼────────────────┐                    │
│         ▼                ▼                ▼                    │
│  ┌───────────┐    ┌───────────┐    ┌───────────┐              │
│  │ Dashboard │    │ Mobile    │    │ Third-    │              │
│  │ (Web)     │    │ App       │    │ Party API │              │
│  └───────────┘    └───────────┘    └───────────┘              │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Data Storage | Cloud object storage + PostgreSQL/PostGIS | Raster and vector data |
| Processing | Python, GDAL, Rasterio | Geospatial analysis |
| ML Framework | XGBoost, scikit-learn, TensorFlow | Model training and inference |
| API | FastAPI, REST/GraphQL | Data access |
| Visualization | Mapbox GL, Deck.gl | Interactive maps |
| IoT Gateway | MQTT, LoRaWAN | Sensor data collection |

### Update Frequency

| Product | Update Frequency | Latency |
|---------|------------------|---------|
| NDVI/EVI | 5 days | < 24 hours |
| PHI Score | Weekly | < 48 hours |
| Carbon Stock | Monthly | < 1 week |
| ESV Assessment | Quarterly | < 2 weeks |
| Trend Report | Annual | < 1 month |

---

## Conclusion

ErthaLoka's Planetary Health Index represents a significant advancement in ecosystem assessment technology. By integrating satellite remote sensing, IoT sensor networks, and machine learning, the platform delivers:

1. **Scientific Rigor**: Methodology grounded in peer-reviewed ecological science
2. **Transparency**: Open algorithms and uncertainty quantification
3. **Actionability**: Direct pathways to carbon credits and ESV monetization
4. **Scalability**: Applicable from individual parcels to regional landscapes
5. **Real-Time Monitoring**: Continuous assessment rather than periodic snapshots

The PHI framework enables stakeholders—including landowners, conservation organizations, investors, and policymakers—to make informed decisions based on quantified ecosystem health metrics.

### Future Development

- Integration of additional satellite platforms (e.g., EnMAP, PRISMA)
- Enhanced biodiversity indicators through acoustic monitoring and eDNA
- Blockchain-based carbon credit registry for transparency
- Predictive modeling for ecosystem health forecasting
- Expanded IoT sensor network with edge computing

---

## References

1. Chave, J., et al. (2014). Improved allometric models to estimate the aboveground biomass of tropical trees. *Global Change Biology*, 20(10), 3177-3190.

2. Costanza, R., et al. (2014). Changes in the global value of ecosystem services. *Global Environmental Change*, 26, 152-158.

3. de Groot, R., et al. (2012). Global estimates of the value of ecosystems and their services in monetary units. *Ecosystem Services*, 1(1), 50-61.

4. Halpern, B.S., et al. (2012). An index to assess the health and benefits of the global ocean. *Nature*, 488(7413), 615-620.

5. IPCC (2019). Climate Change and Land: An IPCC Special Report. Intergovernmental Panel on Climate Change.

6. Newbold, T., et al. (2016). Has land use pushed terrestrial biodiversity beyond the planetary boundary? *Science*, 353(6296), 288-291.

7. TEEB (2010). The Economics of Ecosystems and Biodiversity: Ecological and Economic Foundations. Earthscan, London.

8. VCS (2023). Verified Carbon Standard Program Guide. Verra.

9. Wendisch, M., et al. (2021). Understanding causes and effects of rapid Arctic warming: A review. *Atmospheric Chemistry and Physics*, 21, 1-48.

10. WWF (2022). Living Planet Report 2022. World Wildlife Fund.

---

*© 2025 ErthaLoka. All rights reserved.*

*This whitepaper is provided for informational purposes. Methodology details may be updated as the platform evolves.*
