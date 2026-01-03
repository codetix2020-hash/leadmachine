'use client'

import { PageHeader } from '@saas/shared/components/PageHeader'

export default function PipelinePage() {
	return (
		<div className="space-y-8">
			<PageHeader
				title="Pipeline"
				subtitle="Visualiza tu embudo de ventas"
			/>
			
			<div className="rounded-lg border bg-card p-6">
				<p className="text-muted-foreground">
					Página de pipeline en desarrollo...
				</p>
			</div>
		</div>
	)
}

