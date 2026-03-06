import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.ws.broadcaster import ConnectionManager

logger = logging.getLogger(__name__)

router = APIRouter()


@router.websocket("/ws/tasks")
async def websocket_tasks(websocket: WebSocket) -> None:
    """WebSocket endpoint for task updates. Clients receive JSON broadcasts on task created/updated/deleted."""
    manager: ConnectionManager = websocket.app.state.ws_connection_manager
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; optional: handle incoming pings or commands
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)
