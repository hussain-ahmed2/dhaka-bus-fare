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
export function calculateMetroFare(fromId: string, toId: string): number {
	const line = getMetroLine();
	const fromIdx = line.stations.findIndex((s) => s.id === fromId);
	const toIdx = line.stations.findIndex((s) => s.id === toId);
	if (fromIdx === -1 || toIdx === -1) return 0;

	const stationsTraveled = Math.abs(toIdx - fromIdx);
	for (const slab of line.fareSlabs) {
		if (stationsTraveled >= slab.minStations && stationsTraveled <= slab.maxStations) {
			return slab.fare;
		}
	}
	return line.fareSlabs[line.fareSlabs.length - 1].fare;
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

// ─── Train Simulation ───────────────────────────────────
export function simulateTrainPositions(now: Date): SimulatedTrain[] {
	if (!isMetroOperating(now)) return [];

	const line = getMetroLine();
	const stations = line.stations;
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
					lat = stations[sIdx].lat + (stations[sIdx + 1].lat - stations[sIdx].lat) * progress;
					lng = stations[sIdx].lng + (stations[sIdx + 1].lng - stations[sIdx].lng) * progress;
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
					lat = stations[actualFromIdx].lat + (stations[actualToIdx].lat - stations[actualFromIdx].lat) * progress;
					lng = stations[actualToIdx].lng + (stations[actualToIdx].lng - stations[actualToIdx].lng) * progress;
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
