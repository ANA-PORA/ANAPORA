import { useState } from "react";
import Logo from "../assets/Logo_ANAPORA.png";
import { Link, useNavigate } from "react-router-dom";
import fotoMulher from "../assets/FotoMulher.jpeg";
import { api } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        senha,
      });

      localStorage.setItem("token", response.data.access_token);

      navigate("/");
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
          "Erro ao fazer login"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      
      <div className="left-side">
        <img src={fotoMulher} alt="banner" />
      </div>

      <div className="right-side">

        <nav>
          <a href="#">Página Inicial</a>
          <a href="#">Fale Conosco</a>
          <a href="#">Sobre Nós</a>
        </nav>

        <div className="card">

          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={Logo}
              alt="Logo"
              style={{ width: "120px", height: "auto", objectFit: "contain" }}
            />
          </div>

          <h1>Iniciar Sessão</h1>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button onClick={login} disabled={loading}>
            {loading ? "Entrando..." : "Login"}
          </button>

          <p>
            Não tem conta?{" "}
            <Link to="/cadastro">
              Cadastre-se
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}