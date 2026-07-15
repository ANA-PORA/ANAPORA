from sqlalchemy.orm import (
    Session,
    joinedload
)

from app.entities.carrinho import Carrinho
from app.entities.carrinho_item import CarrinhoItem
from app.entities.produto import Produto
from app.entities.usuario import Usuario


def buscar_por_usuario(
    db: Session,
    usuario_id: int
):
    return (
        db.query(Carrinho)
        .options(
            joinedload(Carrinho.itens)
            .joinedload(CarrinhoItem.produto)
            .joinedload(Produto.imagens),

            joinedload(Carrinho.itens)
            .joinedload(CarrinhoItem.produto)
            .joinedload(Produto.artesao)
            .joinedload(Usuario.perfil_artesao)
        )
        .filter(
            Carrinho.usuario_id == usuario_id
        )
        .first()
    )


def buscar_por_id(
    db: Session,
    carrinho_id: int
):
    return (
        db.query(Carrinho)
        .filter(
            Carrinho.id == carrinho_id
        )
        .first()
    )


def criar_carrinho(
    db: Session,
    usuario_id: int
):
    carrinho = Carrinho(
        usuario_id=usuario_id
    )

    db.add(carrinho)
    db.commit()
    db.refresh(carrinho)

    return carrinho


def buscar_item_por_id(
    db: Session,
    item_id: int
):
    return (
        db.query(CarrinhoItem)
        .options(
            joinedload(CarrinhoItem.produto)
            .joinedload(Produto.imagens),

            joinedload(CarrinhoItem.produto)
            .joinedload(Produto.artesao)
            .joinedload(Usuario.perfil_artesao)
        )
        .filter(
            CarrinhoItem.id == item_id
        )
        .first()
    )


def buscar_item_por_produto(
    db: Session,
    carrinho_id: int,
    produto_id: int
):
    return (
        db.query(CarrinhoItem)
        .filter(
            CarrinhoItem.carrinho_id == carrinho_id,
            CarrinhoItem.produto_id == produto_id
        )
        .first()
    )


def adicionar_item(
    db: Session,
    carrinho_id: int,
    produto_id: int,
    quantidade: int
):
    item = CarrinhoItem(
        carrinho_id=carrinho_id,
        produto_id=produto_id,
        quantidade=quantidade
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


def atualizar_quantidade(
    db: Session,
    item: CarrinhoItem,
    quantidade: int
):
    item.quantidade = quantidade

    db.commit()
    db.refresh(item)

    return item


def remover_item(
    db: Session,
    item: CarrinhoItem
):
    db.delete(item)
    db.commit()


def remover_todos_itens(
    db: Session,
    carrinho_id: int
):
    (
        db.query(CarrinhoItem)
        .filter(
            CarrinhoItem.carrinho_id == carrinho_id
        )
        .delete(
            synchronize_session=False
        )
    )

    db.commit()