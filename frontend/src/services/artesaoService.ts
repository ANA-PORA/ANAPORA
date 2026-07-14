import { api } from "./api";

import type {
  ArtesaoPerfil,
  AtualizarArtesaoPerfilDados
} from "../types/artesao";

export async function buscarPerfilArtesao(): Promise<ArtesaoPerfil> {
  const response = await api.get<ArtesaoPerfil>(
    "/artesao/perfil"
  );

  return response.data;
}

export async function atualizarPerfilArtesao(
  dados: AtualizarArtesaoPerfilDados
): Promise<ArtesaoPerfil> {
  const response = await api.put<ArtesaoPerfil>(
    "/artesao/perfil",
    dados
  );

  return response.data;
}

export async function uploadFotoPerfil(
  foto: File
): Promise<ArtesaoPerfil> {
  const formData = new FormData();

  formData.append("foto", foto);

  const response = await api.post<ArtesaoPerfil>(
    "/artesao/perfil/foto",
    formData
  );

  return response.data;
}