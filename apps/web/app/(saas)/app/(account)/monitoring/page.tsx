'use client';

import { useState } from 'react';
import { Card } from '@ui/components/card';
import { Button } from '@ui/components/button';
import { PageHeader } from '@saas/shared/components/PageHeader';

export default function MonitoringPage() {
	const [testing, setTesting] = useState(false);

	async function testSlack() {
		setTesting(true);
		try {
			const res = await fetch('/api/notifications/test-slack');
			const data = await res.json();
			if (data.success) {
				alert('✅ Notificación enviada a Slack');
			} else {
				alert('❌ Error enviando notificación');
			}
		} catch (error) {
			alert('❌ Error: ' + (error as Error).message);
		} finally {
			setTesting(false);
		}
	}

	return (
		<div className="space-y-8">
			<PageHeader
				title="📡 Monitoring"
				subtitle="Supervisa LEADMACHINE desde Slack sin entrar al dashboard"
			/>

			<Card className="p-6">
				<h2 className="text-xl font-bold mb-4">Slack Notifications</h2>
				<div className="space-y-4">
					<div>
						<strong>Webhook configurado:</strong>
						<span className="ml-2">
							{process.env.NEXT_PUBLIC_SLACK_WEBHOOK ? '✅ Sí' : '⚠️  Configurar SLACK_WEBHOOK_URL en .env'}
						</span>
					</div>

					<Button onClick={testSlack} disabled={testing}>
						{testing ? 'Enviando...' : 'Test Notification'}
					</Button>
				</div>
			</Card>

			<Card className="p-6">
				<h2 className="text-xl font-bold mb-4">🔔 Tipos de Notificaciones</h2>
				<ul className="space-y-2">
					<li>🔥 Lead hot (score &gt; 85%)</li>
					<li>📧 Lead respondió</li>
					<li>📅 Call agendado</li>
					<li>💰 Deal cerrado</li>
					<li>❌ Errores críticos</li>
					<li>📊 Daily digest (9am)</li>
				</ul>
			</Card>

			<Card className="p-6">
				<h2 className="text-xl font-bold mb-4">📧 Contact Info</h2>
				<div className="space-y-2 text-sm">
					<div>
						<strong>Email owner:</strong> bruno48485@gmail.com
					</div>
					<div>
						<strong>Phone owner:</strong> +34670358277
					</div>
				</div>
			</Card>
		</div>
	);
}

