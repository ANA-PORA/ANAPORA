import { useEffect, useState } from "react";

import { me } from "../services/authService";
import type { Usuario } from "../types/usuario";

function usuarioValido(
  dados: unknown
): dados is Usuario {
  if (
    !dados ||
    typeof dados !== "object"
  ) {
    return false;
  }

  const usuario = dados as Partial<Usuario>;

  return (
    typeof usuario.id === "number" &&
    typeof usuario.nome === "string" &&
    typeof usuario.email === "string" &&
    typeof usuario.role === "string"
  );
}

export function useAuth() {
  const [usuario, setUsuario] =
    useState<Usuario | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let componenteAtivo = true;

    async function carregarUsuario() {
      const token =
        localStorage.getItem("token");

      if (!token) {
        if (componenteAtivo) {
          setUsuario(null);
          setLoading(false);
        }

        return;
      }

      try {
        const dados: unknown = await me();

        if (!componenteAtivo) {
          return;
        }

        if (usuarioValido(dados)) {
          setUsuario(dados);
        } else {
          localStorage.removeItem("token");
          setUsuario(null);

          console.error(
            "A API retornou dados de usuário inválidos:",
            dados
          );
        }
      } catch (erro) {
        localStorage.removeItem("token");

        if (componenteAtivo) {
          setUsuario(null);
        }

        console.error(
          "Erro ao carregar usuário autenticado:",
          erro
        );
      } finally {
        if (componenteAtivo) {
          setLoading(false);
        }
      }
    }

    void carregarUsuario();

    return () => {
      componenteAtivo = false;
    };
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setUsuario(null);
  }

  return {
    usuario,
    loading,
    logout
  };
}