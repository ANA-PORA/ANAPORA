from sqlalchemy.orm import Session
from app.entities.usuario import Usuario

def buscar_por_email(
    db: Session,
    email: str
):

    return db.query(Usuario).filter(
        Usuario.email == email
    ).first()


def criar_usuario(
    db: Session,
    usuario: Usuario
):

    db.add(usuario)

    db.commit()

    db.refresh(usuario)

    return usuario