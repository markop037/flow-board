import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.board import Board
from app.db.models.column import Column
from app.schemas.column import ColumnCreate, ColumnUpdate


def get_by_id(db: Session, column_id: uuid.UUID) -> Column | None:
    return db.get(Column, column_id)


def get_by_id_or_404(db: Session, column_id: uuid.UUID) -> Column:
    column = get_by_id(db, column_id)
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    return column


def get_all_for_board(db: Session, board: Board) -> list[Column]:
    return db.query(Column).filter(Column.board_id == board.id).order_by(Column.position).all()


def create(db: Session, column_in: ColumnCreate, board: Board) -> Column:
    column = Column(**column_in.model_dump(), board_id=board.id)
    db.add(column)
    db.commit()
    db.refresh(column)
    return column


def update(db: Session, column: Column, column_in: ColumnUpdate) -> Column:
    for field, value in column_in.model_dump(exclude_unset=True).items():
        setattr(column, field, value)
    db.add(column)
    db.commit()
    db.refresh(column)
    return column


def delete(db: Session, column: Column) -> None:
    db.delete(column)
    db.commit()
