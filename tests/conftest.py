import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.schemas.user import UserCreate
from app.services import user as user_service

# Use an in-memory SQLite DB for tests (fast, no Postgres needed)
SQLALCHEMY_TEST_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db() -> Session:
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db: Session) -> TestClient:
    from app.db.session import get_db
    from app.main import app

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def test_user(db: Session):
    return user_service.create(
        db,
        UserCreate(email="test@example.com", password="testpassword", full_name="Test User"),
    )


@pytest.fixture()
def authenticated_client(client: TestClient, test_user) -> TestClient:
    """Client with Authorization header pre-set."""
    from app.api.deps import get_current_active_user
    from app.main import app

    def override_current_user():
        return test_user

    app.dependency_overrides[get_current_active_user] = override_current_user
    yield client
    app.dependency_overrides.clear()
