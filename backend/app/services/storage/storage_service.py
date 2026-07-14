from fastapi import HTTPException, UploadFile

from app.services.storage.cloudflare_r2 import (
    remover,
    upload
)


TIPOS_PERMITIDOS = {
    "image/jpeg",
    "image/png",
    "image/webp"
}

TAMANHO_MAXIMO = 5 * 1024 * 1024
MAX_IMAGENS = 8


def validar_quantidade(
    imagens: list[UploadFile]
) -> None:
    if not imagens:
        raise HTTPException(
            status_code=400,
            detail="Selecione pelo menos uma imagem."
        )

    if len(imagens) > MAX_IMAGENS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Máximo de {MAX_IMAGENS} "
                "imagens por produto."
            )
        )


def obter_tamanho(
    arquivo: UploadFile
) -> int:
    arquivo.file.seek(0, 2)
    tamanho = arquivo.file.tell()
    arquivo.file.seek(0)

    return tamanho


def validar_imagem(
    arquivo: UploadFile
) -> int:
    if not arquivo.filename:
        raise HTTPException(
            status_code=400,
            detail="O arquivo enviado não possui nome."
        )

    if arquivo.content_type not in TIPOS_PERMITIDOS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Formato de imagem inválido. "
                "Utilize JPG, PNG ou WEBP."
            )
        )

    tamanho = obter_tamanho(arquivo)

    if tamanho <= 0:
        raise HTTPException(
            status_code=400,
            detail="A imagem enviada está vazia."
        )

    if tamanho > TAMANHO_MAXIMO:
        raise HTTPException(
            status_code=400,
            detail="A imagem deve possuir no máximo 5 MB."
        )

    return tamanho


def upload_imagem(
    arquivo: UploadFile,
    pasta: str = "uploads"
) -> dict:
    tamanho = validar_imagem(arquivo)

    dados = upload(
        arquivo,
        pasta=pasta
    )

    dados["tamanho"] = tamanho

    return dados


def remover_imagem(
    nome_arquivo: str
) -> None:
    remover(nome_arquivo)