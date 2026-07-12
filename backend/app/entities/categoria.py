from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship

class Categoria(Base):

    __tablename__ = "categorias"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    nome = Column(
        String,
        unique=True,
        nullable=False
    )

    slug = Column(
        String,
        unique=True,
        nullable=False
    )

    ativo = Column(
        Boolean,
        default=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    produtos = relationship(
    "Produto",
    back_populates="categoria"
)