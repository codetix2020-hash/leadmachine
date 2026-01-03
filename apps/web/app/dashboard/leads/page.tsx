import { PageHeader } from "@saas/shared/components/PageHeader";

export default function LeadsPage() {
	return (
		<div className="space-y-8">
			<PageHeader
				title="Leads"
				subtitle="Gestiona y descubre nuevos leads para tu negocio"
			/>
			
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">
							Total Leads
						</h3>
					</div>
					<div className="mt-2 text-3xl font-bold">0</div>
					<p className="mt-1 text-xs text-muted-foreground">
						+0% desde el último mes
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">
							Leads Contactados
						</h3>
					</div>
					<div className="mt-2 text-3xl font-bold">0</div>
					<p className="mt-1 text-xs text-muted-foreground">
						+0% desde el último mes
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">
							Leads Interesados
						</h3>
					</div>
					<div className="mt-2 text-3xl font-bold">0</div>
					<p className="mt-1 text-xs text-muted-foreground">
						+0% desde el último mes
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-medium text-muted-foreground">
							Tasa de Conversión
						</h3>
					</div>
					<div className="mt-2 text-3xl font-bold">0%</div>
					<p className="mt-1 text-xs text-muted-foreground">
						+0% desde el último mes
					</p>
				</div>
			</div>

			<div className="rounded-lg border bg-card p-6">
				<h3 className="text-lg font-semibold mb-4">Lista de Leads</h3>
				<div className="text-center py-12 text-muted-foreground">
					<p>No hay leads aún.</p>
					<p className="text-sm mt-2">
						Los leads descubiertos aparecerán aquí.
					</p>
				</div>
			</div>
		</div>
	);
}

