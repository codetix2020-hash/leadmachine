'use client'

import type { Lead } from '../../../types/lead'
import { Button } from '@ui/components/button'
import { useState } from 'react'

interface LeadCardProps {
	lead: Lead
	onUpdate?: () => void
}

export function LeadCard({ lead, onUpdate }: LeadCardProps) {
	const [loading, setLoading] = useState(false)

	// Color del score
	const getScoreColor = (score: number) => {
		if (score >= 80) return 'text-green-600 bg-green-50'
		if (score >= 50) return 'text-yellow-600 bg-yellow-50'
		return 'text-red-600 bg-red-50'
	}

	// Color del status badge
	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			new: 'bg-blue-100 text-blue-800',
			contacted: 'bg-purple-100 text-purple-800',
			interested: 'bg-green-100 text-green-800',
			call_scheduled: 'bg-orange-100 text-orange-800',
			closed: 'bg-gray-100 text-gray-800',
			lost: 'bg-red-100 text-red-800',
		}
		return colors[status] || 'bg-gray-100 text-gray-800'
	}

	// Actualizar status del lead
	const updateStatus = async (newStatus: string) => {
		setLoading(true)
		try {
			const response = await fetch('/api/leads', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: lead.id,
					status: newStatus,
				}),
			})

			if (response.ok) {
				onUpdate?.()
			}
		} catch (error) {
			console.error('Error updating lead:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
			{/* Header */}
			<div className="flex items-start justify-between mb-3">
				<div className="flex-1">
					<h3 className="font-semibold text-lg">{lead.company_name}</h3>
					{lead.industry && (
						<p className="text-sm text-muted-foreground capitalize">{lead.industry}</p>
					)}
				</div>
				<div className={`rounded-full px-3 py-1 text-xs font-medium ${getScoreColor(lead.score)}`}>
					{lead.score}/100
				</div>
			</div>

			{/* Location */}
			{lead.location && (
				<div className="text-sm mb-3">
					<span className="text-muted-foreground">📍</span>{' '}
					<span className="text-sm">{lead.location}</span>
				</div>
			)}

			{/* Contact Info */}
			<div className="space-y-2 mb-4">
				{lead.email && (
					<div className="text-sm">
						<span className="text-muted-foreground">Email:</span>{' '}
						<a href={`mailto:${lead.email}`} className="text-primary hover:underline">
							{lead.email}
						</a>
					</div>
				)}
				{lead.phone && (
					<div className="text-sm">
						<span className="text-muted-foreground">Teléfono:</span>{' '}
						<a href={`tel:${lead.phone}`} className="text-primary hover:underline">
							{lead.phone}
						</a>
					</div>
				)}
				{lead.website && (
					<div className="text-sm">
						<span className="text-muted-foreground">Website:</span>{' '}
						<a
							href={lead.website}
							target="_blank"
							rel="noopener noreferrer"
							className="text-primary hover:underline"
						>
							{lead.website}
						</a>
					</div>
				)}
			</div>

			{/* Problem Detected */}
			{lead.problem_detected && (
				<div className="rounded bg-muted p-3 mb-4">
					<p className="text-xs font-medium text-muted-foreground mb-1">
						💡 Problema detectado:
					</p>
					<p className="text-sm">{lead.problem_detected}</p>
				</div>
			)}

			{/* Insight */}
			{lead.insight && (
				<div className="rounded bg-blue-50 p-3 mb-4">
					<p className="text-xs font-medium text-blue-600 mb-1">
						✨ Insight:
					</p>
					<p className="text-sm text-blue-900">{lead.insight}</p>
				</div>
			)}

			{/* Status & Type */}
			<div className="flex items-center gap-2 mb-4">
				<span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}>
					{lead.status}
				</span>
				<span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
					{lead.type}
				</span>
			</div>

			{/* Actions */}
			<div className="flex gap-2">
				{lead.status === 'new' && (
					<Button
						size="sm"
						variant="outline"
						onClick={() => updateStatus('contacted')}
						disabled={loading}
						className="flex-1"
					>
						📞 Contactar
					</Button>
				)}
				
				{lead.status === 'contacted' && (
					<Button
						size="sm"
						onClick={() => updateStatus('interested')}
						disabled={loading}
						className="flex-1"
					>
						✅ Interesado
					</Button>
				)}

				{lead.status === 'interested' && (
					<Button
						size="sm"
						onClick={() => updateStatus('call_scheduled')}
						disabled={loading}
						className="flex-1"
					>
						📅 Agendar
					</Button>
				)}

				<Button
					size="sm"
					variant="outline"
					onClick={() => updateStatus('closed')}
					disabled={loading}
				>
					✓ Cerrar
				</Button>
			</div>

			{/* Quick actions dropdown */}
			<details className="mt-2">
				<summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
					Más acciones
				</summary>
				<div className="mt-2 space-y-1">
					<button
						onClick={() => updateStatus('lost')}
						disabled={loading}
						className="text-xs text-red-600 hover:underline w-full text-left"
					>
						Marcar como perdido
					</button>
					<button
						onClick={() => {
							if (confirm('¿Eliminar este lead?')) {
								fetch(`/api/leads?id=${lead.id}`, { method: 'DELETE' })
									.then(() => onUpdate?.())
							}
						}}
						disabled={loading}
						className="text-xs text-red-600 hover:underline w-full text-left"
					>
						Eliminar lead
					</button>
				</div>
			</details>
		</div>
	)
}

