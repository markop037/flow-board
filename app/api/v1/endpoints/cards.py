import uuid

from fastapi import APIRouter, status

from app.api.deps import CurrentUser, DBSession
from app.schemas.card import CardCreate, CardRead, CardUpdate
from app.services import board as board_service
from app.services import card as card_service
from app.services import column as column_service

router = APIRouter()


@router.get("/", response_model=list[CardRead])
def list_cards(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    column_id: uuid.UUID,
) -> list[CardRead]:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    column = column_service.get_by_id_or_404(db, column_id)
    return card_service.get_all_for_column(db, column)  # type: ignore[return-value]


@router.post("/", response_model=CardRead, status_code=status.HTTP_201_CREATED)
def create_card(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    column_id: uuid.UUID,
    card_in: CardCreate,
) -> CardRead:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    column = column_service.get_by_id_or_404(db, column_id)
    return card_service.create(db, card_in, column)  # type: ignore[return-value]


@router.get("/{card_id}", response_model=CardRead)
def get_card(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    column_id: uuid.UUID,
    card_id: uuid.UUID,
) -> CardRead:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    return card_service.get_by_id_or_404(db, card_id)  # type: ignore[return-value]


@router.patch("/{card_id}", response_model=CardRead)
def update_card(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    column_id: uuid.UUID,
    card_id: uuid.UUID,
    card_in: CardUpdate,
) -> CardRead:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    card = card_service.get_by_id_or_404(db, card_id)
    return card_service.update(db, card, card_in)  # type: ignore[return-value]


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    db: DBSession,
    current_user: CurrentUser,
    board_id: uuid.UUID,
    column_id: uuid.UUID,
    card_id: uuid.UUID,
) -> None:
    board = board_service.get_by_id_or_404(db, board_id)
    board_service.assert_owner(board, current_user)
    card = card_service.get_by_id_or_404(db, card_id)
    card_service.delete(db, card)
