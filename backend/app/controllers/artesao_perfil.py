from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities.usuario import Usuario
from app.schemas.artesao_perfil import (
    ArtesaoPerfilResponse,
    ArtesaoPerfilUpdate
)
from app.services import artesao_perfil_service
from app.services.storage.storage_service import (
    remover_imagem,
    upload_imagem
)


router = APIRouter(
    prefix="/artesao/perfil",
    tags=["Perfil do artesão"]
)


def validar_artesao(
    usuario: Usuario
) -> None:
    if usuario.role != "artesao":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Acesso permitido somente para "
                "artesãos."
            )
        )


def montar_resposta(
    usuario: Usuario,
    perfil
) -> ArtesaoPerfilResponse:
    return ArtesaoPerfilResponse(
        id=perfil.id,
        usuario_id=usuario.id,
        nome=usuario.nome,
        email=usuario.email,
        nome_loja=perfil.nome_loja,
        biografia=perfil.biografia,
        telefone=perfil.telefone,
        cidade=perfil.cidade,
        estado=perfil.estado,
        foto_url=perfil.foto_url,
        instagram=perfil.instagram
    )


@router.get(
    "",
    response_model=ArtesaoPerfilResponse
)
def buscar_meu_perfil(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    validar_artesao(usuario)

    perfil = artesao_perfil_service.buscar_ou_criar(
        db,
        usuario
    )

    return montar_resposta(
        usuario,
        perfil
    )


@router.put(
    "",
    response_model=ArtesaoPerfilResponse
)
def atualizar_meu_perfil(
    dados: ArtesaoPerfilUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    validar_artesao(usuario)

    try:
        perfil = artesao_perfil_service.atualizar(
            db,
            usuario,
            dados
        )

        return montar_resposta(
            usuario,
            perfil
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error


@router.post(
    "/foto",
    response_model=ArtesaoPerfilResponse
)
def atualizar_foto_perfil(
    foto: UploadFile = File(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    validar_artesao(usuario)

    perfil = artesao_perfil_service.buscar_ou_criar(
        db,
        usuario
    )

    dados_upload = upload_imagem(
        foto,
        pasta="perfis"
    )

    foto_antiga_nome = getattr(
        perfil,
        "foto_nome_arquivo",
        None
    )

    try:
        perfil.foto_url = dados_upload["url"]
        perfil.foto_nome_arquivo = (
            dados_upload["nome_arquivo"]
        )

        db.add(perfil)
        db.commit()
        db.refresh(perfil)
    except Exception:
        db.rollback()

        remover_imagem(
            dados_upload["nome_arquivo"]
        )

        raise

    if foto_antiga_nome:
        try:
            remover_imagem(foto_antiga_nome)
        except HTTPException:
            pass

    return montar_resposta(
        usuario,
        perfil
    )


@router.delete(
    "/foto",
    response_model=ArtesaoPerfilResponse
)
def remover_foto_perfil(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    validar_artesao(usuario)

    perfil = artesao_perfil_service.buscar_ou_criar(
        db,
        usuario
    )

    foto_nome_arquivo = getattr(
        perfil,
        "foto_nome_arquivo",
        None
    )

    if not perfil.foto_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O perfil não possui foto cadastrada."
        )

    perfil.foto_url = None
    perfil.foto_nome_arquivo = None

    db.add(perfil)
    db.commit()
    db.refresh(perfil)

    if foto_nome_arquivo:
        try:
            remover_imagem(foto_nome_arquivo)
        except HTTPException:
            pass

    return montar_resposta(
        usuario,
        perfil
    )
