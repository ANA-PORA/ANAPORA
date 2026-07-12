from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.entities.produto import Produto
from app.entities.produto_imagem import ProdutoImagem

from app.schemas.produto_schema import (
    ProdutoCreate,
    ProdutoUpdate
)

from app.repositories import (
    produto_repository,
    categoria_repository,
    produto_imagem_repository
)

from app.services.storage.storage_service import (
    upload_imagem
)


def criar(
    db: Session,
    dados: ProdutoCreate,
    imagens: list[UploadFile],
    artesao_id: int
):
    categoria = categoria_repository.buscar_por_id(
        db,
        dados.categoria_id
    )

    if categoria is None:
        raise ValueError(
            "Categoria não encontrada."
        )

    produto = Produto(
        nome=dados.nome,
        descricao=dados.descricao,
        preco=dados.preco,
        estoque=dados.estoque,
        categoria_id=dados.categoria_id,
        destaque=dados.destaque,
        ativo=dados.ativo,
        artesao_id=artesao_id
    )

    produto = produto_repository.criar(
        db,
        produto
    )

    for ordem, arquivo in enumerate(imagens, start=1):

        upload = upload_imagem(
            arquivo
        )

        imagem = ProdutoImagem(
            produto_id=produto.id,
            nome_arquivo=upload["nome_arquivo"],
            url=upload["url"],
            tipo=upload["tipo"],
            tamanho=arquivo.size or 0,
            ordem=ordem
        )

        produto_imagem_repository.criar(
            db,
            imagem
        )

    return produto_repository.buscar_por_id(
        db,
        produto.id
    )


def listar(
    db: Session
):
    return produto_repository.listar(
        db
    )


def buscar_por_id(
    db: Session,
    produto_id: int
):
    produto = produto_repository.buscar_por_id(
        db,
        produto_id
    )

    if produto is None:
        raise ValueError(
            "Produto não encontrado."
        )

    return produto


def buscar_por_categoria(
    db: Session,
    categoria_id: int
):
    return produto_repository.buscar_por_categoria(
        db,
        categoria_id
    )


def buscar_destaques(
    db: Session
):
    return produto_repository.buscar_destaques(
        db
    )


def pesquisar(
    db: Session,
    texto: str
):
    return produto_repository.pesquisar(
        db,
        texto
    )


def atualizar(
    db: Session,
    produto_id: int,
    dados: ProdutoUpdate
):
    produto = produto_repository.buscar_por_id(
        db,
        produto_id
    )

    if produto is None:
        raise ValueError(
            "Produto não encontrado."
        )

    categoria = categoria_repository.buscar_por_id(
        db,
        dados.categoria_id
    )

    if categoria is None:
        raise ValueError(
            "Categoria não encontrada."
        )

    produto.nome = dados.nome
    produto.descricao = dados.descricao
    produto.preco = dados.preco
    produto.estoque = dados.estoque
    produto.categoria_id = dados.categoria_id
    produto.destaque = dados.destaque
    produto.ativo = dados.ativo

    return produto_repository.atualizar(
        db,
        produto
    )


def remover(
    db: Session,
    produto_id: int
):
    produto = produto_repository.buscar_por_id(
        db,
        produto_id
    )

    if produto is None:
        raise ValueError(
            "Produto não encontrado."
        )

    return produto_repository.remover(
        db,
        produto
    )