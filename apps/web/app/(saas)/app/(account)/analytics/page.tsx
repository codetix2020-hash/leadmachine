'use client'

import { PageHeader } from '@saas/shared/components/PageHeader'

export default function AnalyticsPage() {
	return (
		<div className="space-y-8">
			<PageHeader
				title="Analytics"
				subtitle="Métricas y estadísticas de LEADMACHINE"
			/>
			
			<div className="rounded-lg border bg-card p-6">
				<p className="text-muted-foreground">
					Página de analytics en desarrollo...
				</p>
			</div>
		</div>
	)
}

