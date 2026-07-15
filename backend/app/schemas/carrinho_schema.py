from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class CarrinhoItemCreate(BaseModel):
    produto_id: int = Field(..., gt=0)
    quantidade: int = Field(default=1, ge=1)


class CarrinhoItemUpdate(BaseModel):
    quantidade: int = Field(..., ge=1)


class CarrinhoProdutoResponse(BaseModel):
    id: int
    nome: str
    preco: Decimal
    estoque: int
    ativo: bool
    imagem_principal: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CarrinhoArtesaoResponse(BaseModel):
    id: int
    nome: str
    nome_loja: str | None = None

    model_config = ConfigDict(from_attributes=True)


class CarrinhoItemResponse(BaseModel):
    id: int
    quantidade: int
    preco_unitario: Decimal
    subtotal: Decimal

    estoque_disponivel: int
    disponivel: bool
    mensagem_estoque: str | None = None

    produto: CarrinhoProdutoResponse
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CarrinhoGrupoArtesaoResponse(BaseModel):
    artesao: CarrinhoArtesaoResponse

    quantidade_itens: int
    subtotal: Decimal

    itens: list[CarrinhoItemResponse]


class CarrinhoResponse(BaseModel):
    id: int
    usuario_id: int

    quantidade_itens: int
    quantidade_produtos_diferentes: int

    subtotal: Decimal
    total: Decimal

    possui_item_indisponivel: bool
    mensagens: list[str]

    grupos: list[CarrinhoGrupoArtesaoResponse]

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CarrinhoResumoResponse(BaseModel):
    quantidade_itens: int
    quantidade_produtos_diferentes: int
    subtotal: Decimal
    possui_item_indisponivel: bool


class CarrinhoMensagemResponse(BaseModel):
    message: str