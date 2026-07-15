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

  peso_kg: number | string | null;
  altura_cm: number | string | null;
  largura_cm: number | string | null;
  comprimento_cm: number | string | null;

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

  pesoKg?: number;
  alturaCm?: number;
  larguraCm?: number;
  comprimentoCm?: number;

  categoriaId: number;
  imagens: File[];
}

export interface EditarProdutoDados {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;

  pesoKg?: number;
  alturaCm?: number;
  larguraCm?: number;
  comprimentoCm?: number;

  categoriaId: number;
  destaque: boolean;
  ativo: boolean;
}