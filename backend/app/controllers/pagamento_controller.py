from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities.usuario import Usuario
from app.services import carrinho_service
from app.services.mercadopago_service import criar_preferencia

router = APIRouter(
    prefix="/pagamento",
    tags=["Pagamento"]
)


@router.post("/checkout")
def checkout(db: Session = Depends(get_db)):
    
    carrinho = {
        "quantidade_itens": 1,
        "grupos": [
            {
                "itens": [
                    {
                        "produto": {
                            "nome": "Produto Teste"
                        },
                        "quantidade": 1,
                        "preco_unitario": 220.00
                    }
                ]
            }
        ]
    }
    if carrinho["quantidade_itens"] == 0:
        raise HTTPException(
            status_code=400,
            detail="Carrinho vazio."
        )

    itens = []

    for grupo in carrinho["grupos"]:
        for item in grupo["itens"]:
            itens.append(
                {
                    "title": item["produto"]["nome"],
                    "quantity": item["quantidade"],
                    "currency_id": "BRL",
                    "unit_price": float(
                        item["preco_unitario"]
                    )
                }
            )

    preferencia = criar_preferencia(itens)

    print(preferencia)
    return preferencia