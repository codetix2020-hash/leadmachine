interface RetryOptions {
	maxAttempts: number;
	delayMs: number;
	backoff: boolean; // Exponential backoff
	onRetry?: (attempt: number, error: any) => void;
}

export async function withRetry<T>(
	fn: () => Promise<T>,
	options: Partial<RetryOptions> = {},
): Promise<T> {
	const config: RetryOptions = {
		maxAttempts: options.maxAttempts || 3,
		delayMs: options.delayMs || 1000,
		backoff: options.backoff ?? true,
		onRetry: options.onRetry,
	};

	let lastError: any;

	for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (error: any) {
			lastError = error;

			if (attempt === config.maxAttempts) {
				throw error;
			}

			const delay = config.backoff
				? config.delayMs * Math.pow(2, attempt - 1)
				: config.delayMs;

			console.log(`⚠️  Attempt ${attempt} failed, retrying in ${delay}ms...`);

			if (config.onRetry) {
				config.onRetry(attempt, error);
			}

			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

// Wrapper para operaciones críticas
export async function safeExecute<T>(
	operation: () => Promise<T>,
	fallback: T,
	errorContext: string,
): Promise<T> {
	try {
		return await withRetry(operation, {
			maxAttempts: 3,
			delayMs: 1000,
			backoff: true,
		});
	} catch (error: any) {
		console.error(`❌ ${errorContext} failed after retries:`, error.message);

		// Track error
		const { trackError } = await import('@/lib/monitoring/error-tracker');
		await trackError({
			type: errorContext,
			message: error.message,
			stack: error.stack,
		});

		return fallback;
	}
}

