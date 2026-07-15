import mercadopago

from app.core.config import MERCADO_PAGO_ACCESS_TOKEN


sdk = mercadopago.SDK(MERCADO_PAGO_ACCESS_TOKEN)

def criar_preferencia(itens):
    preference_data = {
        "items": itens,
        "back_urls": {
            "success": "http://localhost:5173/pagamento/sucesso",
            "failure": "http://localhost:5173/pagamento/erro",
            "pending": "http://localhost:5173/pagamento/pendente"
        },
        "auto_return": "approved"
    }

    resposta = sdk.preference().create(preference_data)

    print(resposta)
    return resposta