from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.database import Base, engine
from app.entities import (
    ArtesaoPerfil,
    Carrinho,
    CarrinhoItem,
    Categoria,
    Pedido,
    PedidoItem,
    Produto,
    ProdutoImagem,
    Usuario,
)
from app.controllers import artesao_perfil
<<<<<<< Updated upstream
=======
from app.controllers.auth_controller import router as auth_router
from app.controllers.carrinho_controller import router as carrinho_router
from app.controllers.categoria_controller import router as categoria_router
from app.controllers.frete_controller import router as frete_router
from app.controllers.pedido_controller import router as pedido_router
from app.controllers.produto_controller import router as produto_router
>>>>>>> Stashed changes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ANAPORA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOADS_DIR)),
    name="uploads"
)

app.include_router(auth_router)
app.include_router(categoria_router)
app.include_router(produto_router)
app.include_router(artesao_perfil.router)
<<<<<<< Updated upstream
=======
app.include_router(carrinho_router)
app.include_router(frete_router)
app.include_router(pedido_router)


>>>>>>> Stashed changes
@app.get("/")
def root():
    return {"message": "API ANAPORA funcionando!"}
