// Variable global de testing
export let TESTING_MODE = false;
export let TEST_LEAD: any = null;

export function enableTestingMode(testLead?: any) {
	TESTING_MODE = true;

	TEST_LEAD =
		testLead ||
		({
			id: 'test-lead-123',
			companyName: 'TEST - Barbería Demo',
			email: 'test@leadmachine-internal.com',
			phone: '+34600000000',
			website: 'https://example.com',
			location: 'Barcelona, Spain',
			type: 'reservaspro',
			score: 85,
			status: 'new',
			enrichmentData: JSON.stringify({
				recommendedProduct: 'reservaspro',
				predictiveScores: {
					closeProbability: 85,
					estimatedDealSize: 2400,
					daysToClose: 30,
				},
				recommendations: {
					priority: 'high',
					bestApproach: 'Email personalizado',
					keyTalkingPoints: ['Test point 1', 'Test point 2'],
				},
			}),
		});

	console.log('🧪 TESTING MODE ENABLED');
	console.log('📧 Emails will NOT be sent');
	console.log('📱 SMS/WhatsApp will NOT be sent');
	console.log('🔗 LinkedIn actions will NOT be executed');
}

export function disableTestingMode() {
	TESTING_MODE = false;
	TEST_LEAD = null;
	console.log('✅ TESTING MODE DISABLED - LIVE MODE ACTIVE');
}

export function isTestingMode(): boolean {
	return TESTING_MODE;
}

export function getTestLead() {
	return TEST_LEAD;
}

