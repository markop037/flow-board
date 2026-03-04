import uuid

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DBSession
from app.schemas.column import ColumnCreate, ColumnRead, ColumnUpdate
from app.services import board as board_service
from app.services import column as column_service

router = APIRouter()


@router.get("/", response_model=list[ColumnRead])
def list_columns(db: DBSession, current_user: CurrentUser, board_id: uuid.UUID) -> list[ColumnRead]:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    return column_service.get_all_for_board(db, board)  # type: ignore[return-value]


@router.post("/", response_model=ColumnRead, status_code=status.HTTP_201_CREATED)
def create_column(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    column_in: ColumnCreate,
) -> ColumnRead:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    return column_service.create(db, column_in, board)  # type: ignore[return-value]


@router.patch("/{column_id}", response_model=ColumnRead)
def update_column(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    column_id: uuid.UUID,
    column_in: ColumnUpdate,
) -> ColumnRead:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    column = column_service.get_by_id_or_404(db, column_id)
    return column_service.update(db, column, column_in)  # type: ignore[return-value]


@router.delete("/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_column(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    column_id: uuid.UUID,
) -> None:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    column = column_service.get_by_id_or_404(db, column_id)
    column_service.delete(db, column)
