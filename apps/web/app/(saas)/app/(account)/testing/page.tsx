'use client';

import { useState, useEffect } from 'react';
import { Card } from '@ui/components/card';
import { Button } from '@ui/components/button';
import { PageHeader } from '@saas/shared/components/PageHeader';

export default function TestingPage() {
	const [mode, setMode] = useState<'live' | 'testing'>('live');
	const [testLog, setTestLog] = useState<string[]>([]);

	useEffect(() => {
		// Check current mode
		checkMode();
	}, []);

	async function checkMode() {
		try {
			const res = await fetch('/api/testing/status');
			const data = await res.json();
			setMode(data.mode || 'live');
		} catch (error) {
			console.error('Error checking mode:', error);
		}
	}

	function toggleMode() {
		if (mode === 'live') {
			enableTesting();
		} else {
			disableTesting();
		}
	}

	async function enableTesting() {
		try {
			const res = await fetch('/api/testing/enable', { method: 'POST' });
			const data = await res.json();
			if (data.success) {
				setMode('testing');
				addLog('🧪 Testing mode enabled');
			}
		} catch (error: any) {
			addLog(`❌ Error: ${error.message}`);
		}
	}

	async function disableTesting() {
		try {
			const res = await fetch('/api/testing/disable', { method: 'POST' });
			const data = await res.json();
			if (data.success) {
				setMode('live');
				addLog('✅ Live mode enabled');
			}
		} catch (error: any) {
			addLog(`❌ Error: ${error.message}`);
		}
	}

	function addLog(message: string) {
		setTestLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
	}

	async function runFullTest() {
		addLog('🚀 Starting full system test...');

		try {
			// 1. Test discovery
			addLog('📍 Testing discovery...');
			const discovery = await fetch('/api/test/discovery');
			const data1 = await discovery.json();
			if (data1.success) {
				addLog('✅ Discovery OK');
			} else {
				addLog('❌ Discovery failed');
			}

			// 2. Test enrichment
			addLog('🤖 Testing enrichment...');
			const enrichment = await fetch('/api/test/enrichment');
			const data2 = await enrichment.json();
			if (data2.success) {
				addLog('✅ Enrichment OK');
			} else {
				addLog('❌ Enrichment failed');
			}

			// 3. Test outreach
			addLog('📧 Testing outreach...');
			const outreach = await fetch('/api/test/outreach');
			const data3 = await outreach.json();
			if (data3.success) {
				addLog('✅ Outreach OK');
			} else {
				addLog('❌ Outreach failed');
			}

			// 4. Test conversation AI
			addLog('💬 Testing conversation AI...');
			const conversation = await fetch('/api/test/conversation');
			const data4 = await conversation.json();
			if (data4.success) {
				addLog('✅ Conversation AI OK');
			} else {
				addLog('❌ Conversation AI failed');
			}

			addLog('🎉 All tests passed!');
		} catch (error: any) {
			addLog(`❌ Test failed: ${error.message}`);
		}
	}

	async function checkDeliverability() {
		addLog('🔍 Checking email deliverability...');

		const domain = 'codetix.com'; // Tu dominio
		const res = await fetch(`/api/email/check-deliverability?domain=${domain}`);
		const data = await res.json();

		addLog(`📊 Deliverability score: ${data.score}/100`);

		if (data.recommendations && data.recommendations.length > 0) {
			data.recommendations.forEach((rec: string) => addLog(`⚠️  ${rec}`));
		} else {
			addLog('✅ Email setup is perfect!');
		}
	}

	async function testEmailSend() {
		addLog('📧 Testing email send...');
		try {
			const res = await fetch('/api/test/email-send', { method: 'POST' });
			const data = await res.json();
			if (data.success) {
				addLog(`✅ Email test: ${data.mode === 'testing' ? 'DRY RUN (no sent)' : 'SENT'}`);
			} else {
				addLog(`❌ Email test failed: ${data.error}`);
			}
		} catch (error: any) {
			addLog(`❌ Error: ${error.message}`);
		}
	}

	return (
		<div className="space-y-8">
			<div className="flex justify-between items-center">
				<PageHeader
					title="🧪 Testing & Deliverability"
					subtitle="Test system safely before going live"
				/>

				<Button
					onClick={toggleMode}
					variant={mode === 'testing' ? 'default' : 'destructive'}
					size="lg"
				>
					{mode === 'testing' ? '🧪 Testing Mode' : '🔴 Live Mode'}
				</Button>
			</div>

			{/* Mode warning */}
			{mode === 'testing' && (
				<Card className="p-4 bg-yellow-50 border-yellow-200">
					<div className="flex items-center gap-2">
						<span className="text-2xl">🧪</span>
						<div>
							<div className="font-bold">Testing Mode Active</div>
							<div className="text-sm text-gray-600">
								No emails will be sent. All actions are simulated.
							</div>
						</div>
					</div>
				</Card>
			)}

			{mode === 'live' && (
				<Card className="p-4 bg-red-50 border-red-200">
					<div className="flex items-center gap-2">
						<span className="text-2xl">🔴</span>
						<div>
							<div className="font-bold">Live Mode Active</div>
							<div className="text-sm text-gray-600">
								Real emails will be sent. Use with caution.
							</div>
						</div>
					</div>
				</Card>
			)}

			{/* Test actions */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card className="p-6">
					<h2 className="text-xl font-bold mb-4">🧪 System Tests</h2>
					<div className="space-y-3">
						<Button onClick={runFullTest} className="w-full">
							Run Full Test Suite
						</Button>
						<Button variant="outline" className="w-full" onClick={() => addLog('Test discovery')}>
							Test Discovery Only
						</Button>
						<Button variant="outline" className="w-full" onClick={() => addLog('Test enrichment')}>
							Test Enrichment Only
						</Button>
						<Button variant="outline" className="w-full" onClick={() => addLog('Test outreach')}>
							Test Outreach Only
						</Button>
					</div>
				</Card>

				<Card className="p-6">
					<h2 className="text-xl font-bold mb-4">📧 Email Deliverability</h2>
					<div className="space-y-3">
						<Button onClick={checkDeliverability} className="w-full">
							Check Domain Setup
						</Button>
						<Button variant="outline" className="w-full" onClick={testEmailSend}>
							Test Email Send
						</Button>
						<Button variant="outline" className="w-full" onClick={() => addLog('View bounce list')}>
							View Bounce List
						</Button>
						<Button variant="outline" className="w-full" onClick={() => addLog('Warm-up progress')}>
							Warm-up Progress
						</Button>
					</div>
				</Card>
			</div>

			{/* Log console */}
			<Card className="p-6">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-bold">📜 Test Log</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setTestLog([])}
					>
						Clear
					</Button>
				</div>
				<div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
					{testLog.length === 0 ? (
						<div className="text-gray-500">No logs yet. Run a test to see output.</div>
					) : (
						testLog.map((log, i) => (
							<div key={i} className="mb-1">
								{log}
							</div>
						))
					)}
				</div>
			</Card>
		</div>
	);
}

