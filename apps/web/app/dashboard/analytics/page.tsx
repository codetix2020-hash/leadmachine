import { PageHeader } from "@saas/shared/components/PageHeader";

export default function AnalyticsPage() {
	return (
		<div className="space-y-8">
			<PageHeader
				title="Analytics"
				subtitle="Analiza el rendimiento de tu estrategia de generación de leads"
			/>
			
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-sm font-medium text-muted-foreground">
						Leads Encontrados
					</h3>
					<div className="mt-2 text-3xl font-bold">0</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Este mes
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-sm font-medium text-muted-foreground">
						Mensajes Enviados
					</h3>
					<div className="mt-2 text-3xl font-bold">0</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Este mes
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-sm font-medium text-muted-foreground">
						Tasa de Respuesta
					</h3>
					<div className="mt-2 text-3xl font-bold">0%</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Promedio
					</p>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-sm font-medium text-muted-foreground">
						Llamadas Agendadas
					</h3>
					<div className="mt-2 text-3xl font-bold">0</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Este mes
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">
						Leads por Canal
					</h3>
					<div className="text-center py-12 text-muted-foreground">
						<p className="text-sm">
							No hay datos suficientes para mostrar
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">
						Tasa de Conversión
					</h3>
					<div className="text-center py-12 text-muted-foreground">
						<p className="text-sm">
							No hay datos suficientes para mostrar
						</p>
					</div>
				</div>
			</div>

			<div className="rounded-lg border bg-card p-6">
				<h3 className="text-lg font-semibold mb-4">
					Rendimiento en el Tiempo
				</h3>
				<div className="text-center py-12 text-muted-foreground">
					<p className="text-sm">
						No hay datos suficientes para mostrar
					</p>
				</div>
			</div>
		</div>
	);
}

