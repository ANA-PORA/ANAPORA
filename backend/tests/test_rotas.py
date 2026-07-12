def test_rota_principal_deve_funcionar(cliente):
    resposta = cliente.get("/")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "msg": "API Añaporã"
    }


def test_rota_inexistente_deve_retornar_404(cliente):
    resposta = cliente.get("/rota-que-nao-existe")

    assert resposta.status_code == 404