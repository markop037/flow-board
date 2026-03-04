import uuid
from datetime import datetime

from pydantic import BaseModel


class ColumnBase(BaseModel):
    title: str
    position: int = 0


class ColumnCreate(ColumnBase):
    pass


class ColumnUpdate(BaseModel):
    title: str | None = None
    position: int | None = None


class ColumnRead(ColumnBase):
    id: uuid.UUID
    board_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
