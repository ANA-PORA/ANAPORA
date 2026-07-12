import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiLogOut, FiSearch, FiShoppingCart, FiUser } from "react-icons/fi";

import Logo from "../assets/logo-branca.png";

import { useAuth } from "../hooks/useAuth";

import "../styles/Header.css";

export default function Header() {

    const navigate = useNavigate();

    const { usuario, logout } = useAuth();

    const [busca, setBusca] = useState("");

    function pesquisar() {

        if (!busca.trim()) return;

        navigate(`/produtos?busca=${encodeURIComponent(busca)}`);

    }

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
                                    to="/perfil"
                                    className="header-action"
                                >

                                    <FiUser />

                                    <span>

                                        Olá, {usuario.nome.split(" ")[0]}

                                    </span>

                                </NavLink>

                                <button
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

                    </div>

                </div>

            </div>

        </header>

    );

}