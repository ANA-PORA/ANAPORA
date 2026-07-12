import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";

import ArtesaoLayout from "./layouts/ArtesaoLayout";
// import DashboardArtesao from "./pages/artesao/DashboardArtesao";
import MeusProdutos from "./pages/artesao/MeusProdutos";
import NovoProduto from "./pages/artesao/NovoProduto";
// import PedidosArtesao from "./pages/artesao/PedidosArtesao";
// import RelatorioVendas from "./pages/artesao/RelatorioVendas";
// import PerfilArtesao from "./pages/artesao/PerfilArtesao";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Páginas públicas com navbar/footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          {/* Futuras páginas públicas */}
          {/*
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/contato" element={<Contato />} />
          */}
        </Route>

        {/* Área do artesão */}
        <Route path="/artesao" element={<ArtesaoLayout />}>
          {/* <Route index element={<DashboardArtesao />} /> */}
          <Route path="produtos" element={<MeusProdutos />} />
          <Route path="produtos/novo" element={<NovoProduto />} />

          {/*
          <Route
            path="produtos/:produtoId/editar"
            element={<EditarProduto />}
          />
          */}

          {/* <Route path="pedidos" element={<PedidosArtesao />} />
          <Route path="relatorios" element={<RelatorioVendas />} />
          <Route path="perfil" element={<PerfilArtesao />} /> */}
        </Route>

        {/* Autenticação sem MainLayout */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}