import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronDown } from "react-icons/fi";
import type { Categoria } from "../types/categoria";
import { listarCategorias } from "../services/categoriaService";
import "../styles/Navbar.css";

export default function Navbar() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    async function carregarCategorias() {
      try {
        const dados = await listarCategorias();
        setCategorias(dados);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }

    carregarCategorias();
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

                {categorias.map((categoria) => (
                  <li key={categoria.id}>
                    <NavLink
                      className="dropdown-item"
                      to={`/categoria/${categoria.slug}`}
                    >
                      {categoria.nome}
                    </NavLink>
                  </li>
                ))}

              </ul>

            </div>

            <span className="navbar-divider"></span>

            <NavLink
              to="/"
              end
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Início
            </NavLink>

            <NavLink
              to="/produtos"
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Produtos
            </NavLink>

            <NavLink
              to="/quem-somos"
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Quem Somos
            </NavLink>

            <NavLink
              to="/contato"
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Fale Conosco
            </NavLink>

          </div>

        </div>
      </div>
    </nav>
  );
}