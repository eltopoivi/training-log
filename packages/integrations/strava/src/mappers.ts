import { Sport, type ActivityStreamData, type CreateActivityInput, type LapInput } from '@repo/domain';
import type {
  StravaActivityDetailed,
  StravaActivitySummary,
  StravaLap,
  StravaStreams,
} from './types.js';

export function mapStravaSport(raw: StravaActivitySummary): Sport {
  const t = (raw.sport_type ?? raw.type ?? '').toString();
  switch (t) {
    case 'TrailRun':
      return Sport.TrailRun;
    case 'Run':
      return Sport.Run;
    case 'Ride':
    case 'VirtualRide':
      return Sport.Ride;
    case 'MountainBikeRide':
    case 'GravelRide':
    case 'EMountainBikeRide':
      return Sport.MountainRide;
    case 'WeightTraining':
    case 'Workout':
    case 'Crossfit':
    case 'Elliptical':
    case 'StairStepper':
      return Sport.Gym;
    case 'AlpineSki':
    case 'Snowboard':
      return Sport.Ski;
    case 'BackcountrySki':
      return Sport.BackcountrySki;
    case 'Hike':
    case 'Walk':
      return Sport.Hike;
    case 'Yoga':
      return Sport.Yoga;
    case 'Swim':
      return Sport.Swim;
    default:
      return Sport.Other;
  }
}

export function mapStravaActivity(
  raw: StravaActivityDetailed,
  sourceId: string,
  ownerId: string,
): CreateActivityInput {
  return {
    ownerId,
    sourceId,
    externalId: String(raw.id),
    sport: mapStravaSport(raw),
    name: raw.name ?? 'Activity',
    startedAt: new Date(raw.start_date),
    duration: raw.elapsed_time ?? raw.moving_time ?? 0,
    distance: raw.distance ?? null,
    elevationGain: raw.total_elevation_gain ?? null,
    avgHr: raw.average_heartrate != null ? Math.round(raw.average_heartrate) : null,
    maxHr: raw.max_heartrate != null ? Math.round(raw.max_heartrate) : null,
    avgPower: raw.average_watts != null ? Math.round(raw.average_watts) : null,
    np: raw.weighted_average_watts != null ? Math.round(raw.weighted_average_watts) : null,
    // Strava does not reliably expose TSS/IF in the public API. If absent, keep null.
    // TODO(post-mvp): compute internally when we own zones.
    tss: null,
    intensityFactor: null,
    calories: raw.calories != null ? Math.round(raw.calories) : null,
  };
}

function toNumberArray(arr: unknown[]): number[] {
  return arr.map((v) => Number(v)).filter((n) => Number.isFinite(n));
}

function toLatLngArray(arr: unknown[]): [number, number][] {
  const out: [number, number][] = [];
  for (const v of arr) {
    if (Array.isArray(v) && v.length >= 2) {
      const lat = Number(v[0]);
      const lng = Number(v[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        out.push([lat, lng]);
      }
    }
  }
  return out;
}

export function mapStreams(raw: StravaStreams): ActivityStreamData {
  const out: ActivityStreamData = {};
  if (raw.time?.data) out.time = toNumberArray(raw.time.data);
  if (raw.distance?.data) out.distance = toNumberArray(raw.distance.data);
  if (raw.altitude?.data) out.altitude = toNumberArray(raw.altitude.data);
  if (raw.heartrate?.data) out.hr = toNumberArray(raw.heartrate.data);
  if (raw.watts?.data) out.power = toNumberArray(raw.watts.data);
  if (raw.cadence?.data) out.cadence = toNumberArray(raw.cadence.data);
  if (raw.temp?.data) out.temp = toNumberArray(raw.temp.data);
  if (raw.latlng?.data) out.latlng = toLatLngArray(raw.latlng.data);
  return out;
}

export function mapLaps(raw: StravaLap[]): LapInput[] {
  return raw
    .slice()
    .sort((a, b) => a.lap_index - b.lap_index)
    .map((l, i) => ({
      index: l.lap_index ?? i,
      duration: l.elapsed_time ?? l.moving_time ?? 0,
      distance: l.distance ?? null,
      avgHr: l.average_heartrate != null ? Math.round(l.average_heartrate) : null,
      avgPower: l.average_watts != null ? Math.round(l.average_watts) : null,
    }));
}
