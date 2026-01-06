import { NextResponse } from 'next/server';
import { isTestingMode } from '@/lib/testing/dry-run-mode';

export async function GET() {
	return NextResponse.json({
		mode: isTestingMode() ? 'testing' : 'live',
	});
}

