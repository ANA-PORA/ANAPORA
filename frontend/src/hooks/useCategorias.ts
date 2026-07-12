import { useEffect, useState } from "react";
import { listarCategorias } from "../services/categoriaService";
import type { Categoria } from "../types/categoria";

export function useCategorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregarCategorias() {
            try {
                const data = await listarCategorias();
                setCategorias(data);
            } catch (error) {
                console.error("Erro ao carregar categorias:", error);
            } finally {
                setLoading(false);
            }
        }

        carregarCategorias();
    }, []);

    return {
        categorias,
        loading
    };
}