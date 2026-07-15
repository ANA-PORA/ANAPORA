import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import axios from "axios";

import {
  FiAlertCircle,
  FiChevronLeft,
  FiMapPin,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShoppingBag,
  FiTrash2
} from "react-icons/fi";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  atualizarQuantidadeItem,
  buscarCarrinho,
  esvaziarCarrinho,
  removerItemCarrinho
} from "../services/carrinhoService";

import {
  calcularFrete
} from "../services/freteService";

import type {
  Carrinho as CarrinhoTipo,
  CarrinhoGrupoArtesao,
  CarrinhoItem
} from "../types/carrinho";

import type {
  CalcularFreteResponse,
  FreteArtesao,
  OpcaoFrete
} from "../types/frete";

import "../styles/carrinho.css";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000";

interface FreteSelecionado {
  artesaoId: number;
  opcao: OpcaoFrete;
}

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

function converterNumero(
  valor: number | string | null | undefined
): number {
  const numero = Number(
    String(valor ?? 0).replace(",", ".")
  );

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function formatarDinheiro(
  valor: number | string
): string {
  return converterNumero(valor).toLocaleString(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL"
    }
  );
}

function limparCep(
  valor: string
): string {
  return valor.replace(/\D/g, "");
}

function formatarCep(
  valor: string
): string {
  const numeros =
    limparCep(valor).slice(0, 8);

  if (numeros.length <= 5) {
    return numeros;
  }

  return `${numeros.slice(
    0,
    5
  )}-${numeros.slice(5)}`;
}

function obterMensagemErro(
  erroEncontrado: unknown
): string {
  if (axios.isAxiosError(erroEncontrado)) {
    if (
      erroEncontrado.response?.status === 401
    ) {
      return "Sua sessão expirou. Entre novamente.";
    }

    const detalhe =
      erroEncontrado.response?.data?.detail;

    if (typeof detalhe === "string") {
      return detalhe;
    }

    if (Array.isArray(detalhe)) {
      return detalhe
        .map((item) => item.msg)
        .filter(Boolean)
        .join(", ");
    }
  }

  return "Não foi possível realizar esta operação.";
}

function obterTodosItens(
  carrinho: CarrinhoTipo | null
): CarrinhoItem[] {
  if (!carrinho) {
    return [];
  }

  return carrinho.grupos.flatMap(
    (grupo) => grupo.itens
  );
}

function obterSubtotalGrupoSelecionado(
  grupo: CarrinhoGrupoArtesao,
  itensSelecionados: Set<number>
): number {
  return grupo.itens.reduce(
    (total, item) => {
      if (!itensSelecionados.has(item.id)) {
        return total;
      }

      return (
        total +
        converterNumero(item.subtotal)
      );
    },
    0
  );
}

export default function Carrinho() {
  const navigate = useNavigate();

  const [
    carrinho,
    setCarrinho
  ] = useState<CarrinhoTipo | null>(null);

  const [
    carregando,
    setCarregando
  ] = useState(true);

  const [
    erro,
    setErro
  ] = useState("");

  const [
    mensagem,
    setMensagem
  ] = useState("");

  const [
    itemEmAtualizacao,
    setItemEmAtualizacao
  ] = useState<number | null>(null);

  const [
    removendoItemId,
    setRemovendoItemId
  ] = useState<number | null>(null);

  const [
    esvaziando,
    setEsvaziando
  ] = useState(false);

  const [
    itensSelecionados,
    setItensSelecionados
  ] = useState<Set<number>>(
    () => new Set()
  );

  const [
    cep,
    setCep
  ] = useState("");

  const [
    calculandoFrete,
    setCalculandoFrete
  ] = useState(false);

  const [
    resultadoFrete,
    setResultadoFrete
  ] =
    useState<CalcularFreteResponse | null>(
      null
    );

  const [
    fretesSelecionados,
    setFretesSelecionados
  ] = useState<FreteSelecionado[]>([]);

  const limparFrete = useCallback(() => {
    setResultadoFrete(null);
    setFretesSelecionados([]);
  }, []);

  const carregarCarrinho = useCallback(
    async (): Promise<void> => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          replace: true,
          state: {
            mensagem:
              "Entre na sua conta para acessar o carrinho."
          }
        });

        return;
      }

      try {
        setErro("");
        setCarregando(true);

        const dados =
          await buscarCarrinho();

        setCarrinho(dados);

        const idsDisponiveis =
          obterTodosItens(dados)
            .filter(
              (item) => item.disponivel
            )
            .map((item) => item.id);

        setItensSelecionados(
          new Set(idsDisponiveis)
        );

        limparFrete();
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
            replace: true,
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
        setCarregando(false);
      }
    },
    [limparFrete, navigate]
  );

  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void carregarCarrinho();
      }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [carregarCarrinho]);

  const todosItens = useMemo(
    () => obterTodosItens(carrinho),
    [carrinho]
  );

  const itensMarcados = useMemo(
    () =>
      todosItens.filter((item) =>
        itensSelecionados.has(item.id)
      ),
    [itensSelecionados, todosItens]
  );

  const subtotalSelecionado = useMemo(
    () =>
      itensMarcados.reduce(
        (total, item) =>
          total +
          converterNumero(item.subtotal),
        0
      ),
    [itensMarcados]
  );

  const quantidadeSelecionada = useMemo(
    () =>
      itensMarcados.reduce(
        (total, item) =>
          total + item.quantidade,
        0
      ),
    [itensMarcados]
  );

  const possuiSelecionadoIndisponivel =
    useMemo(
      () =>
        itensMarcados.some(
          (item) => !item.disponivel
        ),
      [itensMarcados]
    );

  const valorFreteSelecionado = useMemo(
    () =>
      fretesSelecionados.reduce(
        (total, frete) =>
          total +
          converterNumero(
            frete.opcao.valor
          ),
        0
      ),
    [fretesSelecionados]
  );

  const quantidadeGruposFrete =
    resultadoFrete?.grupos.length ?? 0;

  const todosFretesEscolhidos =
    quantidadeGruposFrete > 0 &&
    fretesSelecionados.length ===
      quantidadeGruposFrete;

  const totalSelecionado =
    subtotalSelecionado +
    valorFreteSelecionado;

  const todosDisponiveisSelecionados =
    useMemo(() => {
      const disponiveis =
        todosItens.filter(
          (item) => item.disponivel
        );

      return (
        disponiveis.length > 0 &&
        disponiveis.every((item) =>
          itensSelecionados.has(item.id)
        )
      );
    }, [itensSelecionados, todosItens]);

  function limparAvisos(): void {
    setErro("");
    setMensagem("");
  }

  function alternarItem(
    item: CarrinhoItem
  ): void {
    if (!item.disponivel) {
      return;
    }

    limparAvisos();
    limparFrete();

    setItensSelecionados(
      (selecionadosAtuais) => {
        const novosSelecionados =
          new Set(selecionadosAtuais);

        if (
          novosSelecionados.has(item.id)
        ) {
          novosSelecionados.delete(
            item.id
          );
        } else {
          novosSelecionados.add(item.id);
        }

        return novosSelecionados;
      }
    );
  }

  function alternarTodos(): void {
    limparAvisos();
    limparFrete();

    if (todosDisponiveisSelecionados) {
      setItensSelecionados(new Set());
      return;
    }

    const idsDisponiveis =
      todosItens
        .filter(
          (item) => item.disponivel
        )
        .map((item) => item.id);

    setItensSelecionados(
      new Set(idsDisponiveis)
    );
  }

  async function alterarQuantidade(
    item: CarrinhoItem,
    novaQuantidade: number
  ): Promise<void> {
    if (novaQuantidade < 1) {
      return;
    }

    if (
      novaQuantidade >
      item.estoque_disponivel
    ) {
      setErro(
        `Existem apenas ${item.estoque_disponivel} unidades disponíveis de "${item.produto.nome}".`
      );

      return;
    }

    try {
      limparAvisos();
      limparFrete();

      setItemEmAtualizacao(item.id);

      const carrinhoAtualizado =
        await atualizarQuantidadeItem(
          item.id,
          {
            quantidade:
              novaQuantidade
          }
        );

      setCarrinho(
        carrinhoAtualizado
      );
    } catch (erroEncontrado) {
      setErro(
        obterMensagemErro(
          erroEncontrado
        )
      );
    } finally {
      setItemEmAtualizacao(null);
    }
  }

  async function removerItem(
    item: CarrinhoItem
  ): Promise<void> {
    const confirmou =
      window.confirm(
        `Deseja remover "${item.produto.nome}" do carrinho?`
      );

    if (!confirmou) {
      return;
    }

    try {
      limparAvisos();
      limparFrete();

      setRemovendoItemId(item.id);

      const resultado =
        await removerItemCarrinho(
          item.id
        );

      setMensagem(resultado.message);

      await carregarCarrinho();
    } catch (erroEncontrado) {
      setErro(
        obterMensagemErro(
          erroEncontrado
        )
      );
    } finally {
      setRemovendoItemId(null);
    }
  }

  async function limparCarrinho(): Promise<void> {
    if (!carrinho?.quantidade_itens) {
      return;
    }

    const confirmou =
      window.confirm(
        "Deseja remover todos os produtos do carrinho?"
      );

    if (!confirmou) {
      return;
    }

    try {
      limparAvisos();
      limparFrete();

      setEsvaziando(true);

      const resultado =
        await esvaziarCarrinho();

      setMensagem(resultado.message);

      await carregarCarrinho();
    } catch (erroEncontrado) {
      setErro(
        obterMensagemErro(
          erroEncontrado
        )
      );
    } finally {
      setEsvaziando(false);
    }
  }

  async function calcularFreteCarrinho(): Promise<void> {
    limparAvisos();

    const cepLimpo = limparCep(cep);

    if (itensSelecionados.size === 0) {
      setErro(
        "Selecione pelo menos um produto para calcular o frete."
      );

      return;
    }

    if (cepLimpo.length !== 8) {
      setErro(
        "Informe um CEP válido com 8 números."
      );

      return;
    }

    try {
      setCalculandoFrete(true);
      limparFrete();

      const resultado =
        await calcularFrete({
          cep_destino: cepLimpo,
          item_ids: Array.from(
            itensSelecionados
          )
        });

      setResultadoFrete(resultado);

      const opcoesIniciais =
        resultado.grupos
          .map((grupo) => {
            const opcaoMaisBarata =
              [...grupo.opcoes].sort(
                (opcaoA, opcaoB) =>
                  converterNumero(
                    opcaoA.valor
                  ) -
                  converterNumero(
                    opcaoB.valor
                  )
              )[0];

            if (!opcaoMaisBarata) {
              return null;
            }

            return {
              artesaoId:
                grupo.artesao_id,
              opcao: opcaoMaisBarata
            };
          })
          .filter(
            (
              frete
            ): frete is FreteSelecionado =>
              frete !== null
          );

      setFretesSelecionados(
        opcoesIniciais
      );

      setMensagem(
        "Frete calculado com sucesso."
      );
    } catch (erroEncontrado) {
      setErro(
        obterMensagemErro(
          erroEncontrado
        )
      );
    } finally {
      setCalculandoFrete(false);
    }
  }

  function selecionarFrete(
    grupo: FreteArtesao,
    opcao: OpcaoFrete
  ): void {
    setFretesSelecionados(
      (selecionadosAtuais) => {
        const outros =
          selecionadosAtuais.filter(
            (frete) =>
              frete.artesaoId !==
              grupo.artesao_id
          );

        return [
          ...outros,
          {
            artesaoId:
              grupo.artesao_id,
            opcao
          }
        ];
      }
    );
  }

  function verificarFreteSelecionado(
    artesaoId: number,
    codigo: string
  ): boolean {
    return fretesSelecionados.some(
      (frete) =>
        frete.artesaoId ===
          artesaoId &&
        frete.opcao.codigo === codigo
    );
  }

  function continuarCompra(): void {
    if (
      itensSelecionados.size === 0
    ) {
      setErro(
        "Selecione pelo menos um produto para continuar."
      );

      return;
    }

    if (
      possuiSelecionadoIndisponivel
    ) {
      setErro(
        "Existem produtos indisponíveis entre os itens selecionados."
      );

      return;
    }

    if (!resultadoFrete) {
      setErro(
        "Calcule o frete antes de continuar."
      );

      return;
    }

    if (!todosFretesEscolhidos) {
      setErro(
        "Selecione uma modalidade de frete para cada artesão."
      );

      return;
    }

    setMensagem(
      "Os produtos selecionados e o frete estão prontos. O próximo passo será implementar o checkout."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  if (carregando) {
    return (
      <section className="carrinho-page">
        <div className="container carrinho-loading">
          <div
            className="spinner-border text-success"
            role="status"
          >
            <span className="visually-hidden">
              Carregando carrinho...
            </span>
          </div>

          <p>
            Carregando seu carrinho...
          </p>
        </div>
      </section>
    );
  }

  if (erro && !carrinho) {
    return (
      <section className="carrinho-page">
        <div className="container">
          <div className="carrinho-erro-principal">
            <FiAlertCircle />

            <h1>
              Não foi possível abrir o
              carrinho
            </h1>

            <p>{erro}</p>

            <button
              type="button"
              onClick={() => {
                void carregarCarrinho();
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </section>
    );
  }

  const carrinhoVazio =
    !carrinho ||
    carrinho.quantidade_itens === 0 ||
    carrinho.grupos.length === 0;

  return (
    <section className="carrinho-page">
      <div className="container carrinho-container">
        <header className="carrinho-cabecalho">
          <div>
            <NavLink
              to="/"
              className="carrinho-voltar"
            >
              <FiChevronLeft />
              Continuar comprando
            </NavLink>

            <h1>Meu carrinho</h1>

            {!carrinhoVazio &&
              carrinho && (
                <p>
                  {
                    carrinho.quantidade_itens
                  }{" "}
                  {carrinho.quantidade_itens ===
                  1
                    ? "item"
                    : "itens"}{" "}
                  no carrinho
                </p>
              )}
          </div>

          {!carrinhoVazio && (
            <button
              type="button"
              className="carrinho-limpar"
              disabled={esvaziando}
              onClick={() => {
                void limparCarrinho();
              }}
            >
              <FiTrash2 />

              {esvaziando
                ? "Limpando..."
                : "Esvaziar carrinho"}
            </button>
          )}
        </header>

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

        {carrinho?.mensagens.map(
          (aviso, indice) => (
            <div
              className="carrinho-alerta-estoque"
              key={`${aviso}-${indice}`}
            >
              <FiAlertCircle />
              <span>{aviso}</span>
            </div>
          )
        )}

        {carrinhoVazio ? (
          <div className="carrinho-vazio">
            <div className="carrinho-vazio-icone">
              <FiShoppingBag />
            </div>

            <h2>
              Seu carrinho está vazio
            </h2>

            <p>
              Explore nossas biojoias e
              adicione produtos ao carrinho.
            </p>

            <NavLink
              to="/"
              className="carrinho-vazio-botao"
            >
              Ver produtos
            </NavLink>
          </div>
        ) : (
          <>
            <div className="carrinho-selecionar-todos">
              <label>
                <input
                  type="checkbox"
                  checked={
                    todosDisponiveisSelecionados
                  }
                  onChange={
                    alternarTodos
                  }
                />

                <span>
                  Selecionar todos os
                  produtos disponíveis
                </span>
              </label>
            </div>

            <div className="carrinho-conteudo">
              <div className="carrinho-grupos">
                {carrinho?.grupos.map(
                  (grupo) => {
                    const subtotalGrupo =
                      obterSubtotalGrupoSelecionado(
                        grupo,
                        itensSelecionados
                      );

                    return (
                      <article
                        className="carrinho-grupo"
                        key={
                          grupo.artesao.id
                        }
                      >
                        <header className="carrinho-grupo-cabecalho">
                          <div>
                            <span>
                              Vendido por
                            </span>

                            <h2>
                              {grupo.artesao
                                .nome_loja ||
                                grupo.artesao
                                  .nome}
                            </h2>
                          </div>

                          <strong>
                            {formatarDinheiro(
                              subtotalGrupo
                            )}
                          </strong>
                        </header>

                        <div className="carrinho-itens">
                          {grupo.itens.map(
                            (item) => {
                              const imagem =
                                resolverUrlImagem(
                                  item.produto
                                    .imagem_principal
                                );

                              const atualizando =
                                itemEmAtualizacao ===
                                item.id;

                              const removendo =
                                removendoItemId ===
                                item.id;

                              const podeAumentar =
                                item.quantidade <
                                  item.estoque_disponivel &&
                                item.disponivel;

                              const selecionado =
                                itensSelecionados.has(
                                  item.id
                                );

                              return (
                                <div
                                  className={`carrinho-item ${
                                    !item.disponivel
                                      ? "carrinho-item-indisponivel"
                                      : ""
                                  } ${
                                    selecionado
                                      ? "carrinho-item-selecionado"
                                      : ""
                                  }`}
                                  key={item.id}
                                >
                                  <div className="carrinho-item-checkbox">
                                    <input
                                      type="checkbox"
                                      aria-label={`Selecionar ${item.produto.nome}`}
                                      checked={
                                        selecionado
                                      }
                                      disabled={
                                        !item.disponivel
                                      }
                                      onChange={() => {
                                        alternarItem(
                                          item
                                        );
                                      }}
                                    />
                                  </div>

                                  <div className="carrinho-item-imagem">
                                    {imagem ? (
                                      <img
                                        src={
                                          imagem
                                        }
                                        alt={
                                          item
                                            .produto
                                            .nome
                                        }
                                      />
                                    ) : (
                                      <FiPackage />
                                    )}
                                  </div>

                                  <div className="carrinho-item-informacoes">
                                    <h3>
                                      {
                                        item
                                          .produto
                                          .nome
                                      }
                                    </h3>

                                    <span className="carrinho-item-preco-unitario">
                                      {formatarDinheiro(
                                        item.preco_unitario
                                      )}{" "}
                                      por unidade
                                    </span>

                                    {item.mensagem_estoque && (
                                      <div className="carrinho-item-aviso">
                                        <FiAlertCircle />

                                        <span>
                                          {
                                            item.mensagem_estoque
                                          }
                                        </span>
                                      </div>
                                    )}

                                    {!item.mensagem_estoque &&
                                      item.estoque_disponivel <=
                                        5 && (
                                        <span className="carrinho-estoque-baixo">
                                          Apenas{" "}
                                          {
                                            item.estoque_disponivel
                                          }{" "}
                                          unidades
                                          disponíveis
                                        </span>
                                      )}

                                    <button
                                      type="button"
                                      className="carrinho-remover-mobile"
                                      disabled={
                                        removendo
                                      }
                                      onClick={() => {
                                        void removerItem(
                                          item
                                        );
                                      }}
                                    >
                                      Remover
                                    </button>
                                  </div>

                                  <div className="carrinho-item-quantidade">
                                    <span>
                                      Quantidade
                                    </span>

                                    <div className="carrinho-seletor-quantidade">
                                      <button
                                        type="button"
                                        aria-label={`Diminuir quantidade de ${item.produto.nome}`}
                                        disabled={
                                          atualizando ||
                                          item.quantidade <=
                                            1
                                        }
                                        onClick={() => {
                                          void alterarQuantidade(
                                            item,
                                            item.quantidade -
                                              1
                                          );
                                        }}
                                      >
                                        <FiMinus />
                                      </button>

                                      <span>
                                        {atualizando
                                          ? "..."
                                          : item.quantidade}
                                      </span>

                                      <button
                                        type="button"
                                        aria-label={`Aumentar quantidade de ${item.produto.nome}`}
                                        disabled={
                                          atualizando ||
                                          !podeAumentar
                                        }
                                        onClick={() => {
                                          void alterarQuantidade(
                                            item,
                                            item.quantidade +
                                              1
                                          );
                                        }}
                                      >
                                        <FiPlus />
                                      </button>
                                    </div>

                                    <button
                                      type="button"
                                      className="carrinho-remover"
                                      disabled={
                                        removendo
                                      }
                                      onClick={() => {
                                        void removerItem(
                                          item
                                        );
                                      }}
                                    >
                                      <FiTrash2 />

                                      {removendo
                                        ? "Removendo..."
                                        : "Remover"}
                                    </button>
                                  </div>

                                  <div className="carrinho-item-subtotal">
                                    <span>
                                      Subtotal
                                    </span>

                                    <strong>
                                      {formatarDinheiro(
                                        item.subtotal
                                      )}
                                    </strong>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>

                        <footer className="carrinho-grupo-rodape">
                          <span>
                            Subtotal selecionado
                            deste artesão
                          </span>

                          <strong>
                            {formatarDinheiro(
                              subtotalGrupo
                            )}
                          </strong>
                        </footer>
                      </article>
                    );
                  }
                )}
              </div>

              <aside className="carrinho-resumo">
                <h2>
                  Resumo da compra
                </h2>

                <div className="carrinho-resumo-linha">
                  <span>
                    Produtos (
                    {
                      quantidadeSelecionada
                    }
                    )
                  </span>

                  <span>
                    {formatarDinheiro(
                      subtotalSelecionado
                    )}
                  </span>
                </div>

                <div className="carrinho-calculo-frete">
                  <label htmlFor="cep-frete">
                    <FiMapPin />
                    Calcular frete
                  </label>

                  <div className="carrinho-cep-campo">
                    <input
                      id="cep-frete"
                      type="text"
                      inputMode="numeric"
                      placeholder="00000-000"
                      maxLength={9}
                      value={cep}
                      onChange={(evento) => {
                        setCep(
                          formatarCep(
                            evento.target
                              .value
                          )
                        );

                        limparFrete();
                        setMensagem("");
                      }}
                    />

                    <button
                      type="button"
                      disabled={
                        calculandoFrete ||
                        itensSelecionados.size ===
                          0 ||
                        limparCep(cep)
                          .length !== 8
                      }
                      onClick={() => {
                        void calcularFreteCarrinho();
                      }}
                    >
                      {calculandoFrete
                        ? "Calculando..."
                        : "Calcular"}
                    </button>
                  </div>
                </div>

                {resultadoFrete?.grupos.map(
                  (grupo) => (
                    <div
                      className="carrinho-frete-grupo"
                      key={
                        grupo.artesao_id
                      }
                    >
                      <strong>
                        {grupo.nome_loja ||
                          grupo.nome_artesao}
                      </strong>

                      {grupo.opcoes.map(
                        (opcao) => (
                          <label
                            className="carrinho-frete-opcao"
                            key={`${grupo.artesao_id}-${opcao.codigo}`}
                          >
                            <input
                              type="radio"
                              name={`frete-${grupo.artesao_id}`}
                              checked={verificarFreteSelecionado(
                                grupo.artesao_id,
                                opcao.codigo
                              )}
                              onChange={() => {
                                selecionarFrete(
                                  grupo,
                                  opcao
                                );
                              }}
                            />

                            <span>
                              <strong>
                                {
                                  opcao.nome
                                }
                              </strong>

                              <small>
                                Entrega em até{" "}
                                {
                                  opcao.prazo_dias
                                }{" "}
                                {opcao.prazo_dias ===
                                1
                                  ? "dia útil"
                                  : "dias úteis"}
                              </small>
                            </span>

                            <b>
                              {formatarDinheiro(
                                opcao.valor
                              )}
                            </b>
                          </label>
                        )
                      )}
                    </div>
                  )
                )}

                <div className="carrinho-resumo-linha">
                  <span>Frete</span>

                  <span>
                    {resultadoFrete
                      ? formatarDinheiro(
                          valorFreteSelecionado
                        )
                      : "A calcular"}
                  </span>
                </div>

                <div className="carrinho-resumo-total">
                  <span>Total</span>

                  <strong>
                    {formatarDinheiro(
                      totalSelecionado
                    )}
                  </strong>
                </div>

                {itensSelecionados.size ===
                  0 && (
                  <div className="carrinho-resumo-aviso">
                    <FiAlertCircle />

                    <span>
                      Selecione pelo menos
                      um produto.
                    </span>
                  </div>
                )}

                {possuiSelecionadoIndisponivel && (
                  <div className="carrinho-resumo-aviso">
                    <FiAlertCircle />

                    <span>
                      Ajuste os itens
                      indisponíveis antes de
                      continuar.
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  className="carrinho-continuar"
                  disabled={
                    itensSelecionados.size ===
                      0 ||
                    possuiSelecionadoIndisponivel
                  }
                  onClick={
                    continuarCompra
                  }
                >
                  Continuar compra
                </button>

                <NavLink
                  to="/"
                  className="carrinho-continuar-comprando"
                >
                  Continuar comprando
                </NavLink>
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  );
}