# Planetary Health Monitor




![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Real-time Satellite Data**: Query actual satellite data from NASA, ESA, NOAA
Ecosystem
- **PDF Reports**: Generate comprehensive reports with charts
- **CLI Tool**: Query any location from the command line

## Quick Start

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```



## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/query` | POST | Query satellite data |
| `/api/pdf` | POST | Generate PDF report |
| `/api/health` | GET | Health check |
| `/api/datasets` | GET | Available datasets info |



## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

- Satellite data: Google Earth Engine, NASA, ESA, NOAA
