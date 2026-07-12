from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import categoria_service
from app.core.security import get_current_admin

from app.schemas.categoria_schema import (
    CategoriaCreate,
    CategoriaUpdate,
    CategoriaResponse
)

router = APIRouter(
    prefix="/categorias",
    tags=["Categorias"]
)


@router.get(
    "/",
    response_model=list[CategoriaResponse]
)
def listar_categorias(
    db: Session = Depends(get_db)
):
    return categoria_service.listar_categorias(db)


@router.get(
    "/{categoria_id}",
    response_model=CategoriaResponse
)
def buscar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db)
):
    categoria = categoria_service.buscar_categoria(
        db,
        categoria_id
    )

    if not categoria:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada"
        )

    return categoria


@router.post(
    "/",
    response_model=CategoriaResponse,
    status_code=201
)
def criar_categoria(
    dados: CategoriaCreate,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_admin)
):
    categoria = categoria_service.criar_categoria(
        db,
        dados.nome
    )

    if categoria is None:
        raise HTTPException(
            status_code=400,
            detail="Categoria já cadastrada"
        )

    return categoria


@router.put(
    "/{categoria_id}",
    response_model=CategoriaResponse
)
def atualizar_categoria(
    categoria_id: int,
    dados: CategoriaUpdate,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_admin)
):
    categoria = categoria_service.atualizar_categoria(
        db,
        categoria_id,
        dados.nome
    )

    if categoria is None:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada"
        )

    if categoria is False:
        raise HTTPException(
            status_code=400,
            detail="Já existe uma categoria com esse nome"
        )

    return categoria


@router.delete(
    "/{categoria_id}"
)
def deletar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db),
    usuario=Depends(get_current_admin)
):
    deletado = categoria_service.deletar_categoria(
        db,
        categoria_id
    )

    if not deletado:
        raise HTTPException(
            status_code=404,
            detail="Categoria não encontrada"
        )

    return {
        "message": "Categoria removida com sucesso"
    }