from pydantic import BaseModel, ConfigDict


class CategoriaCreate(BaseModel):

    nome: str


class CategoriaUpdate(BaseModel):

    nome: str


class CategoriaResponse(BaseModel):

    id: int
    nome: str
    slug: str
    ativo: bool

    model_config = ConfigDict(
        from_attributes=True
    )