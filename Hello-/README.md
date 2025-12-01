# Planetary Health Monitor

Real-time satellite environmental data for any location on Earth.

![Planetary Health Monitor](https://img.shields.io/badge/Powered%20by-Google%20Earth%20Engine-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Real-time Satellite Data**: Query actual satellite data from NASA, ESA, NOAA
- **5 Health Pillars**: Atmospheric, Biodiversity, Carbon, Degradation, Ecosystem
- **PDF Reports**: Generate comprehensive reports with charts
- **CLI Tool**: Query any location from the command line

## Quick Start

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

## Deployment

### Deploy Backend to Render.com (FREE)

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. New → Web Service → Connect GitHub repo
4. Select `backend` folder
5. Add environment variables:
   - `EE_SERVICE_ACCOUNT`: Your service account email
   - `EE_PRIVATE_KEY`: Service account JSON key
   - `SUPABASE_URL`: Supabase project URL
   - `SUPABASE_KEY`: Supabase anon key

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Render.com)                  │
│   FastAPI + Python + Earth Engine + ReportLab               │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
│ Google EE   │  │ Supabase    │  │ PDF Generation  │
│ Satellite   │  │ PostgreSQL  │  │                 │
│ Data        │  │ (Logs)      │  │                 │
└─────────────┘  └─────────────┘  └─────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/query` | POST | Query satellite data |
| `/api/pdf` | POST | Generate PDF report |
| `/api/health` | GET | Health check |
| `/api/datasets` | GET | Available datasets info |

## 5 Planetary Health Pillars

| Pillar | Metrics | Data Sources |
|--------|---------|--------------|
| **A - Atmospheric** | AOD, AQI, UV Index | MODIS MCD19A2, MOD08 |
| **B - Biodiversity** | NDVI, EVI, LAI | Sentinel-2, MODIS |
| **C - Carbon** | Tree Cover, Biomass | Hansen GFC, GEDI |
| **D - Degradation** | LST, Soil Moisture | MODIS LST, SMAP |
| **E - Ecosystem** | Population, Lights | WorldPop, VIIRS |

## Cost

| Service | Free Tier |
|---------|-----------|
| Render.com | 750 hrs/month |
| Supabase | 500MB, 50k users |
| Earth Engine | 1M requests/month |
| **Total** | **$0/month** |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- Satellite data: Google Earth Engine, NASA, ESA, NOAA
