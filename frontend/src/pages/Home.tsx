import { useEffect, useState } from "react";
import axios from "axios";
import {
  FiArrowRight,
  FiPackage
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

import {
  listarProdutos,
  listarProdutosDestaque
} from "../services/produtoService";

import type { Produto } from "../types/produto";

import "../styles/Home.css";

const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://localhost:8000";

function resolverUrlImagem(
  url?: string
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

function normalizarProdutos(
  dados: unknown
): Produto[] {
  return Array.isArray(dados)
    ? (dados as Produto[])
    : [];
}

export default function Home() {
  const [destaques, setDestaques] =
    useState<Produto[]>([]);

  const [produtos, setProdutos] =
    useState<Produto[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarHome() {
      try {
        setErro("");
        setCarregando(true);

        const [
          resultadoDestaques,
          resultadoProdutos
        ] = await Promise.allSettled([
          listarProdutosDestaque(),
          listarProdutos()
        ]);

        if (!componenteAtivo) {
          return;
        }

        if (
          resultadoDestaques.status ===
          "fulfilled"
        ) {
          setDestaques(
            normalizarProdutos(
              resultadoDestaques.value
            )
          );
        } else {
          setDestaques([]);

          console.error(
            "Erro ao carregar destaques:",
            resultadoDestaques.reason
          );
        }

        if (
          resultadoProdutos.status ===
          "fulfilled"
        ) {
          setProdutos(
            normalizarProdutos(
              resultadoProdutos.value
            )
          );
        } else {
          setProdutos([]);

          console.error(
            "Erro ao carregar produtos:",
            resultadoProdutos.reason
          );
        }

        if (
          resultadoDestaques.status ===
            "rejected" &&
          resultadoProdutos.status ===
            "rejected"
        ) {
          const motivo =
            resultadoProdutos.reason;

          if (axios.isAxiosError(motivo)) {
            const detalhe =
              motivo.response?.data?.detail;

            setErro(
              typeof detalhe === "string"
                ? detalhe
                : "Não foi possível carregar os produtos."
            );
          } else {
            setErro(
              "Não foi possível carregar os produtos."
            );
          }
        } else if (
          resultadoDestaques.status ===
          "rejected"
        ) {
          setErro(
            "Os produtos foram carregados, mas não foi possível carregar os destaques."
          );
        }
      } catch (erroInesperado) {
        if (!componenteAtivo) {
          return;
        }

        setDestaques([]);
        setProdutos([]);

        setErro(
          "Ocorreu um erro inesperado ao carregar a página."
        );

        console.error(
          "Erro inesperado na página inicial:",
          erroInesperado
        );
      } finally {
        if (componenteAtivo) {
          setCarregando(false);
        }
      }
    }

    void carregarHome();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container home-hero-content">
          <h1>
            Apoiando artesãos nortistas
          </h1>

          <p>
            Peças feitas à mão que unem
            natureza, cultura e identidade.
          </p>

          <NavLink
            to="/produtos"
            className="home-hero-button"
          >
            Conhecer produtos
            <FiArrowRight />
          </NavLink>
        </div>
      </section>

      <section className="home-benefits">
        <div className="container home-benefits-grid">
          <article>
            <strong>
              Produção artesanal
            </strong>

            <span>
              Peças únicas feitas por artesãos
            </span>
          </article>

          <article>
            <strong>
              Materiais naturais
            </strong>

            <span>
              Natureza transformada com respeito
            </span>
          </article>

          <article>
            <strong>
              Entrega para todo o Brasil
            </strong>

            <span>
              Receba sua biojoia onde estiver
            </span>
          </article>
        </div>
      </section>

      <main className="container home-main">
        {erro && (
          <div
            className="alert alert-warning"
            role="alert"
          >
            {erro}
          </div>
        )}

        <ProductSection
          titulo="Destaques"
          descricao="Peças selecionadas para você"
          produtos={destaques}
          carregando={carregando}
        />

        <section className="home-institutional-banner" />

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

function ProductSection({
  titulo,
  descricao,
  produtos,
  carregando
}: ProductSectionProps) {
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
          <div
            className="spinner-border text-success"
            role="status"
          >
            <span className="visually-hidden">
              Carregando produtos...
            </span>
          </div>
        </div>
      ) : produtos.length === 0 ? (
        <div className="home-products-empty">
          <FiPackage />

          <strong>
            Nenhum produto disponível
          </strong>

          <span>
            Os produtos cadastrados pelos
            artesãos aparecerão aqui.
          </span>
        </div>
      ) : (
        <div className="home-products-grid">
          {produtos
            .slice(0, 8)
            .map((produto) => {
              const imagens =
                Array.isArray(produto.imagens)
                  ? produto.imagens
                  : [];

              const imagemPrincipal =
                [...imagens].sort(
                  (imagemA, imagemB) =>
                    imagemA.ordem -
                    imagemB.ordem
                )[0];

              const urlImagem =
                resolverUrlImagem(
                  imagemPrincipal?.url
                );

              const precoNumerico =
                Number(
                  String(
                    produto.preco ?? 0
                  ).replace(",", ".")
                );

              const precoFormatado =
                Number.isFinite(precoNumerico)
                  ? precoNumerico.toLocaleString(
                      "pt-BR",
                      {
                        style: "currency",
                        currency: "BRL"
                      }
                    )
                  : "R$ 0,00";

              return (
                <NavLink
                  key={produto.id}
                  to={`/produtos/${produto.id}`}
                  className="home-product-card"
                >
                  <div className="home-product-image">
                    {urlImagem ? (
                      <img
                        src={urlImagem}
                        alt={
                          produto.nome ||
                          "Produto"
                        }
                        loading="lazy"
                        onError={(evento) => {
                          evento.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <FiPackage />
                    )}

                    {produto.destaque && (
                      <span>Destaque</span>
                    )}
                  </div>

                  <div className="home-product-info">
                    <h3>
                      {produto.nome ||
                        "Produto sem nome"}
                    </h3>

                    <strong>
                      {precoFormatado}
                    </strong>
                  </div>
                </NavLink>
              );
            })}
        </div>
      )}
    </section>
  );
}