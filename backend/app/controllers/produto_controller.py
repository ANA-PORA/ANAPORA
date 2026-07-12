from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    UploadFile,
    File
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.entities.usuario import Usuario

from app.schemas.produto_schema import (
    ProdutoCreate,
    ProdutoResponse,
    ProdutoUpdate
)

from app.services import produto_service

router = APIRouter(
    prefix="/produtos",
    tags=["Produtos"]
)


@router.post(
    "",
    response_model=ProdutoResponse
)
def criar_produto(
    dados: ProdutoCreate = Depends(
        ProdutoCreate.as_form
    ),
    imagens: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    try:

        return produto_service.criar(
            db,
            dados,
            imagens,
            usuario.id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


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
    texto: str = Query(...),
    db: Session = Depends(get_db)
):
    return produto_service.pesquisar(
        db,
        texto
    )


@router.get(
    "/categoria/{categoria_id}",
    response_model=list[ProdutoResponse]
)
def buscar_categoria(
    categoria_id: int,
    db: Session = Depends(get_db)
):
    return produto_service.buscar_por_categoria(
        db,
        categoria_id
    )


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

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.put(
    "/{produto_id}",
    response_model=ProdutoResponse
)
def atualizar_produto(
    produto_id: int,
    dados: ProdutoUpdate = Depends(
        ProdutoUpdate.as_form
    ),
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    try:

        produto = produto_service.buscar_por_id(
            db,
            produto_id
        )

        if produto.artesao_id != usuario.id:

            raise HTTPException(
                status_code=403,
                detail="Você não possui permissão para editar este produto."
            )

        return produto_service.atualizar(
            db,
            produto_id,
            dados
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )


@router.delete(
    "/{produto_id}"
)
def remover_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(get_current_user)
):
    try:

        produto = produto_service.buscar_por_id(
            db,
            produto_id
        )

        if produto.artesao_id != usuario.id:

            raise HTTPException(
                status_code=403,
                detail="Você não possui permissão para remover este produto."
            )

        produto_service.remover(
            db,
            produto_id
        )

        return {
            "message": "Produto removido com sucesso."
        }

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )