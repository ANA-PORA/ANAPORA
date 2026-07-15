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
from app.schemas.frete_schema import (
    CalcularFreteRequest,
    CalcularFreteResponse
)
from app.services import frete_service


router = APIRouter(
    prefix="/frete",
    tags=["Frete"]
)


@router.post(
    "/calcular",
    response_model=CalcularFreteResponse,
    status_code=status.HTTP_200_OK
)
def calcular_frete(
    dados: CalcularFreteRequest,
    db: Session = Depends(get_db),
    usuario: Usuario = Depends(
        get_current_user
    )
):
    try:
        return frete_service.calcular_frete(
            db=db,
            usuario_id=usuario.id,
            cep_destino=dados.cep_destino,
            item_ids=dados.item_ids
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        ) from error