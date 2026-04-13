export interface StravaTokenResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  expires_in: number;
  athlete?: { id: number };
}

export interface StravaTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  athleteId?: string;
}

export interface StravaActivitySummary {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  start_date: string;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  total_elevation_gain: number;
  average_heartrate?: number;
  max_heartrate?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  calories?: number;
  suffer_score?: number;
  workout_type?: number;
  trainer?: boolean;
}

export interface StravaActivityDetailed extends StravaActivitySummary {
  description?: string;
  device_watts?: boolean;
  has_heartrate?: boolean;
  kilojoules?: number;
  icu_intensity?: number;
  // Strava does NOT reliably return TSS/IF; we store null unless present.
}

export interface StravaStreamEntry {
  type: string;
  data: unknown[];
  series_type?: string;
  original_size?: number;
  resolution?: string;
}

export type StravaStreams = Record<string, StravaStreamEntry>;

export interface StravaLap {
  id: number;
  lap_index: number;
  elapsed_time: number;
  moving_time: number;
  distance: number;
  average_heartrate?: number;
  average_watts?: number;
}
