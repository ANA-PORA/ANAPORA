import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { FiEdit2, FiPackage, FiPlus, FiTrash2 } from "react-icons/fi";
import { listarMeusProdutos, removerProduto } from "../../services/produtoService";
import { useCategorias } from "../../hooks/useCategorias";
import type { Produto } from "../../types/produto";
import "../../styles/MeusProdutos.css";

export default function MeusProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [removendoId, setRemovendoId] = useState<number | null>(null);
  const { categorias } = useCategorias();

  const categoriasPorId = useMemo(() => {
    return new Map(categorias.map((categoria) => [categoria.id, categoria.nome]));
  }, [categorias]);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        setErro("");
        const dados = await listarMeusProdutos();
        setProdutos(dados);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErro(error.response?.data?.detail ?? "Não foi possível carregar seus produtos.");
        } else {
          setErro("Ocorreu um erro inesperado.");
        }
      } finally {
        setCarregando(false);
      }
    }
    carregarProdutos();
  }, []);

  async function excluirProduto(produto: Produto) {
    const confirmou = window.confirm(`Deseja remover o produto "${produto.nome}"?`);
    if (!confirmou) return;
    try {
      setRemovendoId(produto.id);
      await removerProduto(produto.id);
      setProdutos((produtosAtuais) =>
        produtosAtuais.filter((item) => item.id !== produto.id)
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.detail ?? "Não foi possível remover o produto.");
      } else {
        alert("Ocorreu um erro inesperado.");
      }
    } finally {
      setRemovendoId(null);
    }
  }

  function formatarPreco(preco: number | string) {
    return Number(preco).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function obterImagemPrincipal(produto: Produto) {
    const imagensOrdenadas = [...produto.imagens].sort((a, b) => a.ordem - b.ordem);
    return imagensOrdenadas[0]?.url ?? null;
  }

  if (carregando) {
    return (
      <div className="artisan-page-feedback">
        <div className="spinner-border text-success" role="status" />
        <span>Carregando produtos...</span>
      </div>
    );
  }

  return (
    <section className="artisan-products-page">
      <header className="artisan-page-header">
        <div>
          <span className="artisan-page-eyebrow">Catálogo</span>
          <h1>Meus produtos</h1>
          <p>Gerencie os produtos cadastrados na sua loja.</p>
        </div>
        <NavLink to="/artesao/produtos/novo" className="artisan-add-product">
          <FiPlus />
          <span>Adicionar produto</span>
        </NavLink>
      </header>
      {erro && <div className="alert alert-danger">{erro}</div>}
      {!erro && produtos.length === 0 ? (
        <div className="artisan-empty-products">
          <div className="artisan-empty-icon">
            <FiPackage />
          </div>
          <h2>Nenhum produto cadastrado</h2>
          <p>Cadastre seu primeiro produto para começar a exibi-lo no marketplace.</p>
          <NavLink to="/artesao/produtos/novo" className="artisan-add-product">
            <FiPlus />
            <span>Cadastrar produto</span>
          </NavLink>
        </div>
      ) : (
        <div className="artisan-products-card">
          <div className="artisan-products-summary">
            <strong>{produtos.length}</strong>
            <span>{produtos.length === 1 ? "produto cadastrado" : "produtos cadastrados"}</span>
          </div>
          <div className="artisan-products-table-wrapper">
            <table className="artisan-products-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => {
                  const imagemPrincipal = obterImagemPrincipal(produto);
                  return (
                    <tr key={produto.id}>
                      <td>
                        <div className="artisan-product-identification">
                          {imagemPrincipal ? (
                            <img src={imagemPrincipal} alt={produto.nome} />
                          ) : (
                            <div className="artisan-product-no-image">
                              <FiPackage />
                            </div>
                          )}
                          <div>
                            <strong>{produto.nome}</strong>
                            <span>#{produto.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{categoriasPorId.get(produto.categoria_id) ?? "Categoria indisponível"}</td>
                      <td className="artisan-product-price">{formatarPreco(produto.preco)}</td>
                      <td>
                        <span className={produto.estoque === 0 ? "stock-out" : "stock-available"}>
                          {produto.estoque}
                        </span>
                      </td>
                      <td>
                        <span className={`artisan-status ${produto.ativo ? "artisan-status-active" : "artisan-status-inactive"}`}>
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td>
                        <div className="artisan-product-actions">
                          <NavLink
                            to={`/artesao/produtos/${produto.id}/editar`}
                            className="artisan-action-button artisan-edit-button"
                            aria-label={`Editar ${produto.nome}`}
                            title="Editar produto"
                          >
                            <FiEdit2 />
                          </NavLink>
                          <button
                            type="button"
                            className="artisan-action-button artisan-delete-button"
                            onClick={() => excluirProduto(produto)}
                            disabled={removendoId === produto.id}
                            aria-label={`Remover ${produto.nome}`}
                            title="Remover produto"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}