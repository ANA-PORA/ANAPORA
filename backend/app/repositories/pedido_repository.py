from sqlalchemy.orm import Session, joinedload
from app.entities.pedido import Pedido
from app.entities.pedido_item import PedidoItem

def listar_pedidos_do_artesao(
    db: Session,
    artesao_id: int
) -> list[Pedido]:
    return (
        db.query(Pedido)
        .join(
            PedidoItem,
            PedidoItem.pedido_id == Pedido.id
        )
        .options(
            joinedload(Pedido.cliente),
            joinedload(Pedido.itens)
        )
        .filter(
            PedidoItem.artesao_id == artesao_id
        )
        .order_by(
            Pedido.criado_em.desc()
        )
        .distinct()
        .all()
    )

def buscar_item_por_id(
    db: Session,
    item_id: int
) -> PedidoItem | None:
    return (
        db.query(PedidoItem)
        .filter(
            PedidoItem.id == item_id
        )
        .first()
    )

def atualizar_status_item(
    db: Session,
    item: PedidoItem,
    novo_status: str
) -> PedidoItem:
    item.status = novo_status

    db.commit()
    db.refresh(item)

    return item