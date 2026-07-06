import { useState } from "react";
import { Link } from "react-router-dom";
import fotoMulher from "../assets/FotoMulher.jpeg";
import { api } from "../services/api";

export default function Cadastro() {

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("cliente");

  async function cadastrar() {
    try {

      const response = await api.post(
        "/auth/registrar",
        {
          nome,
          email,
          senha,
          role
        }
      );

      alert("Cadastro realizado com sucesso!");

      localStorage.setItem(
        "token",
        response.data.access_token
      );

    } catch (error: any) {

      alert(
        error.response?.data?.detail ||
        "Erro ao cadastrar"
      );

    }
  }

  return (
    <div className="container">

      <div className="left-side">
        <img src={fotoMulher} alt="Biojoias" />
      </div>

      <div className="right-side">

        <nav>
          <a href="#">Página inicial</a>
          <a href="#">Fale conosco</a>
          <a href="#">Sobre nós</a>
        </nav>

        <div className="card">

          <div className="logo-text">
            <h2>ANA</h2>
            <span>PORÃ</span>
          </div>

          <h1>Cadastro</h1>

          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) =>
              setNome(e.target.value)
            }
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
          >
            <option value="cliente">
              Cliente
            </option>

            <option value="artesao">
              Artesão
            </option>
          </select>

          <button onClick={cadastrar}>
            Cadastrar
          </button>

          <p>
            Já possui conta?
            {" "}
            <Link to="/">
              Entrar
            </Link>
          </p>

        </div>

      </div>

    </div>
  );
}