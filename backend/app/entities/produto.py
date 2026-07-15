from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(Text, nullable=False)
    preco = Column(Numeric(10, 2), nullable=False)
    estoque = Column(Integer, nullable=False, default=0)

    peso_kg = Column(Numeric(10, 3), nullable=True)
    altura_cm = Column(Numeric(10, 2), nullable=True)
    largura_cm = Column(Numeric(10, 2), nullable=True)
    comprimento_cm = Column(Numeric(10, 2), nullable=True)

    destaque = Column(Boolean, nullable=False, default=False)
    ativo = Column(Boolean, nullable=False, default=True)

    categoria_id = Column(
        Integer,
        ForeignKey("categorias.id"),
        nullable=False
    )
    artesao_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    categoria = relationship("Categoria", back_populates="produtos")
    artesao = relationship("Usuario", back_populates="produtos")
    imagens = relationship(
        "ProdutoImagem",
        back_populates="produto",
        cascade="all, delete-orphan",
        order_by="ProdutoImagem.ordem"
    )
    itens_carrinho = relationship(
        "CarrinhoItem",
        back_populates="produto"
    )
    #itens_pedido = relationship(
    #    "PedidoItem",
    #    back_populates="produto"
    #)
