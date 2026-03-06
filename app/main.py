from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.ws.broadcaster import ConnectionManager, InMemoryTaskBroadcaster
from app.ws.endpoints import router as ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize DB connections, caches, WebSocket broadcaster, etc.
    connection_manager = ConnectionManager()
    app.state.ws_connection_manager = connection_manager
    app.state.task_broadcaster = InMemoryTaskBroadcaster(connection_manager)
    yield
    # Shutdown: close connections, flush buffers, etc.


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        openapi_url="/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    application.include_router(api_router, prefix=settings.API_V1_STR)
    application.include_router(ws_router)

    return application


app = create_application()
