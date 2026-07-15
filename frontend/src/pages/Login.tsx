import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";
import { login } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const handleEmail = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSenha = (e: ChangeEvent<HTMLInputElement>) => {
    setSenha(e.target.value);
  };

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    try {
      
      const response = await login(email, senha);

    localStorage.setItem(
      "token",
      response.access_token
    );

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(
          error.response?.data?.detail ??
            "Erro ao fazer login."
        );
      } else {
        alert("Erro inesperado.");
      }
    }
  }

  return (
    <AuthLayout
      title="Iniciar Sessão"
      footer={
        <p className="auth-footer">
          Não possui conta?
          <Link to="/cadastro">Cadastre-se</Link>
        </p>
      }
    >
      <form onSubmit={handleLogin}>

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

        <div className="mb-4">

          <label>Senha</label>

          <input
            type="password"
            className="form-control"
            placeholder="Digite sua senha"
            value={senha}
            onChange={handleSenha}
          />
        </div>

        <button
          className="btn btn-success w-100"
          type="submit"
        >
          Entrar
        </button>

      </form>
    </AuthLayout>
  );
}