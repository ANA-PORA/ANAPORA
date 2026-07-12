import { useEffect, useState } from "react";
import { me } from "../services/authService";
import type { Usuario } from "../types/usuario";

export function useAuth() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregarUsuario() {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await me();
                setUsuario(data);
            } catch {
                localStorage.removeItem("token");
                setUsuario(null);
            } finally {
                setLoading(false);
            }
        }

        carregarUsuario();
    }, []);

    function logout() {
        localStorage.removeItem("token");
        setUsuario(null);
    }

    return {
        usuario,
        loading,
        logout
    };
}