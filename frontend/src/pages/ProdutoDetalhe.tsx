import {
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  FiChevronLeft,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShoppingCart
} from "react-icons/fi";

import {
  NavLink,
  useNavigate,
  useParams
} from "react-router-dom";

import {
  buscarProdutoPorId
} from "../services/produtoService";

import {
  adicionarItemCarrinho
} from "../services/carrinhoService";

import type {
  Produto
} from "../types/produto";

import "../styles/ProdutoDetalhe.css";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000";

function resolverUrlImagem(
  url?: string | null
): string | null {
  if (!url) {
    return null;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const baseUrl =
    API_URL.replace(/\/$/, "");

  const caminho =
    url.startsWith("/")
      ? url
      : `/${url}`;

  return `${baseUrl}${caminho}`;
}

function formatarDinheiro(
  valor: number | string
): string {
  const numero = Number(
    String(valor).replace(",", ".")
  );

  if (!Number.isFinite(numero)) {
    return "R$ 0,00";
  }

  return numero.toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}

function obterMensagemErro(
  erro: unknown
): string {
  if (axios.isAxiosError(erro)) {
    const detalhe =
      erro.response?.data?.detail;

    if (typeof detalhe === "string") {
      return detalhe;
    }

    if (erro.response?.status === 401) {
      return "Entre na sua conta para adicionar produtos ao carrinho.";
    }
  }

  return "Não foi possível realizar esta operação.";
}

export default function ProdutoDetalhe() {
  const navigate = useNavigate();

  const {
    produtoId
  } = useParams<{
    produtoId: string;
  }>();

  const [
    produto,
    setProduto
  ] = useState<Produto | null>(null);

  const [
    quantidade,
    setQuantidade
  ] = useState(1);

  const [
    carregando,
    setCarregando
  ] = useState(true);

  const [
    adicionando,
    setAdicionando
  ] = useState(false);

  const [
    erro,
    setErro
  ] = useState("");

  const [
    mensagem,
    setMensagem
  ] = useState("");

  const imagens = useMemo(() => {
    if (!produto?.imagens) {
      return [];
    }

    return [...produto.imagens].sort(
      (imagemA, imagemB) =>
        imagemA.ordem - imagemB.ordem
    );
  }, [produto]);

  const [
    imagemSelecionada,
    setImagemSelecionada
  ] = useState<string | null>(null);

  useEffect(() => {
    async function carregarProduto() {
      const id = Number(produtoId);

      if (
        !produtoId ||
        !Number.isInteger(id) ||
        id <= 0
      ) {
        setErro("Produto inválido.");
        setCarregando(false);
        return;
      }

      try {
        setErro("");
        setCarregando(true);

        const dados =
          await buscarProdutoPorId(id);

        setProduto(dados);

        const imagensOrdenadas =
          Array.isArray(dados.imagens)
            ? [...dados.imagens].sort(
                (imagemA, imagemB) =>
                  imagemA.ordem -
                  imagemB.ordem
              )
            : [];

        setImagemSelecionada(
          resolverUrlImagem(
            imagensOrdenadas[0]?.url
          )
        );
      } catch (erroEncontrado) {
        setErro(
          obterMensagemErro(
            erroEncontrado
          )
        );
      } finally {
        setCarregando(false);
      }
    }

    void carregarProduto();
  }, [produtoId]);

  function verificarLogin(): boolean {
    const token =
      localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          mensagem:
            "Entre na sua conta para comprar este produto."
        }
      });

      return false;
    }

    return true;
  }

  async function adicionarAoCarrinho(
    comprarAgora = false
  ): Promise<void> {
    if (
      !produto ||
      !verificarLogin()
    ) {
      return;
    }

    try {
      setErro("");
      setMensagem("");
      setAdicionando(true);

      await adicionarItemCarrinho({
        produto_id: produto.id,
        quantidade
      });

      if (comprarAgora) {
        navigate("/carrinho");
        return;
      }

      setMensagem(
        "Produto adicionado ao carrinho com sucesso."
      );
    } catch (erroEncontrado) {
      if (
        axios.isAxiosError(
          erroEncontrado
        ) &&
        erroEncontrado.response
          ?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        navigate("/login", {
          state: {
            mensagem:
              "Sua sessão expirou. Entre novamente."
          }
        });

        return;
      }

      setErro(
        obterMensagemErro(
          erroEncontrado
        )
      );
    } finally {
      setAdicionando(false);
    }
  }

  if (carregando) {
    return (
      <section className="produto-detalhe-page">
        <div className="container produto-detalhe-loading">
          <div
            className="spinner-border text-success"
            role="status"
          >
            <span className="visually-hidden">
              Carregando produto...
            </span>
          </div>

          <p>Carregando produto...</p>
        </div>
      </section>
    );
  }

  if (erro && !produto) {
    return (
      <section className="produto-detalhe-page">
        <div className="container produto-detalhe-erro">
          <FiPackage />

          <h1>
            Não foi possível abrir o produto
          </h1>

          <p>{erro}</p>

          <NavLink to="/">
            Voltar para a página inicial
          </NavLink>
        </div>
      </section>
    );
  }

  if (!produto) {
    return null;
  }

  const produtoDisponivel =
    produto.ativo &&
    produto.estoque > 0;

  return (
    <section className="produto-detalhe-page">
      <div className="container">
        <NavLink
          to="/"
          className="produto-detalhe-voltar"
        >
          <FiChevronLeft />
          Voltar aos produtos
        </NavLink>

        <div className="produto-detalhe-conteudo">
          <div className="produto-detalhe-galeria">
            <div className="produto-detalhe-imagem-principal">
              {imagemSelecionada ? (
                <img
                  src={imagemSelecionada}
                  alt={produto.nome}
                />
              ) : (
                <FiPackage />
              )}
            </div>

            {imagens.length > 1 && (
              <div className="produto-detalhe-miniaturas">
                {imagens.map(
                  (imagem) => {
                    const url =
                      resolverUrlImagem(
                        imagem.url
                      );

                    return (
                      <button
                        type="button"
                        key={imagem.id}
                        onClick={() => {
                          setImagemSelecionada(
                            url
                          );
                        }}
                      >
                        {url ? (
                          <img
                            src={url}
                            alt={produto.nome}
                          />
                        ) : (
                          <FiPackage />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          <div className="produto-detalhe-informacoes">
            {produto.destaque && (
              <span className="produto-detalhe-destaque">
                Produto em destaque
              </span>
            )}

            <h1>{produto.nome}</h1>

            <strong className="produto-detalhe-preco">
              {formatarDinheiro(
                produto.preco
              )}
            </strong>

            <p className="produto-detalhe-descricao">
              {produto.descricao}
            </p>

            <div className="produto-detalhe-estoque">
              {produtoDisponivel ? (
                <>
                  <span>
                    Produto disponível
                  </span>

                  <small>
                    {produto.estoque}{" "}
                    {produto.estoque === 1
                      ? "unidade disponível"
                      : "unidades disponíveis"}
                  </small>
                </>
              ) : (
                <span>
                  Produto indisponível
                </span>
              )}
            </div>

            {erro && (
              <div
                className="alert alert-danger"
                role="alert"
              >
                {erro}
              </div>
            )}

            {mensagem && (
              <div
                className="alert alert-success"
                role="alert"
              >
                {mensagem}
              </div>
            )}

            {produtoDisponivel && (
              <>
                <div className="produto-detalhe-quantidade">
                  <span>Quantidade</span>

                  <div>
                    <button
                      type="button"
                      disabled={
                        quantidade <= 1 ||
                        adicionando
                      }
                      onClick={() => {
                        setQuantidade(
                          (valorAtual) =>
                            Math.max(
                              1,
                              valorAtual - 1
                            )
                        );
                      }}
                    >
                      <FiMinus />
                    </button>

                    <strong>
                      {quantidade}
                    </strong>

                    <button
                      type="button"
                      disabled={
                        quantidade >=
                          produto.estoque ||
                        adicionando
                      }
                      onClick={() => {
                        setQuantidade(
                          (valorAtual) =>
                            Math.min(
                              produto.estoque,
                              valorAtual + 1
                            )
                        );
                      }}
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="produto-detalhe-acoes">
                  <button
                    type="button"
                    className="produto-detalhe-carrinho"
                    disabled={adicionando}
                    onClick={() => {
                      void adicionarAoCarrinho(
                        false
                      );
                    }}
                  >
                    <FiShoppingCart />

                    {adicionando
                      ? "Adicionando..."
                      : "Adicionar ao carrinho"}
                  </button>

                  <button
                    type="button"
                    className="produto-detalhe-comprar"
                    disabled={adicionando}
                    onClick={() => {
                      void adicionarAoCarrinho(
                        true
                      );
                    }}
                  >
                    Comprar agora
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}