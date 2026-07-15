import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { listarCategorias } from "../services/categoriaService";
import type { Categoria } from "../types/categoria";

import "../styles/Navbar.css";

export default function Navbar() {
  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarCategorias() {
      try {
        const dados = await listarCategorias();

        if (!componenteAtivo) {
          return;
        }

        setCategorias(
          Array.isArray(dados) ? dados : []
        );
      } catch (erro) {
        if (componenteAtivo) {
          setCategorias([]);
        }

        console.error(
          "Erro ao carregar categorias:",
          erro
        );
      }
    }

    void carregarCategorias();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  return (
    <nav className="navbar-custom">
      <div className="container">
        <div className="navbar-content">
          <div className="navbar-left">
            <div className="dropdown">
              <button
                className="category-btn dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Categorias
              </button>

              <ul className="dropdown-menu shadow border-0">
                {categorias.length === 0 ? (
                  <li>
                    <span className="dropdown-item-text">
                      Nenhuma categoria disponível
                    </span>
                  </li>
                ) : (
                  categorias.map((categoria) => (
                    <li key={categoria.id}>
                      <NavLink
                        className="dropdown-item"
                        to={`/categoria/${categoria.slug}`}
                      >
                        {categoria.nome}
                      </NavLink>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <span className="navbar-divider" />

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/produtos"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Produtos
            </NavLink>

            <NavLink
              to="/quem-somos"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Quem Somos
            </NavLink>

            <NavLink
              to="/contato"
              className={({ isActive }) =>
                isActive ? "active" : ""
              }
            >
              Fale Conosco
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}