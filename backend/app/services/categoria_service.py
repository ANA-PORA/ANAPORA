from sqlalchemy.orm import Session
from slugify import slugify

from app.entities.categoria import Categoria
from app.repositories import categoria_repository


def listar_categorias(
    db: Session
):
    return categoria_repository.listar_categorias(db)


def buscar_categoria(
    db: Session,
    categoria_id: int
):
    return categoria_repository.buscar_por_id(
        db,
        categoria_id
    )


def criar_categoria(
    db: Session,
    nome: str
):
    existe = categoria_repository.buscar_por_nome(
        db,
        nome
    )

    if existe:
        return None

    categoria = Categoria(
        nome=nome,
        slug=slugify(nome),
        ativo=True
    )

    return categoria_repository.criar_categoria(
        db,
        categoria
    )


def atualizar_categoria(
    db: Session,
    categoria_id: int,
    nome: str
):
    categoria = categoria_repository.buscar_por_id(
        db,
        categoria_id
    )

    if not categoria:
        return None

    existe = categoria_repository.buscar_por_nome(
        db,
        nome
    )

    if existe and existe.id != categoria_id:
        return False

    categoria.nome = nome
    categoria.slug = slugify(nome)

    return categoria_repository.atualizar_categoria(
        db,
        categoria
    )


def deletar_categoria(
    db: Session,
    categoria_id: int
):
    categoria = categoria_repository.buscar_por_id(
        db,
        categoria_id
    )

    if not categoria:
        return None

    categoria_repository.deletar_categoria(
        db,
        categoria
    )

    return True