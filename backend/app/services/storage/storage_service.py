from fastapi import UploadFile

from app.services.storage.cloudflare_r2 import (
    upload,
    remover
)


def upload_imagem(
    arquivo: UploadFile
):
    return upload(
        arquivo
    )


def remover_imagem(
    nome_arquivo: str
):
    remover(
        nome_arquivo
    )