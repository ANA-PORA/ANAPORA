from sqlalchemy.orm import Session

from app.entities.artesao_perfil import ArtesaoPerfil
from app.entities.usuario import Usuario
from app.schemas.artesao_perfil import ArtesaoPerfilUpdate


def buscar_ou_criar(
    db: Session,
    usuario: Usuario
) -> ArtesaoPerfil:
    perfil = (
        db.query(ArtesaoPerfil)
        .filter(
            ArtesaoPerfil.usuario_id == usuario.id
        )
        .first()
    )

    if perfil:
        return perfil

    perfil = ArtesaoPerfil(
        usuario_id=usuario.id
    )

    db.add(perfil)
    db.commit()
    db.refresh(perfil)

    return perfil


def atualizar(
    db: Session,
    usuario: Usuario,
    dados: ArtesaoPerfilUpdate
) -> ArtesaoPerfil:
    perfil = buscar_ou_criar(
        db,
        usuario
    )

    dados_atualizacao = dados.model_dump(
        exclude_unset=True
    )

    nome = dados_atualizacao.pop(
        "nome",
        None
    )

    if nome is not None:
        nome = nome.strip()

        if len(nome) < 3:
            raise ValueError(
                "O nome deve possuir pelo menos 3 caracteres."
            )

        usuario.nome = nome

    for campo, valor in dados_atualizacao.items():
        if isinstance(valor, str):
            valor = valor.strip() or None

        setattr(
            perfil,
            campo,
            valor
        )

    db.add(usuario)
    db.add(perfil)
    db.commit()
    db.refresh(perfil)

    return perfil