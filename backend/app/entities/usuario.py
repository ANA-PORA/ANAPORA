from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    senha = Column(String, nullable=False)
    role = Column(String, default="cliente")
    status = Column(String, default="pendente")

    produtos = relationship(
        "Produto",
        back_populates="artesao"
    )

    perfil_artesao = relationship(
        "ArtesaoPerfil",
        back_populates="usuario",
        uselist=False,
        cascade="all, delete-orphan"
<<<<<<< Updated upstream
    )
=======
    )

    carrinho = relationship(
        "Carrinho",
        back_populates="usuario",
        uselist=False,
        cascade="all, delete-orphan"
    )

    pedidos = relationship(
        "Pedido",
        foreign_keys="Pedido.cliente_id",
        back_populates="cliente"
    )

    itens_vendidos = relationship(
        "PedidoItem",
        foreign_keys="PedidoItem.artesao_id",
        back_populates="artesao"
    )
>>>>>>> Stashed changes
