from decimal import Decimal

from pydantic import BaseModel, Field


class CalcularFreteRequest(BaseModel):
    cep_destino: str = Field(
        ...,
        min_length=8,
        max_length=9,
        examples=["69005010"]
    )

    item_ids: list[int] = Field(
        ...,
        min_length=1,
        description=(
            "IDs dos itens do carrinho selecionados "
            "para o cálculo do frete."
        ),
        examples=[[1, 2, 5]]
    )


class OpcaoFreteResponse(BaseModel):
    codigo: str
    nome: str
    valor: Decimal
    prazo_dias: int


class FreteArtesaoResponse(BaseModel):
    artesao_id: int
    nome_artesao: str
    nome_loja: str | None = None
    cep_origem: str
    cep_destino: str
    opcoes: list[OpcaoFreteResponse]


class CalcularFreteResponse(BaseModel):
    cep_destino: str
    grupos: list[FreteArtesaoResponse]


class PacoteFrete(BaseModel):
    peso_kg: Decimal
    altura_cm: Decimal
    largura_cm: Decimal
    comprimento_cm: Decimal