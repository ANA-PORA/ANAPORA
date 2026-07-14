import { useNavigate } from "react-router-dom";

import ProdutoFormulario from "../../components/artesao/ProdutoFormulario";
import { criarProduto } from "../../services/produtoService";

export default function NovoProduto() {
  const navigate = useNavigate();

  return (
    <ProdutoFormulario
      titulo="Novo produto"
      subtitulo="Cadastre as informações e imagens do produto."
      textoBotao="Cadastrar produto"
      textoEnviando="Cadastrando..."
      exigirImagem
      onSubmit={async (dados) => {
        await criarProduto({
          nome: dados.nome,
          descricao: dados.descricao,
          preco: dados.preco,
          estoque: dados.estoque,
          categoriaId: dados.categoriaId,
          imagens: dados.imagens
        });

        navigate("/artesao/produtos", {
          replace: true,
          state: {
            mensagem:
              "Produto cadastrado com sucesso."
          }
        });
      }}
    />
  );
}