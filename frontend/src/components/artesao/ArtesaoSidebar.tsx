import { NavLink } from "react-router-dom";
import { FiBarChart2, FiHome, FiLogOut, FiPackage, FiPlusCircle, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import type { Usuario } from "../../types/usuario";

interface ArtesaoSidebarProps {
  usuario: Usuario;
  aberto: boolean;
  aoFechar: () => void;
  aoSair: () => void;
}

export default function ArtesaoSidebar({ usuario, aberto, aoFechar, aoSair }: ArtesaoSidebarProps) {
  const primeiroNome = usuario.nome.trim().split(" ")[0];
  const inicial = primeiroNome.charAt(0).toUpperCase();

  return (
    <>
      {aberto && <button type="button" className="artesao-overlay" onClick={aoFechar} aria-label="Fechar menu" />}
      <aside className={`artesao-sidebar ${aberto ? "artesao-sidebar-open" : ""}`}>
        <div className="artesao-sidebar-header">
          <button type="button" className="artesao-sidebar-close" onClick={aoFechar} aria-label="Fechar menu">
            <FiX />
          </button>
          
          <strong>Olá, {primeiroNome}</strong>
          <span>Área do artesão</span>
        </div>
        <nav className="artesao-sidebar-nav">
          <NavLink to="/artesao" end onClick={aoFechar}>
            <FiHome />
            <span>Visão geral</span>
          </NavLink>
          <NavLink to="/artesao/produtos" onClick={aoFechar}>
            <FiPackage />
            <span>Meus produtos</span>
          </NavLink>
          <NavLink to="/artesao/produtos/novo" onClick={aoFechar}>
            <FiPlusCircle />
            <span>Adicionar produto</span>
          </NavLink>
          <NavLink to="/artesao/pedidos" onClick={aoFechar}>
            <FiShoppingBag />
            <span>Pedidos</span>
          </NavLink>
          <NavLink to="/artesao/relatorios" onClick={aoFechar}>
            <FiBarChart2 />
            <span>Relatório de vendas</span>
          </NavLink>
          <NavLink to="/artesao/perfil" onClick={aoFechar}>
            <FiUser />
            <span>Meu perfil</span>
          </NavLink>
        </nav>
        <button type="button" className="artesao-logout" onClick={aoSair}>
          <FiLogOut />
          <span>Sair</span>
        </button>
      </aside>
    </>
  );
}