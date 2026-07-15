import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ArtesaoLayout from "./layouts/ArtesaoLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

import MeusProdutos from "./pages/artesao/MeusProdutos";
import NovoProduto from "./pages/artesao/NovoProduto";
import EditarProduto from "./pages/artesao/EditarProduto";
import PerfilArtesao from "./pages/artesao/PerfilArtesao";

import ProdutoDetalhe from "./pages/ProdutoDetalhe";

import Carrinho from "./pages/Carrinho";

// import DashboardArtesao from "./pages/artesao/DashboardArtesao";
// import PedidosArtesao from "./pages/artesao/PedidosArtesao";
// import RelatorioVendas from "./pages/artesao/RelatorioVendas";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/carrinho" element={<Carrinho />} />
          <Route
          path="/produtos/:produtoId"
          element={<ProdutoDetalhe />}
          />

          {/* Futuras páginas públicas */}
          {/*
          <Route
            path="/produtos"
            element={<Produtos />}
          />

          <Route
            path="/quem-somos"
            element={<QuemSomos />}
          />

          <Route
            path="/contato"
            element={<Contato />}
          />
          */}

        </Route>

        <Route
          path="/artesao"
          element={<ArtesaoLayout />}
        >
          <Route
            index
            element={<Navigate to="produtos" replace />}
          />

          <Route
            path="produtos"
            element={<MeusProdutos />}
          />

          <Route
            path="produtos/novo"
            element={<NovoProduto />}
          />

          <Route
            path="produtos/:produtoId/editar"
            element={<EditarProduto />}
          />

          <Route
            path="perfil"
            element={<PerfilArtesao />}
          />
        </Route>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}