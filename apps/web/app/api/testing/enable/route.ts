import { NextResponse } from 'next/server';
import { enableTestingMode } from '@/lib/testing/dry-run-mode';

export async function POST() {
	try {
		enableTestingMode();
		return NextResponse.json({ success: true, mode: 'testing' });
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

