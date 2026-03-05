# Import all models here so Alembic autogenerate picks them up
from app.db.models.board import Board
from app.db.models.card import Card
from app.db.models.column import Column
from app.db.models.task import Task
from app.db.models.user import User

__all__ = ["User", "Board", "Column", "Card", "Task"]
