import uuid
from datetime import datetime

from pydantic import BaseModel


class BoardBase(BaseModel):
    title: str
    description: str | None = None


class BoardCreate(BoardBase):
    pass


class BoardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None


class BoardRead(BoardBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
