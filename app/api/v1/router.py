from fastapi import APIRouter

from app.api.v1.endpoints import auth, boards, cards, columns, tasks, users

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(boards.router, prefix="/boards", tags=["boards"])
api_router.include_router(
    columns.router,
    prefix="/boards/{board_id}/columns",
    tags=["columns"],
)
api_router.include_router(
    cards.router,
    prefix="/boards/{board_id}/columns/{column_id}/cards",
    tags=["cards"],
)
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
