import uuid
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate


def get_by_id(db: Session, task_id: uuid.UUID) -> Task | None:
    return db.get(Task, task_id)


def get_by_id_or_404(db: Session, task_id: uuid.UUID) -> Task:
    task = get_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


def get_multi(
    db: Session,
    *,
    page: int = 1,
    size: int = 20,
    status: TaskStatus | None = None,
    sort_by: Literal["created_at", "updated_at", "priority", "title"] = "created_at",
    sort_order: Literal["asc", "desc"] = "desc",
) -> list[Task]:
    query = db.query(Task)

    if status is not None:
        query = query.filter(Task.status == status)

    sort_column_map = {
        "created_at": Task.created_at,
        "updated_at": Task.updated_at,
        "priority": Task.priority,
        "title": Task.title,
    }
    order_column = sort_column_map.get(sort_by, Task.created_at)

    if sort_order == "desc":
        order_column = order_column.desc()
    else:
        order_column = order_column.asc()

    offset = (page - 1) * size

    return query.order_by(order_column).offset(offset).limit(size).all()


def create(db: Session, task_in: TaskCreate) -> Task:
    task = Task(
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        priority=task_in.priority,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_full(
    db: Session,
    task: Task,
    task_in: TaskCreate,
    *,
    expected_version: int,
) -> Task:
    if task.version != expected_version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Task has been modified by another process",
        )

    task.title = task_in.title
    task.description = task_in.description
    task.status = task_in.status
    task.priority = task_in.priority
    task.version += 1

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_partial(
    db: Session,
    task: Task,
    task_in: TaskUpdate,
    *,
    expected_version: int | None = None,
) -> Task:
    if expected_version is not None and task.version != expected_version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Task has been modified by another process",
        )

    update_data = task_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    task.version += 1

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def delete(db: Session, task: Task) -> None:
    db.delete(task)
    db.commit()

