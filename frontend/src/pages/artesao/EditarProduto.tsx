import { useEffect, useState } from "react";
import {
  NavLink,
  Navigate,
  useNavigate,
  useParams
} from "react-router-dom";
import axios from "axios";
import { FiArrowLeft } from "react-icons/fi";

import ProdutoFormulario from "../../components/artesao/ProdutoFormulario";
import {
  atualizarProduto,
  buscarProdutoPorId
} from "../../services/produtoService";
import type { Produto } from "../../types/produto";

import "../../styles/NovoProduto.css";

export default function EditarProduto() {
  const navigate = useNavigate();
  const { produtoId } = useParams();

  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const id = Number(produtoId);

  useEffect(() => {
    async function carregarProduto() {
      if (!Number.isInteger(id) || id <= 0) {
        setErro("Produto inválido.");
        setCarregando(false);
        return;
      }

      try {
        setErro("");

        const produtoEncontrado = await buscarProdutoPorId(id);

        setProduto(produtoEncontrado);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const detalhe = error.response?.data?.detail;

          setErro(
            typeof detalhe === "string"
              ? detalhe
              : "Não foi possível carregar o produto."
          );
        } else {
          setErro("Ocorreu um erro inesperado.");
        }
      } finally {
        setCarregando(false);
      }
    }

    void carregarProduto();
  }, [id]);

  if (!produtoId) {
    return (
      <Navigate
        to="/artesao/produtos"
        replace
      />
    );
  }

  if (carregando) {
    return (
      <section className="new-product-page">
        <div className="new-product-card">
          <p>Carregando produto...</p>
        </div>
      </section>
    );
  }

  if (erro || !produto) {
    return (
      <section className="new-product-page">
        <header className="artisan-page-header">
          <div>
            <span className="artisan-page-eyebrow">
              Catálogo
            </span>

            <h1>Editar produto</h1>
          </div>

          <NavLink
            to="/artesao/produtos"
            className="new-product-back"
          >
            <FiArrowLeft />
            <span>Voltar</span>
          </NavLink>
        </header>

        <div className="alert alert-danger">
          {erro || "Produto não encontrado."}
        </div>
      </section>
    );
  }

  return (
    <ProdutoFormulario
      key={produto.id}
      titulo="Editar produto"
      subtitulo="Atualize as informações do produto."
      textoBotao="Salvar alterações"
      textoEnviando="Salvando..."
      mostrarStatus
      permitirUploadImagens={false}
      imagensAtuais={produto.imagens ?? []}
      valoresIniciais={{
        nome: produto.nome,
        descricao: produto.descricao,
        preco: String(produto.preco).replace(".", ","),
        estoque: String(produto.estoque),
        pesoKg:
          produto.peso_kg !== null &&
          produto.peso_kg !== undefined
            ? String(produto.peso_kg).replace(".", ",")
            : "",
        alturaCm:
          produto.altura_cm !== null &&
          produto.altura_cm !== undefined
            ? String(produto.altura_cm).replace(".", ",")
            : "",
        larguraCm:
          produto.largura_cm !== null &&
          produto.largura_cm !== undefined
            ? String(produto.largura_cm).replace(".", ",")
            : "",
        comprimentoCm:
          produto.comprimento_cm !== null &&
          produto.comprimento_cm !== undefined
            ? String(produto.comprimento_cm).replace(".", ",")
            : "",
        categoriaId: String(produto.categoria_id),
        destaque: produto.destaque,
        ativo: produto.ativo
      }}
      onSubmit={async (dados) => {
        await atualizarProduto(produto.id, {
          nome: dados.nome,
          descricao: dados.descricao,
          preco: dados.preco,
          estoque: dados.estoque,
          pesoKg: dados.pesoKg,
          alturaCm: dados.alturaCm,
          larguraCm: dados.larguraCm,
          comprimentoCm: dados.comprimentoCm,
          categoriaId: dados.categoriaId,
          destaque: dados.destaque,
          ativo: dados.ativo
        });

        navigate("/artesao/produtos", {
          replace: true,
          state: {
            mensagem: "Produto atualizado com sucesso."
          }
        });
      }}
    />
  );
}