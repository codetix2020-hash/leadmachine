import { NextResponse } from 'next/server';
import { disableTestingMode } from '@/lib/testing/dry-run-mode';

export async function POST() {
	try {
		disableTestingMode();
		return NextResponse.json({ success: true, mode: 'live' });
	} catch (error: any) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

