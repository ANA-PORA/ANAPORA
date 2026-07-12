import { useEffect, useState } from "react";
import axios from "axios";
import { FiArrowRight, FiPackage } from "react-icons/fi";
import { NavLink } from "react-router-dom";
import { listarProdutos, listarProdutosDestaque } from "../services/produtoService";
import type { Produto } from "../types/produto";
import "../styles/Home.css";

export default function Home() {
  const [destaques, setDestaques] = useState<Produto[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarHome() {
      try {
        setErro("");
        const [dadosDestaques, dadosProdutos] = await Promise.all([
          listarProdutosDestaque(),
          listarProdutos()
        ]);
        setDestaques(dadosDestaques);
        setProdutos(dadosProdutos);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setErro(error.response?.data?.detail ?? "Não foi possível carregar os produtos.");
        } else {
          setErro("Ocorreu um erro inesperado.");
        }
      } finally {
        setCarregando(false);
      }
    }
    carregarHome();
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container home-hero-content">
          <h1>Apoiando artesãos nortistas</h1>
          <p>Peças feitas à mão que unem natureza, cultura e identidade.</p>
          <NavLink to="/produtos" className="home-hero-button">
            Conhecer produtos
            <FiArrowRight />
          </NavLink>
        </div>
      </section>
      <section className="home-benefits">
        <div className="container home-benefits-grid">
          <article>
            <strong>Produção artesanal</strong>
            <span>Peças únicas feitas por artesãos</span>
          </article>
          <article>
            <strong>Materiais naturais</strong>
            <span>Natureza transformada com respeito</span>
          </article>
          <article>
            <strong>Entrega para todo o Brasil</strong>
            <span>Receba sua biojoia onde estiver</span>
          </article>
        </div>
      </section>
      <main className="container home-main">
        {erro && <div className="alert alert-danger">{erro}</div>}
        <ProductSection
          titulo="Destaques"
          descricao="Peças selecionadas para você"
          produtos={destaques}
          carregando={carregando}
        />
        <section className="home-institutional-banner">
         
        </section>
        <ProductSection
          titulo="Produtos"
          descricao="Conheça as peças disponíveis no marketplace"
          produtos={produtos}
          carregando={carregando}
        />
      </main>
    </div>
  );
}

interface ProductSectionProps {
  titulo: string;
  descricao: string;
  produtos: Produto[];
  carregando: boolean;
}

function ProductSection({ titulo, descricao, produtos, carregando }: ProductSectionProps) {
  return (
    <section className="home-product-section">
      <header className="home-section-header">
        <div>
          <h2>{titulo}</h2>
          <p>{descricao}</p>
        </div>
        <NavLink to="/produtos">
          Ver todos
          <FiArrowRight />
        </NavLink>
      </header>
      {carregando ? (
        <div className="home-products-loading">
          <div className="spinner-border text-success" role="status" />
        </div>
      ) : produtos.length === 0 ? (
        <div className="home-products-empty">
          <FiPackage />
          <strong>Nenhum produto disponível</strong>
          <span>Os produtos cadastrados pelos artesãos aparecerão aqui.</span>
        </div>
      ) : (
        <div className="home-products-grid">
          {produtos.slice(0, 8).map((produto) => (
            <NavLink
              key={produto.id}
              to={`/produtos/${produto.id}`}
              className="home-product-card"
            >
              <div className="home-product-image">
                {produto.imagens[0]?.url ? (
                  <img src={produto.imagens[0].url} alt={produto.nome} />
                ) : (
                  <FiPackage />
                )}
                {produto.destaque && <span>Destaque</span>}
              </div>
              <div className="home-product-info">
                <h3>{produto.nome}</h3>
                <strong>
                  {Number(produto.preco).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                  })}
                </strong>
              </div>
            </NavLink>
          ))}
        </div>
      )}
    </section>
  );
}