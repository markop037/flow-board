import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserPublic


class CardBase(BaseModel):
    title: str
    description: str | None = None
    position: int = 0
    due_date: datetime | None = None
    assignee_id: uuid.UUID | None = None


class CardCreate(CardBase):
    pass


class CardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    position: int | None = None
    due_date: datetime | None = None
    assignee_id: uuid.UUID | None = None
    column_id: uuid.UUID | None = None


class CardRead(CardBase):
    id: uuid.UUID
    column_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    assignee: UserPublic | None = None

    model_config = {"from_attributes": True}
