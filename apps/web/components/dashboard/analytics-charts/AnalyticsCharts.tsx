import type { DailyAnalytics } from "../../../types/analytics";

interface AnalyticsChartsProps {
	data: DailyAnalytics[];
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
	// TODO: Implementar gráficos con una librería como recharts o chart.js
	
	return (
		<div className="space-y-6">
			<div className="rounded-lg border bg-card p-6">
				<h3 className="text-lg font-semibold mb-4">
					Leads Encontrados por Día
				</h3>
				<div className="h-64 flex items-center justify-center text-muted-foreground">
					<p className="text-sm">
						Gráfico de leads - Implementar con recharts
					</p>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">
						Tasa de Respuesta por Canal
					</h3>
					<div className="h-48 flex items-center justify-center text-muted-foreground">
						<p className="text-sm">
							Gráfico de canal - Implementar con recharts
						</p>
					</div>
				</div>

				<div className="rounded-lg border bg-card p-6">
					<h3 className="text-lg font-semibold mb-4">
						Conversión del Pipeline
					</h3>
					<div className="h-48 flex items-center justify-center text-muted-foreground">
						<p className="text-sm">
							Gráfico de conversión - Implementar con recharts
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

