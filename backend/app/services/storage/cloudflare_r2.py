import uuid
import boto3

from fastapi import (
    HTTPException,
    UploadFile
)

from app.core.config import (
    R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_PUBLIC_URL
)


def get_client():

    if not all([
        R2_ACCOUNT_ID,
        R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY,
        R2_BUCKET_NAME
    ]):
        raise HTTPException(
            status_code=500,
            detail="Cloudflare R2 não configurado."
        )

    return boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY
    )


def upload(
    arquivo: UploadFile
):

    client = get_client()

    extensao = arquivo.filename.split(".")[-1]

    nome = f"{uuid.uuid4()}.{extensao}"

    client.upload_fileobj(
        arquivo.file,
        R2_BUCKET_NAME,
        nome,
        ExtraArgs={
            "ContentType": arquivo.content_type
        }
    )

    return {
        "nome_arquivo": nome,
        "url": f"{R2_PUBLIC_URL}/{nome}",
        "tipo": arquivo.content_type
    }


def remover(
    nome_arquivo: str
):

    client = get_client()

    client.delete_object(
        Bucket=R2_BUCKET_NAME,
        Key=nome_arquivo
    )