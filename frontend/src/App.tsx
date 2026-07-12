import { BrowserRouter, Routes, Route } from "react-router-dom";
// import MainLayout from "./layouts/MainLayout";
// import Home from "./pages/Home";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
// import Produtos from "./pages/Produtos";
// import Contato from "./pages/Contato";
// import QuemSomos from "./pages/QuemSomos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route element={<MainLayout />}> */}
          {/* <Route path="/" element={<Home />} /> */}
          {/* <Route path="/produtos" element={<Produtos />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/contato" element={<Contato />} /> */}
        {/* </Route> */}

        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>
    </BrowserRouter>
  );
}