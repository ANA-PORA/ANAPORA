import os 

os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "chave_teste")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

URL_BANCO_TESTE = "sqlite://"

teste = create_engine(
    URL_BANCO_TESTE, connect_args={"check_same_thread": False}, poolclass=StaticPool
)

SessaoTeste = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=teste
)


def substituir_get_db():
    db = SessaoTeste()

    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = substituir_get_db


@pytest.fixture(autouse=True)
def preparar_banco():
    
    Base.metadata.create_all(bind=teste)

    yield

    Base.metadata.drop_all(bind=teste)


@pytest.fixture
def cliente():
    
    with TestClient(app) as cliente_teste:
        yield cliente_teste


@pytest.fixture
def banco():
    
    db = SessaoTeste()

    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def usuario_cliente():
    return {
        "nome": "Maria da Silva",
        "email": "maria@email.com",
        "senha": "senha123",
        "role": "cliente"
    }


@pytest.fixture
def usuario_artesao():
    return {
        "nome": "João Artesão",
        "email": "joao@email.com",
        "senha": "senha123",
        "role": "artesao"
    }