"""Integration tests for the FastAPI Kanban API (Testcontainers PostgreSQL + AsyncClient)."""
import uuid

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup(async_client: AsyncClient) -> None:
    email = f"integration-{uuid.uuid4().hex}@example.com"
    response = await async_client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "securepass123",
            "full_name": "Integration User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login(async_client: AsyncClient) -> None:
    email = f"login-{uuid.uuid4().hex}@example.com"
    await async_client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "mypassword",
            "full_name": "Login User",
        },
    )
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": "mypassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_login_wrong_password(async_client: AsyncClient) -> None:
    email = f"wrong-{uuid.uuid4().hex}@example.com"
    await async_client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "correct",
            "full_name": "Wrong User",
        },
    )
    response = await async_client.post(
        "/api/v1/auth/login",
        data={"username": email, "password": "incorrect"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_task(async_client: AsyncClient) -> None:
    email = f"taskuser-{uuid.uuid4().hex}@example.com"
    signup = await async_client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "taskpass123",
            "full_name": "Task User",
        },
    )
    assert signup.status_code == 201
    token = signup.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await async_client.post(
        "/api/v1/tasks/",
        json={
            "title": "Integration test task",
            "description": "Created via integration test",
            "status": "TO_DO",
            "priority": "MEDIUM",
        },
        headers=headers,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Integration test task"
    assert data["description"] == "Created via integration test"
    assert data["status"] == "TO_DO"
    assert data["priority"] == "MEDIUM"
    assert "id" in data
    assert "created_at" in data
    assert "version" in data


@pytest.mark.asyncio
async def test_get_tasks(async_client: AsyncClient) -> None:
    email = f"listuser-{uuid.uuid4().hex}@example.com"
    signup = await async_client.post(
        "/api/v1/auth/signup",
        json={
            "email": email,
            "password": "listpass123",
            "full_name": "List User",
        },
    )
    assert signup.status_code == 201
    token = signup.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    list_response = await async_client.get("/api/v1/tasks/", headers=headers)
    assert list_response.status_code == 200
    tasks = list_response.json()
    assert isinstance(tasks, list)

    await async_client.post(
        "/api/v1/tasks/",
        json={"title": "First task", "status": "TO_DO", "priority": "LOW"},
        headers=headers,
    )
    await async_client.post(
        "/api/v1/tasks/",
        json={"title": "Second task", "status": "IN_PROGRESS", "priority": "HIGH"},
        headers=headers,
    )

    list_response2 = await async_client.get("/api/v1/tasks/", headers=headers)
    assert list_response2.status_code == 200
    tasks_after = list_response2.json()
    assert len(tasks_after) >= 2
    titles = {t["title"] for t in tasks_after}
    assert "First task" in titles
    assert "Second task" in titles


@pytest.mark.asyncio
async def test_get_tasks_unauthorized(async_client: AsyncClient) -> None:
    response = await async_client.get("/api/v1/tasks/")
    assert response.status_code == 401
