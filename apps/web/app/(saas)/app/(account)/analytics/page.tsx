'use client';

import { useState, useEffect } from 'react';
import { Card } from '@ui/components/card';
import { PageHeader } from '@saas/shared/components/PageHeader';
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
} from 'recharts';

export default function AnalyticsPage() {
	const [analytics, setAnalytics] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchAnalytics();
	}, []);

	async function fetchAnalytics() {
		try {
			const res = await fetch('/api/analytics');
			const data = await res.json();
			setAnalytics(data.analytics);
		} catch (error) {
			console.error('Error loading analytics:', error);
		} finally {
			setLoading(false);
		}
	}

	if (loading) {
		return (
			<div className="space-y-8">
				<PageHeader title="Analytics" subtitle="Métricas y performance del sistema" />
				<div className="p-8 text-center">Cargando analytics...</div>
			</div>
		);
	}

	if (!analytics) {
		return (
			<div className="space-y-8">
				<PageHeader title="Analytics" subtitle="Métricas y performance del sistema" />
				<div className="p-8 text-center text-red-500">Error cargando analytics</div>
			</div>
		);
	}

	const { overview, pipeline, performance, channels, timeline } = analytics;

	// Datos para funnel chart
	const funnelData = [
		{ stage: 'Leads', count: overview.totalLeads, color: '#3b82f6' },
		{ stage: 'Contacted', count: overview.contacted, color: '#8b5cf6' },
		{ stage: 'Interested', count: overview.interested, color: '#ec4899' },
		{ stage: 'Calls', count: overview.callsScheduled, color: '#f59e0b' },
		{ stage: 'Closed', count: overview.closed, color: '#10b981' },
	];

	// Datos para channel comparison
	const channelData = [
		{
			channel: 'Email',
			sent: channels.email.sent,
			responded: channels.email.responded,
			responseRate:
				channels.email.sent > 0
					? Number(((channels.email.responded / channels.email.sent) * 100).toFixed(1))
					: 0,
		},
		{
			channel: 'WhatsApp',
			sent: channels.whatsapp.sent,
			responded: channels.whatsapp.responded,
			responseRate:
				channels.whatsapp.sent > 0
					? Number(((channels.whatsapp.responded / channels.whatsapp.sent) * 100).toFixed(1))
					: 0,
		},
	];

	return (
		<div className="space-y-8">
			<PageHeader title="Analytics Dashboard" subtitle="Métricas y performance del sistema" />

			{/* KPIs principales */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Total Leads</div>
					<div className="text-4xl font-bold">{overview.totalLeads}</div>
				</Card>

				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Contacted</div>
					<div className="text-4xl font-bold text-blue-600">{overview.contacted}</div>
					<div className="text-xs text-gray-400 mt-1">
						{overview.conversionRates.leadToContacted.toFixed(1)}% conversion
					</div>
				</Card>

				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Interested</div>
					<div className="text-4xl font-bold text-purple-600">{overview.interested}</div>
					<div className="text-xs text-gray-400 mt-1">
						{overview.conversionRates.contactedToInterested.toFixed(1)}% conversion
					</div>
				</Card>

				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Calls Scheduled</div>
					<div className="text-4xl font-bold text-orange-600">{overview.callsScheduled}</div>
					<div className="text-xs text-gray-400 mt-1">
						{overview.conversionRates.interestedToCalls.toFixed(1)}% conversion
					</div>
				</Card>

				<Card className="p-6">
					<div className="text-sm text-gray-500 mb-2">Closed</div>
					<div className="text-4xl font-bold text-green-600">{overview.closed}</div>
					<div className="text-xs text-gray-400 mt-1">
						{overview.conversionRates.callsToClosed.toFixed(1)}% close rate
					</div>
				</Card>
			</div>

			{/* Pipeline y Funnel */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="p-6">
					<h2 className="text-xl font-bold mb-4">💰 Pipeline Value</h2>
					<div className="text-5xl font-bold text-green-600 mb-6">
						€{pipeline.totalValue.toLocaleString()}
					</div>

					<div className="space-y-3">
						<div className="flex justify-between items-center">
							<span className="text-sm">New ({pipeline.byStage.new.count})</span>
							<span className="font-semibold">
								€{pipeline.byStage.new.value.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm">Contacted ({pipeline.byStage.contacted.count})</span>
							<span className="font-semibold">
								€{pipeline.byStage.contacted.value.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm">
								Interested ({pipeline.byStage.interested.count})
							</span>
							<span className="font-semibold">
								€{pipeline.byStage.interested.value.toLocaleString()}
							</span>
						</div>
						<div className="flex justify-between items-center">
							<span className="text-sm">
								Calls ({pipeline.byStage.callScheduled.count})
							</span>
							<span className="font-semibold">
								€{pipeline.byStage.callScheduled.value.toLocaleString()}
							</span>
						</div>
					</div>
				</Card>

				<Card className="p-6">
					<h2 className="text-xl font-bold mb-4">📊 Conversion Funnel</h2>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart data={funnelData} layout="vertical">
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis type="number" />
							<YAxis dataKey="stage" type="category" width={80} />
							<Tooltip />
							<Bar dataKey="count" fill="#8884d8">
								{funnelData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Bar>
						</BarChart>
					</ResponsiveContainer>
				</Card>
			</div>

			{/* Channel Performance */}
			<Card className="p-6">
				<h2 className="text-xl font-bold mb-4">📱 Channel Performance</h2>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={channelData}>
						<CartesianGrid strokeDasharray="3 3" />
						<XAxis dataKey="channel" />
						<YAxis />
						<Tooltip />
						<Legend />
						<Bar dataKey="sent" fill="#3b82f6" name="Sent" />
						<Bar dataKey="responded" fill="#10b981" name="Responded" />
					</BarChart>
				</ResponsiveContainer>

				<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
					{channelData.map((channel) => (
						<div key={channel.channel} className="p-4 bg-gray-50 rounded">
							<div className="font-semibold">{channel.channel}</div>
							<div className="text-2xl font-bold text-green-600">
								{channel.responseRate}%
							</div>
							<div className="text-sm text-gray-500">response rate</div>
						</div>
					))}
				</div>
			</Card>

			{/* Timeline y Performance */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="p-6">
					<h2 className="text-xl font-bold mb-4">📈 Leads Timeline (Last 7 Days)</h2>
					<ResponsiveContainer width="100%" height={250}>
						<LineChart data={timeline.leadsPerDay}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="date" />
							<YAxis />
							<Tooltip />
							<Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} />
						</LineChart>
					</ResponsiveContainer>
				</Card>

				<Card className="p-6">
					<h2 className="text-xl font-bold mb-4">⚡ Performance Metrics</h2>
					<div className="space-y-6">
						<div>
							<div className="text-sm text-gray-500 mb-2">Average Score</div>
							<div className="text-4xl font-bold">{performance.avgScore}/100</div>
						</div>
						<div>
							<div className="text-sm text-gray-500 mb-2">Avg Days to Close</div>
							<div className="text-4xl font-bold">{performance.avgDaysToClose} días</div>
						</div>
						<div>
							<div className="text-sm text-gray-500 mb-2">Top Products</div>
							<div className="space-y-2 mt-2">
								{performance.topProducts.map((product: any, i: number) => (
									<div key={i} className="flex justify-between items-center">
										<span className="capitalize font-medium">{product.product}</span>
										<span className="text-sm text-gray-600">
											{product.count} leads • €{product.revenue.toLocaleString()}
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
