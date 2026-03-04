import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDMixin


class Column(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "columns"

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    board_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("boards.id", ondelete="CASCADE"), nullable=False
    )

    board: Mapped["Board"] = relationship("Board", back_populates="columns")  # noqa: F821
    cards: Mapped[list["Card"]] = relationship(  # noqa: F821
        "Card", back_populates="column", cascade="all, delete-orphan", order_by="Card.position"
    )
