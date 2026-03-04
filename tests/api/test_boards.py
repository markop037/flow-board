from fastapi.testclient import TestClient


def test_create_board(authenticated_client: TestClient) -> None:
    response = authenticated_client.post(
        "/api/v1/boards/", json={"title": "My Board", "description": "A test board"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "My Board"
    assert "id" in data


def test_list_boards(authenticated_client: TestClient) -> None:
    authenticated_client.post("/api/v1/boards/", json={"title": "Board 1"})
    authenticated_client.post("/api/v1/boards/", json={"title": "Board 2"})
    response = authenticated_client.get("/api/v1/boards/")
    assert response.status_code == 200
    assert len(response.json()) >= 2


def test_get_board(authenticated_client: TestClient) -> None:
    create_resp = authenticated_client.post("/api/v1/boards/", json={"title": "Readable Board"})
    board_id = create_resp.json()["id"]
    response = authenticated_client.get(f"/api/v1/boards/{board_id}")
    assert response.status_code == 200
    assert response.json()["id"] == board_id


def test_update_board(authenticated_client: TestClient) -> None:
    create_resp = authenticated_client.post("/api/v1/boards/", json={"title": "Old Title"})
    board_id = create_resp.json()["id"]
    response = authenticated_client.patch(f"/api/v1/boards/{board_id}", json={"title": "New Title"})
    assert response.status_code == 200
    assert response.json()["title"] == "New Title"


def test_delete_board(authenticated_client: TestClient) -> None:
    create_resp = authenticated_client.post("/api/v1/boards/", json={"title": "To Delete"})
    board_id = create_resp.json()["id"]
    response = authenticated_client.delete(f"/api/v1/boards/{board_id}")
    assert response.status_code == 204
    assert authenticated_client.get(f"/api/v1/boards/{board_id}").status_code == 404
