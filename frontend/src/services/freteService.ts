import { api } from "./api";

import type {
  CalcularFreteRequest,
  CalcularFreteResponse
} from "../types/frete";

export async function calcularFrete(
  dados: CalcularFreteRequest
): Promise<CalcularFreteResponse> {
  const resposta =
    await api.post<CalcularFreteResponse>(
      "/frete/calcular",
      dados
    );

  return resposta.data;
}