from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.entities.usuario import Usuario
from app.schemas.pedido_shema import (
    AtualizarStatusPedidoItem,
    PedidoArtesaoResponse,
    PedidoItemStatusResponse
)
import app.services.pedido_service as pedido_service

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos"]
)

@router.get(
    "/artesao",
    response_model=list[PedidoArtesaoResponse]
)
def listar_pedidos_artesao(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return pedido_service.listar_pedidos_do_artesao(
        db=db,
        usuario=usuario
    )

@router.patch(
    "/artesao/itens/{item_id}/status",
    response_model=PedidoItemStatusResponse
)
def atualizar_status_item(
    item_id: int,
    dados: AtualizarStatusPedidoItem,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    return pedido_service.atualizar_status_item(
        db=db,
        usuario=usuario,
        item_id=item_id,
        dados=dados
    )