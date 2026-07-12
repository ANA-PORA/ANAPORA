from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    String
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class ProdutoImagem(Base):

    __tablename__ = "produto_imagens"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    produto_id = Column(
        Integer,
        ForeignKey("produtos.id"),
        nullable=False
    )

    nome_arquivo = Column(
        String(255),
        nullable=False
    )

    url = Column(
        String(500),
        nullable=False
    )

    tipo = Column(
        String(100),
        nullable=False
    )

    tamanho = Column(
        Integer,
        nullable=False
    )

    ordem = Column(
        Integer,
        default=1
    )

    produto = relationship(
        "Produto",
        back_populates="imagens"
    )