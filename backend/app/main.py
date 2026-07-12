from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.controllers.auth_controller import router as auth_router
from app.core.database import Base, engine
from app.entities.usuario import Usuario

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


@app.get("/")
def root():
    return {
        "msg": "API Añaporã"
    }