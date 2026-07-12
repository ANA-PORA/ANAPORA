from sqlalchemy.orm import Session
from app.entities.categoria import Categoria


def listar_categorias(
    db: Session
):
    return (
        db.query(Categoria)
        .filter(Categoria.ativo == True)
        .order_by(Categoria.nome.asc())
        .all()
    )


def buscar_por_id(
    db: Session,
    categoria_id: int
):
    return (
        db.query(Categoria)
        .filter(Categoria.id == categoria_id)
        .first()
    )


def buscar_por_nome(
    db: Session,
    nome: str
):
    return (
        db.query(Categoria)
        .filter(Categoria.nome == nome)
        .first()
    )


def buscar_por_slug(
    db: Session,
    slug: str
):
    return (
        db.query(Categoria)
        .filter(Categoria.slug == slug)
        .first()
    )


def criar_categoria(
    db: Session,
    categoria: Categoria
):
    db.add(categoria)

    db.commit()

    db.refresh(categoria)

    return categoria


def atualizar_categoria(
    db: Session,
    categoria: Categoria
):
    db.commit()

    db.refresh(categoria)

    return categoria


def deletar_categoria(
    db: Session,
    categoria: Categoria
):
    db.delete(categoria)

    db.commit()