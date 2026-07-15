from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Carrinho(Base):

    __tablename__ = "carrinhos"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    usuario_id = Column(
        Integer,
        ForeignKey(
            "usuarios.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        unique=True,
        index=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    usuario = relationship(
        "Usuario",
        back_populates="carrinho"
    )

    itens = relationship(
        "CarrinhoItem",
        back_populates="carrinho",
        cascade="all, delete-orphan"
    )