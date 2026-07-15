from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.entities.usuario import Usuario
from app.repositories import pedido_repository
from app.schemas.pedido_shema import (
    AtualizarStatusPedidoItem,
    PedidoArtesaoResponse,
    PedidoClienteResponse,
    PedidoItemArtesaoResponse,
    PedidoItemStatusResponse
)

TRANSICOES_STATUS = {
    "pendente": [
        "confirmado",
        "cancelado"
    ],
    "confirmado": [
        "em_preparacao",
        "cancelado"
    ],
    "em_preparacao": [
        "enviado",
        "cancelado"
    ],
    "enviado": [
        "entregue"
    ],
    "entregue": [],
    "cancelado": []
}

def validar_artesao(
    usuario: Usuario
) -> None:
    if usuario.role != "artesao":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso permitido somente para artesãos."
        )

def listar_pedidos_do_artesao(
    db: Session,
    usuario: Usuario
) -> list[PedidoArtesaoResponse]:
    validar_artesao(usuario)

    pedidos = pedido_repository.listar_pedidos_do_artesao(
        db=db,
        artesao_id=usuario.id
    )

    resposta = []

    for pedido in pedidos:
        itens_do_artesao = [
            item
            for item in pedido.itens
            if item.artesao_id == usuario.id
        ]

        valor_artesao = sum(
            (
                Decimal(str(item.subtotal))
                for item in itens_do_artesao
            ),
            Decimal("0.00")
        )

        quantidade_itens = sum(
            item.quantidade
            for item in itens_do_artesao
        )

        resposta.append(
            PedidoArtesaoResponse(
                id=pedido.id,
                cliente=PedidoClienteResponse(
                    id=pedido.cliente.id,
                    nome=pedido.cliente.nome,
                    email=pedido.cliente.email
                ),
                endereco_entrega=pedido.endereco_entrega,
                criado_em=pedido.criado_em,
                atualizado_em=pedido.atualizado_em,
                valor_artesao=valor_artesao,
                quantidade_itens=quantidade_itens,
                itens=[
                    PedidoItemArtesaoResponse(
                        id=item.id,
                        pedido_id=item.pedido_id,
                        produto_id=item.produto_id,
                        nome_produto=item.nome_produto,
                        quantidade=item.quantidade,
                        preco_unitario=item.preco_unitario,
                        subtotal=item.subtotal,
                        status=item.status
                    )
                    for item in itens_do_artesao
                ]
            )
        )

    return resposta

def atualizar_status_item(
    db: Session,
    usuario: Usuario,
    item_id: int,
    dados: AtualizarStatusPedidoItem
) -> PedidoItemStatusResponse:
    validar_artesao(usuario)

    item = pedido_repository.buscar_item_por_id(
        db=db,
        item_id=item_id
    )

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item do pedido não encontrado."
        )

    if item.artesao_id != usuario.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não pode alterar este item."
        )

    status_atual = item.status
    novo_status = dados.status

    if novo_status == status_atual:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O item já possui esse status."
        )

    status_permitidos = TRANSICOES_STATUS.get(
        status_atual,
        []
    )

    if novo_status not in status_permitidos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Não é possível alterar o status de "
                f"'{status_atual}' para '{novo_status}'."
            )
        )

    item_atualizado = (
        pedido_repository.atualizar_status_item(
            db=db,
            item=item,
            novo_status=novo_status
        )
    )

    return PedidoItemStatusResponse(
        id=item_atualizado.id,
        pedido_id=item_atualizado.pedido_id,
        status=item_atualizado.status,
        mensagem="Status atualizado com sucesso."
    )