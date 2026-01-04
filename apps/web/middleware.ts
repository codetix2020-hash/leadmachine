import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🔓 MIDDLEWARE: Deshabilitar todas las verificaciones de auth
export function middleware(request: NextRequest) {
	// Permitir acceso directo a todas las rutas /app/*
	// Sin redirecciones a /auth/login
	if (request.nextUrl.pathname.startsWith('/app')) {
		return NextResponse.next();
	}

	// Para otras rutas, comportamiento normal
	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};

