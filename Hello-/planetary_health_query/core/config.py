"""
Configuration and constants for Earth Engine datasets.
Contains all dataset IDs, metadata, and pillar configurations.
"""

# Default Google Cloud Project ID
DEFAULT_PROJECT_ID = "vibrant-arcanum-477610-v0"

# Resolution presets for different query modes
RESOLUTION_PRESETS = {
    "high": {
        "ndvi": 10,       # Sentinel-2
        "elevation": 30,   # SRTM
        "land_cover": 10   # WorldCover
    },
    "standard": {
        "ndvi": 250,       # MODIS
        "elevation": 90,   # SRTM 90m
        "land_cover": 100  # Aggregated
    },
    "coarse": {
        "ndvi": 1000,      # MODIS aggregated
        "elevation": 1000,
        "land_cover": 1000
    }
}

# Earth Engine Dataset Catalog
DATASETS = {
    # ===== PILLAR A: ATMOSPHERIC =====
    "modis_aod": {
        "id": "MODIS/061/MCD19A2_GRANULES",
        "band": "Optical_Depth_047",
        "scale_factor": 0.001,
        "unit": "dimensionless",
        "description": "Aerosol Optical Depth at 470nm",
        "resolution": 1000,
        "temporal": "daily",
        "pillar": "A"
    },
    "modis_atmosphere": {
        "id": "MODIS/061/MOD08_M3",
        "bands": {
            "aqi": "Aerosol_Optical_Depth_Land_Ocean_Mean_Mean",
            "uv": "Total_Ozone_Mean_Mean",
            "cloud": "Cloud_Fraction_Mean_Mean"
        },
        "unit": "various",
        "description": "MODIS Monthly Atmospheric Products",
        "resolution": 111000,  # 1 degree
        "temporal": "monthly",
        "pillar": "A"
    },

    # ===== PILLAR B: BIODIVERSITY =====
    "sentinel2": {
        "id": "COPERNICUS/S2_SR_HARMONIZED",
        "bands": ["B4", "B8", "B3"],  # Red, NIR, Green
        "unit": "reflectance",
        "description": "Sentinel-2 Surface Reflectance",
        "resolution": 10,
        "temporal": "5-day",
        "pillar": "B"
    },
    "modis_ndvi": {
        "id": "MODIS/061/MOD13A2",
        "bands": {
            "ndvi": "NDVI",
            "evi": "EVI"
        },
        "scale_factor": 0.0001,
        "unit": "dimensionless",
        "description": "MODIS Vegetation Indices",
        "resolution": 1000,
        "temporal": "16-day",
        "pillar": "B"
    },
    "modis_lai": {
        "id": "MODIS/061/MOD15A2H",
        "bands": {
            "lai": "Lai_500m",
            "fpar": "Fpar_500m"
        },
        "scale_factor": 0.1,
        "unit": "m2/m2",
        "description": "MODIS Leaf Area Index",
        "resolution": 500,
        "temporal": "8-day",
        "pillar": "B"
    },
    "worldcover": {
        "id": "ESA/WorldCover/v200",
        "band": "Map",
        "unit": "class",
        "description": "ESA WorldCover 10m Land Cover",
        "resolution": 10,
        "temporal": "annual",
        "pillar": "B",
        "classes": {
            10: "Tree cover",
            20: "Shrubland",
            30: "Grassland",
            40: "Cropland",
            50: "Built-up",
            60: "Bare/sparse vegetation",
            70: "Snow and ice",
            80: "Permanent water",
            90: "Herbaceous wetland",
            95: "Mangroves",
            100: "Moss and lichen"
        }
    },

    # ===== PILLAR C: CARBON =====
    "hansen_gfc": {
        "id": "UMD/hansen/global_forest_change_2023_v1_11",
        "bands": {
            "tree_cover": "treecover2000",
            "loss": "loss",
            "loss_year": "lossyear",
            "gain": "gain"
        },
        "unit": "percent/binary",
        "description": "Hansen Global Forest Change",
        "resolution": 30,
        "temporal": "annual",
        "pillar": "C"
    },
    "gedi_biomass": {
        "id": "LARSE/GEDI/GEDI04_A_002_MONTHLY",
        "band": "agbd",
        "unit": "Mg/ha",
        "description": "GEDI Above-ground Biomass Density",
        "resolution": 1000,
        "temporal": "monthly",
        "pillar": "C",
        "fallback": "eth_canopy_height"
    },
    "eth_canopy_height": {
        "id": "users/nlang/ETH_GlobalCanopyHeight_2020_10m_v1",
        "band": "b1",
        "unit": "meters",
        "description": "ETH Global Canopy Height 2020",
        "resolution": 10,
        "temporal": "static",
        "pillar": "C"
    },

    # ===== PILLAR D: DEGRADATION =====
    "modis_lst": {
        "id": "MODIS/061/MOD11A2",
        "bands": {
            "lst_day": "LST_Day_1km",
            "lst_night": "LST_Night_1km"
        },
        "scale_factor": 0.02,
        "offset": -273.15,
        "unit": "Celsius",
        "description": "MODIS Land Surface Temperature",
        "resolution": 1000,
        "temporal": "8-day",
        "pillar": "D"
    },
    "smap_soil_moisture": {
        "id": "NASA/SMAP/SPL4SMGP/007",
        "band": "sm_surface",
        "unit": "m3/m3",
        "description": "SMAP L4 Global Soil Moisture",
        "resolution": 11000,
        "temporal": "3-hourly",
        "pillar": "D",
        "fallback": "era5_soil_moisture"
    },
    "era5_land": {
        "id": "ECMWF/ERA5_LAND/MONTHLY_AGGR",
        "bands": {
            "soil_moisture": "volumetric_soil_water_layer_1",
            "temperature": "temperature_2m",
            "precipitation": "total_precipitation_sum"
        },
        "unit": "various",
        "description": "ERA5-Land Monthly Aggregated",
        "resolution": 11000,
        "temporal": "monthly",
        "pillar": "D"
    },
    "jrc_water": {
        "id": "JRC/GSW1_4/GlobalSurfaceWater",
        "bands": {
            "occurrence": "occurrence",
            "change": "change_abs",
            "seasonality": "seasonality"
        },
        "unit": "percent",
        "description": "JRC Global Surface Water",
        "resolution": 30,
        "temporal": "static",
        "pillar": "D"
    },
    "modis_et": {
        "id": "MODIS/061/MOD16A2",
        "bands": {
            "et": "ET",
            "pet": "PET"
        },
        "scale_factor": 0.1,
        "unit": "kg/m2/8day",
        "description": "MODIS Evapotranspiration",
        "resolution": 500,
        "temporal": "8-day",
        "pillar": "D"
    },

    # ===== PILLAR E: ECOSYSTEM =====
    "worldpop": {
        "id": "WorldPop/GP/100m/pop_age_sex_cons_unadj",
        "band": "population",
        "unit": "people/pixel",
        "description": "WorldPop Population Count",
        "resolution": 100,
        "temporal": "annual",
        "pillar": "E"
    },
    "viirs_dnb": {
        "id": "NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG",
        "band": "avg_rad",
        "unit": "nanoWatts/cm2/sr",
        "description": "VIIRS Nighttime Lights",
        "resolution": 500,
        "temporal": "monthly",
        "pillar": "E"
    },
    "human_modification": {
        "id": "CSP/HM/GlobalHumanModification",
        "band": "gHM",
        "unit": "index 0-1",
        "description": "Global Human Modification Index",
        "resolution": 1000,
        "temporal": "static",
        "pillar": "E"
    },
    "srtm": {
        "id": "USGS/SRTMGL1_003",
        "band": "elevation",
        "unit": "meters",
        "description": "SRTM Digital Elevation",
        "resolution": 30,
        "temporal": "static",
        "pillar": "E"
    }
}

# Pillar Configuration
PILLAR_CONFIG = {
    "A": {
        "name": "Atmospheric",
        "description": "Air quality, aerosols, and atmospheric conditions",
        "color": "#3498db",
        "simple_metrics": ["aod", "aqi"],
        "comprehensive_metrics": ["aod", "aqi", "uv_index", "cloud_fraction"],
        "weight": 0.20
    },
    "B": {
        "name": "Biodiversity",
        "description": "Vegetation health, land cover, and ecosystem diversity",
        "color": "#27ae60",
        "simple_metrics": ["ndvi", "evi"],
        "comprehensive_metrics": ["ndvi", "evi", "lai", "land_cover", "fpar"],
        "weight": 0.20
    },
    "C": {
        "name": "Carbon",
        "description": "Forest cover, biomass, and carbon storage",
        "color": "#8e44ad",
        "simple_metrics": ["tree_cover", "forest_loss"],
        "comprehensive_metrics": ["tree_cover", "forest_loss", "canopy_height", "biomass", "carbon_stock"],
        "weight": 0.20
    },
    "D": {
        "name": "Degradation",
        "description": "Land and water stress indicators",
        "color": "#e74c3c",
        "simple_metrics": ["lst", "soil_moisture"],
        "comprehensive_metrics": ["lst", "soil_moisture", "water_occurrence", "drought_index", "evaporative_stress"],
        "weight": 0.20
    },
    "E": {
        "name": "Ecosystem",
        "description": "Human impact and ecosystem services",
        "color": "#f39c12",
        "simple_metrics": ["population", "nightlights"],
        "comprehensive_metrics": ["population", "nightlights", "human_modification", "elevation", "distance_to_water"],
        "weight": 0.20
    }
}

# Metric metadata for scoring and display
METRIC_METADATA = {
    # Pillar A
    "aod": {
        "name": "Aerosol Optical Depth",
        "range": [0, 1],
        "optimal_range": [0, 0.2],
        "higher_is_better": False
    },
    "aqi": {
        "name": "Air Quality Index",
        "range": [0, 500],
        "optimal_range": [0, 50],
        "higher_is_better": False
    },
    "uv_index": {
        "name": "UV Index",
        "range": [0, 15],
        "optimal_range": [2, 7],
        "higher_is_better": None
    },
    "cloud_fraction": {
        "name": "Cloud Fraction",
        "range": [0, 1],
        "optimal_range": [0.2, 0.6],
        "higher_is_better": None
    },

    # Pillar B
    "ndvi": {
        "name": "Normalized Difference Vegetation Index",
        "range": [-1, 1],
        "optimal_range": [0.4, 0.9],
        "higher_is_better": True
    },
    "evi": {
        "name": "Enhanced Vegetation Index",
        "range": [-1, 1],
        "optimal_range": [0.3, 0.8],
        "higher_is_better": True
    },
    "lai": {
        "name": "Leaf Area Index",
        "range": [0, 10],
        "optimal_range": [2, 6],
        "higher_is_better": True
    },
    "fpar": {
        "name": "Fraction of Absorbed PAR",
        "range": [0, 1],
        "optimal_range": [0.4, 0.8],
        "higher_is_better": True
    },
    "land_cover": {
        "name": "Land Cover Class",
        "range": [10, 100],
        "optimal_range": None,
        "higher_is_better": None
    },

    # Pillar C
    "tree_cover": {
        "name": "Tree Cover Percentage",
        "range": [0, 100],
        "optimal_range": [40, 100],
        "higher_is_better": True
    },
    "forest_loss": {
        "name": "Forest Loss (since 2000)",
        "range": [0, 1],
        "optimal_range": [0, 0],
        "higher_is_better": False
    },
    "canopy_height": {
        "name": "Canopy Height",
        "range": [0, 60],
        "optimal_range": [15, 45],
        "higher_is_better": True
    },
    "biomass": {
        "name": "Above-ground Biomass",
        "range": [0, 500],
        "optimal_range": [100, 400],
        "higher_is_better": True
    },
    "carbon_stock": {
        "name": "Carbon Stock",
        "range": [0, 250],
        "optimal_range": [50, 200],
        "higher_is_better": True
    },

    # Pillar D
    "lst": {
        "name": "Land Surface Temperature",
        "range": [-40, 60],
        "optimal_range": [15, 35],
        "higher_is_better": None
    },
    "soil_moisture": {
        "name": "Soil Moisture",
        "range": [0, 0.6],
        "optimal_range": [0.2, 0.4],
        "higher_is_better": None
    },
    "water_occurrence": {
        "name": "Water Occurrence",
        "range": [0, 100],
        "optimal_range": None,
        "higher_is_better": None
    },
    "drought_index": {
        "name": "Drought Index",
        "range": [-3, 3],
        "optimal_range": [-0.5, 0.5],
        "higher_is_better": None
    },
    "evaporative_stress": {
        "name": "Evaporative Stress Index",
        "range": [-2, 2],
        "optimal_range": [-0.5, 0.5],
        "higher_is_better": None
    },

    # Pillar E
    "population": {
        "name": "Population Density",
        "range": [0, 50000],
        "optimal_range": None,
        "higher_is_better": None
    },
    "nightlights": {
        "name": "Nighttime Lights Radiance",
        "range": [0, 300],
        "optimal_range": None,
        "higher_is_better": None
    },
    "human_modification": {
        "name": "Human Modification Index",
        "range": [0, 1],
        "optimal_range": None,
        "higher_is_better": None
    },
    "elevation": {
        "name": "Elevation",
        "range": [-500, 9000],
        "optimal_range": None,
        "higher_is_better": None
    },
    "distance_to_water": {
        "name": "Distance to Water",
        "range": [0, 100000],
        "optimal_range": [0, 5000],
        "higher_is_better": False
    }
}
