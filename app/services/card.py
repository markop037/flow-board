import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.card import Card
from app.db.models.column import Column
from app.schemas.card import CardCreate, CardUpdate


def get_by_id(db: Session, card_id: uuid.UUID) -> Card | None:
    return db.get(Card, card_id)


def get_by_id_or_404(db: Session, card_id: uuid.UUID) -> Card:
    card = get_by_id(db, card_id)
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    return card


def get_all_for_column(db: Session, column: Column) -> list[Card]:
    return db.query(Card).filter(Card.column_id == column.id).order_by(Card.position).all()


def create(db: Session, card_in: CardCreate, column: Column) -> Card:
    card = Card(**card_in.model_dump(), column_id=column.id)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def update(db: Session, card: Card, card_in: CardUpdate) -> Card:
    data = card_in.model_dump(exclude_unset=True)

    if "column_id" in data:
        new_column_id = data["column_id"]
        column = db.get(Column, new_column_id)
        if not column:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target column not found")

    for field, value in data.items():
        setattr(card, field, value)
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


def delete(db: Session, card: Card) -> None:
    db.delete(card)
    db.commit()
