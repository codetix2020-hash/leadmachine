import { NextResponse } from 'next/server';
import { exportAllData } from '@/lib/backup/exporter';

export async function GET() {
	try {
		const backup = await exportAllData();

		return NextResponse.json(backup);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

