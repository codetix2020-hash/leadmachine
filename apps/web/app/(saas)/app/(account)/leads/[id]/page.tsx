'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@ui/components/button';
import { PageHeader } from '@saas/shared/components/PageHeader';

export default function LeadDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [lead, setLead] = useState<any>(null);
	const [enrichment, setEnrichment] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [enriching, setEnriching] = useState(false);

	useEffect(() => {
		fetchLead();
	}, [params.id]);

	const fetchLead = async () => {
		try {
			const response = await fetch(`/api/leads?id=${params.id}`);
			const result = await response.json();
			if (result.leads && result.leads.length > 0) {
				const leadData = result.leads[0];
				setLead(leadData);

				// Si tiene enrichment data, parsearlo
				if (leadData.enrichmentData) {
					try {
						setEnrichment(JSON.parse(leadData.enrichmentData));
					} catch (e) {
						console.error('Error parsing enrichment data:', e);
					}
				}
			}
		} catch (error) {
			console.error('Error fetching lead:', error);
		} finally {
			setLoading(false);
		}
	};

	const runDeepEnrichment = async () => {
		setEnriching(true);
		try {
			const res = await fetch(`/api/leads/${params.id}/enrich-deep`, {
				method: 'POST',
			});
			const data = await res.json();
			if (data.success) {
				setEnrichment(data.enrichment);
				// Recargar lead para obtener score actualizado
				fetchLead();
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			console.error('Error enriching lead:', error);
			alert('Error al realizar análisis profundo');
		} finally {
			setEnriching(false);
		}
	};

	if (loading) {
		return (
			<div className="p-8">
				<div className="text-center">Cargando...</div>
			</div>
		);
	}

	if (!lead) {
		return (
			<div className="p-8">
				<div className="text-center">Lead no encontrado</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 p-8">
			<div className="flex justify-between items-center">
				<PageHeader
					title={lead.company_name}
					subtitle={lead.location || 'Sin ubicación'}
				/>
				<Button onClick={runDeepEnrichment} disabled={enriching}>
					{enriching ? '🔍 Analizando...' : '🔍 Análisis Profundo'}
				</Button>
			</div>

			{/* Scores Predictivos */}
			{enrichment?.predictiveScores && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="rounded-lg border bg-card p-6">
						<div className="text-sm font-medium text-muted-foreground">
							Probabilidad de Cierre
						</div>
						<div className="mt-2 text-3xl font-bold text-green-600">
							{enrichment.predictiveScores.closeProbability}%
						</div>
					</div>

					<div className="rounded-lg border bg-card p-6">
						<div className="text-sm font-medium text-muted-foreground">
							Deal Estimado
						</div>
						<div className="mt-2 text-3xl font-bold">
							€{enrichment.predictiveScores.estimatedDealSize?.toLocaleString() ||
								'N/A'}
						</div>
					</div>

					<div className="rounded-lg border bg-card p-6">
						<div className="text-sm font-medium text-muted-foreground">
							Días para Cerrar
						</div>
						<div className="mt-2 text-3xl font-bold">
							{enrichment.predictiveScores.daysToClose || 'N/A'}
						</div>
					</div>

					<div className="rounded-lg border bg-card p-6">
						<div className="text-sm font-medium text-muted-foreground">
							Prioridad
						</div>
						<div className="mt-2 text-2xl font-bold uppercase">
							{enrichment.recommendations?.priority || 'medium'}
						</div>
					</div>
				</div>
			)}

			{/* Recomendaciones */}
			{enrichment?.recommendations && (
				<div className="rounded-lg border bg-card p-6">
					<h2 className="text-xl font-bold mb-4">🎯 Estrategia de Contacto</h2>
					<div className="space-y-4">
						<div>
							<strong>Mejor Approach:</strong>
							<p className="text-muted-foreground mt-1">
								{enrichment.recommendations.bestApproach}
							</p>
						</div>

						<div>
							<strong>Key Talking Points:</strong>
							<ul className="list-disc list-inside mt-1 space-y-1">
								{enrichment.recommendations.keyTalkingPoints?.map(
									(point: string, i: number) => (
										<li key={i} className="text-muted-foreground">
											{point}
										</li>
									)
								)}
							</ul>
						</div>

						<div>
							<strong>Timing:</strong>
							<p className="text-muted-foreground mt-1">
								{enrichment.recommendations.bestTiming}
							</p>
						</div>

						{enrichment.recommendations.objectionsPredicted &&
							enrichment.recommendations.objectionsPredicted.length > 0 && (
								<div>
									<strong>Objeciones Predecibles:</strong>
									<ul className="list-disc list-inside mt-1 space-y-1">
										{enrichment.recommendations.objectionsPredicted.map(
											(obj: string, i: number) => (
												<li key={i} className="text-muted-foreground">
													{obj}
												</li>
											)
										)}
									</ul>
								</div>
							)}
					</div>
				</div>
			)}

			{/* Website Analysis */}
			{enrichment?.website && enrichment.website.hasWebsite && (
				<div className="rounded-lg border bg-card p-6">
					<h2 className="text-xl font-bold mb-4">🌐 Análisis Website</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
						<div>
							<strong>Calidad:</strong>
							<div className="text-muted-foreground capitalize">
								{enrichment.website.quality}
							</div>
						</div>
						<div>
							<strong>Diseño:</strong>
							<div className="text-muted-foreground capitalize">
								{enrichment.website.design}
							</div>
						</div>
						<div>
							<strong>SEO Score:</strong>
							<div className="text-muted-foreground">
								{enrichment.website.seoScore}/100
							</div>
						</div>
						<div>
							<strong>Booking System:</strong>
							<div className="text-muted-foreground">
								{enrichment.website.hasBookingSystem ? '✅ Sí' : '❌ No'}
							</div>
						</div>
					</div>

					{enrichment.website.problems &&
						enrichment.website.problems.length > 0 && (
							<div className="mt-4">
								<strong>Problemas Detectados:</strong>
								<ul className="list-disc list-inside mt-1 space-y-1">
									{enrichment.website.problems.map(
										(problem: string, i: number) => (
											<li key={i} className="text-red-600">
												{problem}
											</li>
										)
									)}
								</ul>
							</div>
						)}
				</div>
			)}

			{/* Reviews */}
			{enrichment?.reviews && (
				<div className="rounded-lg border bg-card p-6">
					<h2 className="text-xl font-bold mb-4">⭐ Análisis de Reviews</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
						<div>
							<strong>Rating Promedio:</strong>
							<div className="text-muted-foreground">
								{enrichment.reviews.averageRating?.toFixed(1)}/5
							</div>
						</div>
						<div>
							<strong>Total Reviews:</strong>
							<div className="text-muted-foreground">
								{enrichment.reviews.totalReviews}
							</div>
						</div>
						<div>
							<strong>Sentiment:</strong>
							<div className="text-muted-foreground capitalize">
								{enrichment.reviews.sentiment?.replace('_', ' ')}
							</div>
						</div>
						<div>
							<strong>Tendencia:</strong>
							<div className="text-muted-foreground capitalize">
								{enrichment.reviews.recentTrend}
							</div>
						</div>
					</div>

					{enrichment.reviews.commonComplaints &&
						enrichment.reviews.commonComplaints.length > 0 && (
							<div className="mt-4">
								<strong>Quejas Comunes:</strong>
								<ul className="list-disc list-inside mt-1 space-y-1">
									{enrichment.reviews.commonComplaints.map(
										(complaint: any, i: number) => (
											<li key={i} className="text-muted-foreground">
												{complaint.issue} ({complaint.count} veces)
											</li>
										)
									)}
								</ul>
							</div>
						)}
				</div>
			)}

			{/* Contacts */}
			{enrichment?.contacts && (
				<div className="rounded-lg border bg-card p-6">
					<h2 className="text-xl font-bold mb-4">👤 Información de Contacto</h2>
					{enrichment.contacts.decisionMaker ? (
						<div className="space-y-2">
							<div>
								<strong>Decision Maker:</strong>
								<div className="text-muted-foreground">
									{enrichment.contacts.decisionMaker.name} -{' '}
									{enrichment.contacts.decisionMaker.title}
								</div>
							</div>
							{enrichment.contacts.decisionMaker.email && (
								<div>
									<strong>Email:</strong>
									<div className="text-muted-foreground">
										{enrichment.contacts.decisionMaker.email}
									</div>
								</div>
							)}
							{enrichment.contacts.decisionMaker.linkedinUrl && (
								<div>
									<strong>LinkedIn:</strong>
									<a
										href={enrichment.contacts.decisionMaker.linkedinUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-primary hover:underline"
									>
										Ver perfil
									</a>
								</div>
							)}
						</div>
					) : (
						<div className="space-y-2">
							{enrichment.contacts.genericEmails &&
								enrichment.contacts.genericEmails.length > 0 && (
									<div>
										<strong>Emails:</strong>
										<div className="text-muted-foreground">
											{enrichment.contacts.genericEmails.join(', ')}
										</div>
									</div>
								)}
							{enrichment.contacts.phones &&
								enrichment.contacts.phones.length > 0 && (
									<div>
										<strong>Teléfonos:</strong>
										<div className="text-muted-foreground">
											{enrichment.contacts.phones.join(', ')}
										</div>
									</div>
								)}
							<div>
								<strong>Mejor Método:</strong>
								<div className="text-muted-foreground capitalize">
									{enrichment.contacts.bestContactMethod}
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Botón volver */}
			<div>
				<Button variant="outline" onClick={() => router.push('/app/leads')}>
					← Volver a Leads
				</Button>
			</div>
		</div>
	);
}

