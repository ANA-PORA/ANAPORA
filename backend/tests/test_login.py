def cadastrar_usuario(cliente, usuario):
    return cliente.post(
        "/auth/registrar",
        json=usuario
    )


def test_deve_fazer_login_com_dados_corretos(
    cliente,
    usuario_cliente
):
    cadastrar_usuario(
        cliente,
        usuario_cliente
    )

    resposta = cliente.post(
        "/auth/login",
        json={
            "email": usuario_cliente["email"],
            "senha": usuario_cliente["senha"]
        }
    )

    assert resposta.status_code == 200

    dados = resposta.json()

    assert "access_token" in dados
    assert isinstance(dados["access_token"], str)
    assert len(dados["access_token"]) > 0
    assert dados["token_type"] == "bearer"


def test_nao_deve_fazer_login_com_senha_incorreta(
    cliente,
    usuario_cliente
):
    cadastrar_usuario(
        cliente,
        usuario_cliente
    )

    resposta = cliente.post(
        "/auth/login",
        json={
            "email": usuario_cliente["email"],
            "senha": "senha-incorreta"
        }
    )

    assert resposta.status_code == 401
    assert resposta.json() == {
        "detail": "Credenciais inválidas"
    }


def test_nao_deve_fazer_login_com_email_inexistente(
    cliente
):
    resposta = cliente.post(
        "/auth/login",
        json={
            "email": "inexistente@email.com",
            "senha": "senha123"
        }
    )

    assert resposta.status_code == 401
    assert resposta.json() == {
        "detail": "Credenciais inválidas"
    }


def test_nao_deve_fazer_login_com_email_invalido(
    cliente
):
    resposta = cliente.post(
        "/auth/login",
        json={
            "email": "email-invalido",
            "senha": "senha123"
        }
    )

    assert resposta.status_code == 422


def test_nao_deve_fazer_login_sem_senha(cliente):
    resposta = cliente.post(
        "/auth/login",
        json={
            "email": "usuario@email.com"
        }
    )

    assert resposta.status_code == 422