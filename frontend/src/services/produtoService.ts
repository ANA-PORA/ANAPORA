import { api } from "./api";
import type {
  CriarProdutoDados,
  EditarProdutoDados,
  Produto
} from "../types/produto";

export async function listarMeusProdutos(): Promise<Produto[]> {
  const response = await api.get<Produto[]>("/produtos/meus");
  return response.data;
}

export async function listarProdutos(): Promise<Produto[]> {
  const response = await api.get<Produto[]>("/produtos");
  return response.data;
}

export async function listarProdutosDestaque(): Promise<Produto[]> {
  const response = await api.get<Produto[]>("/produtos/destaques");
  return response.data;
}

export async function buscarProdutoPorId(
  produtoId: number
): Promise<Produto> {
  const response = await api.get<Produto>(
    `/produtos/${produtoId}`
  );
  return response.data;
}

export async function listarProdutosPorCategoria(
  categoriaId: number
): Promise<Produto[]> {
  const response = await api.get<Produto[]>(
    `/produtos/categoria/${categoriaId}`
  );
  return response.data;
}

export async function pesquisarProdutos(
  texto: string
): Promise<Produto[]> {
  const response = await api.get<Produto[]>(
    "/produtos/pesquisar",
    {
      params: {
        texto
      }
    }
  );
  return response.data;
}

export async function criarProduto(
  dados: CriarProdutoDados
): Promise<Produto> {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("descricao", dados.descricao);
  formData.append("preco", dados.preco.toString());
  formData.append("estoque", dados.estoque.toString());
  formData.append(
    "categoria_id",
    dados.categoriaId.toString()
  );
  formData.append("destaque", "false");
  formData.append("ativo", "true");

  dados.imagens.forEach((imagem) => {
    formData.append("imagens", imagem);
  });

  const response = await api.post<Produto>(
    "/produtos",
    formData
  );

  return response.data;
}

export async function atualizarProduto(
  produtoId: number,
  dados: EditarProdutoDados
): Promise<Produto> {
  const formData = new FormData();

  formData.append("nome", dados.nome);
  formData.append("descricao", dados.descricao);
  formData.append("preco", dados.preco.toString());
  formData.append("estoque", dados.estoque.toString());
  formData.append(
    "categoria_id",
    dados.categoriaId.toString()
  );
  formData.append("destaque", dados.destaque.toString());
  formData.append("ativo", dados.ativo.toString());

  const response = await api.put<Produto>(
    `/produtos/${produtoId}`,
    formData
  );

  return response.data;
}

export async function removerProduto(
  produtoId: number
): Promise<void> {
  await api.delete(`/produtos/${produtoId}`);
}