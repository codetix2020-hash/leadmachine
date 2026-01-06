'use client'

import { useState, useEffect } from 'react'

export default function TestSupabasePage() {
	const [status, setStatus] = useState('Cargando...')
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		// Probar conexión a Supabase
		async function testSupabase() {
			try {
				const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
				
				if (!supabaseUrl) {
					setStatus('❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está definida')
					setError('Variable de entorno faltante')
					return
				}

				setStatus(`🔍 Probando conexión a: ${supabaseUrl}`)

				// Intentar hacer una query simple a Supabase
				const response = await fetch('/api/leads?limit=1')
				
				if (response.ok) {
					const data = await response.json()
					setStatus('✅ Supabase funciona correctamente!')
					setError(null)
				} else {
					const errorData = await response.text()
					setStatus('❌ Error en la respuesta de Supabase')
					setError(`Status: ${response.status} - ${errorData}`)
				}
			} catch (err: any) {
				setStatus('❌ Error conectando a Supabase')
				setError(err.message || 'Error desconocido')
			}
		}

		testSupabase()
	}, [])

	return (
		<div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
			<h1>🔍 Test de Supabase</h1>
			
			<div style={{ 
				marginTop: '20px', 
				padding: '20px', 
				backgroundColor: error ? '#fee' : '#efe', 
				border: `2px solid ${error ? '#f00' : '#0f0'}`,
				borderRadius: '5px' 
			}}>
				<h3>Estado:</h3>
				<p>{status}</p>
				{error && (
					<div style={{ marginTop: '10px', color: '#c00' }}>
						<strong>Error:</strong> {error}
					</div>
				)}
			</div>

			<div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
				<h3>📋 Variables de Entorno:</h3>
				<p><strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ NO DEFINIDA'}</p>
			</div>

			<div style={{ marginTop: '20px' }}>
				<a href="/test" style={{ color: 'blue', textDecoration: 'underline' }}>
					← Volver a página de prueba simple
				</a>
				{' | '}
				<a href="/app/leads" style={{ color: 'blue', textDecoration: 'underline' }}>
					Ir a Dashboard →
				</a>
			</div>
		</div>
	)
}



