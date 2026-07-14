from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.entities.produto import Produto


def criar(
    db: Session,
    produto: Produto
):
    db.add(produto)
    db.commit()
    db.refresh(produto)
    return produto


def listar(
    db: Session
):
    return (
        db.query(Produto)
        .filter(Produto.ativo == True)
        .all()
    )


def buscar_por_id(
    db: Session,
    produto_id: int
):
    return (
        db.query(Produto)
        .filter(
            Produto.id == produto_id
        )
        .first()
    )

def buscar_por_categoria(
    db: Session,
    categoria_id: int
):
    return (
        db.query(Produto)
        .filter(
            Produto.categoria_id == categoria_id,
            Produto.ativo == True
        )
        .all()
    )


def buscar_por_artesao(
    db: Session,
    artesao_id: int
):
    return (
        db.query(Produto)
        .filter(
            Produto.artesao_id == artesao_id
        )
        .all()
    )


def buscar_destaques(
    db: Session
):
    return (
        db.query(Produto)
        .filter(
            Produto.destaque == True,
            Produto.ativo == True
        )
        .all()
    )


def pesquisar(
    db: Session,
    texto: str
):
    return (
        db.query(Produto)
        .filter(
            Produto.ativo == True,
            or_(
                Produto.nome.ilike(f"%{texto}%"),
                Produto.descricao.ilike(f"%{texto}%")
            )
        )
        .all()
    )


def atualizar(
    db: Session,
    produto: Produto
):
    db.commit()
    db.refresh(produto)
    return produto


def remover(
    db: Session,
    produto: Produto
):
    produto.ativo = False
    db.commit()
    db.refresh(produto)
    return produto

def buscar_meus_produtos(
    db: Session,
    artesao_id: int
) -> list[Produto]:
    return (
        db.query(Produto)
        .filter(
            Produto.artesao_id == artesao_id
        )
        .order_by(
            Produto.created_at.desc()
        )
        .all()
    )