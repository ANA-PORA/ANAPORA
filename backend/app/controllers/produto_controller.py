from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.entities.usuario import Usuario
from app.schemas.produto_schema import (
    ProdutoCreate,
    ProdutoImagemResponse,
    ProdutoResponse,
    ProdutoUpdate
)
from app.services import produto_service

router = APIRouter(
    prefix="/produtos",
    tags=["Produtos"]
)

def validar_artesao(usuario: Usuario):
    if usuario.role != "artesao":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas artesãos podem gerenciar produtos."
        )

@router.post(
    "",
    response_model=ProdutoResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_produto(
    dados: ProdutoCreate = Depends(ProdutoCreate.as_form),
    imagens: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    validar_artesao(usuario)
    try:
        return produto_service.criar(
            db,
            dados,
            imagens,
            usuario.id
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error

@router.get(
    "",
    response_model=list[ProdutoResponse]
)
def listar_produtos(
    db: Session = Depends(get_db)
):
    return produto_service.listar(db)

@router.get(
    "/destaques",
    response_model=list[ProdutoResponse]
)
def listar_destaques(
    db: Session = Depends(get_db)
):
    return produto_service.buscar_destaques(db)

@router.get(
    "/pesquisar",
    response_model=list[ProdutoResponse]
)
def pesquisar_produtos(
    texto: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):
    return produto_service.pesquisar(
        db,
        texto.strip()
    )

@router.get(
    "/meus",
    response_model=list[ProdutoResponse]
)
def listar_meus_produtos(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    validar_artesao(usuario)
    return produto_service.buscar_meus_produtos(
        db,
        usuario.id
    )

@router.get(
    "/categoria/{categoria_id}",
    response_model=list[ProdutoResponse]
)
def listar_produtos_por_categoria(
    categoria_id: int,
    db: Session = Depends(get_db)
):
    return produto_service.buscar_por_categoria(
        db,
        categoria_id
    )

@router.get(
    "/{produto_id}/imagens",
    response_model=list[ProdutoImagemResponse]
)
def listar_imagens_produto(
    produto_id: int,
    db: Session = Depends(get_db)
):
    try:
        return produto_service.listar_imagens(
            db,
            produto_id
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error

@router.get(
    "/{produto_id}",
    response_model=ProdutoResponse
)
def buscar_produto(
    produto_id: int,
    db: Session = Depends(get_db)
):
    try:
        return produto_service.buscar_por_id(
            db,
            produto_id
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error

@router.put(
    "/{produto_id}",
    response_model=ProdutoResponse
)
def atualizar_produto(
    produto_id: int,
    dados: ProdutoUpdate = Depends(ProdutoUpdate.as_form),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    validar_artesao(usuario)
    try:
        produto = produto_service.buscar_por_id(
            db,
            produto_id
        )
        if produto.artesao_id != usuario.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não possui permissão para editar este produto."
            )
        return produto_service.atualizar(
            db,
            produto_id,
            dados
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error

@router.delete(
    "/{produto_id}"
)
def remover_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    validar_artesao(usuario)
    try:
        produto = produto_service.buscar_por_id(
            db,
            produto_id
        )
        if produto.artesao_id != usuario.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Você não possui permissão para remover este produto."
            )
        produto_service.remover(
            db,
            produto_id
        )
        return {
            "message": "Produto removido com sucesso."
        }
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error