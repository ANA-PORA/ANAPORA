from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services import auth_service

from app.schemas.usuario_shema import (
    UsuarioCreate,
    UsuarioLogin,
    Token
)

from app.core.security import (
    criar_token,
    get_current_user
)

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

@router.post(
    "/registrar",
    response_model=Token
)
def registrar(
    dados: UsuarioCreate,
    db: Session = Depends(get_db)
):

    if dados.role not in [
        "cliente",
        "artesao"
    ]:
        raise HTTPException(
            status_code=400,
            detail="Role inválida"
        )

    usuario = auth_service.registrar_usuario(
        db,
        dados.nome,
        dados.email,
        dados.senha,
        dados.role
    )

    if not usuario:
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado"
        )

    token = criar_token({
        "sub": usuario.email,
        "role": usuario.role
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.post(
    "/login",
    response_model=Token
)
def login(
    dados: UsuarioLogin,
    db: Session = Depends(get_db)
):

    usuario = auth_service.autenticar_usuario(
        db,
        dados.email,
        dados.senha
    )

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Credenciais inválidas"
        )

    token = criar_token({
        "sub": usuario.email,
        "role": usuario.role
    })

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def me(
    usuario=Depends(get_current_user)
):

    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "role": usuario.role,
        "status": usuario.status
    }