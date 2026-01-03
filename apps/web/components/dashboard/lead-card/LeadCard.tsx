import type { Lead } from "../../../types/lead";

interface LeadCardProps {
	lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
	return (
		<div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between">
				<div className="space-y-1">
					<h3 className="font-semibold text-lg">{lead.company_name}</h3>
					{lead.industry && (
						<p className="text-sm text-muted-foreground">{lead.industry}</p>
					)}
				</div>
				<div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
					Score: {lead.score}
				</div>
			</div>

			<div className="mt-4 space-y-2">
				{lead.email && (
					<div className="text-sm">
						<span className="text-muted-foreground">Email:</span>{" "}
						{lead.email}
					</div>
				)}
				{lead.phone && (
					<div className="text-sm">
						<span className="text-muted-foreground">Teléfono:</span>{" "}
						{lead.phone}
					</div>
				)}
				{lead.website && (
					<div className="text-sm">
						<span className="text-muted-foreground">Website:</span>{" "}
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

			{lead.problem_detected && (
				<div className="mt-4 rounded bg-muted p-3">
					<p className="text-xs font-medium text-muted-foreground mb-1">
						Problema Detectado:
					</p>
					<p className="text-sm">{lead.problem_detected}</p>
				</div>
			)}

			<div className="mt-4 flex items-center justify-between">
				<div className="text-xs text-muted-foreground">
					Estado: <span className="font-medium">{lead.status}</span>
				</div>
				<div className="text-xs text-muted-foreground">
					Tipo: <span className="font-medium">{lead.type}</span>
				</div>
			</div>
		</div>
	);
}

