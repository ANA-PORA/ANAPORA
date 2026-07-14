from typing import Optional

from pydantic import BaseModel, ConfigDict


class ArtesaoPerfilUpdate(BaseModel):
    nome: Optional[str] = None
    nome_loja: Optional[str] = None
    biografia: Optional[str] = None
    telefone: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    foto_url: Optional[str] = None
    instagram: Optional[str] = None


class ArtesaoPerfilResponse(BaseModel):
    id: int
    usuario_id: int

    nome: str
    email: str

    nome_loja: Optional[str] = None
    biografia: Optional[str] = None
    telefone: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    foto_url: Optional[str] = None
    instagram: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )