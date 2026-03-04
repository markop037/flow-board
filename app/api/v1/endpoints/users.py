import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, DBSession, SuperUser
from app.db.session import get_db
from app.schemas.user import UserCreate, UserRead, UserUpdate
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


@router.get("/", response_model=list[UserRead])
def list_users(db: DBSession, _: SuperUser, skip: int = 0, limit: int = 100) -> list[UserRead]:
    return user_service.get_all(db, skip=skip, limit=limit)  # type: ignore[return-value]


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(db: DBSession, _: SuperUser, user_in: UserCreate) -> UserRead:
    if user_service.get_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )
    return user_service.create(db, user_in)  # type: ignore[return-value]


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(db: DBSession, superuser: SuperUser, user_id: uuid.UUID) -> None:
    user = user_service.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == superuser.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete yourself")
    user_service.delete(db, user)
