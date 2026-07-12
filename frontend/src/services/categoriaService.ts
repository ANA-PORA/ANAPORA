import { api } from "./api";
import type { Categoria } from "../types/categoria";

export async function listarCategorias(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>("/categorias");
    return response.data;
}

export async function buscarCategoria(id: number): Promise<Categoria> {
    const response = await api.get<Categoria>(`/categorias/${id}`);
    return response.data;
}