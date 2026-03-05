from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, DBSession
from app.db.session import get_db
from app.schemas.user import UserRead, UserUpdate
from app.services import user as user_service

router = APIRouter()


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: CurrentUser) -> UserRead:
    return current_user  # type: ignore[return-value]


@router.patch("/me", response_model=UserRead)
def update_current_user(
    db: DBSession,
    current_user: CurrentUser,
    user_in: UserUpdate,
) -> UserRead:
    return user_service.update(db, current_user, user_in)  # type: ignore[return-value]
