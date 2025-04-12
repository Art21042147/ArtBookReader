# ----------- Stage 1: Build React frontend -----------
FROM node:20 AS frontend
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# ----------- Stage 2: Django backend -----------
FROM python:3.11-slim AS backend
WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && pip install -r requirements.txt

# Copy Django
COPY backend/ ./backend/
COPY manage.py ./
COPY templates/ ./templates/
COPY --from=frontend /app/static ./static

# Start
CMD ["gunicorn", "backend.wsgi", "--bind", "0.0.0.0:8000"]
