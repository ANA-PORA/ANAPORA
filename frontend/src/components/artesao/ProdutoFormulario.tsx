import {
  useEffect,
  useRef,
  useState
} from "react";
import type {
  ChangeEvent,
  SyntheticEvent
} from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiImage,
  FiSave,
  FiTrash2,
  FiUploadCloud
} from "react-icons/fi";

import { useCategorias } from "../../hooks/useCategorias";
import type { ProdutoImagem } from "../../types/produto";

import "../../styles/NovoProduto.css";

interface ImagemPreview {
  arquivo: File;
  url: string;
}

export interface ProdutoFormularioDados {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoriaId: number;
  imagens: File[];
  destaque: boolean;
  ativo: boolean;
}

interface ProdutoFormularioValoresIniciais {
  nome: string;
  descricao: string;
  preco: string;
  estoque: string;
  categoriaId: string;
  destaque: boolean;
  ativo: boolean;
}

interface ProdutoFormularioProps {
  titulo: string;
  subtitulo: string;
  textoBotao: string;
  textoEnviando: string;
  valoresIniciais?: ProdutoFormularioValoresIniciais;
  imagensAtuais?: ProdutoImagem[];
  exigirImagem?: boolean;
  mostrarStatus?: boolean;
  permitirUploadImagens?: boolean;
  onSubmit: (
    dados: ProdutoFormularioDados
  ) => Promise<void>;
}

const VALORES_PADRAO: ProdutoFormularioValoresIniciais = {
  nome: "",
  descricao: "",
  preco: "",
  estoque: "",
  categoriaId: "",
  destaque: false,
  ativo: true
};

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const MAXIMO_IMAGENS = 8;

export default function ProdutoFormulario({
  titulo,
  subtitulo,
  textoBotao,
  textoEnviando,
  valoresIniciais = VALORES_PADRAO,
  imagensAtuais = [],
  exigirImagem = false,
  mostrarStatus = false,
  permitirUploadImagens = true,
  onSubmit
}: ProdutoFormularioProps) {
  const {
    categorias,
    loading: carregandoCategorias
  } = useCategorias();

  const urlsCriadas = useRef<string[]>([]);

  const [nome, setNome] = useState(
    valoresIniciais.nome
  );

  const [descricao, setDescricao] = useState(
    valoresIniciais.descricao
  );

  const [preco, setPreco] = useState(
    valoresIniciais.preco
  );

  const [estoque, setEstoque] = useState(
    valoresIniciais.estoque
  );

  const [categoriaId, setCategoriaId] = useState(
    valoresIniciais.categoriaId
  );

  const [destaque, setDestaque] = useState(
    valoresIniciais.destaque
  );

  const [ativo, setAtivo] = useState(
    valoresIniciais.ativo
  );

  const [imagens, setImagens] = useState<
    ImagemPreview[]
  >([]);

  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    setNome(valoresIniciais.nome);
    setDescricao(valoresIniciais.descricao);
    setPreco(valoresIniciais.preco);
    setEstoque(valoresIniciais.estoque);
    setCategoriaId(valoresIniciais.categoriaId);
    setDestaque(valoresIniciais.destaque);
    setAtivo(valoresIniciais.ativo);
  }, [
    valoresIniciais.nome,
    valoresIniciais.descricao,
    valoresIniciais.preco,
    valoresIniciais.estoque,
    valoresIniciais.categoriaId,
    valoresIniciais.destaque,
    valoresIniciais.ativo
  ]);

  useEffect(() => {
    return () => {
      urlsCriadas.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  function selecionarImagens(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivos = Array.from(
      evento.target.files ?? []
    );

    setErro("");

    if (!permitirUploadImagens) {
      evento.target.value = "";
      return;
    }

    const totalImagens =
      imagensAtuais.length +
      imagens.length +
      arquivos.length;

    if (totalImagens > MAXIMO_IMAGENS) {
      setErro(
        `Você pode cadastrar no máximo ${MAXIMO_IMAGENS} imagens.`
      );

      evento.target.value = "";
      return;
    }

    const arquivoInvalido = arquivos.find(
      (arquivo) =>
        !TIPOS_PERMITIDOS.includes(arquivo.type)
    );

    if (arquivoInvalido) {
      setErro(
        "Envie somente imagens JPG, PNG ou WEBP."
      );

      evento.target.value = "";
      return;
    }

    const arquivoGrande = arquivos.find(
      (arquivo) => arquivo.size > TAMANHO_MAXIMO
    );

    if (arquivoGrande) {
      setErro(
        "Cada imagem deve possuir no máximo 5 MB."
      );

      evento.target.value = "";
      return;
    }

    const novasImagens = arquivos.map((arquivo) => {
      const url = URL.createObjectURL(arquivo);

      urlsCriadas.current.push(url);

      return {
        arquivo,
        url
      };
    });

    setImagens((imagensAtuaisDoEstado) => [
      ...imagensAtuaisDoEstado,
      ...novasImagens
    ]);

    evento.target.value = "";
  }

  function removerNovaImagem(indice: number) {
    setImagens((imagensAtuaisDoEstado) => {
      const imagemRemovida =
        imagensAtuaisDoEstado[indice];

      if (imagemRemovida) {
        URL.revokeObjectURL(imagemRemovida.url);

        urlsCriadas.current =
          urlsCriadas.current.filter(
            (url) => url !== imagemRemovida.url
          );
      }

      return imagensAtuaisDoEstado.filter(
        (_, indiceAtual) => indiceAtual !== indice
      );
    });
  }

  async function enviarFormulario(
    evento: SyntheticEvent<HTMLFormElement>
  ) {
    evento.preventDefault();
    setErro("");

    const precoNumerico = Number(
      preco.replace(",", ".")
    );

    const estoqueNumerico = Number(estoque);
    const categoriaNumerica = Number(categoriaId);

    if (
      !nome.trim() ||
      !descricao.trim() ||
      !preco ||
      estoque === "" ||
      !categoriaId
    ) {
      setErro(
        "Preencha todos os campos obrigatórios."
      );
      return;
    }

    if (nome.trim().length < 3) {
      setErro(
        "O nome deve possuir pelo menos 3 caracteres."
      );
      return;
    }

    if (descricao.trim().length < 10) {
      setErro(
        "A descrição deve possuir pelo menos 10 caracteres."
      );
      return;
    }

    if (
      !Number.isFinite(precoNumerico) ||
      precoNumerico <= 0
    ) {
      setErro(
        "Informe um preço válido e maior que zero."
      );
      return;
    }

    if (
      !Number.isInteger(estoqueNumerico) ||
      estoqueNumerico < 0
    ) {
      setErro(
        "Informe uma quantidade de estoque válida."
      );
      return;
    }

    if (
      !Number.isInteger(categoriaNumerica) ||
      categoriaNumerica <= 0
    ) {
      setErro("Selecione uma categoria.");
      return;
    }

    if (
      exigirImagem &&
      imagensAtuais.length === 0 &&
      imagens.length === 0
    ) {
      setErro("Selecione pelo menos uma imagem.");
      return;
    }

    try {
      setEnviando(true);

      await onSubmit({
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico,
        estoque: estoqueNumerico,
        categoriaId: categoriaNumerica,
        imagens: permitirUploadImagens
          ? imagens.map((imagem) => imagem.arquivo)
          : [],
        destaque,
        ativo
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detalhe = error.response?.data?.detail;

        if (typeof detalhe === "string") {
          setErro(detalhe);
        } else {
          setErro(
            "Não foi possível salvar o produto."
          );
        }
      } else {
        setErro("Ocorreu um erro inesperado.");
      }
    } finally {
      setEnviando(false);
    }
  }

  const quantidadeTotal =
    imagensAtuais.length + imagens.length;

  return (
    <section className="new-product-page">
      <header className="artisan-page-header">
        <div>
          <span className="artisan-page-eyebrow">
            Catálogo
          </span>

          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
        </div>

        <NavLink
          to="/artesao/produtos"
          className="new-product-back"
        >
          <FiArrowLeft />
          <span>Voltar</span>
        </NavLink>
      </header>

      <form
        className="new-product-form"
        onSubmit={enviarFormulario}
      >
        {erro && (
          <div className="alert alert-danger">
            {erro}
          </div>
        )}

        <div className="new-product-grid">
          <div className="new-product-card">
            <div className="new-product-card-title">
              <h2>Informações do produto</h2>

              <p>
                Preencha os dados que serão apresentados
                no marketplace.
              </p>
            </div>

            <div className="mb-3">
              <label
                htmlFor="produto-nome"
                className="form-label"
              >
                Nome do produto
              </label>

              <input
                id="produto-nome"
                type="text"
                className="form-control"
                value={nome}
                onChange={(evento) =>
                  setNome(evento.target.value)
                }
                maxLength={150}
                placeholder="Ex.: Colar de sementes amazônicas"
                disabled={enviando}
              />

              <small>
                {nome.length}/150 caracteres
              </small>
            </div>

            <div className="mb-3">
              <label
                htmlFor="produto-descricao"
                className="form-label"
              >
                Descrição
              </label>

              <textarea
                id="produto-descricao"
                className="form-control new-product-description"
                value={descricao}
                onChange={(evento) =>
                  setDescricao(evento.target.value)
                }
                placeholder="Descreva os materiais, processo de produção e características do produto"
                disabled={enviando}
              />
            </div>

            <div className="new-product-fields">
              <div>
                <label
                  htmlFor="produto-preco"
                  className="form-label"
                >
                  Preço
                </label>

                <div className="new-product-money">
                  <span>R$</span>

                  <input
                    id="produto-preco"
                    type="text"
                    inputMode="decimal"
                    value={preco}
                    onChange={(evento) =>
                      setPreco(evento.target.value)
                    }
                    placeholder="0,00"
                    disabled={enviando}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="produto-estoque"
                  className="form-label"
                >
                  Estoque
                </label>

                <input
                  id="produto-estoque"
                  type="number"
                  className="form-control"
                  min="0"
                  step="1"
                  value={estoque}
                  onChange={(evento) =>
                    setEstoque(evento.target.value)
                  }
                  placeholder="0"
                  disabled={enviando}
                />
              </div>
            </div>

            <div className="mt-3">
              <label
                htmlFor="produto-categoria"
                className="form-label"
              >
                Categoria
              </label>

              <select
                id="produto-categoria"
                className="form-select"
                value={categoriaId}
                onChange={(evento) =>
                  setCategoriaId(evento.target.value)
                }
                disabled={
                  carregandoCategorias || enviando
                }
              >
                <option value="">
                  {carregandoCategorias
                    ? "Carregando categorias..."
                    : "Selecione uma categoria"}
                </option>

                {categorias.map((categoria) => (
                  <option
                    key={categoria.id}
                    value={categoria.id}
                  >
                    {categoria.nome}
                  </option>
                ))}
              </select>

              {!carregandoCategorias &&
                categorias.length === 0 && (
                  <small className="text-danger">
                    Nenhuma categoria ativa está
                    disponível.
                  </small>
                )}
            </div>

            {mostrarStatus && (
              <div className="mt-4">
                <div className="new-product-card-title">
                  <h2>Status do produto</h2>

                  <p>
                    Controle a visibilidade do produto no
                    marketplace.
                  </p>
                </div>

                <div className="form-check mb-3">
                  <input
                    id="produto-ativo"
                    type="checkbox"
                    className="form-check-input"
                    checked={ativo}
                    onChange={(evento) =>
                      setAtivo(evento.target.checked)
                    }
                    disabled={enviando}
                  />

                  <label
                    htmlFor="produto-ativo"
                    className="form-check-label"
                  >
                    Produto ativo
                  </label>
                </div>

                <div className="form-check">
                  <input
                    id="produto-destaque"
                    type="checkbox"
                    className="form-check-input"
                    checked={destaque}
                    onChange={(evento) =>
                      setDestaque(
                        evento.target.checked
                      )
                    }
                    disabled={enviando}
                  />

                  <label
                    htmlFor="produto-destaque"
                    className="form-check-label"
                  >
                    Produto em destaque
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="new-product-card">
            <div className="new-product-card-title">
              <h2>Imagens</h2>

              <p>
                {permitirUploadImagens
                  ? "Envie até 8 imagens em JPG, PNG ou WEBP, com no máximo 5 MB cada."
                  : "Estas são as imagens cadastradas no produto."}
              </p>
            </div>

            {permitirUploadImagens && (
              <>
                <label
                  htmlFor="produto-imagens"
                  className="new-product-upload"
                >
                  <FiUploadCloud />
                  <strong>Selecionar imagens</strong>
                  <span>
                    Clique para procurar os arquivos
                  </span>
                </label>

                <input
                  id="produto-imagens"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="new-product-file-input"
                  onChange={selecionarImagens}
                  disabled={enviando}
                />
              </>
            )}

            <div className="new-product-image-count">
              <span>
                {quantidadeTotal} de {MAXIMO_IMAGENS}{" "}
                imagens
              </span>

              {quantidadeTotal > 0 &&
                permitirUploadImagens && (
                  <span>
                    A primeira imagem será a principal
                  </span>
                )}
            </div>

            {quantidadeTotal === 0 ? (
              <div className="new-product-empty-images">
                <FiImage />

                <span>
                  {permitirUploadImagens
                    ? "Nenhuma imagem selecionada"
                    : "Nenhuma imagem cadastrada"}
                </span>
              </div>
            ) : (
              <div className="new-product-previews">
                {imagensAtuais.map(
                  (imagem, indice) => (
                    <div
                      className="new-product-preview"
                      key={`atual-${imagem.id}`}
                    >
                      <img
                        src={imagem.url}
                        alt={`Imagem atual ${indice + 1}`}
                      />

                      {indice === 0 && (
                        <span className="new-product-main-image">
                          Principal
                        </span>
                      )}
                    </div>
                  )
                )}

                {permitirUploadImagens &&
                  imagens.map((imagem, indice) => {
                    const indiceReal =
                      imagensAtuais.length + indice;

                    return (
                      <div
                        className="new-product-preview"
                        key={`${imagem.arquivo.name}-${imagem.arquivo.lastModified}`}
                      >
                        <img
                          src={imagem.url}
                          alt={`Nova imagem ${indice + 1}`}
                        />

                        {indiceReal === 0 && (
                          <span className="new-product-main-image">
                            Principal
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removerNovaImagem(indice)
                          }
                          aria-label="Remover imagem"
                          disabled={enviando}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            {!permitirUploadImagens &&
              imagensAtuais.length > 0 && (
                <small>
                  A alteração de imagens ainda não está
                  disponível nesta tela.
                </small>
              )}
          </div>
        </div>

        <div className="new-product-actions">
          <NavLink
            to="/artesao/produtos"
            className="new-product-cancel"
          >
            Cancelar
          </NavLink>

          <button
            type="submit"
            className="new-product-submit"
            disabled={
              enviando ||
              carregandoCategorias ||
              categorias.length === 0
            }
          >
            <FiSave />

            <span>
              {enviando ? textoEnviando : textoBotao}
            </span>
          </button>
        </div>
      </form>
    </section>
  );
}