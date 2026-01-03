import { PageHeader } from "@saas/shared/components/PageHeader";

export default function PipelinePage() {
	return (
		<div className="space-y-8">
			<PageHeader
				title="Pipeline"
				subtitle="Visualiza y gestiona tu pipeline de ventas"
			/>
			
			<div className="grid gap-6 md:grid-cols-6">
				<div className="rounded-lg border bg-card p-4">
					<h3 className="text-sm font-medium mb-2">New</h3>
					<div className="text-2xl font-bold">0</div>
				</div>

				<div className="rounded-lg border bg-card p-4">
					<h3 className="text-sm font-medium mb-2">Contacted</h3>
					<div className="text-2xl font-bold">0</div>
				</div>

				<div className="rounded-lg border bg-card p-4">
					<h3 className="text-sm font-medium mb-2">Interested</h3>
					<div className="text-2xl font-bold">0</div>
				</div>

				<div className="rounded-lg border bg-card p-4">
					<h3 className="text-sm font-medium mb-2">Call Scheduled</h3>
					<div className="text-2xl font-bold">0</div>
				</div>

				<div className="rounded-lg border bg-card p-4">
					<h3 className="text-sm font-medium mb-2">Closed</h3>
					<div className="text-2xl font-bold">0</div>
				</div>

				<div className="rounded-lg border bg-card p-4">
					<h3 className="text-sm font-medium mb-2">Lost</h3>
					<div className="text-2xl font-bold">0</div>
				</div>
			</div>

			<div className="rounded-lg border bg-card p-6">
				<h3 className="text-lg font-semibold mb-4">Pipeline View</h3>
				<div className="text-center py-12 text-muted-foreground">
					<p>No hay leads en el pipeline.</p>
					<p className="text-sm mt-2">
						Comienza descubriendo leads para ver el flujo del pipeline.
					</p>
				</div>
			</div>
		</div>
	);
}

