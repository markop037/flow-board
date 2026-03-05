import uuid
from typing import Literal

from fastapi import APIRouter, Query, status

from app.api.deps import CurrentUser, DBSession
from app.db.models.task import TaskStatus
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services import task as task_service

router = APIRouter()


@router.get("/", response_model=list[TaskRead])
def list_tasks(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: TaskStatus | None = Query(None),
    sort_by: Literal["created_at", "updated_at", "priority", "title"] = Query(
        "created_at"
    ),
    sort_order: Literal["asc", "desc"] = Query("desc"),
) -> list[TaskRead]:
    return task_service.get_multi(
        db,
        page=page,
        size=size,
        status=status,
        sort_by=sort_by,
        sort_order=sort_order,
    )  # type: ignore[return-value]


@router.get("/{task_id}", response_model=TaskRead)
def get_task(db: DBSession, current_user: CurrentUser, task_id: uuid.UUID) -> TaskRead:
    task = task_service.get_by_id_or_404(db, task_id)
    return task  # type: ignore[return-value]


@router.post("/", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(db: DBSession, current_user: CurrentUser, task_in: TaskCreate) -> TaskRead:
    return task_service.create(db, task_in)  # type: ignore[return-value]


@router.put("/{task_id}", response_model=TaskRead)
def replace_task(
    db: DBSession,
    current_user: CurrentUser,
    task_id: uuid.UUID,
    task_in: TaskCreate,
    version: int = Query(..., ge=1, description="Expected current version for optimistic locking"),
) -> TaskRead:
    task = task_service.get_by_id_or_404(db, task_id)
    return task_service.update_full(  # type: ignore[return-value]
        db,
        task,
        task_in,
        expected_version=version,
    )


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(
    db: DBSession,
    current_user: CurrentUser,
    task_id: uuid.UUID,
    task_in: TaskUpdate,
    version: int | None = Query(
        None,
        ge=1,
        description="Optional expected version; if provided, optimistic locking is enforced",
    ),
) -> TaskRead:
    task = task_service.get_by_id_or_404(db, task_id)
    return task_service.update_partial(  # type: ignore[return-value]
        db,
        task,
        task_in,
        expected_version=version,
    )


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(db: DBSession, current_user: CurrentUser, task_id: uuid.UUID) -> None:
    task = task_service.get_by_id_or_404(db, task_id)
    task_service.delete(db, task)

