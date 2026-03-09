"""Integration test fixtures: Testcontainers PostgreSQL, migrations, AsyncClient."""
import os
from collections.abc import AsyncGenerator, Generator
from urllib.parse import urlparse

import pytest
import pytest_asyncio
from alembic import command
from alembic.config import Config
from httpx import ASGITransport, AsyncClient

try:
    import docker
    docker.from_env().ping()
    _docker_available = True
except Exception:
    _docker_available = False

from testcontainers.postgres import PostgresContainer


def _set_env_from_container(container: PostgresContainer) -> None:
    url = container.get_connection_url()
    parsed = urlparse(url)
    assert parsed.hostname is not None
    assert parsed.port is not None
    assert parsed.username is not None
    assert parsed.password is not None
    assert parsed.path and len(parsed.path) > 1
    dbname = parsed.path.lstrip("/").split("/")[0]
    os.environ["POSTGRES_SERVER"] = parsed.hostname
    os.environ["POSTGRES_PORT"] = str(parsed.port)
    os.environ["POSTGRES_USER"] = parsed.username
    os.environ["POSTGRES_PASSWORD"] = parsed.password
    os.environ["POSTGRES_DB"] = dbname
    if "SECRET_KEY" not in os.environ:
        os.environ["SECRET_KEY"] = "integration-test-secret-key-min-32-chars"


def _run_migrations() -> None:
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")


@pytest.fixture(scope="session")
def postgres_container() -> Generator:
    """Start PostgreSQL in Docker; set env and run migrations before yielding."""
    if not _docker_available:
        pytest.skip("Docker not available; integration tests require Testcontainers")
    with PostgresContainer("postgres:16") as container:
        _set_env_from_container(container)
        _run_migrations()
        yield container


@pytest.fixture(scope="session")
def app(postgres_container):
    """FastAPI app bound to the testcontainer DB (import after env is set)."""
    from app.main import create_application
    return create_application()


@pytest_asyncio.fixture
async def async_client(app) -> AsyncGenerator[AsyncClient, None]:
    """Async HTTP client for the FastAPI app (no live server).
    Runs the app lifespan so app.state (e.g. task_broadcaster) is set.
    """
    transport = ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            yield client
