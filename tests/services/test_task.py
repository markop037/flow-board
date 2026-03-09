"""Unit tests for the task service layer. Database session is mocked."""
import uuid
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.db.models.task import Task, TaskPriority, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate
from app.services import task as task_service


@pytest.fixture
def db():
    """Mock SQLAlchemy session."""
    session = MagicMock()
    session.add = MagicMock()
    session.commit = MagicMock()
    session.refresh = MagicMock()
    session.get = MagicMock(return_value=None)
    session.delete = MagicMock()
    return session


@pytest.fixture
def task_create():
    return TaskCreate(
        title="Test task",
        description="Description",
        status=TaskStatus.TO_DO,
        priority=TaskPriority.MEDIUM,
    )


@pytest.fixture
def task_model():
    """A Task instance for update/delete tests."""
    return Task(
        id=uuid.uuid4(),
        title="Existing task",
        description="Existing description",
        status=TaskStatus.IN_PROGRESS,
        priority=TaskPriority.HIGH,
        version=1,
    )


# --- create ---


def test_create_calls_add_commit_refresh(db, task_create):
    task_service.create(db, task_create)
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()
    # refresh is called with the task instance that was added
    added_task = db.add.call_args[0][0]
    db.refresh.assert_called_with(added_task)


def test_create_returns_task_with_correct_fields(db, task_create):
    result = task_service.create(db, task_create)
    assert result is not None
    assert result.title == task_create.title
    assert result.description == task_create.description
    assert result.status == task_create.status
    assert result.priority == task_create.priority


def test_create_minimal_task(db):
    minimal = TaskCreate(title="Only title")
    result = task_service.create(db, minimal)
    assert result.title == "Only title"
    assert result.description is None
    assert result.status == TaskStatus.TO_DO
    assert result.priority == TaskPriority.MEDIUM


# --- update_full ---


def test_update_full_success(db, task_model, task_create):
    task_create.title = "Updated title"
    task_create.status = TaskStatus.DONE
    result = task_service.update_full(db, task_model, task_create, expected_version=1)
    assert result is task_model
    assert task_model.title == "Updated title"
    assert task_model.status == TaskStatus.DONE
    assert task_model.version == 2
    db.add.assert_called_once_with(task_model)
    db.commit.assert_called_once()
    db.refresh.assert_called_once_with(task_model)


def test_update_full_raises_409_on_version_mismatch(db, task_model, task_create):
    with pytest.raises(HTTPException) as exc_info:
        task_service.update_full(db, task_model, task_create, expected_version=99)
    assert exc_info.value.status_code == 409
    assert "modified by another process" in str(exc_info.value.detail).lower()
    db.commit.assert_not_called()


# --- update_partial ---


def test_update_partial_success(db, task_model):
    task_in = TaskUpdate(title="New title", status=TaskStatus.DONE)
    result = task_service.update_partial(db, task_model, task_in)
    assert result is task_model
    assert task_model.title == "New title"
    assert task_model.status == TaskStatus.DONE
    assert task_model.version == 2
    db.commit.assert_called_once()


def test_update_partial_only_set_fields(db, task_model):
    task_model.title = "Original"
    task_in = TaskUpdate(priority=TaskPriority.LOW)
    task_service.update_partial(db, task_model, task_in)
    assert task_model.priority == TaskPriority.LOW
    assert task_model.title == "Original"
    assert task_model.version == 2


def test_update_partial_raises_409_when_expected_version_given_and_mismatch(db, task_model):
    task_in = TaskUpdate(title="X")
    with pytest.raises(HTTPException) as exc_info:
        task_service.update_partial(db, task_model, task_in, expected_version=999)
    assert exc_info.value.status_code == 409
    db.commit.assert_not_called()


def test_update_partial_no_409_when_expected_version_not_given(db, task_model):
    task_in = TaskUpdate(title="Y")
    result = task_service.update_partial(db, task_model, task_in)
    assert result is task_model
    db.commit.assert_called_once()


# --- delete ---


def test_delete_calls_delete_and_commit(db, task_model):
    task_service.delete(db, task_model)
    db.delete.assert_called_once_with(task_model)
    db.commit.assert_called_once()


# --- get_by_id ---


def test_get_by_id_returns_none_when_not_found(db):
    task_id = uuid.uuid4()
    db.get.return_value = None
    result = task_service.get_by_id(db, task_id)
    assert result is None
    db.get.assert_called_once_with(Task, task_id)


def test_get_by_id_returns_task_when_found(db, task_model):
    task_id = task_model.id
    db.get.return_value = task_model
    result = task_service.get_by_id(db, task_id)
    assert result is task_model
    db.get.assert_called_once_with(Task, task_id)


# --- get_by_id_or_404 ---


def test_get_by_id_or_404_raises_when_not_found(db):
    task_id = uuid.uuid4()
    db.get.return_value = None
    with pytest.raises(HTTPException) as exc_info:
        task_service.get_by_id_or_404(db, task_id)
    assert exc_info.value.status_code == 404
    assert "not found" in str(exc_info.value.detail).lower()


def test_get_by_id_or_404_returns_task_when_found(db, task_model):
    db.get.return_value = task_model
    result = task_service.get_by_id_or_404(db, task_model.id)
    assert result is task_model


# --- get_multi ---


def test_get_multi_returns_list_from_query_chain(db):
    expected_tasks = [
        Task(title="A", version=1),
        Task(title="B", version=1),
    ]
    mock_query = MagicMock()
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.offset.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.all.return_value = expected_tasks
    db.query.return_value = mock_query

    result = task_service.get_multi(db, page=1, size=20)
    assert result == expected_tasks
    db.query.assert_called_once_with(Task)
    mock_query.offset.assert_called_once_with(0)
    mock_query.limit.assert_called_once_with(20)
    mock_query.all.assert_called_once()


def test_get_multi_applies_status_filter(db):
    mock_query = MagicMock()
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.offset.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.all.return_value = []
    db.query.return_value = mock_query

    task_service.get_multi(db, page=2, size=10, status=TaskStatus.DONE)
    mock_query.filter.assert_called_once()
    mock_query.offset.assert_called_once_with(10)
    mock_query.limit.assert_called_once_with(10)


def test_get_multi_sort_order_asc(db):
    mock_query = MagicMock()
    mock_query.filter.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.offset.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.all.return_value = []
    db.query.return_value = mock_query

    task_service.get_multi(db, sort_by="title", sort_order="asc")
    mock_query.order_by.assert_called_once()
    # order_by is called with a descending or ascending column; we only check it was called
    assert mock_query.order_by.called
