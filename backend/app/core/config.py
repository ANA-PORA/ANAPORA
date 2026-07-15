import os
from dotenv import load_dotenv

load_dotenv()


def obter_variavel(
    nome: str,
    obrigatoria: bool = True,
    padrao: str | None = None
) -> str | None:
    valor = os.getenv(nome, padrao)

    if isinstance(valor, str):
        valor = valor.strip()

    if obrigatoria and not valor:
        raise RuntimeError(
            f"A variável de ambiente {nome} não foi configurada."
        )

    return valor


DATABASE_URL = obter_variavel("DATABASE_URL")

SECRET_KEY = obter_variavel("SECRET_KEY")

ALGORITHM = obter_variavel(
    "ALGORITHM",
    padrao="HS256"
)

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    obter_variavel(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        padrao="60"
    )
)

R2_ACCOUNT_ID = obter_variavel(
    "R2_ACCOUNT_ID",
    obrigatoria=False
)

R2_ACCESS_KEY_ID = obter_variavel(
    "R2_ACCESS_KEY_ID",
    obrigatoria=False
)

R2_SECRET_ACCESS_KEY = obter_variavel(
    "R2_SECRET_ACCESS_KEY",
    obrigatoria=False
)

R2_BUCKET_NAME = obter_variavel(
    "R2_BUCKET_NAME",
    obrigatoria=False
)

R2_PUBLIC_URL = obter_variavel(
    "R2_PUBLIC_URL",
    obrigatoria=False
)

MERCADO_PAGO_ACCESS_TOKEN = obter_variavel(
    "MERCADO_PAGO_ACCESS_TOKEN",
    obrigatoria=False
)