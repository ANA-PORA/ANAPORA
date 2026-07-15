from pathlib import Path
import os

import httpx
from dotenv import load_dotenv


CAMINHO_ENV = Path(__file__).resolve().parent / ".env"

load_dotenv(
    dotenv_path=CAMINHO_ENV,
    override=True
)

url = os.getenv("CORREIOS_TOKEN_URL", "").strip()
usuario = os.getenv("CORREIOS_USUARIO", "").strip()
codigo = os.getenv("CORREIOS_CODIGO_ACESSO", "").strip()

print("Arquivo .env:", CAMINHO_ENV)
print("Arquivo existe:", CAMINHO_ENV.exists())
print("URL carregada:", url)
print("Usuário carregado:", bool(usuario))
print("Tamanho do usuário:", len(usuario))
print("Código carregado:", bool(codigo))
print("Tamanho do código:", len(codigo))

if not url or not usuario or not codigo:
    raise SystemExit(
        "Uma ou mais variáveis dos Correios não foram carregadas."
    )

response = httpx.post(
    url,
    auth=(usuario, codigo),
    headers={
        "Accept": "application/json"
    },
    timeout=20
)

print("Status:", response.status_code)
print("Content-Type:", response.headers.get("content-type"))
print("Resposta:", response.text[:1000])