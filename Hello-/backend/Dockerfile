# Dockerfile for Planetary Health API
# Use for alternative deployment (Docker, Cloud Run, etc.)

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy planetary_health_query package
COPY ../planetary_health_query ./planetary_health_query
RUN pip install -e ./planetary_health_query || true

# Copy application
COPY app ./app

# Create temp directory for PDFs
RUN mkdir -p /app/temp_pdfs

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
