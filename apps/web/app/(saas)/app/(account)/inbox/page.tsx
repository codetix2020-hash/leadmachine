'use client';

import { useState, useEffect } from 'react';
import { Card } from '@ui/components/card';
import { PageHeader } from '@saas/shared/components/PageHeader';

export default function InboxPage() {
	const [conversations, setConversations] = useState<any[]>([]);
	const [selectedConv, setSelectedConv] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchConversations();
	}, []);

	async function fetchConversations() {
		try {
			const res = await fetch('/api/conversations');
			const data = await res.json();
			setConversations(data.conversations || []);
		} catch (error) {
			console.error('Error loading conversations:', error);
		} finally {
			setLoading(false);
		}
	}

	if (loading) {
		return (
			<div className="space-y-8">
				<PageHeader title="Inbox" subtitle="Todas tus conversaciones con leads" />
				<div className="p-8 text-center">Cargando inbox...</div>
			</div>
		);
	}

	// Agrupar por lead
	const grouped = conversations.reduce((acc: any, conv) => {
		if (!acc[conv.leadId]) {
			acc[conv.leadId] = {
				leadId: conv.leadId,
				leadName: conv.leadName || 'Unknown',
				messages: [],
			};
		}
		acc[conv.leadId].messages.push(conv);
		return acc;
	}, {});

	const threads = Object.values(grouped).map((thread: any) => ({
		...thread,
		messages: thread.messages.sort((a: any, b: any) => {
			const dateA = new Date(a.createdAt || 0).getTime();
			const dateB = new Date(b.createdAt || 0).getTime();
			return dateA - dateB;
		}),
	}));

	return (
		<div className="space-y-8">
			<PageHeader title="📨 Inbox" subtitle="Todas tus conversaciones con leads" />

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Lista de conversaciones */}
				<Card className="p-4 h-[600px] overflow-y-auto">
					<h2 className="font-bold mb-4">Conversaciones</h2>
					<div className="space-y-2">
						{threads.length === 0 ? (
							<div className="text-sm text-gray-500 text-center py-8">
								No hay conversaciones aún
							</div>
						) : (
							threads.map((thread: any) => (
								<div
									key={thread.leadId}
									onClick={() => setSelectedConv(thread)}
									className={`p-3 rounded cursor-pointer hover:bg-gray-100 transition-colors ${
										selectedConv?.leadId === thread.leadId ? 'bg-blue-50 border-2 border-blue-200' : ''
									}`}
								>
									<div className="font-semibold">{thread.leadName}</div>
									<div className="text-sm text-gray-500">
										{thread.messages.length} mensaje{thread.messages.length !== 1 ? 's' : ''}
									</div>
									{thread.messages[thread.messages.length - 1]?.sentiment && (
										<div className="text-xs mt-1">
											{getSentimentEmoji(thread.messages[thread.messages.length - 1].sentiment)}{' '}
											{thread.messages[thread.messages.length - 1].sentiment}
										</div>
									)}
									{thread.messages.length > 0 && (
										<div className="text-xs text-gray-400 mt-1">
											{new Date(
												thread.messages[thread.messages.length - 1].createdAt,
											).toLocaleDateString()}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</Card>

				{/* Mensajes */}
				<Card className="lg:col-span-2 p-6 h-[600px] overflow-y-auto">
					{selectedConv ? (
						<div>
							<h2 className="text-xl font-bold mb-6">{selectedConv.leadName}</h2>

							<div className="space-y-4">
								{selectedConv.messages.length === 0 ? (
									<div className="text-gray-500 text-center py-8">No hay mensajes aún</div>
								) : (
									selectedConv.messages.map((msg: any, i: number) => (
										<div key={i}>
											{msg.messageSent && (
												<div className="flex justify-end mb-2">
													<div className="bg-blue-100 rounded-lg p-3 max-w-md">
														<div className="text-xs text-gray-500 mb-1">
															Nosotros •{' '}
															{new Date(msg.createdAt).toLocaleString('es-ES')}
														</div>
														<div className="whitespace-pre-wrap">{msg.messageSent}</div>
													</div>
												</div>
											)}

											{msg.messageReceived && (
												<div className="flex justify-start mb-2">
													<div className="bg-gray-100 rounded-lg p-3 max-w-md">
														<div className="text-xs text-gray-500 mb-1">
															Lead • {new Date(msg.createdAt).toLocaleString('es-ES')}
															{msg.sentiment &&
																` • ${getSentimentEmoji(msg.sentiment)} ${msg.sentiment}`}
														</div>
														<div className="whitespace-pre-wrap">{msg.messageReceived}</div>
													</div>
												</div>
											)}
										</div>
									))
								)}
							</div>
						</div>
					) : (
						<div className="flex items-center justify-center h-full text-gray-400">
							Selecciona una conversación para ver los mensajes
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}

function getSentimentEmoji(sentiment: string): string {
	switch (sentiment) {
		case 'interested':
			return '🟢';
		case 'needs_info':
			return '🟡';
		case 'not_interested':
			return '🔴';
		case 'not_now':
			return '🟠';
		case 'objection':
			return '🟣';
		default:
			return '⚪';
	}
}

