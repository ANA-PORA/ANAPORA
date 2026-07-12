import { useState } from "react";
import type {ChangeEvent, FormEvent} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";
import { api } from "../services/api";

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState("cliente");

  const handleNome = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setNome(e.target.value);
  };

  const handleEmail = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setEmail(e.target.value);
  };

  const handleSenha = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setSenha(e.target.value);
  };

  const handleRole = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    setRole(e.target.value);
  };

  async function handleCadastro(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (
      !nome.trim() ||
      !email.trim() ||
      !senha.trim()
    ) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      await api.post("/auth/registrar", {
        nome,
        email,
        senha,
        role,
      });

      alert("Cadastro realizado com sucesso!");

      navigate("/login");

    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.detail ??
            "Erro ao cadastrar."
        );
      } else {
        alert("Erro inesperado.");
      }
    }
  }

  return (
    <AuthLayout
      title="Cadastro"
      footer={
        <p className="auth-footer">
          Já possui conta?
          <Link to="/login">Entrar</Link>
        </p>
      }
    >
      <form onSubmit={handleCadastro}>

        <div className="mb-3">
          <label>Nome</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite seu nome"
            value={nome}
            onChange={handleNome}
          />

        </div>

        <div className="mb-3">

          <label>Email</label>

          <input
            type="email"
            className="form-control"
            placeholder="Digite seu email"
            value={email}
            onChange={handleEmail}
          />

        </div>
        <div className="mb-3">
          <label>Senha</label>
          <input
            type="password"
            className="form-control"
            placeholder="Digite sua senha"
            value={senha}
            onChange={handleSenha}
          />

        </div>

        <div className="mb-4">

          <label>Tipo de conta</label>

          <select
            className="form-control"
            value={role}
            onChange={handleRole}
          >
            <option value="cliente">
              Cliente
            </option>

            <option value="artesao">
              Artesão
            </option>

          </select>

        </div>

        <button
          className="btn btn-success w-100"
          type="submit"
        >
          Cadastrar
        </button>

      </form>
    </AuthLayout>
  );
}