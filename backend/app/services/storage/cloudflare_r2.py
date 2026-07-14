import uuid
from pathlib import Path

import boto3
from botocore.config import Config
from botocore.exceptions import (
    BotoCoreError,
    ClientError
)
from fastapi import HTTPException, UploadFile

from app.core.config import (
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_PUBLIC_URL
)


EXTENSOES_POR_TIPO = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}


def validar_configuracao() -> None:
    configuracoes = {
        "R2_ACCOUNT_ID": R2_ACCOUNT_ID,
        "R2_ACCESS_KEY_ID": R2_ACCESS_KEY_ID,
        "R2_SECRET_ACCESS_KEY": R2_SECRET_ACCESS_KEY,
        "R2_BUCKET_NAME": R2_BUCKET_NAME,
        "R2_PUBLIC_URL": R2_PUBLIC_URL
    }

    ausentes = [
        nome
        for nome, valor in configuracoes.items()
        if not valor
    ]

    if ausentes:
        raise HTTPException(
            status_code=500,
            detail=(
                "Cloudflare R2 não configurado. "
                f"Variáveis ausentes: {', '.join(ausentes)}."
            )
        )


def get_client():
    validar_configuracao()

    return boto3.client(
        "s3",
        endpoint_url=(
            f"https://{R2_ACCOUNT_ID}"
            ".r2.cloudflarestorage.com"
        ),
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(
            signature_version="s3v4"
        )
    )


def montar_nome_arquivo(
    arquivo: UploadFile,
    pasta: str
) -> str:
    tipo = arquivo.content_type or ""

    extensao = EXTENSOES_POR_TIPO.get(tipo)

    if not extensao:
        nome_original = arquivo.filename or ""
        extensao_original = Path(nome_original).suffix.lower()

        if extensao_original not in {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        }:
            raise HTTPException(
                status_code=400,
                detail="Não foi possível identificar a extensão da imagem."
            )

        extensao = (
            ".jpg"
            if extensao_original == ".jpeg"
            else extensao_original
        )

    pasta_tratada = pasta.strip("/")

    return (
        f"{pasta_tratada}/"
        f"{uuid.uuid4().hex}{extensao}"
    )


def upload(
    arquivo: UploadFile,
    pasta: str = "uploads"
) -> dict:
    client = get_client()

    nome_arquivo = montar_nome_arquivo(
        arquivo,
        pasta
    )

    try:
        arquivo.file.seek(0)

        client.upload_fileobj(
            arquivo.file,
            R2_BUCKET_NAME,
            nome_arquivo,
            ExtraArgs={
                "ContentType": (
                    arquivo.content_type
                    or "application/octet-stream"
                )
            }
        )
    except (ClientError, BotoCoreError) as error:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível enviar o arquivo para o armazenamento."
        ) from error

    public_url = str(R2_PUBLIC_URL).rstrip("/")

    return {
        "nome_arquivo": nome_arquivo,
        "url": f"{public_url}/{nome_arquivo}",
        "tipo": arquivo.content_type
    }


def remover(
    nome_arquivo: str
) -> None:
    if not nome_arquivo or not nome_arquivo.strip():
        raise HTTPException(
            status_code=400,
            detail="Nome do arquivo inválido."
        )

    client = get_client()

    try:
        client.delete_object(
            Bucket=R2_BUCKET_NAME,
            Key=nome_arquivo
        )
    except (ClientError, BotoCoreError) as error:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível remover o arquivo do armazenamento."
        ) from error