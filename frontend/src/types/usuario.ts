export interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: string;
    foto_url?: string | null;
}