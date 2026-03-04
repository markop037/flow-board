import uuid

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DBSession
from app.schemas.board import BoardCreate, BoardRead, BoardUpdate
from app.services import board as board_service

router = APIRouter()


@router.get("/", response_model=list[BoardRead])
def list_boards(db: DBSession, current_user: CurrentUser) -> list[BoardRead]:
    return board_service.get_all_for_user(db, current_user)  # type: ignore[return-value]


@router.post("/", response_model=BoardRead, status_code=status.HTTP_201_CREATED)
def create_board(db: DBSession, current_user: CurrentUser, board_in: BoardCreate) -> BoardRead:
    return board_service.create(db, board_in, current_user)  # type: ignore[return-value]


@router.get("/{board_id}", response_model=BoardRead)
def get_board(db: DBSession, current_user: CurrentUser, board_id: uuid.UUID) -> BoardRead:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    return board  # type: ignore[return-value]


@router.patch("/{board_id}", response_model=BoardRead)
def update_board(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    board_in: BoardUpdate,
) -> BoardRead:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    return board_service.update(db, board, board_in)  # type: ignore[return-value]


@router.delete("/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_board(db: DBSession, current_user: CurrentUser, board_id: uuid.UUID) -> None:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    board_service.delete(db, board)
