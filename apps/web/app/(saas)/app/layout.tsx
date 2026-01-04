import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 🔓 AUTENTICACIÓN DESHABILITADA - Acceso directo al dashboard
export default async function Layout({ children }: PropsWithChildren) {
	// Sin protección de rutas - acceso libre
	return children;
}
