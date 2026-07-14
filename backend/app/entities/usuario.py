from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )
    nome = Column(
        String,
        nullable=False
    )
    email = Column(
        String,
        unique=True,
        nullable=False
    )
    senha = Column(
        String,
        nullable=False
    )
    role = Column(
        String,
        default="cliente"
    )
    status = Column(
        String,
        default="pendente"
    )
    produtos = relationship(
        "Produto",
        back_populates="artesao"
    )
    perfil_artesao = relationship(
        "ArtesaoPerfil",
        back_populates="usuario",
        uselist=False,
        cascade="all, delete-orphan"
    )