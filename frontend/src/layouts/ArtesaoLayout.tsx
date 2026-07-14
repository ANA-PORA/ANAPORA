import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import ArtesaoSidebar from "../components/artesao/ArtesaoSidebar";
import { useAuth } from "../hooks/useAuth";
import "../styles/ArtesaoLayout.css";

export default function ArtesaoLayout() {
    const navigate = useNavigate();
    const { usuario, loading, logout } = useAuth();
    const [menuAberto, setMenuAberto] = useState(false);

    function sair() {
        logout();
        navigate("/login");
    }

    if (loading) {
        return (
            <div className="artesao-auth-check">
                <div className="spinner-border text-success" role="status" aria-label="Verificando autenticação" />
            </div>
        );
    }

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    if (usuario.role !== "artesao") {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="artesao-layout">
            <ArtesaoSidebar usuario={usuario} aberto={menuAberto} aoFechar={() => setMenuAberto(false)} aoSair={sair} />
            <div className="artesao-main">
                <header className="artesao-mobile-header">
                    <button type="button" onClick={() => setMenuAberto(true)} aria-label="Abrir menu">
                        <FiMenu />
                    </button>
                    <span>Painel do Artesão</span>
                </header>
                <main className="artesao-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}