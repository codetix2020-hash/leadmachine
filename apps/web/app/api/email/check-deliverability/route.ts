import { NextResponse } from 'next/server';
import { checkDomainDeliverability } from '@/lib/email/deliverability-checker';

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const domain = searchParams.get('domain') || 'codetix.com';

		const result = await checkDomainDeliverability(domain);

		return NextResponse.json(result);
	} catch (error: any) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

