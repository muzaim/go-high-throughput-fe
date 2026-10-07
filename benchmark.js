const TOTAL_REQUESTS = 10000;
const TARGET_URL = "http://localhost:8080/api/v1/inventory/reserve";
const ITEM_ID = "item_4021";

async function runBenchmark() {
	console.log(`Starting Concurrency Benchmark...`);
	console.log(`Target  : ${TARGET_URL}`);
	console.log(
		`Sending : ${TOTAL_REQUESTS} concurrent POST requests for item: ${ITEM_ID}\n`
	);

	const startTime = Date.now();

	const requests = Array.from({ length: TOTAL_REQUESTS }, (_, i) =>
		fetch(TARGET_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id: `usr_bench_${1000 + i}`,
				item_id: ITEM_ID,
				quantity: 1,
			}),
		})
			.then(async (res) => {
				const json = await res.json().catch(() => null);
				return { statusCode: res.status, body: json };
			})
			.catch((err) => ({ statusCode: 0, error: err.message }))
	);

	const results = await Promise.allSettled(requests);
	const durationInSeconds = (Date.now() - startTime) / 1000;

	let successCount = 0;
	let insufficientStockCount = 0;
	let errorCount = 0;

	results.forEach((r) => {
		if (r.status === "fulfilled") {
			const { statusCode, body } = r.value;
			if (statusCode === 200 && body?.status === "success") {
				successCount++;
			} else if (
				body?.code === "INSUFFICIENT_STOCK" ||
				statusCode === 409
			) {
				insufficientStockCount++;
			} else {
				errorCount++;
			}
		} else {
			errorCount++;
		}
	});

	console.log(`==========================================`);
	console.log(`📊 BENCHMARK RESULT SUMMARY`);
	console.log(`==========================================`);
	console.log(
		`⏱ Total Time Elapsed : ${durationInSeconds.toFixed(2)} seconds`
	);
	console.log(
		`⚡ Throughput         : ${(TOTAL_REQUESTS / durationInSeconds).toFixed(
			0
		)} requests/sec`
	);
	console.log(`------------------------------------------`);
	console.log(`✅ Reserved Success   : ${successCount}`);
	console.log(`⚠️ Insufficient Stock: ${insufficientStockCount}`);
	console.log(`❌ Failed / Errors    : ${errorCount}`);
	console.log(`==========================================\n`);
}

runBenchmark();
