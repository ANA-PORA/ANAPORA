from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers import auth_router, categoria_router
from app.controllers.produto_controller import router as produto_router
from app.core.database import Base, engine
from app.entities import Usuario, Categoria
from app.controllers import artesao_perfil
from app.entities.pedido import Pedido
from app.entities.pedido_item import PedidoItem
from app.controllers.pedido_controller import router as pedido_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(categoria_router)
app.include_router(produto_router)
app.include_router(artesao_perfil.router)
app.include_router(pedido_router)

@app.get("/")
def root():
    return {
        "msg": "API Añaporã"
    }