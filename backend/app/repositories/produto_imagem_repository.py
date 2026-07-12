from sqlalchemy.orm import Session
from app.entities.produto_imagem import ProdutoImagem


def criar(
    db: Session,
    imagem: ProdutoImagem
):
    db.add(imagem)
    db.commit()
    db.refresh(imagem)
    return imagem


def listar_por_produto(
    db: Session,
    produto_id: int
):
    return (
        db.query(ProdutoImagem)
        .filter(
            ProdutoImagem.produto_id == produto_id
        )
        .order_by(
            ProdutoImagem.ordem.asc()
        )
        .all()
    )


def buscar_por_id(
    db: Session,
    imagem_id: int
):
    return (
        db.query(ProdutoImagem)
        .filter(
            ProdutoImagem.id == imagem_id
        )
        .first()
    )


def atualizar(
    db: Session,
    imagem: ProdutoImagem
):
    db.commit()
    db.refresh(imagem)
    return imagem


def remover(
    db: Session,
    imagem: ProdutoImagem
):
    db.delete(imagem)
    db.commit()