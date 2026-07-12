export interface ProdutoImagem {
  id: number;
  url: string;
  ordem: number;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number | string;
  estoque: number;
  categoria_id: number;
  artesao_id: number;
  destaque: boolean;
  ativo: boolean;
  imagens: ProdutoImagem[];
  created_at: string;
  updated_at: string;
}

export interface CriarProdutoDados {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoriaId: number;
  imagens: File[];
}