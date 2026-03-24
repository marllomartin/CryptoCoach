FROM python:3.11-slim

WORKDIR /app/backend

# System dependencies (gcc for some Python packages, ffmpeg for moviepy/video generation)
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create static directories for generated media
RUN mkdir -p static/audio static/images static/video

EXPOSE 8001

CMD uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001}
