import metroRawData from "@/data/metroData.json";
import type {
	MetroData,
	MetroLine,
	MetroStation,
	SimulatedTrain,
} from "@/types";

const data = metroRawData as MetroData;

// ─── Getters ────────────────────────────────────────────
export function getMetroLine(): MetroLine {
	return data.lines[0];
}

export function getMetroStations(): MetroStation[] {
	return data.lines[0].stations;
}

export function getMetroStationById(id: string): MetroStation | undefined {
	return data.lines[0].stations.find((s) => s.id === id);
}

// ─── Fare Logic ─────────────────────────────────────────
const FARE_TABLE: Record<string, Record<string, number>> = {
	"uttara-north": {
		"uttara-north": 0, "uttara-center": 20, "uttara-south": 20, "pallabi": 30, "mirpur-11": 30, "mirpur-10": 40, "kazipara": 40, "shewrapara": 50, "agargaon": 60, "bijoy-sarani": 60, "farmgate": 70, "karwan-bazar": 80, "shahbag": 80, "dhaka-university": 90, "bangladesh-secretariat": 90, "motijheel": 100
	},
	"uttara-center": {
		"uttara-north": 20, "uttara-center": 0, "uttara-south": 20, "pallabi": 20, "mirpur-11": 30, "mirpur-10": 30, "kazipara": 40, "shewrapara": 40, "agargaon": 50, "bijoy-sarani": 60, "farmgate": 60, "karwan-bazar": 70, "shahbag": 80, "dhaka-university": 80, "bangladesh-secretariat": 90, "motijheel": 90
	},
	"uttara-south": {
		"uttara-north": 20, "uttara-center": 20, "uttara-south": 0, "pallabi": 20, "mirpur-11": 20, "mirpur-10": 30, "kazipara": 30, "shewrapara": 40, "agargaon": 50, "bijoy-sarani": 50, "farmgate": 60, "karwan-bazar": 70, "shahbag": 70, "dhaka-university": 80, "bangladesh-secretariat": 90, "motijheel": 90
	},
	"pallabi": {
		"uttara-north": 30, "uttara-center": 20, "uttara-south": 20, "pallabi": 0, "mirpur-11": 20, "mirpur-10": 20, "kazipara": 20, "shewrapara": 30, "agargaon": 40, "bijoy-sarani": 40, "farmgate": 50, "karwan-bazar": 60, "shahbag": 60, "dhaka-university": 70, "bangladesh-secretariat": 80, "motijheel": 80
	},
	"mirpur-11": {
		"uttara-north": 30, "uttara-center": 30, "uttara-south": 20, "pallabi": 20, "mirpur-11": 0, "mirpur-10": 20, "kazipara": 20, "shewrapara": 20, "agargaon": 30, "bijoy-sarani": 40, "farmgate": 40, "karwan-bazar": 50, "shahbag": 60, "dhaka-university": 60, "bangladesh-secretariat": 70, "motijheel": 70
	},
	"mirpur-10": {
		"uttara-north": 40, "uttara-center": 30, "uttara-south": 30, "pallabi": 20, "mirpur-11": 20, "mirpur-10": 0, "kazipara": 20, "shewrapara": 20, "agargaon": 20, "bijoy-sarani": 30, "farmgate": 30, "karwan-bazar": 40, "shahbag": 40, "dhaka-university": 50, "bangladesh-secretariat": 60, "motijheel": 60
	},
	"kazipara": {
		"uttara-north": 40, "uttara-center": 40, "uttara-south": 30, "pallabi": 20, "mirpur-11": 20, "mirpur-10": 20, "kazipara": 0, "shewrapara": 20, "agargaon": 20, "bijoy-sarani": 20, "farmgate": 30, "karwan-bazar": 30, "shahbag": 40, "dhaka-university": 40, "bangladesh-secretariat": 50, "motijheel": 60
	},
	"shewrapara": {
		"uttara-north": 50, "uttara-center": 40, "uttara-south": 40, "pallabi": 30, "mirpur-11": 20, "mirpur-10": 20, "kazipara": 20, "shewrapara": 0, "agargaon": 20, "bijoy-sarani": 20, "farmgate": 20, "karwan-bazar": 30, "shahbag": 30, "dhaka-university": 40, "bangladesh-secretariat": 40, "motijheel": 50
	},
	"agargaon": {
		"uttara-north": 60, "uttara-center": 50, "uttara-south": 50, "pallabi": 40, "mirpur-11": 30, "mirpur-10": 20, "kazipara": 20, "shewrapara": 20, "agargaon": 0, "bijoy-sarani": 20, "farmgate": 20, "karwan-bazar": 30, "shahbag": 30, "dhaka-university": 30, "bangladesh-secretariat": 40, "motijheel": 50
	},
	"bijoy-sarani": {
		"uttara-north": 60, "uttara-center": 60, "uttara-south": 50, "pallabi": 40, "mirpur-11": 40, "mirpur-10": 30, "kazipara": 20, "shewrapara": 20, "agargaon": 20, "bijoy-sarani": 0, "farmgate": 20, "karwan-bazar": 20, "shahbag": 30, "dhaka-university": 30, "bangladesh-secretariat": 40, "motijheel": 50
	},
	"farmgate": {
		"uttara-north": 70, "uttara-center": 60, "uttara-south": 60, "pallabi": 50, "mirpur-11": 40, "mirpur-10": 30, "kazipara": 30, "shewrapara": 20, "agargaon": 20, "bijoy-sarani": 20, "farmgate": 0, "karwan-bazar": 20, "shahbag": 20, "dhaka-university": 30, "bangladesh-secretariat": 30, "motijheel": 40
	},
	"karwan-bazar": {
		"uttara-north": 80, "uttara-center": 70, "uttara-south": 70, "pallabi": 60, "mirpur-11": 50, "mirpur-10": 40, "kazipara": 30, "shewrapara": 30, "agargaon": 30, "bijoy-sarani": 20, "farmgate": 20, "karwan-bazar": 0, "shahbag": 20, "dhaka-university": 20, "bangladesh-secretariat": 30, "motijheel": 30
	},
	"shahbag": {
		"uttara-north": 80, "uttara-center": 80, "uttara-south": 70, "pallabi": 60, "mirpur-11": 60, "mirpur-10": 40, "kazipara": 40, "shewrapara": 30, "agargaon": 30, "bijoy-sarani": 30, "farmgate": 20, "karwan-bazar": 20, "shahbag": 0, "dhaka-university": 20, "bangladesh-secretariat": 20, "motijheel": 30
	},
	"dhaka-university": {
		"uttara-north": 90, "uttara-center": 80, "uttara-south": 80, "pallabi": 70, "mirpur-11": 60, "mirpur-10": 50, "kazipara": 40, "shewrapara": 40, "agargaon": 30, "bijoy-sarani": 30, "farmgate": 30, "karwan-bazar": 20, "shahbag": 20, "dhaka-university": 0, "bangladesh-secretariat": 20, "motijheel": 20
	},
	"bangladesh-secretariat": {
		"uttara-north": 90, "uttara-center": 90, "uttara-south": 90, "pallabi": 80, "mirpur-11": 70, "mirpur-10": 60, "kazipara": 50, "shewrapara": 40, "agargaon": 40, "bijoy-sarani": 40, "farmgate": 30, "karwan-bazar": 30, "shahbag": 20, "dhaka-university": 20, "bangladesh-secretariat": 0, "motijheel": 20
	},
	"motijheel": {
		"uttara-north": 100, "uttara-center": 90, "uttara-south": 90, "pallabi": 80, "mirpur-11": 70, "mirpur-10": 60, "kazipara": 60, "shewrapara": 50, "agargaon": 50, "bijoy-sarani": 50, "farmgate": 40, "karwan-bazar": 30, "shahbag": 30, "dhaka-university": 20, "bangladesh-secretariat": 20, "motijheel": 0
	}
};

export function calculateMetroFare(fromId: string, toId: string): number {
	if (fromId === toId) return 0;
	if (getMetroStationById(fromId)?.underConstruction || getMetroStationById(toId)?.underConstruction) {
		return 0;
	}
	return FARE_TABLE[fromId]?.[toId] ?? 0;
}

export function getMetroFareWithCard(fare: number): number {
	const line = getMetroLine();
	return Math.round(fare * (1 - line.cardDiscount));
}

export function getStationCount(fromId: string, toId: string): number {
	const line = getMetroLine();
	const fromIdx = line.stations.findIndex((s) => s.id === fromId);
	const toIdx = line.stations.findIndex((s) => s.id === toId);
	if (fromIdx === -1 || toIdx === -1) return 0;
	return Math.abs(toIdx - fromIdx);
}

export function getEstimatedTravelTime(fromId: string, toId: string): number {
	const count = getStationCount(fromId, toId);
	return Math.round(count * getMetroLine().travelTimeBetweenStations);
}

export function getDistanceBetweenStations(fromId: string, toId: string): number {
	const line = getMetroLine();
	const from = line.stations.find((s) => s.id === fromId);
	const to = line.stations.find((s) => s.id === toId);
	if (!from || !to) return 0;
	return Math.abs(to.distanceFromStart - from.distanceFromStart);
}

// ─── Schedule Logic ─────────────────────────────────────
function parseTime(time: string): number {
	const [h, m] = time.split(":").map(Number);
	return h * 60 + m;
}

export function getDayType(date: Date): "weekday" | "friday" | "saturday" {
	const day = date.getDay();
	if (day === 5) return "friday";
	if (day === 6) return "saturday";
	return "weekday";
}

export function getMetroSchedule(date: Date) {
	const line = getMetroLine();
	const dayType = getDayType(date);
	return line.schedule[dayType];
}

export function isMetroOperating(now: Date): boolean {
	const schedule = getMetroSchedule(now);
	if (!schedule) return false;
	const currentMinutes = now.getHours() * 60 + now.getMinutes();
	const start = parseTime(schedule.start);
	const end = parseTime(schedule.end);
	return currentMinutes >= start && currentMinutes <= end;
}

export function isPeakHour(now: Date): boolean {
	const line = getMetroLine();
	const currentMinutes = now.getHours() * 60 + now.getMinutes();
	return line.peakHours.some((peak) => {
		const start = parseTime(peak.start);
		const end = parseTime(peak.end);
		return currentMinutes >= start && currentMinutes <= end;
	});
}

export function getCurrentFrequency(now: Date): number {
	const line = getMetroLine();
	return isPeakHour(now) ? line.frequency.peak : line.frequency.offPeak;
}

export function getNextTrainMinutes(now: Date): number {
	if (!isMetroOperating(now)) {
		// Calculate minutes until next opening
		const schedule = getMetroSchedule(now);
		if (!schedule) return -1;
		const currentMinutes = now.getHours() * 60 + now.getMinutes();
		const start = parseTime(schedule.start);
		if (currentMinutes < start) return start - currentMinutes;
		return -1; // Service ended for today
	}
	const freq = getCurrentFrequency(now);
	const minutesPastHour = now.getMinutes();
	const minutesSinceLastTrain = minutesPastHour % freq;
	return freq - minutesSinceLastTrain;
}

// ─── Track Path Interpolation & Coordinates ─────────────
export function interpolatePath(path: [number, number][], progress: number): [number, number] {
	if (!path || path.length === 0) return [0, 0];
	if (path.length === 1) return path[0];
	if (progress <= 0) return path[0];
	if (progress >= 1) return path[path.length - 1];

	const segmentDistances: number[] = [];
	let totalDist = 0;
	for (let i = 0; i < path.length - 1; i++) {
		const dy = path[i + 1][0] - path[i][0];
		const dx = path[i + 1][1] - path[i][1];
		const d = Math.sqrt(dy * dy + dx * dx);
		segmentDistances.push(d);
		totalDist += d;
	}

	if (totalDist === 0) return path[0];

	const targetDist = progress * totalDist;
	let accumDist = 0;
	for (let i = 0; i < path.length - 1; i++) {
		const d = segmentDistances[i];
		if (accumDist + d >= targetDist) {
			const segProgress = d > 0 ? (targetDist - accumDist) / d : 0;
			const lat = path[i][0] + (path[i + 1][0] - path[i][0]) * segProgress;
			const lng = path[i][1] + (path[i + 1][1] - path[i][1]) * segProgress;
			return [lat, lng];
		}
		accumDist += d;
	}

	return path[path.length - 1];
}

export function getMetroLineCoords(): [number, number][] {
	const stations = getMetroStations();
	const coords: [number, number][] = [];
	for (let i = 0; i < stations.length; i++) {
		const s = stations[i];
		if (s.segmentPath && s.segmentPath.length > 0) {
			for (let j = 0; j < s.segmentPath.length - 1; j++) {
				coords.push(s.segmentPath[j]);
			}
		} else {
			coords.push([s.lat, s.lng]);
		}
	}
	const last = stations[stations.length - 1];
	coords.push([last.lat, last.lng]);
	return coords;
}

// ─── Train Simulation ───────────────────────────────────
export function simulateTrainPositions(now: Date): SimulatedTrain[] {
	if (!isMetroOperating(now)) return [];

	const line = getMetroLine();
	const stations = line.stations.filter((s) => !s.underConstruction);
	const N = stations.length;
	const freq = getCurrentFrequency(now);

	const currentMinutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
	const schedule = getMetroSchedule(now);
	if (!schedule) return [];

	const serviceStart = parseTime(schedule.start);
	const elapsed = currentMinutes - serviceStart;
	if (elapsed < 0) return [];

	// Timings and cycle configuration
	const dwellTime = 40 / 60; // 40 seconds dwell time per intermediate station
	const oneWayTime = line.totalTravelTime; // 38 mins
	const turnaroundTime = 7; // 7 minutes turnaround at each terminus
	const roundTripTime = (oneWayTime + turnaroundTime) * 2; // 90 minutes total

	const totalDistance = stations[N - 1].distanceFromStart - stations[0].distanceFromStart;
	const totalDwellTime = (N - 2) * dwellTime;
	const totalRunTime = oneWayTime - totalDwellTime;

	// Precalculate Southbound Timeline
	const sbTimeline: { arr: number; dep: number }[] = [];
	let currentOffset = 0;
	for (let i = 0; i < N; i++) {
		if (i === 0) {
			sbTimeline.push({ arr: 0, dep: 0 });
		} else {
			const segDist = stations[i].distanceFromStart - stations[i - 1].distanceFromStart;
			const runTime = (segDist / totalDistance) * totalRunTime;
			const arr = currentOffset + runTime;
			const dep = i === N - 1 ? arr : arr + dwellTime;
			sbTimeline.push({ arr, dep });
			currentOffset = dep;
		}
	}

	// Precalculate Northbound Timeline
	const nbTimeline: { arr: number; dep: number }[] = [];
	currentOffset = 0;
	for (let i = 0; i < N; i++) {
		const stationIdx = N - 1 - i;
		if (i === 0) {
			nbTimeline.push({ arr: 0, dep: 0 });
		} else {
			const prevStationIdx = N - 1 - (i - 1);
			const segDist = Math.abs(stations[stationIdx].distanceFromStart - stations[prevStationIdx].distanceFromStart);
			const runTime = (segDist / totalDistance) * totalRunTime;
			const arr = currentOffset + runTime;
			const dep = i === N - 1 ? arr : arr + dwellTime;
			nbTimeline.push({ arr, dep });
			currentOffset = dep;
		}
	}

	const trains: SimulatedTrain[] = [];
	const totalTrainsDispatched = Math.floor(elapsed / freq) + 1;

	// Only process active departures in the last roundTripTime
	const startTrainIdx = Math.max(0, Math.floor((elapsed - roundTripTime) / freq));

	for (let i = startTrainIdx; i < totalTrainsDispatched; i++) {
		const departureTime = i * freq; // departure from service origin
		const timeSinceDeparture = elapsed - departureTime;

		// If the train hasn't started yet, or has finished its cycle
		if (timeSinceDeparture < 0 || timeSinceDeparture >= roundTripTime) continue;

		const cycleTime = timeSinceDeparture % roundTripTime;

		let lat = stations[0].lat;
		let lng = stations[0].lng;
		let direction: "northbound" | "southbound";
		let fromStation = stations[0];
		let toStation = stations[0];
		let progress = 0;

		if (cycleTime < oneWayTime) {
			// Southbound leg (Uttara North -> Motijheel)
			direction = "southbound";
			
			// Find segment where cycleTime is
			let found = false;
			for (let sIdx = 0; sIdx < N - 1; sIdx++) {
				const dep = sbTimeline[sIdx].dep;
				const arr = sbTimeline[sIdx + 1].arr;
				if (cycleTime >= dep && cycleTime <= arr) {
					// Moving between stations
					const segmentDuration = arr - dep;
					progress = segmentDuration > 0 ? (cycleTime - dep) / segmentDuration : 0;
					
					const path = stations[sIdx].segmentPath || [[stations[sIdx].lat, stations[sIdx].lng], [stations[sIdx + 1].lat, stations[sIdx + 1].lng]];
					const interpolated = interpolatePath(path as [number, number][], progress);
					lat = interpolated[0];
					lng = interpolated[1];

					fromStation = stations[sIdx];
					toStation = stations[sIdx + 1];
					found = true;
					break;
				}
				
				// Dwell at station sIdx+1 (except terminal)
				if (sIdx < N - 2) {
					const nextDep = sbTimeline[sIdx + 1].dep;
					if (cycleTime > arr && cycleTime < nextDep) {
						lat = stations[sIdx + 1].lat;
						lng = stations[sIdx + 1].lng;
						fromStation = stations[sIdx + 1];
						toStation = stations[sIdx + 1];
						progress = 0;
						found = true;
						break;
					}
				}
			}

			// If not found in segment loops, must be near start/end
			if (!found) {
				lat = stations[0].lat;
				lng = stations[0].lng;
				fromStation = stations[0];
				toStation = stations[0];
			}

		} else if (cycleTime >= oneWayTime && cycleTime < oneWayTime + turnaroundTime) {
			// Turnaround at Motijheel
			direction = "southbound";
			lat = stations[N - 1].lat;
			lng = stations[N - 1].lng;
			fromStation = stations[N - 1];
			toStation = stations[N - 1];
			progress = 0;

		} else if (cycleTime >= oneWayTime + turnaroundTime && cycleTime < oneWayTime * 2 + turnaroundTime) {
			// Northbound leg (Motijheel -> Uttara North)
			direction = "northbound";
			const tOffset = cycleTime - (oneWayTime + turnaroundTime);

			let found = false;
			for (let sIdx = 0; sIdx < N - 1; sIdx++) {
				const dep = nbTimeline[sIdx].dep;
				const arr = nbTimeline[sIdx + 1].arr;
				const actualFromIdx = N - 1 - sIdx;
				const actualToIdx = N - 1 - (sIdx + 1);

				if (tOffset >= dep && tOffset <= arr) {
					// Moving between stations
					const segmentDuration = arr - dep;
					progress = segmentDuration > 0 ? (tOffset - dep) / segmentDuration : 0;

					const segmentPoints = stations[actualToIdx].segmentPath || [[stations[actualToIdx].lat, stations[actualToIdx].lng], [stations[actualFromIdx].lat, stations[actualFromIdx].lng]];
					const path = [...segmentPoints].reverse();
					const interpolated = interpolatePath(path as [number, number][], progress);
					lat = interpolated[0];
					lng = interpolated[1];

					fromStation = stations[actualFromIdx];
					toStation = stations[actualToIdx];
					found = true;
					break;
				}

				// Dwell at station actualToIdx (except terminal)
				if (sIdx < N - 2) {
					const nextDep = nbTimeline[sIdx + 1].dep;
					if (tOffset > arr && tOffset < nextDep) {
						lat = stations[actualToIdx].lat;
						lng = stations[actualToIdx].lng;
						fromStation = stations[actualToIdx];
						toStation = stations[actualToIdx];
						progress = 0;
						found = true;
						break;
					}
				}
			}

			if (!found) {
				lat = stations[N - 1].lat;
				lng = stations[N - 1].lng;
				fromStation = stations[N - 1];
				toStation = stations[N - 1];
			}

		} else {
			// Turnaround at Uttara North
			direction = "northbound";
			lat = stations[0].lat;
			lng = stations[0].lng;
			fromStation = stations[0];
			toStation = stations[0];
			progress = 0;
		}

		trains.push({
			id: `train-${direction}-${i}`,
			direction,
			lat,
			lng,
			fromStation,
			toStation,
			progress,
		});
	}

	return trains;
}

// ─── Distance Helpers ───────────────────────────────────
export function haversineDistance(
	lat1: number,
	lng1: number,
	lat2: number,
	lng2: number
): number {
	const R = 6371; // km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLng = ((lng2 - lng1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLng / 2) *
			Math.sin(dLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
}

export function findNearestStation(
	lat: number,
	lng: number
): { station: MetroStation; distance: number; walkingMinutes: number } {
	const stations = getMetroStations();
	let nearest = stations[0];
	let minDist = Infinity;

	for (const station of stations) {
		const dist = haversineDistance(lat, lng, station.lat, station.lng);
		if (dist < minDist) {
			minDist = dist;
			nearest = station;
		}
	}

	return {
		station: nearest,
		distance: Math.round(minDist * 1000) / 1000, // km with 3 decimals
		walkingMinutes: Math.ceil((minDist / 5) * 60), // ~5km/h walking speed
	};
}

// ─── Metro Station Translations ─────────────────────────
export const metroStopTranslations: Record<string, string> = {};
getMetroStations().forEach((s) => {
	metroStopTranslations[s.name.en] = s.name.bn;
});
