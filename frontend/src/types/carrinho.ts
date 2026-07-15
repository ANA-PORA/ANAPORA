export interface CarrinhoProduto {
  id: number;
  nome: string;
  preco: number | string;
  estoque: number;
  ativo: boolean;
  imagem_principal: string | null;
}

export interface CarrinhoArtesao {
  id: number;
  nome: string;
  nome_loja: string | null;
}

export interface CarrinhoItem {
  id: number;
  quantidade: number;
  preco_unitario: number | string;
  subtotal: number | string;

  estoque_disponivel: number;
  disponivel: boolean;
  mensagem_estoque: string | null;

  produto: CarrinhoProduto;
  created_at: string;
}

export interface CarrinhoGrupoArtesao {
  artesao: CarrinhoArtesao;
  quantidade_itens: number;
  subtotal: number | string;
  itens: CarrinhoItem[];
}

export interface Carrinho {
  id: number;
  usuario_id: number;

  quantidade_itens: number;
  quantidade_produtos_diferentes: number;

  subtotal: number | string;
  total: number | string;

  possui_item_indisponivel: boolean;
  mensagens: string[];

  grupos: CarrinhoGrupoArtesao[];

  created_at: string;
  updated_at: string;
}

export interface CarrinhoResumo {
  quantidade_itens: number;
  quantidade_produtos_diferentes: number;
  subtotal: number | string;
  possui_item_indisponivel: boolean;
}

export interface AdicionarItemCarrinhoDados {
  produto_id: number;
  quantidade?: number;
}

export interface AtualizarItemCarrinhoDados {
  quantidade: number;
}

export interface MensagemCarrinho {
  message: string;
}
