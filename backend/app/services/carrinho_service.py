from decimal import Decimal

from sqlalchemy.orm import Session

from app.entities.carrinho import Carrinho
from app.entities.carrinho_item import CarrinhoItem
from app.entities.produto import Produto
from app.repositories import (
    carrinho_repository,
    produto_repository
)
from app.schemas.carrinho_schema import (
    CarrinhoItemCreate,
    CarrinhoItemUpdate
)


def obter_ou_criar_carrinho(
    db: Session,
    usuario_id: int
):
    carrinho = carrinho_repository.buscar_por_usuario(
        db,
        usuario_id
    )

    if carrinho is None:
        carrinho_repository.criar_carrinho(
            db,
            usuario_id
        )

        carrinho = carrinho_repository.buscar_por_usuario(
            db,
            usuario_id
        )

    return carrinho


def validar_produto_para_carrinho(
    produto: Produto,
    usuario_id: int,
    quantidade: int
):
    if not produto.ativo:
        raise ValueError(
            "Este produto está inativo."
        )

    if produto.estoque <= 0:
        raise ValueError(
            "Este produto está sem estoque."
        )

    if quantidade <= 0:
        raise ValueError(
            "A quantidade deve ser maior que zero."
        )

    if quantidade > produto.estoque:
        raise ValueError(
            f"Existem apenas {produto.estoque} "
            "unidades disponíveis."
        )

    if produto.artesao_id == usuario_id:
        raise ValueError(
            "Você não pode adicionar seu próprio "
            "produto ao carrinho."
        )


def obter_imagem_principal(
    produto: Produto
):
    if not produto.imagens:
        return None

    return produto.imagens[0].url


def obter_nome_loja(
    produto: Produto
):
    if (
        produto.artesao
        and produto.artesao.perfil_artesao
    ):
        return produto.artesao.perfil_artesao.nome_loja

    return None


def verificar_disponibilidade_item(
    item: CarrinhoItem
):
    produto = item.produto

    if not produto.ativo:
        return {
            "disponivel": False,
            "mensagem": (
                f'O produto "{produto.nome}" '
                "não está mais disponível."
            )
        }

    if produto.estoque <= 0:
        return {
            "disponivel": False,
            "mensagem": (
                f'O produto "{produto.nome}" '
                "está sem estoque."
            )
        }

    if item.quantidade > produto.estoque:
        return {
            "disponivel": False,
            "mensagem": (
                f'A quantidade do produto "{produto.nome}" '
                f"é maior que o estoque disponível. "
                f"Disponível: {produto.estoque}."
            )
        }

    return {
        "disponivel": True,
        "mensagem": None
    }


def montar_item_response(
    item: CarrinhoItem
):
    produto = item.produto

    preco_unitario = Decimal(
        str(produto.preco)
    )

    subtotal = (
        preco_unitario *
        item.quantidade
    )

    disponibilidade = verificar_disponibilidade_item(
        item
    )

    return {
        "id": item.id,
        "quantidade": item.quantidade,
        "preco_unitario": preco_unitario,
        "subtotal": subtotal,
        "estoque_disponivel": produto.estoque,
        "disponivel": disponibilidade["disponivel"],
        "mensagem_estoque": disponibilidade["mensagem"],
        "produto": {
            "id": produto.id,
            "nome": produto.nome,
            "preco": preco_unitario,
            "estoque": produto.estoque,
            "ativo": produto.ativo,
            "imagem_principal": obter_imagem_principal(
                produto
            )
        },
        "created_at": item.created_at
    }


def montar_carrinho_response(
    carrinho: Carrinho
):
    grupos_por_artesao = {}

    quantidade_total_itens = 0
    subtotal_carrinho = Decimal("0.00")

    mensagens = []
    possui_item_indisponivel = False

    for item in carrinho.itens:
        produto = item.produto
        artesao = produto.artesao

        item_response = montar_item_response(
            item
        )

        artesao_id = artesao.id

        if artesao_id not in grupos_por_artesao:
            grupos_por_artesao[artesao_id] = {
                "artesao": {
                    "id": artesao.id,
                    "nome": artesao.nome,
                    "nome_loja": obter_nome_loja(
                        produto
                    )
                },
                "quantidade_itens": 0,
                "subtotal": Decimal("0.00"),
                "itens": []
            }

        grupo = grupos_por_artesao[artesao_id]

        grupo["itens"].append(
            item_response
        )

        grupo["quantidade_itens"] += (
            item.quantidade
        )

        grupo["subtotal"] += (
            item_response["subtotal"]
        )

        quantidade_total_itens += (
            item.quantidade
        )

        subtotal_carrinho += (
            item_response["subtotal"]
        )

        if not item_response["disponivel"]:
            possui_item_indisponivel = True

            if item_response["mensagem_estoque"]:
                mensagens.append(
                    item_response["mensagem_estoque"]
                )

    return {
        "id": carrinho.id,
        "usuario_id": carrinho.usuario_id,
        "quantidade_itens": quantidade_total_itens,
        "quantidade_produtos_diferentes": len(
            carrinho.itens
        ),
        "subtotal": subtotal_carrinho,
        "total": subtotal_carrinho,
        "possui_item_indisponivel": (
            possui_item_indisponivel
        ),
        "mensagens": mensagens,
        "grupos": list(
            grupos_por_artesao.values()
        ),
        "created_at": carrinho.created_at,
        "updated_at": carrinho.updated_at
    }


def buscar_carrinho(
    db: Session,
    usuario_id: int
):
    carrinho = obter_ou_criar_carrinho(
        db,
        usuario_id
    )

    return montar_carrinho_response(
        carrinho
    )


def buscar_resumo(
    db: Session,
    usuario_id: int
):
    carrinho = obter_ou_criar_carrinho(
        db,
        usuario_id
    )

    quantidade_itens = 0
    subtotal = Decimal("0.00")
    possui_item_indisponivel = False

    for item in carrinho.itens:
        quantidade_itens += item.quantidade

        subtotal += (
            Decimal(str(item.produto.preco))
            * item.quantidade
        )

        disponibilidade = verificar_disponibilidade_item(
            item
        )

        if not disponibilidade["disponivel"]:
            possui_item_indisponivel = True

    return {
        "quantidade_itens": quantidade_itens,
        "quantidade_produtos_diferentes": len(
            carrinho.itens
        ),
        "subtotal": subtotal,
        "possui_item_indisponivel": (
            possui_item_indisponivel
        )
    }


def adicionar_item(
    db: Session,
    dados: CarrinhoItemCreate,
    usuario_id: int
):
    produto = produto_repository.buscar_por_id(
        db,
        dados.produto_id
    )

    if produto is None:
        raise ValueError(
            "Produto não encontrado."
        )

    carrinho = obter_ou_criar_carrinho(
        db,
        usuario_id
    )

    item_existente = (
        carrinho_repository.buscar_item_por_produto(
            db,
            carrinho.id,
            produto.id
        )
    )

    quantidade_final = dados.quantidade

    if item_existente is not None:
        quantidade_final += (
            item_existente.quantidade
        )

    validar_produto_para_carrinho(
        produto,
        usuario_id,
        quantidade_final
    )

    if item_existente is not None:
        carrinho_repository.atualizar_quantidade(
            db,
            item_existente,
            quantidade_final
        )
    else:
        carrinho_repository.adicionar_item(
            db,
            carrinho.id,
            produto.id,
            dados.quantidade
        )

    return buscar_carrinho(
        db,
        usuario_id
    )


def atualizar_item(
    db: Session,
    item_id: int,
    dados: CarrinhoItemUpdate,
    usuario_id: int
):
    item = carrinho_repository.buscar_item_por_id(
        db,
        item_id
    )

    if item is None:
        raise ValueError(
            "Item do carrinho não encontrado."
        )

    carrinho = carrinho_repository.buscar_por_usuario(
        db,
        usuario_id
    )

    if (
        carrinho is None
        or item.carrinho_id != carrinho.id
    ):
        raise PermissionError(
            "Você não possui permissão para "
            "alterar este item."
        )

    validar_produto_para_carrinho(
        item.produto,
        usuario_id,
        dados.quantidade
    )

    carrinho_repository.atualizar_quantidade(
        db,
        item,
        dados.quantidade
    )

    return buscar_carrinho(
        db,
        usuario_id
    )


def remover_item(
    db: Session,
    item_id: int,
    usuario_id: int
):
    item = carrinho_repository.buscar_item_por_id(
        db,
        item_id
    )

    if item is None:
        raise ValueError(
            "Item do carrinho não encontrado."
        )

    carrinho = carrinho_repository.buscar_por_usuario(
        db,
        usuario_id
    )

    if (
        carrinho is None
        or item.carrinho_id != carrinho.id
    ):
        raise PermissionError(
            "Você não possui permissão para "
            "remover este item."
        )

    carrinho_repository.remover_item(
        db,
        item
    )


def esvaziar_carrinho(
    db: Session,
    usuario_id: int
):
    carrinho = carrinho_repository.buscar_por_usuario(
        db,
        usuario_id
    )

    if carrinho is None:
        return

    carrinho_repository.remover_todos_itens(
        db,
        carrinho.id
    )