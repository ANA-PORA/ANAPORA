from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities.usuario import Usuario
from app.schemas.carrinho_schema import (
    CarrinhoItemCreate,
    CarrinhoItemUpdate,
    CarrinhoMensagemResponse,
    CarrinhoResponse,
    CarrinhoResumoResponse
)
from app.services import carrinho_service


router = APIRouter(
    prefix="/carrinho",
    tags=["Carrinho"]
)


@router.get(
    "",
    response_model=CarrinhoResponse
)
def buscar_carrinho(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        get_current_user
    )
):
    return carrinho_service.buscar_carrinho(
        db,
        usuario.id
    )


@router.get(
    "/resumo",
    response_model=CarrinhoResumoResponse
)
def buscar_resumo_carrinho(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        get_current_user
    )
):
    return carrinho_service.buscar_resumo(
        db,
        usuario.id
    )


@router.post(
    "/itens",
    response_model=CarrinhoResponse,
    status_code=status.HTTP_201_CREATED
)
def adicionar_item(
    dados: CarrinhoItemCreate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        get_current_user
    )
):
    try:
        return carrinho_service.adicionar_item(
            db,
            dados,
            usuario.id
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error


@router.patch(
    "/itens/{item_id}",
    response_model=CarrinhoResponse
)
def atualizar_quantidade_item(
    item_id: int,
    dados: CarrinhoItemUpdate,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        get_current_user
    )
):
    try:
        return carrinho_service.atualizar_item(
            db,
            item_id,
            dados,
            usuario.id
        )

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error)
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error


@router.delete(
    "/itens/{item_id}",
    response_model=CarrinhoMensagemResponse
)
def remover_item(
    item_id: int,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        get_current_user
    )
):
    try:
        carrinho_service.remover_item(
            db,
            item_id,
            usuario.id
        )

        return {
            "message": (
                "Produto removido do carrinho "
                "com sucesso."
            )
        }

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error)
        ) from error

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error)
        ) from error


@router.delete(
    "",
    response_model=CarrinhoMensagemResponse
)
def esvaziar_carrinho(
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        get_current_user
    )
):
    carrinho_service.esvaziar_carrinho(
        db,
        usuario.id
    )

    return {
        "message": (
            "Carrinho esvaziado com sucesso."
        )
    }