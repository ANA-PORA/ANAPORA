import { useEffect, useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiArrowLeft, FiImage, FiSave, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { criarProduto } from "../../services/produtoService";
import { useCategorias } from "../../hooks/useCategorias";
import "../../styles/NovoProduto.css";

interface ImagemPreview {
  arquivo: File;
  url: string;
}

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO = 5 * 1024 * 1024;
const MAXIMO_IMAGENS = 8;

export default function NovoProduto() {
  const navigate = useNavigate();
  const { categorias, loading: carregandoCategorias } = useCategorias();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [estoque, setEstoque] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [imagens, setImagens] = useState<ImagemPreview[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    return () => {
      imagens.forEach((imagem) => URL.revokeObjectURL(imagem.url));
    };
  }, [imagens]);

  function selecionarImagens(evento: ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(evento.target.files ?? []);
    setErro("");
    if (imagens.length + arquivos.length > MAXIMO_IMAGENS) {
      setErro(`Você pode cadastrar no máximo ${MAXIMO_IMAGENS} imagens.`);
      evento.target.value = "";
      return;
    }
    const arquivoInvalido = arquivos.find((arquivo) => !TIPOS_PERMITIDOS.includes(arquivo.type));
    if (arquivoInvalido) {
      setErro("Envie somente imagens JPG, PNG ou WEBP.");
      evento.target.value = "";
      return;
    }
    const arquivoGrande = arquivos.find((arquivo) => arquivo.size > TAMANHO_MAXIMO);
    if (arquivoGrande) {
      setErro("Cada imagem deve possuir no máximo 5 MB.");
      evento.target.value = "";
      return;
    }
    const novasImagens = arquivos.map((arquivo) => ({
      arquivo,
      url: URL.createObjectURL(arquivo)
    }));
    setImagens((imagensAtuais) => [...imagensAtuais, ...novasImagens]);
    evento.target.value = "";
  }

  function removerImagem(indice: number) {
    setImagens((imagensAtuais) => {
      URL.revokeObjectURL(imagensAtuais[indice].url);
      return imagensAtuais.filter((_, indiceAtual) => indiceAtual !== indice);
    });
  }

  async function cadastrarProduto(evento: SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro("");
    const precoNumerico = Number(preco.replace(",", "."));
    const estoqueNumerico = Number(estoque);
    const categoriaNumerica = Number(categoriaId);
    if (!nome.trim() || !descricao.trim() || !preco || !estoque || !categoriaId) {
      setErro("Preencha todos os campos obrigatórios.");
      return;
    }
    if (nome.trim().length < 3) {
      setErro("O nome deve possuir pelo menos 3 caracteres.");
      return;
    }
    if (descricao.trim().length < 10) {
      setErro("A descrição deve possuir pelo menos 10 caracteres.");
      return;
    }
    if (!Number.isFinite(precoNumerico) || precoNumerico <= 0) {
      setErro("Informe um preço válido e maior que zero.");
      return;
    }
    if (!Number.isInteger(estoqueNumerico) || estoqueNumerico < 0) {
      setErro("Informe uma quantidade de estoque válida.");
      return;
    }
    if (!categoriaNumerica) {
      setErro("Selecione uma categoria.");
      return;
    }
    if (imagens.length === 0) {
      setErro("Selecione pelo menos uma imagem.");
      return;
    }
    try {
      setEnviando(true);
      await criarProduto({
        nome: nome.trim(),
        descricao: descricao.trim(),
        preco: precoNumerico,
        estoque: estoqueNumerico,
        categoriaId: categoriaNumerica,
        imagens: imagens.map((imagem) => imagem.arquivo)
      });
      navigate("/artesao/produtos", {
        replace: true,
        state: {
          mensagem: "Produto cadastrado com sucesso."
        }
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErro(error.response?.data?.detail ?? "Não foi possível cadastrar o produto.");
      } else {
        setErro("Ocorreu um erro inesperado.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="new-product-page">
      <header className="artisan-page-header">
        <div>
          <span className="artisan-page-eyebrow">Catálogo</span>
          <h1>Novo produto</h1>
          <p>Cadastre as informações e imagens do produto.</p>
        </div>
        <NavLink to="/artesao/produtos" className="new-product-back">
          <FiArrowLeft />
          <span>Voltar</span>
        </NavLink>
      </header>
      <form className="new-product-form" onSubmit={cadastrarProduto}>
        {erro && <div className="alert alert-danger">{erro}</div>}
        <div className="new-product-grid">
          <div className="new-product-card">
            <div className="new-product-card-title">
              <h2>Informações do produto</h2>
              <p>Preencha os dados que serão apresentados no marketplace.</p>
            </div>
            <div className="mb-3">
              <label htmlFor="produto-nome" className="form-label">Nome do produto</label>
              <input
                id="produto-nome"
                type="text"
                className="form-control"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                maxLength={150}
                placeholder="Ex.: Colar de sementes amazônicas"
              />
              <small>{nome.length}/150 caracteres</small>
            </div>
            <div className="mb-3">
              <label htmlFor="produto-descricao" className="form-label">Descrição</label>
              <textarea
                id="produto-descricao"
                className="form-control new-product-description"
                value={descricao}
                onChange={(evento) => setDescricao(evento.target.value)}
                placeholder="Descreva os materiais, processo de produção e características do produto"
              />
            </div>
            <div className="new-product-fields">
              <div>
                <label htmlFor="produto-preco" className="form-label">Preço</label>
                <div className="new-product-money">
                  <span>R$</span>
                  <input
                    id="produto-preco"
                    type="text"
                    inputMode="decimal"
                    value={preco}
                    onChange={(evento) => setPreco(evento.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="produto-estoque" className="form-label">Estoque</label>
                <input
                  id="produto-estoque"
                  type="number"
                  className="form-control"
                  min="0"
                  step="1"
                  value={estoque}
                  onChange={(evento) => setEstoque(evento.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor="produto-categoria" className="form-label">Categoria</label>
              <select
                id="produto-categoria"
                className="form-select"
                value={categoriaId}
                onChange={(evento) => setCategoriaId(evento.target.value)}
                disabled={carregandoCategorias}
              >
                <option value="">
                  {carregandoCategorias ? "Carregando categorias..." : "Selecione uma categoria"}
                </option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
              {!carregandoCategorias && categorias.length === 0 && (
                <small className="text-danger">Nenhuma categoria ativa está disponível.</small>
              )}
            </div>
          </div>
          <div className="new-product-card">
            <div className="new-product-card-title">
              <h2>Imagens</h2>
              <p>Envie até 8 imagens em JPG, PNG ou WEBP, com no máximo 5 MB cada.</p>
            </div>
            <label htmlFor="produto-imagens" className="new-product-upload">
              <FiUploadCloud />
              <strong>Selecionar imagens</strong>
              <span>Clique para procurar os arquivos</span>
            </label>
            <input
              id="produto-imagens"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="new-product-file-input"
              onChange={selecionarImagens}
            />
            <div className="new-product-image-count">
              <span>{imagens.length} de {MAXIMO_IMAGENS} imagens</span>
              {imagens.length > 0 && <span>A primeira imagem será a principal</span>}
            </div>
            {imagens.length === 0 ? (
              <div className="new-product-empty-images">
                <FiImage />
                <span>Nenhuma imagem selecionada</span>
              </div>
            ) : (
              <div className="new-product-previews">
                {imagens.map((imagem, indice) => (
                  <div className="new-product-preview" key={`${imagem.arquivo.name}-${imagem.arquivo.lastModified}`}>
                    <img src={imagem.url} alt={`Prévia ${indice + 1}`} />
                    {indice === 0 && <span className="new-product-main-image">Principal</span>}
                    <button type="button" onClick={() => removerImagem(indice)} aria-label="Remover imagem">
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="new-product-actions">
          <NavLink to="/artesao/produtos" className="new-product-cancel">Cancelar</NavLink>
          <button
            type="submit"
            className="new-product-submit"
            disabled={enviando || carregandoCategorias || categorias.length === 0}
          >
            <FiSave />
            <span>{enviando ? "Cadastrando..." : "Cadastrar produto"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}