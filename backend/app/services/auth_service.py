from sqlalchemy.orm import Session
from app.repositories import usuario_repository
from app.entities.usuario import Usuario
from app.core.security import (
    gerar_hash,
    verificar_senha
)

def registrar_usuario(
    db: Session,
    nome: str,
    email: str,
    senha: str,
    role: str
):

    existe = usuario_repository.buscar_por_email(
        db,
        email
    )

    if existe:
        return None

    usuario = Usuario(
        nome=nome,
        email=email,
        senha=gerar_hash(senha),
        role=role,
        status="pendente"
        if role == "artesao"
        else "aprovado"
    )

    return usuario_repository.criar_usuario(
        db,
        usuario
    )


def autenticar_usuario(
    db: Session,
    email: str,
    senha: str
):

    usuario = usuario_repository.buscar_por_email(
        db,
        email
    )

    if not usuario:
        return None

    if not verificar_senha(
        senha,
        usuario.senha
    ):
        return None

    return usuario