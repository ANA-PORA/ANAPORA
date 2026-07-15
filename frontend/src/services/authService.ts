import { api } from "./api";

export async function me() {
    const response = await api.get("/auth/me");
    return response.data;
}

export async function login(
  email: string,
  senha: string
) {
  const dados = new URLSearchParams();

  dados.append("username", email);
  dados.append("password", senha);

  const response = await api.post(
    "/auth/login",
    dados,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return response.data;
}