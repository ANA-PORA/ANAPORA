from app.entities.usuario import Usuario


def test_deve_criar_tabelas_no_banco(banco):
    tabelas = banco.bind.dialect.get_table_names(
        banco.bind.connect()
    )

    assert "usuarios" in tabelas


def test_deve_salvar_usuario_no_banco(banco):
    usuario = Usuario(
        nome="Usuário Teste",
        email="usuario@teste.com",
        senha="senha_temporaria",
        role="cliente",
        status="aprovado"
    )

    banco.add(usuario)
    banco.commit()
    banco.refresh(usuario)

    usuario_encontrado = (
        banco.query(Usuario)
        .filter(Usuario.email == "usuario@teste.com")
        .first()
    )

    assert usuario_encontrado is not None
    assert usuario_encontrado.id is not None
    assert usuario_encontrado.nome == "Usuário Teste"
    assert usuario_encontrado.role == "cliente"
    assert usuario_encontrado.status == "aprovado"