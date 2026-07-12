from app.entities.usuario import Usuario
from app.core.security import verificar_senha


def test_deve_cadastrar_cliente(
    cliente,
    banco,
    usuario_cliente
):
    resposta = cliente.post(
        "/auth/registrar",
        json=usuario_cliente
    )

    assert resposta.status_code == 200

    dados = resposta.json()

    assert "access_token" in dados
    assert dados["token_type"] == "bearer"

    usuario_salvo = (
        banco.query(Usuario)
        .filter(
            Usuario.email == usuario_cliente["email"]
        )
        .first()
    )

    assert usuario_salvo is not None
    assert usuario_salvo.nome == usuario_cliente["nome"]
    assert usuario_salvo.role == "cliente"
    assert usuario_salvo.status == "aprovado"


def test_deve_cadastrar_artesao_com_status_pendente(
    cliente,
    banco,
    usuario_artesao
):
    resposta = cliente.post(
        "/auth/registrar",
        json=usuario_artesao
    )

    assert resposta.status_code == 200

    usuario_salvo = (
        banco.query(Usuario)
        .filter(
            Usuario.email == usuario_artesao["email"]
        )
        .first()
    )

    assert usuario_salvo is not None
    assert usuario_salvo.role == "artesao"
    assert usuario_salvo.status == "pendente"


def test_nao_deve_salvar_senha_em_texto_puro(
    cliente,
    banco,
    usuario_cliente
):
    cliente.post(
        "/auth/registrar",
        json=usuario_cliente
    )

    usuario_salvo = (
        banco.query(Usuario)
        .filter(
            Usuario.email == usuario_cliente["email"]
        )
        .first()
    )

    assert usuario_salvo.senha != usuario_cliente["senha"]

    assert verificar_senha(
        usuario_cliente["senha"],
        usuario_salvo.senha
    )


def test_nao_deve_cadastrar_email_duplicado(
    cliente,
    usuario_cliente
):
    primeira_resposta = cliente.post(
        "/auth/registrar",
        json=usuario_cliente
    )

    segunda_resposta = cliente.post(
        "/auth/registrar",
        json=usuario_cliente
    )

    assert primeira_resposta.status_code == 200
    assert segunda_resposta.status_code == 400

    assert segunda_resposta.json() == {
        "detail": "Email já cadastrado"
    }


def test_nao_deve_cadastrar_role_invalida(cliente):
    dados = {
        "nome": "Usuário Inválido",
        "email": "invalido@email.com",
        "senha": "senha123",
        "role": "administrador"
    }

    resposta = cliente.post(
        "/auth/registrar",
        json=dados
    )

    assert resposta.status_code == 400
    assert resposta.json() == {
        "detail": "Role inválida"
    }


def test_nao_deve_cadastrar_email_invalido(cliente):
    dados = {
        "nome": "Usuário Teste",
        "email": "email-invalido",
        "senha": "senha123",
        "role": "cliente"
    }

    resposta = cliente.post(
        "/auth/registrar",
        json=dados
    )

    assert resposta.status_code == 422


def test_nao_deve_cadastrar_sem_nome(cliente):
    dados = {
        "email": "usuario@email.com",
        "senha": "senha123",
        "role": "cliente"
    }

    resposta = cliente.post(
        "/auth/registrar",
        json=dados
    )

    assert resposta.status_code == 422