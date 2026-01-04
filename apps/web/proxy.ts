import { routing } from "@i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware(routing);

// 🔓 PROXY SIMPLIFICADO - Sin verificaciones de auth
export default async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;

	// Permitir acceso directo a /app sin ninguna verificación
	if (pathname.startsWith("/app")) {
		return NextResponse.next();
	}

	// Para otras rutas, usar middleware de internacionalización
	return intlMiddleware(req);
}

export const config = {
	matcher: [
		"/((?!api|image-proxy|images|fonts|_next/static|_next/image|favicon.ico|icon.png|sitemap.xml|robots.txt).*)",
	],
};
