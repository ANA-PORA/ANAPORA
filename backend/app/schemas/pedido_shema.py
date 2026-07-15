from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, ConfigDict

StatusPedidoItem = Literal[
    "pendente",
    "confirmado",
    "em_preparacao",
    "enviado",
    "entregue",
    "cancelado"
]

class PedidoClienteResponse(BaseModel):
    id: int
    nome: str
    email: str

    model_config = ConfigDict(
        from_attributes=True
    )

class PedidoItemArtesaoResponse(BaseModel):
    id: int
    pedido_id: int
    produto_id: int
    nome_produto: str
    quantidade: int
    preco_unitario: Decimal
    subtotal: Decimal
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )

class PedidoArtesaoResponse(BaseModel):
    id: int
    cliente: PedidoClienteResponse
    endereco_entrega: str
    criado_em: datetime
    atualizado_em: datetime
    valor_artesao: Decimal
    quantidade_itens: int
    itens: list[PedidoItemArtesaoResponse]

    model_config = ConfigDict(
        from_attributes=True
    )

class AtualizarStatusPedidoItem(BaseModel):
    status: StatusPedidoItem

class PedidoItemStatusResponse(BaseModel):
    id: int
    pedido_id: int
    status: str
    mensagem: str