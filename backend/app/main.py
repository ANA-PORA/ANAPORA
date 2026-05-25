from fastapi import FastAPI
from app.controllers.auth_controller import router as auth_router
from app.core.database import Base, engine
from app.entities.usuario import Usuario

Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "msg": "API Añaporã"
    }