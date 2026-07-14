from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class ArtesaoPerfil(Base):
    __tablename__ = "artesaos_perfis"

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
        unique=True,
        nullable=False,
        index=True
    )

    nome_loja = Column(
        String(150),
        nullable=True
    )

    biografia = Column(
        Text,
        nullable=True
    )

    telefone = Column(
        String(20),
        nullable=True
    )

    cidade = Column(
        String(100),
        nullable=True
    )

    estado = Column(
        String(2),
        nullable=True
    )

    foto_url = Column(
        String(500),
        nullable=True
    )

    instagram = Column(
        String(150),
        nullable=True
    )

    usuario = relationship(
        "Usuario",
        back_populates="perfil_artesao"
    )

    foto_nome_arquivo = Column(
    String(500),
    nullable=True
)