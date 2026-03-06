"""
WebSocket connection manager and task broadcaster.

Uses a connection-manager pattern and an abstract broadcaster interface
so the implementation can be swapped (e.g. Redis pub/sub) for multi-instance scaling.
"""

import json
import logging
from abc import ABC, abstractmethod
from typing import Any

from fastapi import Request, WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts messages to all connected clients."""

    def __init__(self) -> None:
        self._connections: set[WebSocket] = set()

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.add(websocket)
        logger.info("WebSocket connected; total connections: %s", len(self._connections))

    def disconnect(self, websocket: WebSocket) -> None:
        self._connections.discard(websocket)
        logger.info("WebSocket disconnected; total connections: %s", len(self._connections))

    async def broadcast_json(self, payload: dict[str, Any]) -> None:
        """Send a JSON payload to all connected clients."""
        message = json.dumps(payload, default=str)
        dead: set[WebSocket] = set()
        for connection in self._connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning("Failed to send to WebSocket: %s", e)
                dead.add(connection)
        for conn in dead:
            self.disconnect(conn)


class TaskBroadcaster(ABC):
    """Abstract broadcaster for task events. Implementations can be in-memory or backend-based (e.g. Redis)."""

    @abstractmethod
    async def broadcast_task_created(self, task_payload: dict[str, Any]) -> None:
        """Broadcast that a task was created."""
        ...

    @abstractmethod
    async def broadcast_task_updated(self, task_payload: dict[str, Any]) -> None:
        """Broadcast that a task was updated."""
        ...

    @abstractmethod
    async def broadcast_task_deleted(self, task_id: str) -> None:
        """Broadcast that a task was deleted."""
        ...


class InMemoryTaskBroadcaster(TaskBroadcaster):
    """In-memory task broadcaster using a connection manager. Suitable for single-instance deployment."""

    def __init__(self, manager: ConnectionManager) -> None:
        self._manager = manager

    async def broadcast_task_created(self, task_payload: dict[str, Any]) -> None:
        await self._manager.broadcast_json(
            {"event": "task_created", "task": task_payload}
        )

    async def broadcast_task_updated(self, task_payload: dict[str, Any]) -> None:
        await self._manager.broadcast_json(
            {"event": "task_updated", "task": task_payload}
        )

    async def broadcast_task_deleted(self, task_id: str) -> None:
        await self._manager.broadcast_json(
            {"event": "task_deleted", "task": {"id": task_id}}
        )


def get_task_broadcaster(request: Request) -> TaskBroadcaster:
    """FastAPI dependency: returns the task broadcaster from app state."""
    return request.app.state.task_broadcaster
