import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiSearch,
  FiShoppingCart,
  FiUser
} from "react-icons/fi";

import Logo from "../assets/logo-branca.png";
import { useAuth } from "../hooks/useAuth";

import "../styles/Header.css";

export default function Header() {
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [busca, setBusca] = useState("");

  function pesquisar() {
    const termo = busca.trim();

    if (!termo) {
      return;
    }

<<<<<<< Updated upstream
    function sair() {

        logout();

        navigate("/login");

    }

    return (

        <header className="header">

            <div className="container">

                <div className="header-content">

                    <NavLink
                        to="/"
                        className="header-logo"
                    >

                        <img
                            src={Logo}
                            alt="Añaporã"
                        />

                    </NavLink>

                    <div className="header-search">

                        <input
                            type="text"
                            placeholder="Buscar Brinco de Arara..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            onKeyDown={(e) => {

                                if (e.key === "Enter") {

                                    pesquisar();

                                }

                            }}
                        />

                        <button
                            type="button"
                            onClick={pesquisar}
                        >

                            <FiSearch />

                        </button>

                    </div>

                    <div className="header-actions">

                        {usuario ? (

                            <>
                                <NavLink
                                to="/artesao/perfil"
                                className={({ isActive }) =>
                                    `header-action ${isActive ? "active" : ""}`
                                }
                                >
                                <FiUser />

                                <span>
                                    Olá, {usuario.nome.split(" ")[0]}
                                </span>
                                </NavLink>
                            </>

                        ) : (

                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `header-action ${isActive ? "active" : ""}`
                                }
                            >

                                <FiUser />
                                <span>Entrar</span>
                            </NavLink>

                        )}

                        <NavLink
                            to="/carrinho"
                            className={({ isActive }) =>
                                `header-action cart ${isActive ? "active" : ""}`
                            }
                        >

                            <FiShoppingCart />

                            <span>Carrinho</span>

                        </NavLink>
                            <button
                                    className="header-action logout-btn"
                                    onClick={sair}
                                >

                                    <FiLogOut />

                                    <span>Sair</span>

                                </button>
                    </div>

                </div>

            </div>

        </header>

=======
    navigate(
      `/produtos?busca=${encodeURIComponent(termo)}`
>>>>>>> Stashed changes
    );
  }

  function sair() {
    logout();
    navigate("/login");
  }

  const primeiroNome =
    usuario?.nome?.trim().split(/\s+/)[0] || "Usuário";

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <NavLink
            to="/"
            className="header-logo"
          >
            <img
              src={Logo}
              alt="Añaporã"
            />
          </NavLink>

          <div className="header-search">
            <input
              type="text"
              placeholder="Buscar Brinco de Arara..."
              value={busca}
              onChange={(evento) =>
                setBusca(evento.target.value)
              }
              onKeyDown={(evento) => {
                if (evento.key === "Enter") {
                  pesquisar();
                }
              }}
            />

            <button
              type="button"
              onClick={pesquisar}
              aria-label="Pesquisar produtos"
            >
              <FiSearch />
            </button>
          </div>

          <div className="header-actions">
            {usuario ? (
              <>
                <NavLink
                  to="/artesao/perfil"
                  className="header-action"
                >
                  <FiUser />

                  <span>
                    Olá, {primeiroNome}
                  </span>
                </NavLink>

                <button
                  type="button"
                  className="header-action logout-btn"
                  onClick={sair}
                >
                  <FiLogOut />
                  <span>Sair</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `header-action ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <FiUser />
                <span>Entrar</span>
              </NavLink>
            )}

            <NavLink
              to="/carrinho"
              className={({ isActive }) =>
                `header-action cart ${
                  isActive ? "active" : ""
                }`
              }
            >
              <FiShoppingCart />
              <span>Carrinho</span>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}