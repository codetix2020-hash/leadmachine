import type { Lead } from "../../../types/lead";

interface PipelineViewProps {
	leads: Lead[];
}

export function PipelineView({ leads }: PipelineViewProps) {
	const stages = [
		{ key: "new", label: "New" },
		{ key: "contacted", label: "Contacted" },
		{ key: "interested", label: "Interested" },
		{ key: "call_scheduled", label: "Call Scheduled" },
		{ key: "closed", label: "Closed" },
		{ key: "lost", label: "Lost" },
	];

	const getLeadsByStatus = (status: string) => {
		return leads.filter((lead) => lead.status === status);
	};

	return (
		<div className="grid gap-4 md:grid-cols-6">
			{stages.map((stage) => {
				const stageLeads = getLeadsByStatus(stage.key);
				return (
					<div key={stage.key} className="space-y-3">
						<div className="rounded-lg border bg-card p-3">
							<h3 className="text-sm font-medium mb-1">{stage.label}</h3>
							<div className="text-2xl font-bold">{stageLeads.length}</div>
						</div>

						<div className="space-y-2">
							{stageLeads.slice(0, 3).map((lead) => (
								<div
									key={lead.id}
									className="rounded border bg-card p-2 text-xs"
								>
									<div className="font-medium truncate">
										{lead.company_name}
									</div>
									<div className="text-muted-foreground">
										Score: {lead.score}
									</div>
								</div>
							))}
							{stageLeads.length > 3 && (
								<div className="text-xs text-muted-foreground text-center">
									+{stageLeads.length - 3} más
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}

