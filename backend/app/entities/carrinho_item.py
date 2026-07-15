from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    UniqueConstraint
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class CarrinhoItem(Base):

    __tablename__ = "carrinho_itens"

    __table_args__ = (
        UniqueConstraint(
            "carrinho_id",
            "produto_id",
            name="uq_carrinho_produto"
        ),
    )

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    carrinho_id = Column(
        Integer,
        ForeignKey(
            "carrinhos.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    produto_id = Column(
        Integer,
        ForeignKey(
            "produtos.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    quantidade = Column(
        Integer,
        nullable=False,
        default=1
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

    carrinho = relationship(
        "Carrinho",
        back_populates="itens"
    )

    produto = relationship(
        "Produto",
        back_populates="itens_carrinho"
    )