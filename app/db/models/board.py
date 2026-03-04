import uuid

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class Board(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "boards"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    owner: Mapped["User"] = relationship("User", back_populates="boards")  # noqa: F821
    columns: Mapped[list["Column"]] = relationship(  # noqa: F821
        "Column", back_populates="board", cascade="all, delete-orphan", order_by="Column.position"
    )
