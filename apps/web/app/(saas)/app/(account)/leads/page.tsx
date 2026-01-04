'use client'

import { useState, useEffect } from 'react'
import { Button } from '@ui/components/button'
import { PageHeader } from '@saas/shared/components/PageHeader'
import { LeadCard } from '@/components/dashboard/lead-card/LeadCard'
import type { Lead } from '@/types/lead'

export default function LeadsPage() {
	const [leads, setLeads] = useState<Lead[]>([])
	const [loading, setLoading] = useState(false)
	const [showModal, setShowModal] = useState(false)
	const [filters, setFilters] = useState({
		type: 'all',
		status: 'all',
		minScore: 0,
	})

	// Formulario de búsqueda
	const [searchForm, setSearchForm] = useState({
		query: '',
		location: '',
		type: 'reservaspro' as 'codetix' | 'reservaspro',
	})

	// Cargar leads
	const fetchLeads = async () => {
		setLoading(true)
		try {
			const params = new URLSearchParams()
			if (filters.type !== 'all') params.append('type', filters.type)
			if (filters.status !== 'all') params.append('status', filters.status)
			if (filters.minScore > 0) params.append('minScore', filters.minScore.toString())

			const response = await fetch(`/api/leads?${params.toString()}`)
			
			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`)
			}
			
			const result = await response.json()
			
			// La API devuelve { leads: [...], pagination: {...} }
			if (result.error) {
				console.error('Error de Supabase:', result.error)
				// Mostrar leads vacío si hay error, pero no bloquear
				setLeads([])
			} else if (result.leads) {
				setLeads(result.leads)
			} else {
				setLeads([])
			}
		} catch (error) {
			console.error('Error fetching leads:', error)
			// En caso de error, mostrar lista vacía pero no bloquear la UI
			setLeads([])
		} finally {
			setLoading(false)
		}
	}

	// Buscar nuevos leads
	const discoverLeads = async () => {
		if (!searchForm.query || !searchForm.location) {
			alert('Por favor completa todos los campos')
			return
		}

		setLoading(true)
		try {
			const response = await fetch('/api/leads/discover', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(searchForm),
			})

			const result = await response.json()
			
			if (result.success) {
				alert(`¡${result.count} leads encontrados!`)
				setShowModal(false)
				setSearchForm({ query: '', location: '', type: 'reservaspro' })
				fetchLeads() // Recargar lista
			} else {
				alert(`Error: ${result.error}`)
			}
		} catch (error) {
			console.error('Error discovering leads:', error)
			alert('Error al buscar leads')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetchLeads()
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters.type, filters.status, filters.minScore])

	// Stats
	const stats = {
		total: leads.length,
		contacted: leads.filter(l => l.status === 'contacted').length,
		interested: leads.filter(l => l.status === 'interested').length,
		avgScore: leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length) : 0,
	}

	return (
		<div className="space-y-8">
			<PageHeader
				title="Leads"
				subtitle="Gestiona y descubre nuevos leads para tu negocio"
			/>
			
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-sm font-medium text-muted-foreground">Total Leads</h3>
					<div className="mt-2 text-3xl font-bold">{stats.total}</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-sm font-medium text-muted-foreground">Contactados</h3>
					<div className="mt-2 text-3xl font-bold">{stats.contacted}</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-sm font-medium text-muted-foreground">Interesados</h3>
					<div className="mt-2 text-3xl font-bold">{stats.interested}</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-sm font-medium text-muted-foreground">Score Promedio</h3>
					<div className="mt-2 text-3xl font-bold">{stats.avgScore}/100</div>
				</div>
			</div>

			{/* Actions & Filters */}
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex gap-2">
					<select
						value={filters.type}
						onChange={(e) => setFilters({ ...filters, type: e.target.value })}
						className="rounded-md border px-3 py-2"
					>
						<option value="all">Todos los tipos</option>
						<option value="codetix">CodeTix</option>
						<option value="reservaspro">ReservasPro</option>
					</select>

					<select
						value={filters.status}
						onChange={(e) => setFilters({ ...filters, status: e.target.value })}
						className="rounded-md border px-3 py-2"
					>
						<option value="all">Todos los estados</option>
						<option value="new">Nuevos</option>
						<option value="contacted">Contactados</option>
						<option value="interested">Interesados</option>
						<option value="call_scheduled">Llamada agendada</option>
					</select>

					<select
						value={filters.minScore}
						onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
						className="rounded-md border px-3 py-2"
					>
						<option value="0">Score mínimo</option>
						<option value="50">50+</option>
						<option value="70">70+</option>
						<option value="80">80+</option>
					</select>
				</div>

				<Button onClick={() => setShowModal(true)} disabled={loading}>
					🔍 Find Leads
				</Button>
			</div>

			{/* Leads List */}
			<div className="rounded-lg border bg-card p-6">
				<h3 className="text-lg font-semibold mb-4">Lista de Leads</h3>
				
				{loading ? (
					<div className="text-center py-12 text-muted-foreground">
						<p>Cargando...</p>
					</div>
				) : leads.length === 0 ? (
					<div className="text-center py-12 text-muted-foreground">
						<p>No hay leads aún.</p>
						<p className="text-sm mt-2">Haz clic en "Find Leads" para empezar.</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{leads.map(lead => (
							<LeadCard key={lead.id} lead={lead} onUpdate={fetchLeads} />
						))}
					</div>
				)}
			</div>

			{/* Modal de búsqueda */}
			{showModal && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
						<h2 className="text-xl font-bold mb-4">Buscar Leads</h2>
						
						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2">
									Tipo de negocio
								</label>
								<input
									type="text"
									placeholder="ej: barberías, restaurantes"
									value={searchForm.query}
									onChange={(e) => setSearchForm({ ...searchForm, query: e.target.value })}
									className="w-full rounded-md border px-3 py-2"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Ubicación
								</label>
								<input
									type="text"
									placeholder="ej: Barcelona, Spain"
									value={searchForm.location}
									onChange={(e) => setSearchForm({ ...searchForm, location: e.target.value })}
									className="w-full rounded-md border px-3 py-2"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2">
									Producto
								</label>
								<select
									value={searchForm.type}
									onChange={(e) => setSearchForm({ ...searchForm, type: e.target.value as any })}
									className="w-full rounded-md border px-3 py-2"
								>
									<option value="reservaspro">ReservasPro</option>
									<option value="codetix">CodeTix</option>
								</select>
							</div>
						</div>

						<div className="flex gap-2 mt-6">
							<Button
								onClick={() => setShowModal(false)}
								variant="outline"
								className="flex-1"
								disabled={loading}
							>
								Cancelar
							</Button>
							<Button
								onClick={discoverLeads}
								className="flex-1"
								disabled={loading}
							>
								{loading ? 'Buscando...' : 'Buscar'}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
