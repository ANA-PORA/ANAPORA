import { api } from "./api";

export async function me() {
    const response = await api.get("/auth/me");
    return response.data;
}