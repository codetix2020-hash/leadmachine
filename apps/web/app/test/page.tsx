'use client'

export default function TestPage() {
	return (
		<div style={{ padding: '40px', fontFamily: 'Arial' }}>
			<h1>✅ LEADMACHINE FUNCIONANDO!</h1>
			<p>Si ves esto, la app está funcionando.</p>
			<p>Esta página NO usa Supabase.</p>
			<div style={{ marginTop: '20px' }}>
				<a href="/app/leads" style={{ 
					display: 'inline-block',
					padding: '10px 20px', 
					backgroundColor: '#0070f3',
					color: 'white', 
					textDecoration: 'none',
					borderRadius: '5px'
				}}>
					Ir al Dashboard de Leads →
				</a>
			</div>
			<div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
				<h3>🔍 Diagnóstico:</h3>
				<p>Si esta página carga pero /app/leads no, el problema es Supabase.</p>
				<p>Si esta página tampoco carga, el problema es más básico (layout, Next.js).</p>
			</div>
		</div>
	)
}
