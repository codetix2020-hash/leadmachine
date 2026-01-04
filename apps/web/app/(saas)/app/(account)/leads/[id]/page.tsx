'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/modules/ui/components/button';
import { Card } from '@/modules/ui/components/card';
import { useRouter } from 'next/navigation';

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const [lead, setLead] = useState<any>(null);
	const [enrichment, setEnrichment] = useState<any>(null);
	const [contactInfo, setContactInfo] = useState<any>(null);
	const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
	const [enriching, setEnriching] = useState(false);
	const [outreaching, setOutreaching] = useState(false);
	const [loading, setLoading] = useState(true);
	const router = useRouter();
	const [leadId, setLeadId] = useState<string>('');

	useEffect(() => {
		// Resolver params en Next.js 15
		params.then((resolved) => {
			setLeadId(resolved.id);
			fetchLead(resolved.id);
		});
	}, [params]);

	async function fetchLead(id: string) {
		try {
			setLoading(true);

			const res = await fetch(`/api/leads/${id}`);
			if (!res.ok) throw new Error('Failed to fetch lead');
			const data = await res.json();

			if (data.lead) {
				setLead(data.lead);

				// Si ya tiene enrichment, mostrarlo
				if (data.lead.enrichmentData || data.lead.enrichment_data) {
					try {
						setEnrichment(JSON.parse(data.lead.enrichmentData || data.lead.enrichment_data));
					} catch (e) {
						console.error('Error parsing enrichment:', e);
					}
				}
			}
		} catch (error) {
			console.error('Error loading lead:', error);
		} finally {
			setLoading(false);
		}
	}

	async function runEnrichment() {
		if (!leadId) {
			const resolved = await params;
			setLeadId(resolved.id);
		}

		setEnriching(true);
		try {
			const id = leadId || (await params).id;

			const res = await fetch(`/api/leads/${id}/enrich`, {
				method: 'POST',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Enrichment failed');
			}

			const data = await res.json();

			// Asegurar que se actualiza el estado
			if (data.enrichment) {
				setEnrichment(data.enrichment);
				console.log('✅ Enrichment updated:', data.enrichment);

				// Actualizar lead localmente
				if (data.enrichment?.predictiveScores) {
					setLead((prev: any) => ({
						...prev,
						score: data.enrichment.predictiveScores.closeProbability || prev.score,
						enrichmentData: JSON.stringify(data.enrichment),
					}));
				}
			}

			alert('✅ Análisis profundo completado!');
		} catch (error) {
			console.error('Enrichment error:', error);
			alert(`Error al analizar: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setEnriching(false);
		}
	}

	async function startOutreach() {
		if (
			!confirm(
				'¿Iniciar secuencia de outreach automático? Se enviará un mensaje inicial y se programarán 6 follow-ups.'
			)
		) {
			return;
		}

		setOutreaching(true);
		setWhatsappLink(null);
		setContactInfo(null);

		try {
			const id = leadId || (await params).id;

			const res = await fetch(`/api/leads/${id}/outreach`, {
				method: 'POST',
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || 'Outreach failed');
			}

			const data = await res.json();

			setContactInfo(data.contacts);

			if (data.success) {
				if (data.whatsappLink) {
					// WhatsApp
					setWhatsappLink(data.whatsappLink);
					alert('✅ Mensaje generado. Click en "Enviar WhatsApp" para abrir.');
				} else if (data.method === 'email') {
					// Email
					alert('✅ Email enviado. Follow-ups programados automáticamente.');
				} else if (data.method === 'phone') {
					// Teléfono
					alert('✅ Script generado. Ver abajo para llamar.');
				} else {
					alert('✅ Outreach iniciado correctamente.');
				}
			} else {
				alert(`❌ Error: ${data.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error:', error);
			alert(`Error al iniciar outreach: ${error instanceof Error ? error.message : 'Unknown error'}`);
		} finally {
			setOutreaching(false);
		}
	}

	if (loading) {
		return (
			<div className="p-8 text-center">
				<div className="text-gray-500">Cargando lead...</div>
			</div>
		);
	}

	if (!lead) {
		return (
			<div className="p-8 text-center">
				<div className="text-red-500 mb-4">Lead no encontrado</div>
				<Button onClick={() => router.push('/app/leads')}>Volver a Leads</Button>
			</div>
		);
	}

	return (
		<div className="p-8 max-w-6xl mx-auto">
			{/* Header */}
			<div className="flex justify-between items-start mb-8">
				<div>
					<h1 className="text-3xl font-bold mb-2">{lead.company_name}</h1>
					<p className="text-gray-600">{lead.location}</p>
					{lead.industry && <p className="text-sm text-gray-500 mt-1">Industria: {lead.industry}</p>}
				</div>
				<div className="flex gap-3 flex-wrap">
					<Button variant="outline" onClick={() => router.push('/app/leads')}>
						← Volver
					</Button>
					<Button onClick={runEnrichment} disabled={enriching} size="lg">
						{enriching ? '⏳ Analizando (15-20seg)...' : '🔍 Análisis Profundo'}
					</Button>
					{enrichment && (
						<Button
							onClick={startOutreach}
							disabled={!enrichment || outreaching || !lead?.email}
							size="lg"
							variant="default"
						>
							{outreaching ? '📧 Enviando...' : '🚀 Iniciar Outreach'}
						</Button>
					)}
				</div>
			</div>

			{/* Información básica */}
			<Card className="p-6 mb-6">
				<h2 className="text-xl font-bold mb-4">📋 Información Básica</h2>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<strong>Score:</strong> <span className="text-2xl font-bold text-green-600">{lead.score}/100</span>
					</div>
					<div>
						<strong>Estado:</strong> <span className="capitalize">{lead.status}</span>
					</div>
					{lead.email ? (
						<div>
							<strong>Email:</strong> <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
						</div>
					) : (
						<div>
							<strong>Email:</strong> <span className="text-red-600">❌ No disponible</span>
						</div>
					)}
					{lead.phone && (
						<div>
							<strong>Teléfono:</strong> <a href={`tel:${lead.phone}`} className="text-primary hover:underline">{lead.phone}</a>
						</div>
					)}
					{lead.website && (
						<div className="col-span-2">
							<strong>Website:</strong>{' '}
							<a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
								{lead.website}
							</a>
						</div>
					)}
				</div>
			</Card>

			{/* Warning si no hay ningún contacto */}
			{enrichment && !lead?.email && !lead?.phone && (
				<Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
					<p className="text-yellow-800">
						⚠️ Este lead no tiene email ni teléfono. Se intentará buscar contactos automáticamente al iniciar outreach.
					</p>
				</Card>
			)}

			{/* Debug info */}
			{enrichment && (
				<div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
					<strong>Debug:</strong> Enrichment existe: ✅, Email: {lead?.email || '❌ No'}, Outreaching: {outreaching ? 'Sí' : 'No'}
				</div>
			)}

			{enrichment && (
				<>
					{/* Producto Recomendado */}
					{enrichment.recommendedProduct && (
						<Card className="p-6 mb-6 bg-blue-50 border-blue-200">
							<h2 className="text-2xl font-bold mb-2">🎯 Producto Recomendado</h2>
							<div className="text-3xl font-bold text-blue-600 uppercase mb-2">{enrichment.recommendedProduct}</div>
							<p className="text-gray-700">{enrichment.productReasoning}</p>
						</Card>
					)}

					{/* Scores Predictivos */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<Card className="p-6">
							<div className="text-sm text-gray-500 mb-2">Probabilidad de Cierre</div>
							<div className="text-4xl font-bold text-green-600">
								{enrichment.predictiveScores?.closeProbability || 0}%
							</div>
						</Card>

						<Card className="p-6">
							<div className="text-sm text-gray-500 mb-2">Deal Estimado</div>
							<div className="text-4xl font-bold">€{enrichment.predictiveScores?.estimatedDealSize || 0}</div>
						</Card>

						<Card className="p-6">
							<div className="text-sm text-gray-500 mb-2">Días para Cerrar</div>
							<div className="text-4xl font-bold">{enrichment.predictiveScores?.daysToClose || 0}</div>
						</Card>
					</div>

					{/* Estrategia */}
					<Card className="p-6 mb-6">
						<h2 className="text-2xl font-bold mb-4">🎯 Estrategia de Contacto</h2>
						<div className="space-y-4">
							<div>
								<strong className="text-lg">Prioridad:</strong>
								<span className="ml-2 text-2xl uppercase font-bold text-orange-600">
									{enrichment.recommendations?.priority || 'medium'}
								</span>
							</div>

							<div>
								<strong>Mejor Approach:</strong>
								<p className="text-gray-700 mt-2">{enrichment.recommendations?.bestApproach}</p>
							</div>

							<div>
								<strong>Key Talking Points:</strong>
								<ul className="list-disc list-inside mt-2 space-y-1">
									{enrichment.recommendations?.keyTalkingPoints?.map((point: string, i: number) => (
										<li key={i} className="text-gray-700">
											{point}
										</li>
									))}
								</ul>
							</div>

							<div>
								<strong>Pitch Angle:</strong>
								<p className="text-gray-700 mt-2">{enrichment.recommendations?.pitchAngle}</p>
							</div>

							<div>
								<strong>Timing:</strong>
								<p className="text-gray-700 mt-2">{enrichment.recommendations?.bestTiming}</p>
							</div>

							{enrichment.recommendations?.expectedObjections && (
								<div>
									<strong>Objeciones Esperadas:</strong>
									<ul className="list-disc list-inside mt-2 space-y-1">
										{enrichment.recommendations.expectedObjections.map((obj: string, i: number) => (
											<li key={i} className="text-gray-700">
												{obj}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</Card>

					{/* Website Analysis */}
					{enrichment.website && (
						<Card className="p-6 mb-6">
							<h2 className="text-2xl font-bold mb-4">🌐 Análisis Website</h2>
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									<strong>Calidad:</strong> <span className="capitalize">{enrichment.website.quality}</span>
								</div>
								<div>
									<strong>Diseño:</strong> <span className="capitalize">{enrichment.website.design}</span>
								</div>
								<div>
									<strong>Sistema de Reservas:</strong>{' '}
									{enrichment.website.hasBookingSystem ? '✅ Sí' : '❌ No'}
								</div>
								<div>
									<strong>E-commerce:</strong> {enrichment.website.hasEcommerce ? '✅ Sí' : '❌ No'}
								</div>
								<div>
									<strong>Optimizado Móvil:</strong> {enrichment.website.mobileOptimized ? '✅ Sí' : '❌ No'}
								</div>
								{enrichment.website.techStack && enrichment.website.techStack.length > 0 && (
									<div>
										<strong>Tech Stack:</strong> {enrichment.website.techStack.join(', ')}
									</div>
								)}
							</div>

							{enrichment.website.problems?.length > 0 && (
								<div className="mt-4">
									<strong>Problemas Detectados:</strong>
									<ul className="list-disc list-inside mt-2">
										{enrichment.website.problems.map((p: string, i: number) => (
											<li key={i} className="text-red-600">
												{p}
											</li>
										))}
									</ul>
								</div>
							)}

							{enrichment.website.opportunities?.length > 0 && (
								<div className="mt-4">
									<strong>Oportunidades:</strong>
									<ul className="list-disc list-inside mt-2">
										{enrichment.website.opportunities.map((o: string, i: number) => (
											<li key={i} className="text-green-600">
												{o}
											</li>
										))}
									</ul>
								</div>
							)}
						</Card>
					)}

					{/* Reviews */}
					{enrichment.reviews && enrichment.reviews.totalReviews > 0 && (
						<Card className="p-6">
							<h2 className="text-2xl font-bold mb-4">⭐ Análisis de Reviews</h2>
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									<strong>Rating Promedio:</strong> {enrichment.reviews.averageRating}/5 ⭐
								</div>
								<div>
									<strong>Total Reviews:</strong> {enrichment.reviews.totalReviews}
								</div>
								<div>
									<strong>Sentiment:</strong> <span className="capitalize">{enrichment.reviews.sentiment}</span>
								</div>
							</div>

							{enrichment.reviews.commonComplaints?.length > 0 && (
								<div className="mt-4">
									<strong>Quejas Comunes:</strong>
									<ul className="list-disc list-inside mt-2">
										{enrichment.reviews.commonComplaints.map((c: any, i: number) => (
											<li key={i}>
												{c.issue} <span className="text-gray-500">({c.count}x)</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{enrichment.reviews.painPoints?.length > 0 && (
								<div className="mt-4">
									<strong>Pain Points (Software puede resolver):</strong>
									<ul className="list-disc list-inside mt-2">
										{enrichment.reviews.painPoints.map((p: string, i: number) => (
											<li key={i} className="text-orange-600 font-medium">
												{p}
											</li>
										))}
									</ul>
								</div>
							)}
						</Card>
					)}
				</>
			)}

			{!enrichment && (
				<Card className="p-12 text-center">
					<p className="text-gray-500 mb-4 text-lg">
						Haz click en "🔍 Análisis Profundo" para ver predicciones y estrategia personalizada.
					</p>
					<p className="text-sm text-gray-400">
						El análisis tarda 15-20 segundos y genera recomendaciones inteligentes basadas en el website y reviews.
					</p>
				</Card>
			)}
		</div>
	);
}
