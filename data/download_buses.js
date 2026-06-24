// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const https = require("https");

const inputPath = path.join(__dirname, "combined_bus_app_data.json");
const outputPath = path.join(__dirname, "buses.json");
const imagesDir = path.join(__dirname, "../public/images/buses");

// Create the target directories if they don't exist
if (!fs.existsSync(imagesDir)) {
	fs.mkdirSync(imagesDir, { recursive: true });
}

// Read input data
const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const buses = data.buses || [];

console.log(`Loaded ${buses.length} buses.`);

// Helper to sanitize title to safe filename
function getSafeFilename(titleEn, imageUrl) {
	const base = titleEn
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "_")
		.replace(/_+/g, "_")
		.replace(/(^_|_$)/g, "");

	// Extract extension from imageUrl
	let ext = ".jpg";
	try {
		const urlPath = new URL(imageUrl).pathname;
		const matchedExt = urlPath.match(/\.(jpg|jpeg|png|webp|gif)$/i);
		if (matchedExt) {
			ext = matchedExt[0].toLowerCase();
		}
	} catch {
		// Ignore invalid url parse errors
	}
	return base + ext;
}

// Download function using https
function downloadImage(url, destPath) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				if (res.statusCode !== 200) {
					reject(new Error(`Failed with status code: ${res.statusCode}`));
					return;
				}

				const fileStream = fs.createWriteStream(destPath);
				res.pipe(fileStream);

				fileStream.on("finish", () => {
					fileStream.close();
					resolve();
				});

				fileStream.on("error", (err) => {
					fs.unlink(destPath, () => {}); // delete partial file on error
					reject(err);
				});
			})
			.on("error", (err) => {
				reject(err);
			});
	});
}

// Concurrency pool helper
async function runWithConcurrencyLimit(tasks, limit) {
	const results = [];
	const executing = [];
	for (const task of tasks) {
		const p = Promise.resolve().then(() => task());
		results.push(p);
		if (limit <= tasks.length) {
			const e = p.then(() => executing.splice(executing.indexOf(e), 1));
			executing.push(e);
			if (executing.length >= limit) {
				await Promise.race(executing);
			}
		}
	}
	return Promise.all(results);
}

// Run the pipeline
async function main() {
	const downloadTasks = [];
	const processedBuses = [];

	// Track unique image downloads to avoid downloading the same image multiple times
	const downloadedUrlsMap = new Map();

	for (const bus of buses) {
		const titleEn = bus.title.en;
		const imageUrl = bus.image;

		// Default clone of bus data
		const optimizedBus = {
			title: bus.title,
			image: null,
			routes: bus.routes,
			time: bus.time,
			service_type: bus.service_type,
		};

		if (imageUrl && imageUrl.startsWith("http")) {
			const filename = getSafeFilename(titleEn, imageUrl);
			const destPath = path.join(imagesDir, filename);
			const localImagePath = `/images/buses/${filename}`;

			optimizedBus.image = localImagePath;

			if (!downloadedUrlsMap.has(imageUrl)) {
				// Schedule download task
				downloadedUrlsMap.set(imageUrl, destPath);
				downloadTasks.push(async () => {
					try {
						console.log(`Downloading: ${imageUrl} -> ${filename}...`);
						await downloadImage(imageUrl, destPath);
						console.log(`✓ Success: ${filename}`);
					} catch (error) {
						console.error(`✗ Error downloading ${titleEn} image: ${error.message}`);
						// Fallback to null image on failure
						optimizedBus.image = null;
					}
				});
			}
		}

		processedBuses.push(optimizedBus);
	}

	console.log(`Starting downloads of ${downloadTasks.length} unique images (concurrency: 5)...`);
	await runWithConcurrencyLimit(downloadTasks, 5);

	// Write new optimized data JSON file
	fs.writeFileSync(outputPath, JSON.stringify({ buses: processedBuses }, null, 2), "utf8");
	console.log(`\n🎉 Process complete! Created optimized dataset at ${outputPath}`);
	console.log(`Total buses output: ${processedBuses.length}`);
}

main().catch((err) => {
	console.error("Fatal pipeline error:", err);
});
