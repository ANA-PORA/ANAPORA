from fastapi import (
    HTTPException,
    UploadFile
)

from app.services.storage.cloudflare_r2 import (
    upload,
    remover
)

TIPOS_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp"
]

TAMANHO_MAXIMO = 5 * 1024 * 1024

MAX_IMAGENS = 8


def validar_quantidade(
    imagens: list[UploadFile]
):
    if len(imagens) > MAX_IMAGENS:
        raise HTTPException(
            status_code=400,
            detail="Máximo de 8 imagens por produto."
        )


def upload_imagem(
    arquivo: UploadFile
):
    if arquivo.content_type not in TIPOS_PERMITIDOS:
        raise HTTPException(
            status_code=400,
            detail="Formato de imagem inválido."
        )

    arquivo.file.seek(0, 2)
    tamanho = arquivo.file.tell()
    arquivo.file.seek(0)

    if tamanho > TAMANHO_MAXIMO:
        raise HTTPException(
            status_code=400,
            detail="A imagem deve possuir no máximo 5 MB."
        )

    dados = upload(
        arquivo
    )

    dados["tamanho"] = tamanho

    return dados


def remover_imagem(
    nome_arquivo: str
):
    remover(
        nome_arquivo
    )