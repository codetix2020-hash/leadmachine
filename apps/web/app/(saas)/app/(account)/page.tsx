// 🔓 Página sin autenticación - Redirige a /app/leads
import { redirect } from "next/navigation";

export default async function AppStartPage() {
	// Sin check de auth - acceso directo
	redirect("/app/leads");
}
