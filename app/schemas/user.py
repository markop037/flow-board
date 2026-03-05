import uuid

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None


class UserRead(UserBase):
    id: uuid.UUID

    model_config = {"from_attributes": True}


class UserPublic(BaseModel):
    """Minimal user data safe to embed in other responses."""

    id: uuid.UUID
    full_name: str | None = None

    model_config = {"from_attributes": True}
