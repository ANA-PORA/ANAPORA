import re
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP

from sqlalchemy.orm import Session

from app.entities.carrinho import Carrinho
from app.entities.carrinho_item import CarrinhoItem
from app.schemas.frete_schema import (
    CalcularFreteResponse,
    FreteArtesaoResponse,
    OpcaoFreteResponse
)


VALOR_BASE_ECONOMICO = Decimal("12.00")
VALOR_BASE_EXPRESSO = Decimal("22.00")

VALOR_KG_ECONOMICO = Decimal("6.50")
VALOR_KG_EXPRESSO = Decimal("10.00")

ADICIONAL_VOLUME_ECONOMICO = Decimal("0.0008")
ADICIONAL_VOLUME_EXPRESSO = Decimal("0.0012")


def limpar_cep(cep: str) -> str:
    cep_limpo = re.sub(r"\D", "", cep)

    if len(cep_limpo) != 8:
        raise ValueError(
            "O CEP deve possuir exatamente 8 números."
        )

    return cep_limpo


def obter_prefixo_cep(cep: str) -> int:
    return int(cep[:2])


def estimar_distancia_por_cep(
    cep_origem: str,
    cep_destino: str
) -> str:
    prefixo_origem = obter_prefixo_cep(cep_origem)
    prefixo_destino = obter_prefixo_cep(cep_destino)

    diferenca = abs(prefixo_origem - prefixo_destino)

    if diferenca == 0:
        return "local"

    if diferenca <= 10:
        return "regional"

    if diferenca <= 35:
        return "nacional_proximo"

    return "nacional_distante"


def estimar_prazo(
    tipo_entrega: str,
    faixa_distancia: str
) -> int:
    prazos = {
        "economico": {
            "local": 4,
            "regional": 6,
            "nacional_proximo": 9,
            "nacional_distante": 13
        },
        "expresso": {
            "local": 2,
            "regional": 3,
            "nacional_proximo": 5,
            "nacional_distante": 7
        }
    }

    return prazos[tipo_entrega][faixa_distancia]


def calcular_volume_cm3(
    altura_cm: Decimal,
    largura_cm: Decimal,
    comprimento_cm: Decimal
) -> Decimal:
    return (
        altura_cm
        * largura_cm
        * comprimento_cm
    )


def arredondar_moeda(valor: Decimal) -> Decimal:
    return valor.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )


def calcular_valor_frete(
    tipo_entrega: str,
    peso_total: Decimal,
    volume_cm3: Decimal,
    faixa_distancia: str
) -> Decimal:
    multiplicadores_distancia = {
        "local": Decimal("1.00"),
        "regional": Decimal("1.15"),
        "nacional_proximo": Decimal("1.35"),
        "nacional_distante": Decimal("1.60")
    }

    multiplicador = multiplicadores_distancia[
        faixa_distancia
    ]

    if tipo_entrega == "economico":
        valor = (
            VALOR_BASE_ECONOMICO
            + peso_total * VALOR_KG_ECONOMICO
            + volume_cm3 * ADICIONAL_VOLUME_ECONOMICO
        )
    else:
        valor = (
            VALOR_BASE_EXPRESSO
            + peso_total * VALOR_KG_EXPRESSO
            + volume_cm3 * ADICIONAL_VOLUME_EXPRESSO
        )

    return arredondar_moeda(
        valor * multiplicador
    )


def montar_opcoes_frete(
    cep_origem: str,
    cep_destino: str,
    peso_total: Decimal,
    altura_cm: Decimal,
    largura_cm: Decimal,
    comprimento_cm: Decimal
) -> list[OpcaoFreteResponse]:
    faixa_distancia = estimar_distancia_por_cep(
        cep_origem,
        cep_destino
    )

    volume_cm3 = calcular_volume_cm3(
        altura_cm,
        largura_cm,
        comprimento_cm
    )

    economico = OpcaoFreteResponse(
        codigo="ECONOMICO",
        nome="Entrega econômica",
        valor=calcular_valor_frete(
            tipo_entrega="economico",
            peso_total=peso_total,
            volume_cm3=volume_cm3,
            faixa_distancia=faixa_distancia
        ),
        prazo_dias=estimar_prazo(
            tipo_entrega="economico",
            faixa_distancia=faixa_distancia
        )
    )

    expresso = OpcaoFreteResponse(
        codigo="EXPRESSO",
        nome="Entrega expressa",
        valor=calcular_valor_frete(
            tipo_entrega="expresso",
            peso_total=peso_total,
            volume_cm3=volume_cm3,
            faixa_distancia=faixa_distancia
        ),
        prazo_dias=estimar_prazo(
            tipo_entrega="expresso",
            faixa_distancia=faixa_distancia
        )
    )

    return [
        economico,
        expresso
    ]


def calcular_frete(
    db: Session,
    usuario_id: int,
    cep_destino: str,
    item_ids: list[int]
) -> CalcularFreteResponse:
    cep_destino_limpo = limpar_cep(
        cep_destino
    )

    if not item_ids:
        raise ValueError(
            "Selecione pelo menos um item para calcular o frete."
        )

    item_ids_unicos = list(
        dict.fromkeys(item_ids)
    )

    carrinho = (
        db.query(Carrinho)
        .filter(
            Carrinho.usuario_id == usuario_id
        )
        .first()
    )

    if carrinho is None:
        raise ValueError(
            "Carrinho não encontrado."
        )

    itens = (
        db.query(CarrinhoItem)
        .filter(
            CarrinhoItem.carrinho_id == carrinho.id,
            CarrinhoItem.id.in_(item_ids_unicos)
        )
        .all()
    )

    if not itens:
        raise ValueError(
            "Nenhum item selecionado foi encontrado no seu carrinho."
        )

    ids_encontrados = {
        item.id
        for item in itens
    }

    ids_invalidos = [
        item_id
        for item_id in item_ids_unicos
        if item_id not in ids_encontrados
    ]

    if ids_invalidos:
        raise ValueError(
            "Um ou mais itens selecionados não pertencem ao seu carrinho."
        )

    grupos = defaultdict(list)

    for item in itens:
        produto = item.produto

        if produto is None:
            raise ValueError(
                "Um dos itens selecionados possui um produto inválido."
            )

        grupos[
            produto.artesao_id
        ].append(item)

    resposta = []

    for itens_artesao in grupos.values():
        artesao = (
            itens_artesao[0]
            .produto
            .artesao
        )

        perfil = artesao.perfil_artesao

        if perfil is None or not perfil.cep:
            raise ValueError(
                f"O artesão {artesao.nome} "
                "não possui CEP cadastrado."
            )

        cep_origem = limpar_cep(
            perfil.cep
        )

        peso_total = Decimal("0")
        altura_total = Decimal("0")
        maior_largura = Decimal("0")
        maior_comprimento = Decimal("0")

        for item in itens_artesao:
            produto = item.produto

            if not produto.ativo:
                raise ValueError(
                    f"O produto '{produto.nome}' "
                    "não está disponível."
                )

            if item.quantidade <= 0:
                raise ValueError(
                    f"A quantidade do produto "
                    f"'{produto.nome}' é inválida."
                )

            if item.quantidade > produto.estoque:
                raise ValueError(
                    f"A quantidade do produto "
                    f"'{produto.nome}' é maior que o estoque disponível."
                )

            if (
                produto.peso_kg is None
                or produto.altura_cm is None
                or produto.largura_cm is None
                or produto.comprimento_cm is None
            ):
                raise ValueError(
                    f"O produto '{produto.nome}' "
                    "não possui peso e dimensões cadastrados."
                )

            peso = Decimal(
                str(produto.peso_kg)
            )

            altura = Decimal(
                str(produto.altura_cm)
            )

            largura = Decimal(
                str(produto.largura_cm)
            )

            comprimento = Decimal(
                str(produto.comprimento_cm)
            )

            if (
                peso <= 0
                or altura <= 0
                or largura <= 0
                or comprimento <= 0
            ):
                raise ValueError(
                    f"O produto '{produto.nome}' "
                    "possui peso ou dimensões inválidas."
                )

            peso_total += (
                peso * item.quantidade
            )

            altura_total += (
                altura * item.quantidade
            )

            maior_largura = max(
                maior_largura,
                largura
            )

            maior_comprimento = max(
                maior_comprimento,
                comprimento
            )

        opcoes = montar_opcoes_frete(
            cep_origem=cep_origem,
            cep_destino=cep_destino_limpo,
            peso_total=peso_total,
            altura_cm=altura_total,
            largura_cm=maior_largura,
            comprimento_cm=maior_comprimento
        )

        resposta.append(
            FreteArtesaoResponse(
                artesao_id=artesao.id,
                nome_artesao=artesao.nome,
                nome_loja=perfil.nome_loja,
                cep_origem=cep_origem,
                cep_destino=cep_destino_limpo,
                opcoes=opcoes
            )
        )

    return CalcularFreteResponse(
        cep_destino=cep_destino_limpo,
        grupos=resposta
    )