import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.board import Board
from app.db.models.user import User
from app.schemas.board import BoardCreate, BoardUpdate


def get_by_id(db: Session, board_id: uuid.UUID) -> Board | None:
    return db.get(Board, board_id)


def get_by_id_or_404(db: Session, board_id: uuid.UUID) -> Board:
    board = get_by_id(db, board_id)
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    return board


def get_all_for_user(db: Session, owner: User, skip: int = 0, limit: int = 50) -> list[Board]:
    return (
        db.query(Board)
        .filter(Board.owner_id == owner.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create(db: Session, board_in: BoardCreate, owner: User) -> Board:
    board = Board(**board_in.model_dump(), owner_id=owner.id)
    db.add(board)
    db.commit()
    db.refresh(board)
    return board


def update(db: Session, board: Board, board_in: BoardUpdate) -> Board:
    for field, value in board_in.model_dump(exclude_unset=True).items():
        setattr(board, field, value)
    db.add(board)
    db.commit()
    db.refresh(board)
    return board


def delete(db: Session, board: Board) -> None:
    db.delete(board)
    db.commit()


def assert_owner(board: Board, user: User) -> None:
    if board.owner_id != user.id and not user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
