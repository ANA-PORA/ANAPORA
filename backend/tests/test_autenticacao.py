def cadastrar_e_obter_token(
    cliente,
    usuario
):
    resposta = cliente.post(
        "/auth/registrar",
        json=usuario
    )

    return resposta.json()["access_token"]


def test_deve_acessar_dados_do_usuario_autenticado(
    cliente,
    usuario_cliente
):
    token = cadastrar_e_obter_token(
        cliente,
        usuario_cliente
    )

    resposta = cliente.get(
        "/auth/me",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert resposta.status_code == 200

    dados = resposta.json()

    assert dados["id"] is not None
    assert dados["nome"] == usuario_cliente["nome"]
    assert dados["email"] == usuario_cliente["email"]
    assert dados["role"] == "cliente"
    assert dados["status"] == "aprovado"


def test_nao_deve_acessar_rota_sem_token(cliente):
    resposta = cliente.get("/auth/me")

    assert resposta.status_code == 401


def test_nao_deve_acessar_rota_com_token_invalido(
    cliente
):
    resposta = cliente.get(
        "/auth/me",
        headers={
            "Authorization": "Bearer token-invalido"
        }
    )

    assert resposta.status_code == 401
    assert resposta.json() == {
        "detail": "Credenciais inválidas"
    }


def test_nao_deve_acessar_com_tipo_de_token_incorreto(
    cliente,
    usuario_cliente
):
    token = cadastrar_e_obter_token(
        cliente,
        usuario_cliente
    )

    resposta = cliente.get(
        "/auth/me",
        headers={
            "Authorization": f"Basic {token}"
        }
    )

    assert resposta.status_code == 401