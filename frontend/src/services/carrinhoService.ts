import { api } from "./api";

import type {
  AdicionarItemCarrinhoDados,
  AtualizarItemCarrinhoDados,
  Carrinho,
  CarrinhoResumo,
  MensagemCarrinho
} from "../types/carrinho";

export async function buscarCarrinho(): Promise<Carrinho> {
  const response = await api.get<Carrinho>("/carrinho");

  return response.data;
}

export async function buscarResumoCarrinho(): Promise<CarrinhoResumo> {
  const response = await api.get<CarrinhoResumo>(
    "/carrinho/resumo"
  );

  return response.data;
}

export async function adicionarItemCarrinho(
  dados: AdicionarItemCarrinhoDados
): Promise<Carrinho> {
  const response = await api.post<Carrinho>(
    "/carrinho/itens",
    {
      produto_id: dados.produto_id,
      quantidade: dados.quantidade ?? 1
    }
  );

  return response.data;
}

export async function atualizarQuantidadeItem(
  itemId: number,
  dados: AtualizarItemCarrinhoDados
): Promise<Carrinho> {
  const response = await api.patch<Carrinho>(
    `/carrinho/itens/${itemId}`,
    dados
  );

  return response.data;
}

export async function removerItemCarrinho(
  itemId: number
): Promise<MensagemCarrinho> {
  const response = await api.delete<MensagemCarrinho>(
    `/carrinho/itens/${itemId}`
  );

  return response.data;
}

export async function esvaziarCarrinho(): Promise<MensagemCarrinho> {
  const response = await api.delete<MensagemCarrinho>(
    "/carrinho"
  );

  return response.data;
}