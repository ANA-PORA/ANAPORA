from decimal import Decimal
from sqlalchemy import ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class PedidoItem(Base):
    __tablename__ = "pedido_itens"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )
    pedido_id: Mapped[int] = mapped_column(
        ForeignKey(
            "pedidos.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )
    produto_id: Mapped[int] = mapped_column(
        ForeignKey("produtos.id"),
        nullable=False,
        index=True
    )
    artesao_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"),
        nullable=False,
        index=True
    )
    nome_produto: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    quantidade: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    preco_unitario: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )
    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pendente"
    )

    pedido = relationship(
        "Pedido",
        back_populates="itens"
    )
    produto = relationship(
        "Produto",
        back_populates="itens_pedido"
    )
    artesao = relationship(
        "Usuario",
        foreign_keys=[artesao_id],
        back_populates="itens_vendidos"
    )