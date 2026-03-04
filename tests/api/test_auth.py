from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate
from app.services import user as user_service


def test_login_success(client: TestClient, db: Session) -> None:
    user_service.create(db, UserCreate(email="login@example.com", password="secret123"))
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "secret123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient, db: Session) -> None:
    user_service.create(db, UserCreate(email="wrong@example.com", password="correct"))
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "wrong@example.com", "password": "incorrect"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "ghost@example.com", "password": "whatever"},
    )
    assert response.status_code == 401
