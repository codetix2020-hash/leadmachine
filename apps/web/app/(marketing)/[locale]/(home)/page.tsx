import { redirect } from "next/navigation";

// 🚀 Redirect automático a LEADMACHINE
export default async function Home({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	// Redirect directo a página de prueba primero para verificar que funciona
	redirect("/test");
}
