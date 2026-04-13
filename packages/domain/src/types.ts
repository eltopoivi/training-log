import type { Sport } from './sports.js';

export interface ActivityStreamData {
  time?: number[];
  distance?: number[];
  latlng?: [number, number][];
  altitude?: number[];
  hr?: number[];
  power?: number[];
  cadence?: number[];
  temp?: number[];
}

export interface CreateActivityInput {
  ownerId: string;
  sourceId: string;
  externalId: string;
  sport: Sport;
  name: string;
  startedAt: Date;
  duration: number;
  distance: number | null;
  elevationGain: number | null;
  avgHr: number | null;
  maxHr: number | null;
  avgPower: number | null;
  np: number | null;
  tss: number | null;
  intensityFactor: number | null;
  calories: number | null;
}

export interface LapInput {
  index: number;
  duration: number;
  distance: number | null;
  avgHr: number | null;
  avgPower: number | null;
}

export interface HealthStatus {
  status: 'ok' | 'degraded';
  services: {
    db: boolean;
    redis: boolean;
    s3: boolean;
  };
}
