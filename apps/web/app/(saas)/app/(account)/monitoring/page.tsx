'use client';

import { useState, useEffect } from 'react';
import { Card } from '@ui/components/card';
import { Button } from '@ui/components/button';
import { PageHeader } from '@saas/shared/components/PageHeader';

export default function MonitoringPage() {
	const [testing, setTesting] = useState(false);
	const [webhookConfigured, setWebhookConfigured] = useState(true); // Default true since webhook is hardcoded

	useEffect(() => {
		setWebhookConfigured(true);
	}, []);

	async function testSlack() {
		setTesting(true);
		try {
			const res = await fetch('/api/notifications/test-slack');
			const data = await res.json();
			if (data.success) {
				alert('✅ Notificación enviada a Slack. Revisa tu canal.');
			} else {
				alert('❌ Error enviando notificación');
			}
		} catch (error) {
			alert('❌ Error enviando notificación');
		} finally {
			setTesting(false);
		}
	}

	return (
		<div className="space-y-8">
			<PageHeader
				title="📡 Monitoring & Notifications"
				subtitle="Supervisa LEADMACHINE desde Slack sin entrar al dashboard"
			/>

			<Card className="p-6">
				<h2 className="text-xl font-bold mb-4">Slack Notifications</h2>
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<strong>Webhook configurado:</strong>
						<span className={webhookConfigured ? 'text-green-600' : 'text-red-600'}>
							{webhookConfigured ? '✅ Sí' : '❌ No'}
						</span>
					</div>

					{!webhookConfigured && (
						<div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
							<p className="text-sm">
								Agrega SLACK_WEBHOOK_URL al archivo .env para activar notificaciones.
							</p>
						</div>
					)}

					<Button onClick={testSlack} disabled={testing || !webhookConfigured}>
						{testing ? 'Enviando...' : 'Test Notification'}
					</Button>
				</div>
			</Card>

			<Card className="p-6">
				<h2 className="text-xl font-bold mb-4">🔔 Tipos de Notificaciones</h2>
				<ul className="space-y-2 text-sm">
					<li className="flex items-start gap-2">
						<span>🔥</span>
						<span><strong>Lead hot:</strong> Score &gt; 85%</span>
					</li>
					<li className="flex items-start gap-2">
						<span>📧</span>
						<span><strong>Lead respondió:</strong> Respuesta recibida</span>
					</li>
					<li className="flex items-start gap-2">
						<span>📅</span>
						<span><strong>Call agendado:</strong> Lead agendó llamada</span>
					</li>
					<li className="flex items-start gap-2">
						<span>💰</span>
						<span><strong>Deal cerrado:</strong> Venta confirmada</span>
					</li>
					<li className="flex items-start gap-2">
						<span>❌</span>
						<span><strong>Errores:</strong> Problemas del sistema</span>
					</li>
					<li className="flex items-start gap-2">
						<span>📊</span>
						<span><strong>Daily digest:</strong> Resumen diario (9am)</span>
					</li>
				</ul>
			</Card>
		</div>
	);
}

