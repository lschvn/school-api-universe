import consola from 'consola';
import { performance } from 'perf_hooks';
import os from 'os';

type BenchmarkResult = {
	route: string;
	method: string;
	duration: number;
	status: number;
	timestamp: number;
	success: boolean;
};

class ApiBenchmark {
	private baseUrl: string;
	private results: BenchmarkResult[] = [];
	private startTime: number = 0;
	private endTime: number = 0;
	private totalRequests: number = 0;
	private successfulRequests: number = 0;
	private failedRequests: number = 0;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	async measureRoute(
		route: string,
		method: string = 'GET',
		body?: any,
	): Promise<void> {
		const start = performance.now();
		this.totalRequests++;

		try {
			const response = await fetch(`${this.baseUrl}${route}`, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: body ? JSON.stringify(body) : undefined,
			});

			const duration = performance.now() - start;
			const success = response.status >= 200 && response.status < 500;

			if (success) this.successfulRequests++;
			else this.failedRequests++;

			this.results.push({
				route,
				method,
				duration,
				status: response.status,
				timestamp: Date.now(),
				success,
			});
		} catch (error: any) {
			this.failedRequests++;
		}
	}

	async runLoadTest(
		routes: any[],
		duration: number = 30,
		concurrency: number = 50,
	) {
		consola.info({
			message: '🚀 Starting Load Test',
			badge: true,
			additional: [
				`Duration: ${duration}s`,
				`Concurrency: ${concurrency}`,
				`Routes: ${routes.length}`,
			].join(' | '),
		});

		this.startTime = Date.now();
		const endTime = this.startTime + duration * 1000;

		while (Date.now() < endTime) {
			const promises = [];
			for (let i = 0; i < concurrency; i++) {
				const route = routes[Math.floor(Math.random() * routes.length)];
				promises.push(this.measureRoute(route.path, route.method, route.body));
			}
			await Promise.all(promises);

			// Afficher les stats en temps réel
			this.printRealtimeStats(endTime);
		}
		this.endTime = Date.now();
	}

	private printRealtimeStats(endTime: number) {
		const elapsed = (Date.now() - this.startTime) / 1000;
		const remaining = Math.max(0, (endTime - Date.now()) / 1000);
		const rps = this.totalRequests / elapsed;

		process.stdout.write('\r');
		process.stdout.write(
			`⏱️  ${elapsed.toFixed(1)}s | ` +
				`🎯 ${rps.toFixed(2)} req/s | ` +
				`✅ ${this.successfulRequests} | ` +
				`❌ ${this.failedRequests} | ` +
				`⏳ ${remaining.toFixed(1)}s remaining`,
		);
	}

	printResults(): void {
		console.clear();
		const testDuration = (this.endTime - this.startTime) / 1000;
		const rps = this.totalRequests / testDuration;

		consola.log('\n' + '='.repeat(50));
		consola.info('📊 LOAD TEST RESULTS');
		consola.log('='.repeat(50) + '\n');

		// Système info
		consola.info('💻 System Information:');
		consola.log(`CPU: ${os.cpus()[0].model}`);
		consola.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
		consola.log(`Platform: ${os.platform()} ${os.release()}`);
		consola.log(`Node Version: ${process.version}\n`);

		// Performance metrics
		consola.info('🎯 Performance Metrics:');
		consola.log(`Total Requests: ${this.totalRequests}`);
		consola.log(`Successful Requests: ${this.successfulRequests}`);
		consola.log(`Failed Requests: ${this.failedRequests}`);
		consola.log(`Average RPS: ${rps.toFixed(2)}`);
		consola.log(`Test Duration: ${testDuration.toFixed(2)}s\n`);

		// Latency stats
		const latencies = this.results.map((r) => r.duration);
		const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
		const sorted = [...latencies].sort((a, b) => a - b);
		const p95 = sorted[Math.floor(sorted.length * 0.95)];
		const p99 = sorted[Math.floor(sorted.length * 0.99)];

		consola.info('⏱️  Latency Information:');
		consola.log(`Average: ${avg.toFixed(2)}ms`);
		consola.log(`Min: ${Math.min(...latencies).toFixed(2)}ms`);
		consola.log(`Max: ${Math.max(...latencies).toFixed(2)}ms`);
		consola.log(`P95: ${p95.toFixed(2)}ms`);
		consola.log(`P99: ${p99.toFixed(2)}ms\n`);

		// Route specific stats
		consola.info('🛣️  Route Statistics:');
		const routeStats = new Map();
		this.results.forEach((result) => {
			const key = `${result.method} ${result.route}`;
			if (!routeStats.has(key)) {
				routeStats.set(key, {
					count: 0,
					success: 0,
					failed: 0,
					totalDuration: 0,
				});
			}
			const stats = routeStats.get(key);
			stats.count++;
			result.success ? stats.success++ : stats.failed++;
			stats.totalDuration += result.duration;
		});

		routeStats.forEach((stats, route) => {
			consola.log(`\n${route}:`);
			consola.log(`  Requests: ${stats.count}`);
			consola.log(
				`  Success Rate: ${((stats.success / stats.count) * 100).toFixed(2)}%`,
			);
			consola.log(
				`  Avg Duration: ${(stats.totalDuration / stats.count).toFixed(2)}ms`,
			);
		});
	}
}

// Exemple d'utilisation
async function runBenchmark() {
	const benchmark = new ApiBenchmark('http://localhost:3000');

	const routes = [
		{ path: '/api/universe', method: 'GET' },
		{ path: '/api/universe/19', method: 'GET' },
		{ path: '/api/character/6', method: 'GET' },
		{
			path: '/api/universe/new',
			method: 'POST',
			body: {
				name: `Universe ${Math.random().toString(36).substring(7)}`,
				description: `Description ${Math.random().toString(36).substring(7)}`,
			},
		},
		{
			path: '/api/auth/signup',
			method: 'POST',
			body: {
				name: `Test User ${Math.random().toString(36).substring(7)}`,
				email: `test${Math.random().toString(36).substring(7)}@test.com`,
				password: 'password123',
			},
		},
	];

	// Exécuter le test de charge (30 secondes avec 50 requêtes concurrentes)
	await benchmark.runLoadTest(routes, 20, 150);
	benchmark.printResults();
}

runBenchmark().catch(console.error);
