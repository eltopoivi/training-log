export const Sport = {
  TrailRun: 'trail_run',
  Run: 'run',
  Ride: 'ride',
  MountainRide: 'mtb',
  Gym: 'gym',
  Ski: 'ski',
  BackcountrySki: 'backcountry_ski',
  Hike: 'hike',
  Yoga: 'yoga',
  Swim: 'swim',
  Other: 'other',
} as const;

export type Sport = (typeof Sport)[keyof typeof Sport];

export const ALL_SPORTS: Sport[] = Object.values(Sport);

export const SPORT_LABELS: Record<Sport, string> = {
  trail_run: 'Trail Running',
  run: 'Running',
  ride: 'Ciclismo',
  mtb: 'MTB',
  gym: 'Gym',
  ski: 'Esquí',
  backcountry_ski: 'Esquí de travesía',
  hike: 'Hiking',
  yoga: 'Yoga',
  swim: 'Natación',
  other: 'Otros',
};

export function isSport(value: string): value is Sport {
  return ALL_SPORTS.includes(value as Sport);
}
