# Flow Board API

Backend API for a Kanban-style board application, built with FastAPI and PostgreSQL.

## What This Project Includes

- FastAPI application with versioned routes under `/api/v1`
- PostgreSQL database with Alembic migrations
- JWT-based auth
- Dockerfile for production-style API image
- Docker Compose setup for API + Postgres

## Quick Start (Recommended): Docker Compose

> Current `docker-compose.yml` is backend stack only: it starts `api` + `postgres`.  
> Frontend is not included in Compose in this repository.

### 1) Prerequisites

- Docker Desktop (or Docker Engine + Compose)

### 2) Create `.env`

Create a `.env` file in the project root (you can copy from `.env.example`) and set at least:

```env
SECRET_KEY=replace-with-a-strong-random-secret

POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=kanban
POSTGRES_PASSWORD=kanban
POSTGRES_DB=kanban_db

BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

Notes:

- `POSTGRES_SERVER` is overridden to `postgres` inside the API container by `docker-compose.yml`.
- Keep `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` aligned with the Postgres service values in `docker-compose.yml`.
- `SECRET_KEY` is required.

### 3) Build and start

```bash
docker compose up --build -d
```

### 4) Verify services

```bash
docker compose ps
docker compose logs --tail 100 api
```

Expected:

- `flow-board-postgres` is `healthy`
- `flow-board-api` is `healthy`
- API logs show migrations, then Gunicorn startup

### 5) Open the API

- Health check: `http://localhost:8000/health`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

If you want full-stack development, run the frontend separately from the `frontend` directory (for example with your JS package manager dev command).

### 6) Stop services

```bash
docker compose down
```

To also remove Postgres data volume:

```bash
docker compose down -v
```

## Run Without Docker (Local Development)

### 1) Prerequisites

- Python 3.12+
- PostgreSQL running locally

### 2) Create and activate virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
python -m venv .venv
source .venv/bin/activate
```

### 3) Install dependencies

```bash
pip install -r requirements.txt
pip install gunicorn "uvicorn[standard]>=0.30.0"
```

### 4) Configure `.env`

Set local DB values in `.env` to match your local Postgres instance (host is typically `localhost`).

### 5) Run migrations

```bash
alembic upgrade head
```

### 6) Start API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Testing

Run tests with:

```bash
pytest
```

Integration tests use Testcontainers (`testcontainers[postgres]`), so Docker must be available when running those tests.

## Architecture Overview

Current Compose scope: backend only (`api` + `postgres`).

### Docker services

- `api`
  - Built from `Dockerfile`
  - Runs `scripts/entrypoint.sh`
  - Entrypoint applies migrations (`alembic upgrade head`) before launching Gunicorn
  - Exposes port `8000`
- `postgres`
  - Uses `postgres:16-alpine`
  - Stores data in named volume `postgres_data`
  - Exposes only internal container port `5432` (not published to host)

### How containers communicate

- Both services run on the `kanban-net` bridge network.
- API connects to DB via hostname `postgres` (service name), not `localhost`.
- `depends_on` + health check ensures API waits for Postgres health before startup.

## API Route Prefixes

All API v1 routes are under `/api/v1`:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/boards`
- `/api/v1/boards/{board_id}/columns`
- `/api/v1/boards/{board_id}/columns/{column_id}/cards`
- `/api/v1/tasks`

## Common Issues

### API container restarts with `env: 'bash\r': No such file or directory`

Cause: shell script line endings are CRLF.
Fix: ensure `scripts/entrypoint.sh` uses LF line endings. This repo includes `.gitattributes` for `scripts/*.sh` to enforce LF.

### API fails DB auth on startup/migrations

Cause: `.env` DB credentials do not match `docker-compose.yml` Postgres credentials.
Fix: align `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` with Compose values.

### Health endpoint not reachable

Check:

- `docker compose ps`
- `docker compose logs --tail 200 api`
- `docker compose logs --tail 200 postgres`

## Useful Commands

```bash
# Rebuild and restart
docker compose up --build -d

# Watch logs
docker compose logs -f api
docker compose logs -f postgres

# Show running containers
docker compose ps
```
