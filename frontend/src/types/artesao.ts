export interface ArtesaoPerfil {
  id: number;
  usuario_id: number;
  nome: string;
  email: string;
  nome_loja: string | null;
  biografia: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  foto_url: string | null;
  instagram: string | null;
}

export interface AtualizarArtesaoPerfilDados {
  nome?: string;
  nome_loja?: string | null;
  biografia?: string | null;
  telefone?: string | null;
  cidade?: string | null;
  estado?: string | null;
  foto_url?: string | null;
  instagram?: string | null;
}