'use client';

import { useState, useEffect } from 'react';
import { Card } from '@ui/components/card';
import { Button } from '@ui/components/button';
import { PageHeader } from '@saas/shared/components/PageHeader';

export default function PersistencePage() {
	const [stats, setStats] = useState<any>(null);
	const [running, setRunning] = useState(false);

	useEffect(() => {
		fetchStats();
	}, []);

	async function fetchStats() {
		// TODO: API para stats de persistencia
		// Por ahora placeholder
		setStats({
			activeSequences: 0,
			actionsToday: 0,
			responses: 0,
			callsScheduled: 0,
		});
	}

	async function runCronManually() {
		setRunning(true);
		try {
			const res = await fetch('/api/cron/master');
			const data = await res.json();
			alert('Cron ejecutado: ' + JSON.stringify(data.results, null, 2));
		} catch (error) {
			console.error('Error running cron:', error);
			alert('Error ejecutando cron');
		} finally {
			setRunning(false);
		}
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				<PageHeader
					title="⚡ Persistence Engine"
					subtitle="Sistema de seguimiento automático multi-canal que NO PARA hasta cerrar"
				/>
				<Button onClick={runCronManually} disabled={running} size="lg">
					{running ? '🔄 Ejecutando...' : '🔄 Run Cron Now'}
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Active Sequences</div>
					<div className="text-4xl font-bold">{stats?.activeSequences || 0}</div>
				</Card>

				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Actions Today</div>
					<div className="text-4xl font-bold">{stats?.actionsToday || 0}</div>
				</Card>

				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Responses</div>
					<div className="text-4xl font-bold text-green-600">{stats?.responses || 0}</div>
				</Card>

				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Calls Scheduled</div>
					<div className="text-4xl font-bold text-orange-600">{stats?.callsScheduled || 0}</div>
				</Card>
			</div>

			<Card className="p-6">
				<h2 className="text-xl font-bold mb-4">📅 Secuencia de Persistencia (90 Días)</h2>
				<div className="space-y-4 text-sm">
					<div>
						<div className="font-bold mb-2 text-blue-600">FASE 1: SOFT TOUCH (Días 1-14)</div>
						<div className="ml-4 space-y-1 text-gray-700">
							<div>✅ Día 1: Email inicial personalizado</div>
							<div>✅ Día 3: LinkedIn connection</div>
							<div>✅ Día 5: Email caso de estudio</div>
							<div>✅ Día 7: LinkedIn message</div>
							<div>✅ Día 10: WhatsApp</div>
							<div>✅ Día 14: Email oferta especial</div>
						</div>
					</div>

					<div>
						<div className="font-bold mb-2 text-yellow-600">FASE 2: MEDIUM PRESSURE (Días 15-30)</div>
						<div className="ml-4 space-y-1 text-gray-700">
							<div>⚡ Día 17: Email estadística impactante</div>
							<div>⚡ Día 21: Instagram DM</div>
							<div>⚡ Día 25: Email descuento temporal</div>
							<div>⚡ Día 30: Video personalizado</div>
						</div>
					</div>

					<div>
						<div className="font-bold mb-2 text-orange-600">FASE 3: HIGH PRESSURE (Días 31-60)</div>
						<div className="ml-4 space-y-1 text-gray-700">
							<div>🔥 Día 31: Email urgente (competidor)</div>
							<div>🔥 Día 42: Email pérdida estimada</div>
							<div>🔥 Día 45: Llamada telefónica</div>
							<div>🔥 Día 50: Breakup email</div>
						</div>
					</div>

					<div>
						<div className="font-bold mb-2 text-red-600">FASE 4: NUCLEAR (Días 61-90)</div>
						<div className="ml-4 space-y-1 text-gray-700">
							<div>☢️ Día 61: Contactar CEO/Owner</div>
							<div>☢️ Día 65: Correo físico</div>
							<div>☢️ Día 80: Oferta irresistible</div>
							<div>☢️ Día 85: Llamada final</div>
							<div>☢️ Día 90: Pausa 6 meses</div>
						</div>
					</div>
				</div>
			</Card>

			<Card className="p-6">
				<h2 className="text-xl font-bold mb-4">🤖 Auto-Discovery Masivo 24/7</h2>
				<div className="space-y-2 text-sm text-gray-700">
					<div>✅ Búsqueda automática en 50+ ciudades España</div>
					<div>✅ 16 tipos de negocio para ReservasPro</div>
					<div>✅ Auto-enrichment de nuevos leads</div>
					<div>✅ Auto-outreach a leads calificados (score >70)</div>
					<div>✅ Ejecución cada 6 horas (mass discovery)</div>
					<div>✅ Ejecución cada 2 horas (enrichment)</div>
					<div>✅ Ejecución cada 4 horas (outreach)</div>
				</div>
			</Card>
		</div>
	);
}



