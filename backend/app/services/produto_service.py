from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.entities.produto import Produto
from app.entities.produto_imagem import ProdutoImagem
from app.repositories import (
    categoria_repository,
    produto_imagem_repository,
    produto_repository
)
from app.schemas.produto_schema import ProdutoCreate, ProdutoUpdate
from app.services.storage.storage_service import (
    upload_imagem,
    validar_quantidade
)


def validar_dados_frete(dados: ProdutoCreate | ProdutoUpdate) -> None:
    campos = {
        "peso": dados.peso_kg,
        "altura": dados.altura_cm,
        "largura": dados.largura_cm,
        "comprimento": dados.comprimento_cm
    }

    for nome, valor in campos.items():
        if valor is not None and valor <= 0:
            raise ValueError(
                f"O campo {nome} deve ser maior que zero."
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
        raise ValueError("Categoria não encontrada.")

    if not categoria.ativo:
        raise ValueError(
            "A categoria informada está inativa."
        )

    if dados.preco <= 0:
        raise ValueError(
            "O preço deve ser maior que zero."
        )

    if dados.estoque < 0:
        raise ValueError(
            "O estoque não pode ser negativo."
        )

    validar_dados_frete(dados)
    validar_quantidade(imagens)

    produto = Produto(
        nome=dados.nome.strip(),
        descricao=dados.descricao.strip(),
        preco=dados.preco,
        estoque=dados.estoque,
        peso_kg=dados.peso_kg,
        altura_cm=dados.altura_cm,
        largura_cm=dados.largura_cm,
        comprimento_cm=dados.comprimento_cm,
        categoria_id=dados.categoria_id,
        destaque=dados.destaque,
        ativo=dados.ativo,
        artesao_id=artesao_id
    )

    produto = produto_repository.criar(
        db,
        produto
    )

    try:
        for ordem, arquivo in enumerate(
            imagens,
            start=1
        ):
            dados_upload = upload_imagem(
                arquivo
            )

            imagem = ProdutoImagem(
                produto_id=produto.id,
                nome_arquivo=dados_upload[
                    "nome_arquivo"
                ],
                url=dados_upload["url"],
                tipo=dados_upload["tipo"],
                tamanho=dados_upload[
                    "tamanho"
                ],
                ordem=ordem
            )

            produto_imagem_repository.criar(
                db,
                imagem
            )

    except Exception:
        produto_repository.remover(
            db,
            produto
        )

        raise

    return produto_repository.buscar_por_id(
        db,
        produto.id
    )


def listar(
    db: Session
):
    return produto_repository.listar(db)


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
    categoria = categoria_repository.buscar_por_id(
        db,
        categoria_id
    )

    if categoria is None:
        raise ValueError(
            "Categoria não encontrada."
        )

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
    texto = texto.strip()

    if not texto:
        raise ValueError(
            "Informe um texto para pesquisa."
        )

    return produto_repository.pesquisar(
        db,
        texto
    )


def buscar_meus_produtos(
    db: Session,
    artesao_id: int
):
    return produto_repository.buscar_meus_produtos(
        db,
        artesao_id
    )


def listar_imagens(
    db: Session,
    produto_id: int
):
    produto = buscar_por_id(
        db,
        produto_id
    )

    return produto.imagens


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

    if not categoria.ativo:
        raise ValueError(
            "A categoria informada está inativa."
        )

    if dados.preco <= 0:
        raise ValueError(
            "O preço deve ser maior que zero."
        )

    if dados.estoque < 0:
        raise ValueError(
            "O estoque não pode ser negativo."
        )

    validar_dados_frete(dados)

    produto.nome = dados.nome.strip()
    produto.descricao = dados.descricao.strip()
    produto.preco = dados.preco
    produto.estoque = dados.estoque

    produto.peso_kg = dados.peso_kg
    produto.altura_cm = dados.altura_cm
    produto.largura_cm = dados.largura_cm
    produto.comprimento_cm = (
        dados.comprimento_cm
    )

    produto.categoria_id = (
        dados.categoria_id
    )

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