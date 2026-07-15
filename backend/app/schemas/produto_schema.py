from datetime import datetime
from decimal import Decimal

from fastapi import Form
from pydantic import BaseModel, ConfigDict


class ProdutoImagemResponse(BaseModel):

    id: int

    url: str

    ordem: int

    model_config = ConfigDict(
        from_attributes=True
    )


class ProdutoBase(BaseModel):

    nome: str

    descricao: str

    preco: Decimal

    estoque: int
    
    peso_kg: Decimal | None = None

    altura_cm: Decimal | None = None

    largura_cm: Decimal | None = None

    comprimento_cm: Decimal | None = None

    categoria_id: int

    destaque: bool = False

    ativo: bool = True


class ProdutoCreate(ProdutoBase):

    @classmethod
    def as_form(
        cls,
        nome: str = Form(...),
        descricao: str = Form(...),
        preco: Decimal = Form(...),
        estoque: int = Form(...),
        peso_kg: Decimal | None = Form(None),
        altura_cm: Decimal | None = Form(None),
        largura_cm: Decimal | None = Form(None),
        comprimento_cm: Decimal | None = Form(None),
        categoria_id: int = Form(...),
        destaque: bool = Form(False),
        ativo: bool = Form(True)
    ):
        return cls(
            nome=nome,
            descricao=descricao,
            preco=preco,
            estoque=estoque,
            peso_kg=peso_kg,
            altura_cm=altura_cm,
            largura_cm=largura_cm,
            comprimento_cm=comprimento_cm,
            categoria_id=categoria_id,
            destaque=destaque,
            ativo=ativo
        )


class ProdutoUpdate(ProdutoBase):

    @classmethod
    def as_form(
        cls,
        nome: str = Form(...),
        descricao: str = Form(...),
        preco: Decimal = Form(...),
        estoque: int = Form(...),
        peso_kg: Decimal | None = Form(None),
        altura_cm: Decimal | None = Form(None),
        largura_cm: Decimal | None = Form(None),
        comprimento_cm: Decimal | None = Form(None),
        categoria_id: int = Form(...),
        destaque: bool = Form(False),
        ativo: bool = Form(True)
    ):
        return cls(
            nome=nome,
            descricao=descricao,
            preco=preco,
            estoque=estoque,
            peso_kg=peso_kg,
            altura_cm=altura_cm,
            largura_cm=largura_cm,
            comprimento_cm=comprimento_cm,
            categoria_id=categoria_id,
            destaque=destaque,
            ativo=ativo
        )


class ProdutoResponse(ProdutoBase):

    id: int

    artesao_id: int

    imagens: list[ProdutoImagemResponse] = []

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )