export interface CalcularFreteRequest {
  cep_destino: string;
  item_ids: number[];
}

export interface OpcaoFrete {
  codigo: string;
  nome: string;
  valor: number;
  prazo_dias: number;
}

export interface FreteArtesao {
  artesao_id: number;
  nome_artesao: string;
  nome_loja?: string | null;
  cep_origem: string;
  cep_destino: string;
  opcoes: OpcaoFrete[];
}

export interface CalcularFreteResponse {
  cep_destino: string;
  grupos: FreteArtesao[];
}